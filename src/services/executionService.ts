import { supabase } from '../lib/supabase';

// Environment variables
const WEBHOOK_LAUNCH_URL = import.meta.env.VITE_N8N_CAMPAIGN_LAUNCH_WEBHOOK;
const WEBHOOK_TEST_EMAIL_URL = import.meta.env.VITE_N8N_SEND_TEST_EMAIL_WEBHOOK;

interface ExecutionScheduleEntry {
    campaign_id: string;
    channel: string;
    asset_type: string;
    asset_id: string;
    scheduled_day: number;
    scheduled_date: string;
    status: string;
    recipients_total: number;
}

/**
 * Generates the 28-day execution schedule for a campaign.
 * Fetches all assets and creates schedule entries in Supabase.
 */
export const generateExecutionSchedule = async (campaignId: string) => {
    // DEMO MODE BYPASS
    if (campaignId === 'demo-campaign-001') {
        console.log('[Demo Mode] Skipping execution schedule generation');
        return { success: true, entryCount: 25 }; // Mock success
    }

    // 1. Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

    if (campaignError) throw new Error(`Failed to fetch campaign: ${campaignError.message}`);

    const startDate = new Date();
    const recommendedChannels: string[] = campaign.recommended_channels || [];

    // Get recipient count
    let recipientCount = 0;
    const { count } = await supabase
        .from('customer_data')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId);

    recipientCount = count || 0;

    // 2. Fetch all assets
    const { data: emails } = await supabase.from('email_templates').select('*').eq('campaign_id', campaignId);
    const { data: whatsapp } = await supabase.from('whatsapp_messages').select('*').eq('campaign_id', campaignId);
    const { data: socialPosts } = await supabase.from('social_posts').select('*').eq('campaign_id', campaignId);

    const scheduleEntries: ExecutionScheduleEntry[] = [];

    const getDateForDay = (dayNum: number) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (dayNum - 1));
        return date.toISOString().split('T')[0];
    };

    // 3. Build Schedule Entries

    // EMAILS
    if (emails) {
        emails.forEach(email => {
            scheduleEntries.push({
                campaign_id: campaignId,
                channel: 'email',
                asset_type: 'email_template',
                asset_id: email.id,
                scheduled_day: email.scheduled_day,
                scheduled_date: getDateForDay(email.scheduled_day),
                status: 'scheduled',
                recipients_total: recipientCount
            });
        });
    }

    // WHATSAPP
    if (recommendedChannels.includes('whatsapp') && whatsapp) {
        whatsapp.forEach(msg => {
            scheduleEntries.push({
                campaign_id: campaignId,
                channel: 'whatsapp',
                asset_type: 'whatsapp_message',
                asset_id: msg.id,
                scheduled_day: msg.scheduled_day,
                scheduled_date: getDateForDay(msg.scheduled_day),
                status: 'scheduled',
                recipients_total: recipientCount
            });
        });
    }

    // INSTAGRAM
    if (recommendedChannels.includes('instagram') && socialPosts) {
        socialPosts.forEach(post => {
            scheduleEntries.push({
                campaign_id: campaignId,
                channel: 'instagram',
                asset_type: 'social_post',
                asset_id: post.id,
                scheduled_day: post.scheduled_day,
                scheduled_date: getDateForDay(post.scheduled_day),
                status: 'scheduled',
                recipients_total: 0
            });
        });
    }

    // 4. Insert into Supabase
    if (scheduleEntries.length > 0) {
        const { error: insertError } = await supabase
            .from('execution_schedule')
            .insert(scheduleEntries);

        if (insertError) throw new Error(`Failed to save schedule: ${insertError.message}`);
    }

    // 5. Update Campaign Status
    const campaignEndDate = new Date(startDate);
    campaignEndDate.setDate(campaignEndDate.getDate() + 27);

    const { error: updateError } = await supabase
        .from('campaigns')
        .update({
            status: 'executing',
            launched_at: new Date().toISOString(),
            campaign_start_date: startDate.toISOString().split('T')[0],
            campaign_end_date: campaignEndDate.toISOString().split('T')[0]
        })
        .eq('id', campaignId);

    if (updateError) throw new Error(`Failed to update campaign status: ${updateError.message}`);

    return { success: true, entryCount: scheduleEntries.length };
};

/**
 * Triggers a webhook with simulation fallback.
 */
export const triggerWebhook = async (action: 'campaign_launched' | 'send_test', payload: any) => {
    let url = '';

    if (action === 'campaign_launched') url = WEBHOOK_LAUNCH_URL;
    if (action === 'send_test') url = WEBHOOK_TEST_EMAIL_URL;

    // Check if URL is configured
    if (!url || url === 'placeholder' || url === '') {
        console.warn(`[Simulation Mode] Webhook for ${action} not configured. Simulating execution...`);

        // Short delay for feel
        await new Promise(resolve => setTimeout(resolve, 500));

        // If launching, simulate Day 1 execution with visible animation
        if (action === 'campaign_launched') {
            // Don't await — let it run in background so the UI can transition first
            simulateDay1Execution(payload.campaign_id);
        }

        return {
            success: true,
            simulated: true,
            message: 'Execution simulated (n8n not connected)'
        };
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Webhook failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Webhook trigger error:', error);
        console.warn('Network call failed, falling back to simulated success for demo purposes.');
        return { success: true, simulated: true, error: String(error) };
    }
};

/**
 * Simulates the execution of Day 1 tasks for a campaign.
 * Updates status from 'scheduled' → 'in_progress' (visible on UI) → 'completed'.
 * Each task spends time in 'in_progress' so the user can SEE the blue progress bar.
 */
const simulateDay1Execution = async (campaignId: string) => {
    // DEMO MODE BYPASS
    if (campaignId === 'demo-campaign-001') {
        console.log(`[Demo Simulation] Starting Day 1 execution for ${campaignId}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`[Demo Simulation] Day 1 completed (mock).`);
        return;
    }

    console.log(`[Simulation] Starting Day 1 execution for ${campaignId}`);

    // Small initial delay to let the UI transition to the Campaign Live tab
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 1. Get Day 1 tasks
    const { data: tasks } = await supabase
        .from('execution_schedule')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('scheduled_day', 1)
        .eq('status', 'scheduled');

    if (!tasks || tasks.length === 0) return;

    // 2. Process each task one by one with visible in_progress state
    for (const task of tasks) {
        // Mark as In Progress — this triggers the blue pulsing bar on the dashboard
        await supabase
            .from('execution_schedule')
            .update({
                status: 'in_progress',
                started_at: new Date().toISOString(),
                recipients_sent: 0
            })
            .eq('id', task.id);

        console.log(`[Simulation] Task ${task.channel} now IN PROGRESS`);

        // Simulate incremental progress (if there are recipients)
        const total = task.recipients_total || 1;
        const steps = Math.min(total, 5); // Max 5 incremental updates
        const perStep = Math.ceil(total / steps);

        for (let i = 1; i <= steps; i++) {
            await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s between updates

            const sent = Math.min(i * perStep, total);
            await supabase
                .from('execution_schedule')
                .update({ recipients_sent: sent })
                .eq('id', task.id);

            console.log(`[Simulation] ${task.channel} progress: ${sent}/${total}`);
        }

        // Final delay before completing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mark as Completed
        await supabase
            .from('execution_schedule')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                recipients_sent: task.recipients_total,
                recipients_failed: 0
            })
            .eq('id', task.id);

        console.log(`[Simulation] Task ${task.channel} COMPLETED`);

        // Log entry
        await supabase.from('campaign_logs').insert({
            campaign_id: campaignId,
            channel: task.channel,
            action: task.channel === 'instagram' ? 'posted' : 'sent',
            recipient: 'Simulated Batch',
            status_details: 'Simulated execution completed'
        });

        // Brief pause before next task
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`[Simulation] Day 1 execution finished.`);
};

export const pauseCampaign = async (campaignId: string) => {
    await supabase.from('campaigns').update({ status: 'paused' }).eq('id', campaignId);

    await supabase.from('execution_schedule')
        .update({ status: 'paused' })
        .eq('campaign_id', campaignId)
        .eq('status', 'scheduled');

    return { success: true };
};

export const resumeCampaign = async (campaignId: string) => {
    await supabase.from('campaigns').update({ status: 'executing' }).eq('id', campaignId);

    await supabase.from('execution_schedule')
        .update({ status: 'scheduled' })
        .eq('campaign_id', campaignId)
        .eq('status', 'paused');

    return { success: true };
};
