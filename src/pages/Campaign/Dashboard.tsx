import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import {
    LayoutDashboard, Mail, MessageSquare, Instagram,
    ArrowLeft, Video, CheckCircle2, PauseCircle, PlayCircle, Send, Copy, Check, Download
} from 'lucide-react';
import { VideoPlayer, SocialPostCard } from '../../components/DashboardComponents';
import { LaunchSection } from '../../components/Dashboard/LaunchSection';
import { CampaignTimeline } from '../../components/Dashboard/CampaignTimeline';
import { ExecutionLog } from '../../components/Dashboard/ExecutionLog';
import { generateImage } from '../../services/imageService';
import { buildImagePrompt } from '../../services/imagePromptBuilder';
import { pauseCampaign, resumeCampaign, triggerWebhook } from '../../services/executionService';
import { checkVideoStatus, persistVideoToStorage } from '../../services/videoService';
import { DEMO_MODE_ENABLED, DEMO_CAMPAIGN } from '../../data/demoData';
import { useAnimationContext } from '../../context/AnimationContext';

interface Campaign {
    id: string;
    product_name: string;
    status: string;
    marketing_plan: any;
    recommended_channels: string[];
    video_url?: string;
    video_status?: string;
    video_script?: string;
    heygen_video_id?: string;
    video_started_at?: string;
    target_audience: string;
    launch_date?: string;
    campaign_start_date?: string;
    budget: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

interface EmailTemplate {
    id: string;
    subject: string;
    pre_header: string;
    body: string;
    scheduled_day: number;
    cta_text: string;
}

interface WhatsAppMessage {
    id: string;
    message_text: string;
    scheduled_day: number;
    message_type: string;
}

interface SocialPost {
    id: string;
    caption: string;
    hashtags: string;
    scheduled_day: number;
    image_suggestion: string;
    post_type: string;
    image_url?: string;
    post_order?: number;
}

export const Dashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [emails, setEmails] = useState<EmailTemplate[]>([]);
    const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
    const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);
    const [recipientCount, setRecipientCount] = useState(0);
    const [sendingTest, setSendingTest] = useState<string | null>(null); // ID of asset being tested
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [exportingPDF, setExportingPDF] = useState<string | null>(null); // 'strategy' | 'assets' | null

    const { setEyeballHidden } = useAnimationContext();
    useEffect(() => {
        setEyeballHidden(true);
        return () => setEyeballHidden(false);
    }, []);

    useEffect(() => {
        if (id) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Guards against the polling effect and the manual "Check now" button
    // both firing persistVideoToStorage in parallel — without it, two copies
    // of the same MP4 land in Storage (one orphaned). Set true while an
    // upload+update is in flight; both code paths short-circuit if it's true.
    const persistInFlight = useRef(false);

    // Poll for video completion. When heygen_video_id is set, ask HeyGen
    // directly — this works regardless of which session/tab/device started
    // the generation. Falls back to a Supabase read for legacy rows that
    // pre-date the heygen_video_id column.
    //
    // Tab-close-during-upload story: if the user closes the tab mid-upload,
    // the partial blob may live in Storage (Supabase GCs abandoned multipart
    // uploads; small enough blobs are atomic). The campaign row stays as
    // 'generating'. Next time the Dashboard loads, polling resumes, HeyGen
    // returns 'completed' again, and the persist step retries cleanly. The
    // recovery path is by design — keep it intact when refactoring.
    useEffect(() => {
        if (!campaign || campaign.video_status !== 'generating') return;

        const videoId = campaign.heygen_video_id;
        const campaignId = campaign.id;
        let cancelled = false;

        const poll = async () => {
            try {
                if (videoId) {
                    const result = await checkVideoStatus(videoId);
                    if (cancelled) return;

                    if (result.status === 'completed' && result.videoUrl) {
                        if (persistInFlight.current) return; // checkVideoNow is uploading
                        persistInFlight.current = true;
                        try {
                            // Try to persist the video to Supabase Storage so the URL
                            // doesn't expire. Falls back to the HeyGen URL if upload fails.
                            const persistentUrl = await persistVideoToStorage(result.videoUrl, campaignId);
                            if (cancelled) return;
                            await supabase.from('campaigns').update({
                                video_url: persistentUrl,
                                video_status: 'completed',
                            }).eq('id', campaignId);
                            if (cancelled) return;
                            setCampaign(prev => prev ? { ...prev, video_url: persistentUrl, video_status: 'completed' } : prev);
                        } finally {
                            persistInFlight.current = false;
                        }
                    } else if (result.status === 'failed' || result.status === 'cancelled') {
                        await supabase.from('campaigns').update({
                            video_status: result.status,
                        }).eq('id', campaignId);
                        if (cancelled) return;
                        setCampaign(prev => prev ? { ...prev, video_status: result.status } : prev);
                    }
                    // pending/processing/unknown → keep polling
                } else {
                    const { data } = await supabase
                        .from('campaigns')
                        .select('video_url, video_status')
                        .eq('id', campaignId)
                        .single();
                    if (cancelled) return;
                    if (data && data.video_status !== 'generating') {
                        setCampaign(prev => prev ? { ...prev, video_url: data.video_url, video_status: data.video_status } : prev);
                    }
                }
            } catch (err) {
                console.error('Video status poll error:', err);
            }
        };

        poll(); // immediate first check on mount
        const interval = setInterval(poll, 15000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [campaign?.video_status, campaign?.id, campaign?.heygen_video_id]);

    // Manual on-demand status check — wired to the "Check now" button
    // in the wait-time UI. Same logic as the poll, just a single shot.
    // Shares the persistInFlight guard with the polling effect so a
    // concurrent click + poll can't double-upload the MP4.
    const checkVideoNow = async () => {
        if (!campaign?.heygen_video_id || !campaign?.id) return;
        try {
            const result = await checkVideoStatus(campaign.heygen_video_id);
            if (result.status === 'completed' && result.videoUrl) {
                if (persistInFlight.current) return; // poll is uploading
                persistInFlight.current = true;
                try {
                    const persistentUrl = await persistVideoToStorage(result.videoUrl, campaign.id);
                    await supabase.from('campaigns').update({
                        video_url: persistentUrl,
                        video_status: 'completed',
                    }).eq('id', campaign.id);
                    setCampaign(prev => prev ? { ...prev, video_url: persistentUrl, video_status: 'completed' } : prev);
                } finally {
                    persistInFlight.current = false;
                }
            } else if (result.status === 'failed' || result.status === 'cancelled') {
                await supabase.from('campaigns').update({ video_status: result.status }).eq('id', campaign.id);
                setCampaign(prev => prev ? { ...prev, video_status: result.status } : prev);
            }
        } catch (err) {
            console.error('Manual video check failed:', err);
        }
    };

    // "Cancel" the wait. HeyGen has no public cancel endpoint, so this is a
    // local-only operation: we stop polling and mark the campaign cancelled.
    // HeyGen continues generating server-side and consumes the credit either
    // way — the confirm dialog says so honestly.
    const cancelVideoNow = async () => {
        if (!campaign?.heygen_video_id || !campaign?.id) return;
        if (!confirm(
            "HeyGen doesn't support aborting an in-progress video, so the credit will be consumed regardless. " +
            "Cancelling here just stops MiCA from waiting on it — the video may still appear in your HeyGen library later. " +
            "Continue?"
        )) return;
        try {
            await supabase.from('campaigns').update({ video_status: 'cancelled' }).eq('id', campaign.id);
            setCampaign(prev => prev ? { ...prev, video_status: 'cancelled' } : prev);
        } catch (err) {
            console.error('Cancel failed:', err);
            alert(`Cancel failed: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const fetchData = async () => {
        try {
            if (!id) return;

            // DEMO MODE CHECK
            if (DEMO_MODE_ENABLED()) {
                setCampaign(DEMO_CAMPAIGN as any);

                setRecipientCount(1250); // Hardcoded demo count
                setEmails(DEMO_CAMPAIGN.email_templates as any[]);
                setWhatsappMessages(DEMO_CAMPAIGN.whatsapp_messages as any[]);
                setSocialPosts(DEMO_CAMPAIGN.social_posts as any[]);

                // Set initial tab based on demo status
                const currentStatus = DEMO_CAMPAIGN.status;
                if (currentStatus === 'executing' || currentStatus === 'paused') {
                    setActiveTab('campaign_live');
                } else {
                    setActiveTab('overview');
                }
                setLoading(false);
                return;
            }

            // Fetch Campaign
            const { data: campaignData, error: campaignError } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', id)
                .single();

            if (campaignError) throw campaignError;
            setCampaign(campaignData);

            // Fetch Recipient Count (using customer_data)
            const { count } = await supabase
                .from('customer_data')
                .select('*', { count: 'exact', head: true })
                .eq('campaign_id', id);
            setRecipientCount(count || 0);

            // Fetch Emails
            const { data: emailData } = await supabase
                .from('email_templates')
                .select('*')
                .eq('campaign_id', id)
                .order('scheduled_day', { ascending: true });
            if (emailData) setEmails(emailData);

            // Fetch WhatsApp
            const { data: waData } = await supabase
                .from('whatsapp_messages')
                .select('*')
                .eq('campaign_id', id)
                .order('scheduled_day', { ascending: true });
            if (waData) setWhatsappMessages(waData);

            // Fetch Social
            const { data: socialData } = await supabase
                .from('social_posts')
                .select('*')
                .eq('campaign_id', id)
                .order('scheduled_day', { ascending: true });
            if (socialData) setSocialPosts(socialData);

            // Set initial tab based on status
            if (campaignData.status === 'executing' || campaignData.status === 'paused') {
                setActiveTab('campaign_live');
            } else {
                setActiveTab('overview');
            }

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateImage = async (postId: string, suggestion: string) => {
        if (!campaign) return;
        setGeneratingImageId(postId);
        try {
            const prompt = buildImagePrompt(suggestion, campaign.product_name, campaign.marketing_plan?.tone || 'Professional');
            const imageUrl = await generateImage({ prompt });

            // Save to DB
            await supabase.from('social_posts').update({ image_url: imageUrl }).eq('id', postId);
            await supabase.from('generated_images').insert({
                campaign_id: campaign.id,
                image_url: imageUrl,
                image_prompt: prompt,
                image_type: 'social'
            });

            // Update local state
            setSocialPosts(prev => prev.map(p => p.id === postId ? { ...p, image_url: imageUrl } : p));

        } catch (error) {
            console.error("Failed to regenerate image:", error);
            alert("Failed to generate image. Please try again.");
        } finally {
            setGeneratingImageId(null);
        }
    };

    const handleSendTest = async (assetId: string, type: 'email' | 'whatsapp', content: any) => {
        setSendingTest(assetId);
        try {
            await triggerWebhook('send_test', {
                campaign_id: campaign?.id,
                action: 'send_test',
                type,
                content
            });
            alert("Test sent successfully!");
        } catch (error) {
            console.error("Test send failed:", error);
            alert("Failed to send test.");
        } finally {
            setSendingTest(null);
        }
    };

    const stripHtml = (html: string): string => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent ?? '';
    };

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const handleAssetsPDFExport = () => {
        if (!campaign) return;
        const campaignName = campaign.marketing_plan?.campaign_name || campaign.product_name;
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        // Resolve relative image URLs (e.g. /demo-assets/...) to absolute so they load inside blob: windows
        const resolveImageUrl = (url?: string) => {
            if (!url) return null;
            if (url.startsWith('http://') || url.startsWith('https://')) return url;
            return `${window.location.origin}${url}`;
        };

        const emailSection = emails.length === 0 ? '' : `
            <div style="margin-bottom:40px;">
                <h2 style="font-size:20px;font-weight:700;color:#60a5fa;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #1e3a5f;display:flex;align-items:center;gap:8px;">
                    ✉️ Email Campaign (${emails.length} emails)
                </h2>
                ${emails.map(email => `
                    <div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:12px;padding:20px;margin-bottom:16px;page-break-inside:avoid;">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                            <span style="background:#1e3a5f;color:#60a5fa;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;print-color-adjust:exact;">Day ${email.scheduled_day}</span>
                            <strong style="color:#f1f5f9;font-size:15px;">${email.subject}</strong>
                        </div>
                        <div style="font-size:12px;color:#94a3b8;margin-bottom:12px;background:#1e293b;padding:8px 12px;border-radius:6px;">
                            <strong style="color:#cbd5e1;">Preview:</strong> ${email.pre_header}
                        </div>
                        <div style="color:#cbd5e1;font-size:13px;line-height:1.7;margin-bottom:12px;">${email.body}</div>
                        <div style="text-align:right;">
                            <span style="font-size:11px;color:#94a3b8;background:#1e293b;padding:4px 10px;border-radius:6px;">CTA: ${email.cta_text}</span>
                        </div>
                    </div>
                `).join('')}
            </div>`;

        const whatsappSection = whatsappMessages.length === 0 ? '' : `
            <div style="margin-bottom:40px;">
                <h2 style="font-size:20px;font-weight:700;color:#4ade80;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #14532d;display:flex;align-items:center;gap:8px;">
                    💬 WhatsApp Messages (${whatsappMessages.length} messages)
                </h2>
                ${whatsappMessages.map(msg => `
                    <div style="background:#0f172a;border:1px solid #14532d;border-radius:12px;padding:20px;margin-bottom:16px;page-break-inside:avoid;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                            <span style="background:#14532d;color:#4ade80;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;print-color-adjust:exact;">Day ${msg.scheduled_day}</span>
                            <span style="font-size:11px;color:#6b7280;text-transform:uppercase;font-weight:600;">${msg.message_type}</span>
                        </div>
                        <div style="background:#005c4b;color:white;padding:16px;border-radius:12px;border-top-right-radius:2px;font-size:13px;line-height:1.7;print-color-adjust:exact;">
                            ${msg.message_text}
                        </div>
                    </div>
                `).join('')}
            </div>`;

        const instagramPosts = socialPosts.filter(p => p.post_type !== 'story');
        const instagramSection = instagramPosts.length === 0 ? '' : `
            <div style="margin-bottom:40px;">
                <h2 style="font-size:20px;font-weight:700;color:#f472b6;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #4a1942;display:flex;align-items:center;gap:8px;">
                    📸 Instagram Posts (${instagramPosts.length} posts)
                </h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                ${instagramPosts.map(post => `
                    <div style="background:#0f172a;border:1px solid #4a1942;border-radius:12px;overflow:hidden;page-break-inside:avoid;">
                        ${resolveImageUrl(post.image_url) ? `<img src="${resolveImageUrl(post.image_url)}" alt="Post image" style="width:100%;aspect-ratio:1;object-fit:cover;" />` : ''}
                        <div style="padding:16px;">
                            <span style="background:#4a1942;color:#f472b6;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;print-color-adjust:exact;">Day ${post.scheduled_day}</span>
                            <p style="color:#cbd5e1;font-size:13px;line-height:1.6;margin:10px 0 8px;">${post.caption}</p>
                            <p style="color:#60a5fa;font-size:11px;line-height:1.6;">${post.hashtags}</p>
                        </div>
                    </div>
                `).join('')}
                </div>
            </div>`;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${campaignName} — Campaign Assets</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #020617; color: #f1f5f9; padding: 32px; }
        @media print { body { padding: 16px; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="no-print" style="position:sticky;top:0;z-index:100;background:#1e1b4b;padding:12px 32px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);">
        <span style="color:#a5b4fc;font-size:14px;">Review your content, then save as PDF</span>
        <button onclick="window.print()" style="background:#6366f1;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">🖨️ Save as PDF</button>
    </div>
    <div style="background:linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b);border-radius:16px;padding:32px;margin-bottom:40px;print-color-adjust:exact;">
        <h1 style="font-size:28px;font-weight:800;color:white;margin-bottom:8px;">${campaignName}</h1>
        <p style="color:#a5b4fc;font-size:14px;margin-bottom:16px;">Campaign Assets Export &mdash; ${today}</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
            ${emails.length > 0 ? `<span style="background:rgba(255,255,255,0.15);color:white;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;print-color-adjust:exact;">${emails.length} Emails</span>` : ''}
            ${whatsappMessages.length > 0 ? `<span style="background:rgba(255,255,255,0.15);color:white;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;print-color-adjust:exact;">${whatsappMessages.length} WhatsApp Messages</span>` : ''}
            ${instagramPosts.length > 0 ? `<span style="background:rgba(255,255,255,0.15);color:white;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;print-color-adjust:exact;">${instagramPosts.length} Instagram Posts</span>` : ''}
        </div>
    </div>
    ${emailSection}
    ${whatsappSection}
    ${instagramSection}
    <div style="text-align:center;color:#6b7280;font-size:12px;margin-top:32px;border-top:1px solid #1e293b;padding-top:16px;">
        Generated by MiCA &mdash; Marketing Intelligence &amp; Campaign Automation
    </div>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        setExportingPDF('assets');
        setTimeout(() => {
            window.open(url, '_blank');
            setExportingPDF(null);
        }, 50);
    };

    const handlePDFExport = () => {
        if (!campaign) return;
        const p = campaign.marketing_plan;
        if (!p) return;
        const c = campaign;
        const methodology = p.methodology;
        const persona = typeof p.target_persona === 'object' ? p.target_persona : { description: p.target_persona, pain_points: [], motivations: [] };
        const channelPlan = p.channel_plan || {};
        const budget = p.budget_allocation || {};
        const outcomes = p.expected_outcomes || {};
        const budgetBreakdown = budget.breakdown || budget;
        const budgetEntries = Object.entries(budgetBreakdown).filter(([key]) => key !== 'total' && key !== 'rationale').map(([channel, data]: [string, any]) => ({
            channel,
            amount: typeof data === 'number' ? data : data?.amount || 0,
            purpose: typeof data === 'object' ? data?.purpose : undefined,
        }));
        const maxBudget = Math.max(...budgetEntries.map(e => e.amount), 1);
        const mName = methodology?.name?.replace('_', ' ') || 'Marketing';
        const dur = p.campaign_duration_days || 28;
        const budgetStr = `&#8377;${c.budget.toLocaleString('en-IN')}`;

        const channelSections = ['email', 'whatsapp', 'instagram'].map(ch => {
            const cp = channelPlan[ch];
            if (!cp) return '';
            const label = ch === 'email' ? 'Email' : ch === 'whatsapp' ? 'WhatsApp' : 'Instagram';
            const color = ch === 'email' ? '#60a5fa' : ch === 'whatsapp' ? '#4ade80' : '#f472b6';
            const countLabel = ch === 'email' ? 'Emails' : ch === 'whatsapp' ? 'Messages' : 'Posts';
            const stages = cp.stages?.map((s: any) =>
                `<div style="display:inline-block;background:#f3f4f6;border-radius:6px;padding:8px 14px;margin:4px 6px 4px 0;font-size:14px;">
                    <strong style="color:${color};">D${s.day_range?.[0]}&#8211;${s.day_range?.[1]}</strong>
                    <span style="margin-left:6px;font-weight:600;">${s.stage_name}</span>
                    <br/><span style="color:#6b7280;font-size:13px;">${s.purpose}</span>
                </div>`
            ).join('') || '';
            return `
                <div style="border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:16px;page-break-inside:avoid;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <div>
                            <h4 style="margin:0;font-size:18px;">${label}</h4>
                            <span style="color:${color};font-size:14px;">${cp.journey_type?.replace('_', ' ') || ''}</span>
                        </div>
                        <span style="background:${color}22;color:${color};padding:4px 12px;border-radius:99px;font-size:13px;font-weight:700;">${cp.total_count} ${countLabel}</span>
                    </div>
                    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 12px 0;">${cp.rationale || ''}</p>
                    ${cp.audience_context ? `<p style="color:#6b7280;font-size:14px;font-style:italic;margin:0 0 12px 0;">Audience: ${cp.audience_context}</p>` : ''}
                    <div style="display:flex;flex-wrap:wrap;">${stages}</div>
                </div>`;
        }).join('');

        const budgetRows = budgetEntries.map(e => {
            const pct = Math.round((e.amount / maxBudget) * 100);
            return `<div style="margin-bottom:14px;">
                <div style="display:flex;justify-content:space-between;font-size:15px;margin-bottom:4px;">
                    <span style="text-transform:capitalize;">${e.channel.replace(/_/g, ' ')}</span>
                    <strong>&#8377;${e.amount.toLocaleString('en-IN')}</strong>
                </div>
                <div style="background:#e5e7eb;border-radius:99px;height:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
                    <div style="background:linear-gradient(90deg,#6366f1,#a855f7);height:8px;border-radius:99px;width:${pct}%;-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div>
                </div>
                ${e.purpose ? `<p style="color:#6b7280;font-size:13px;margin:4px 0 0;">${e.purpose}</p>` : ''}
            </div>`;
        }).join('');

        const kpiHtml = outcomes.secondary_kpis?.map((k: string) =>
            `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="color:#22c55e;">&#10003;</span> <span style="font-size:15px;">${k}</span></div>`
        ).join('') || '';

        const painHtml = persona.pain_points?.map((pt: string) =>
            `<li style="color:#374151;font-size:15px;margin-bottom:4px;">${pt}</li>`
        ).join('') || '';
        const motiveHtml = persona.motivations?.map((m: string) =>
            `<li style="color:#374151;font-size:15px;margin-bottom:4px;">${m}</li>`
        ).join('') || '';

        const msgHtml = p.key_messages?.map((m: string, i: number) =>
            `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;flex:1;min-width:220px;">
                <span style="color:#6366f1;font-size:13px;font-weight:700;">Message ${i + 1}</span>
                <p style="margin:6px 0 0;font-size:15px;line-height:1.5;color:#1e293b;">${m}</p>
            </div>`
        ).join('') || '';

        const timelineHtml = p.weekly_plan?.map((week: any) => {
            const tactics = week.tactics?.map((t: any) => {
                const chColor = t.channel === 'email' ? '#3b82f6' : t.channel === 'whatsapp' ? '#22c55e' : '#ec4899';
                return `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;padding-left:16px;border-left:3px solid ${chColor};-webkit-print-color-adjust:exact;print-color-adjust:exact;">
                    <div>
                        <span style="font-size:13px;color:#9ca3af;">Day ${t.day}</span>&nbsp;
                        <span style="font-size:14px;font-weight:600;color:${chColor};text-transform:capitalize;">${t.channel}</span>&nbsp;
                        <span style="font-size:14px;color:#1e293b;">${t.action}</span>
                        <p style="font-size:13px;color:#6b7280;margin:2px 0 0;">${t.description || ''}</p>
                    </div>
                </div>`;
            }).join('') || '';
            return `<div style="margin-bottom:20px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                    <span style="background:#6366f1;color:white;padding:4px 12px;border-radius:6px;font-size:13px;font-weight:700;-webkit-print-color-adjust:exact;print-color-adjust:exact;">Week ${week.week}</span>
                    <span style="font-size:16px;font-weight:600;">${week.theme}</span>
                    ${week.days_covered ? `<span style="color:#9ca3af;font-size:13px;">(${week.days_covered})</span>` : ''}
                </div>
                <p style="color:#6b7280;font-size:14px;margin:0 0 10px 0;">${week.goal || ''}</p>
                ${tactics}
            </div>`;
        }).join('') || '';

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${p.campaign_name || c.product_name} &#8212; Strategy</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; max-width: 850px; margin: 0 auto; padding: 40px 32px; line-height: 1.6; }
        h1 { font-size: 28px; margin-bottom: 8px; }
        h2 { font-size: 20px; margin-bottom: 12px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; page-break-after: avoid; }
        h3 { font-size: 16px; margin-bottom: 8px; page-break-after: avoid; }
        .badge { display: inline-block; padding: 4px 14px; border-radius: 99px; font-size: 13px; font-weight: 700; margin-right: 8px; margin-bottom: 8px; }
        .section { margin-bottom: 24px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; page-break-inside: avoid; }
        @media print {
            body { padding: 20px 16px; }
            h2, h3 { page-break-after: avoid; }
            .card { page-break-inside: avoid; }
            p, li { orphans: 3; widows: 3; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="position:sticky;top:0;z-index:100;background:#1e1b4b;padding:12px 32px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);">
        <span style="color:#a5b4fc;font-size:14px;">Review your content, then save as PDF</span>
        <button onclick="window.print()" style="background:#6366f1;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">🖨️ Save as PDF</button>
    </div>
    <div style="background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:16px;padding:28px 32px;color:white;margin-bottom:28px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
        <div style="margin-bottom:8px;">
            <span class="badge" style="background:rgba(255,255,255,0.25);color:white;-webkit-print-color-adjust:exact;print-color-adjust:exact;">${mName.toUpperCase()}</span>
            <span class="badge" style="background:rgba(255,255,255,0.25);color:white;-webkit-print-color-adjust:exact;print-color-adjust:exact;">${dur} DAY CAMPAIGN</span>
            <span class="badge" style="background:rgba(255,255,255,0.25);color:white;-webkit-print-color-adjust:exact;print-color-adjust:exact;">${budgetStr}</span>
        </div>
        <h1 style="color:white;">${p.campaign_name || c.product_name}</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:15px;margin-top:8px;">${p.strategy_summary || ''}</p>
    </div>

    <div class="section grid-2">
        <div class="card">
            <h2 style="border-color:#c7d2fe;">&#127919; Target Persona</h2>
            <p style="font-size:15px;color:#374151;margin-bottom:12px;">${persona.description || ''}</p>
            ${painHtml ? `<h3 style="color:#dc2626;">Pain Points</h3><ul style="padding-left:20px;margin-bottom:12px;">${painHtml}</ul>` : ''}
            ${motiveHtml ? `<h3 style="color:#16a34a;">Motivations</h3><ul style="padding-left:20px;">${motiveHtml}</ul>` : ''}
        </div>
        <div class="card">
            <h2 style="border-color:#e9d5ff;">&#128161; Methodology: ${mName}</h2>
            <p style="font-size:15px;color:#374151;line-height:1.7;">${methodology?.reasoning || ''}</p>
        </div>
    </div>

    ${msgHtml ? `<div class="section"><h2>&#128172; Key Campaign Messages</h2><div style="display:flex;flex-wrap:wrap;gap:12px;">${msgHtml}</div></div>` : ''}

    <div class="section">
        <h2>&#128202; Channel Strategy</h2>
        ${channelSections}
    </div>

    <div class="section grid-2">
        <div class="card">
            <h2 style="border-color:#d1fae5;">&#128176; Budget Allocation</h2>
            ${budgetRows}
            <div style="border-top:1px solid #e2e8f0;padding-top:10px;margin-top:8px;display:flex;justify-content:space-between;font-size:16px;">
                <strong>Total</strong>
                <strong>&#8377;${(budget.total || c.budget).toLocaleString('en-IN')}</strong>
            </div>
            ${budget.rationale ? `<p style="color:#6b7280;font-size:13px;font-style:italic;margin-top:10px;">${budget.rationale}</p>` : ''}
        </div>
        <div class="card">
            <h2 style="border-color:#fef3c7;">&#128200; Expected Outcomes</h2>
            ${outcomes.primary_kpi ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:14px;margin-bottom:14px;-webkit-print-color-adjust:exact;print-color-adjust:exact;"><span style="color:#d97706;font-size:13px;font-weight:700;text-transform:uppercase;">Primary KPI</span><p style="font-size:17px;font-weight:600;margin-top:4px;">${outcomes.primary_kpi}</p></div>` : ''}
            ${kpiHtml ? `<div style="margin-bottom:12px;">${kpiHtml}</div>` : ''}
            ${outcomes.success_criteria ? `<div style="border-top:1px solid #e2e8f0;padding-top:10px;"><h3 style="color:#6b7280;font-size:13px;text-transform:uppercase;">Success Criteria</h3><p style="font-size:15px;margin-top:4px;">${outcomes.success_criteria}</p></div>` : ''}
        </div>
    </div>

    ${timelineHtml ? `<div class="section"><h2>&#128197; Campaign Timeline</h2>${timelineHtml}</div>` : ''}

    <div style="text-align:center;color:#9ca3af;font-size:13px;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px;">
        Generated by MiCA &#8212; Marketing Intelligence &amp; Campaign Automation
    </div>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        setExportingPDF('strategy');
        setTimeout(() => {
            window.open(url, '_blank');
            setExportingPDF(null);
        }, 50);
    };

    const handlePauseResume = async () => {
        if (!campaign) return;
        try {
            if (campaign.status === 'executing') {
                if (confirm("Pause this campaign? Scheduled tasks will NOT execute until resumed.")) {
                    await pauseCampaign(campaign.id);
                    setCampaign({ ...campaign, status: 'paused' });
                }
            } else if (campaign.status === 'paused') {
                await resumeCampaign(campaign.id);
                setCampaign({ ...campaign, status: 'executing' });
            }
        } catch (error) {
            console.error("Failed to toggle campaign status:", error);
            alert("Failed to update status.");
        }
    };

    if (loading) return (
        <Layout>
            <div className="min-h-screen bg-black text-white">
                <div className="border-b border-gray-800 px-6 py-4">
                    <div className="h-8 w-64 bg-gray-900 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] h-[calc(100vh-73px)]">
                    <div className="border-r border-gray-800 bg-gray-950 p-6 space-y-8">
                        <div className="aspect-[9/16] bg-gray-900 rounded-2xl animate-pulse"></div>
                        <div className="space-y-4">
                            <div className="h-4 w-32 bg-gray-900 rounded animate-pulse"></div>
                            <div className="h-24 bg-gray-900 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="flex gap-4 mb-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-10 w-32 bg-gray-900 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="h-40 bg-gray-900 rounded-xl animate-pulse"></div>
                            <div className="h-40 bg-gray-900 rounded-xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    ); if (!campaign) return <Layout><div className="text-white p-8">Campaign not found</div></Layout>;

    const isLive = campaign.status === 'executing' || campaign.status === 'paused';

    const renderOverview = () => {
        const plan = campaign.marketing_plan;
        if (!plan) return <div className="text-gray-400 text-center py-12 text-lg">Strategy data not available.</div>;

        const methodology = plan.methodology;
        const persona = typeof plan.target_persona === 'object' ? plan.target_persona : { description: plan.target_persona, pain_points: [], motivations: [] };
        const channelPlan = plan.channel_plan || {};
        const budget = plan.budget_allocation || {};
        const outcomes = plan.expected_outcomes || {};

        // Budget bar chart helper
        const budgetBreakdown = budget.breakdown || budget;
        const budgetEntries = Object.entries(budgetBreakdown).filter(([key]) => key !== 'total' && key !== 'rationale').map(([channel, data]: [string, any]) => ({
            channel,
            amount: typeof data === 'number' ? data : data?.amount || 0,
            purpose: typeof data === 'object' ? data?.purpose : undefined,
        }));
        const maxBudget = Math.max(...budgetEntries.map(e => e.amount), 1);

        // Methodology gradient colors
        const methodologyColors: Record<string, string> = {
            'AIDA': 'from-blue-500 to-cyan-500',
            'PAS': 'from-red-500 to-orange-500',
            'Storytelling': 'from-purple-500 to-pink-500',
            'Scarcity': 'from-amber-500 to-yellow-500',
            'Social_Proof': 'from-green-500 to-emerald-500',
            'Educational': 'from-indigo-500 to-violet-500',
        };
        const gradientClass = methodologyColors[methodology?.name] || 'from-indigo-500 to-purple-500';

        // ─── PDF EXPORT HANDLER defined at component level ───


        return (
            <div className="animate-in fade-in max-w-5xl mx-auto pb-12">
                <div className="bg-gray-950/40 relative border border-gray-800 rounded-3xl p-6 md:p-12 shadow-[0_0_60px_rgba(0,0,0,0.5)] mt-8 group/document ring-1 ring-white/5 space-y-10">
                    <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 rounded-3xl opacity-0 group-hover/document:opacity-100 transition-opacity duration-700 blur border-none pointer-events-none z-0"></div>
                    <div className="relative z-10 space-y-10">
                        {/* â”€â”€â”€ HEADER BANNER â”€â”€â”€ */}
                        <div className={`bg-gradient-to-r ${gradientClass} rounded-2xl p-10 relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="relative z-10">
                                <div className="flex flex-wrap gap-3 mb-5">
                                    {methodology?.name && (
                                        <span className="bg-white/25 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                                            {methodology.name.replace('_', ' ')} Methodology
                                        </span>
                                    )}
                                    <span className="bg-white/25 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                                        {plan.campaign_duration_days || 28} Day Campaign
                                    </span>
                                    <span className="bg-white/25 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                                        ₹{campaign.budget.toLocaleString('en-IN')} Budget
                                    </span>
                                </div>
                                <h2 className="text-4xl font-bold text-white mb-3">{plan.campaign_name || campaign.product_name}</h2>
                                <p className="text-white/90 text-base leading-relaxed max-w-3xl">{plan.strategy_summary}</p>
                            </div>
                        </div>

                        {/* ─── TWO COLUMN GRID: PERSONA + METHODOLOGY ─── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* TARGET PERSONA */}
                            <div className="group/section bg-gray-900/40 backdrop-blur-sm border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-2xl p-8 hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(99,102,241,0.25)] hover:border-indigo-400/60 hover:bg-gray-800/50 transition-all duration-500 cursor-default">
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3 pb-4 border-b border-white/10">
                                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    Target Persona
                                </h3>
                                <p className="text-gray-100 text-lg leading-relaxed mb-8">{persona.description}</p>

                                {persona.pain_points?.length > 0 && (
                                    <div className="mb-8">
                                        <h4 className="text-base font-bold text-red-400 uppercase tracking-wider mb-4">Pain Points</h4>
                                        <div className="space-y-3">
                                            {persona.pain_points.map((point: string, i: number) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <span className="text-red-400 mt-1 flex-shrink-0 text-xl">•</span>
                                                    <span className="text-gray-200 text-lg leading-relaxed">{point}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {persona.motivations?.length > 0 && (
                                    <div>
                                        <h4 className="text-base font-bold text-emerald-400 uppercase tracking-wider mb-4">Motivations</h4>
                                        <div className="space-y-3">
                                            {persona.motivations.map((motive: string, i: number) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <span className="text-emerald-400 mt-1 flex-shrink-0 text-xl">•</span>
                                                    <span className="text-gray-200 text-lg leading-relaxed">{motive}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* METHODOLOGY */}
                            <div className="group/section bg-gray-900/40 backdrop-blur-sm border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-2xl p-8 hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(99,102,241,0.25)] hover:border-indigo-400/60 hover:bg-gray-800/50 transition-all duration-500 cursor-default">
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3 pb-4 border-b border-white/10">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                    Chosen Methodology
                                </h3>
                                {methodology?.name && (
                                    <div className={`bg-gradient-to-r ${gradientClass} text-white text-xl font-bold px-6 py-4 rounded-xl mb-6 shadow-lg inline-block`}>
                                        {methodology.name.replace('_', ' ')}
                                    </div>
                                )}
                                <p className="text-gray-100 text-lg leading-relaxed">{methodology?.reasoning || 'Methodology reasoning not available.'}</p>
                            </div>
                        </div>

                        {/* ─── KEY MESSAGES ─── */}
                        {plan.key_messages?.length > 0 && (
                            <div className="group/section bg-gray-900/40 backdrop-blur-sm border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-2xl p-8 hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(99,102,241,0.25)] hover:border-indigo-400/60 hover:bg-gray-800/50 transition-all duration-500 cursor-default">
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3 pb-4 border-b border-white/10">
                                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                    Key Campaign Messages
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {plan.key_messages.map((msg: string, i: number) => (
                                        <div key={i} className="bg-gray-950/50 border border-white/5 p-6 rounded-xl hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-shadow duration-300">
                                            <span className="text-indigo-400 text-base font-bold tracking-wide">Message {i + 1}</span>
                                            <p className="text-gray-100 text-lg mt-3 leading-relaxed">{msg}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── CHANNEL STRATEGY ─── */}
                        <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-2xl p-8">
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-8 flex items-center gap-3 pb-4 border-b border-white/10">
                                <LayoutDashboard className="w-6 h-6 text-indigo-400" />
                                Channel Strategy
                            </h3>
                            <div className="space-y-8">
                                {/* Email Channel */}
                                {channelPlan.email && (
                                    <div className="bg-gray-950/50 rounded-xl p-8 border border-white/5 hover:-translate-y-1.5 hover:border-indigo-400/60 hover:shadow-[0_15px_40px_rgba(99,102,241,0.25)] hover:bg-gray-900/80 transition-all duration-500 cursor-default">
                                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-blue-500/20 p-3 rounded-xl"><Mail className="w-6 h-6 text-blue-400" /></div>
                                                <div>
                                                    <h4 className="text-white font-bold text-xl">Email</h4>
                                                    <span className="text-blue-400 text-base">{channelPlan.email.journey_type?.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                            <span className="bg-blue-500/20 text-blue-300 text-base font-bold px-5 py-2 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)]">{channelPlan.email.total_count} Emails</span>
                                        </div>
                                        <p className="text-gray-100 text-lg mb-6 leading-relaxed">{channelPlan.email.rationale}</p>
                                        {channelPlan.email.stages?.length > 0 && (
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                                {channelPlan.email.stages.map((stage: any, i: number) => (
                                                    <div key={i} className="bg-gray-900/60 p-5 rounded-xl border border-white/5">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="bg-blue-500/30 text-blue-200 text-sm font-bold px-2.5 py-1 rounded">D{stage.day_range?.[0]}–{stage.day_range?.[1]}</span>
                                                            <span className="text-white text-base font-bold">{stage.stage_name}</span>
                                                        </div>
                                                        <p className="text-gray-300 text-base leading-relaxed">{stage.purpose}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* WhatsApp Channel */}
                                {channelPlan.whatsapp && (
                                    <div className="bg-gray-950/50 rounded-xl p-8 border border-white/5 hover:-translate-y-1.5 hover:border-green-400/60 hover:shadow-[0_15px_40px_rgba(34,197,94,0.25)] hover:bg-gray-900/80 transition-all duration-500 cursor-default">
                                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-green-500/20 p-3 rounded-xl"><MessageSquare className="w-6 h-6 text-green-400" /></div>
                                                <div>
                                                    <h4 className="text-white font-bold text-xl">WhatsApp</h4>
                                                    <span className="text-green-400 text-base">{channelPlan.whatsapp.journey_type?.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                            <span className="bg-green-500/20 text-green-300 text-base font-bold px-5 py-2 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.2)]">{channelPlan.whatsapp.total_count} Messages</span>
                                        </div>
                                        <p className="text-gray-100 text-lg mb-6 leading-relaxed">{channelPlan.whatsapp.rationale}</p>
                                        {channelPlan.whatsapp.audience_context && (
                                            <p className="text-gray-300 text-base italic mb-6">Audience: {channelPlan.whatsapp.audience_context}</p>
                                        )}
                                        {channelPlan.whatsapp.stages?.length > 0 && (
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                                {channelPlan.whatsapp.stages.map((stage: any, i: number) => (
                                                    <div key={i} className="bg-gray-900/60 p-5 rounded-xl border border-white/5">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="bg-green-500/30 text-green-200 text-sm font-bold px-2.5 py-1 rounded">D{stage.day_range?.[0]}–{stage.day_range?.[1]}</span>
                                                            <span className="text-white text-base font-bold">{stage.stage_name}</span>
                                                        </div>
                                                        <p className="text-gray-300 text-base leading-relaxed">{stage.purpose}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Instagram Channel */}
                                {channelPlan.instagram && (
                                    <div className="bg-gray-950/50 rounded-xl p-8 border border-white/5 hover:-translate-y-1.5 hover:border-pink-400/60 hover:shadow-[0_15px_40px_rgba(236,72,153,0.25)] hover:bg-gray-900/80 transition-all duration-500 cursor-default">
                                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-pink-500/20 p-3 rounded-xl"><Instagram className="w-6 h-6 text-pink-400" /></div>
                                                <div>
                                                    <h4 className="text-white font-bold text-xl">Instagram</h4>
                                                    <span className="text-pink-400 text-base">{channelPlan.instagram.journey_type?.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                            <span className="bg-pink-500/20 text-pink-300 text-base font-bold px-5 py-2 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.2)]">{channelPlan.instagram.total_count} Posts</span>
                                        </div>
                                        <p className="text-gray-100 text-lg mb-6 leading-relaxed">{channelPlan.instagram.rationale}</p>

                                        {/* Content Mix */}
                                        {channelPlan.instagram.content_mix && (
                                            <div className="mb-6">
                                                <h5 className="text-base text-gray-400 uppercase tracking-wider mb-3 font-semibold">Content Mix</h5>
                                                <div className="flex flex-wrap gap-3">
                                                    {Object.entries(channelPlan.instagram.content_mix).filter(([, v]) => (v as number) > 0).map(([type, count]) => (
                                                        <span key={type} className="bg-pink-500/15 text-pink-200 text-base font-semibold px-4 py-1.5 rounded-full border border-pink-500/25">
                                                            {type.replace('_', ' ')}: {count as number}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {channelPlan.instagram.stages?.length > 0 && (
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                                {channelPlan.instagram.stages.map((stage: any, i: number) => (
                                                    <div key={i} className="bg-gray-900/60 p-5 rounded-xl border border-white/5">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="bg-pink-500/30 text-pink-200 text-sm font-bold px-2.5 py-1 rounded">D{stage.day_range?.[0]}–{stage.day_range?.[1]}</span>
                                                            <span className="text-white text-base font-bold">{stage.stage_name}</span>
                                                        </div>
                                                        <p className="text-gray-300 text-base leading-relaxed">{stage.purpose}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ─── TWO COLUMN: BUDGET + OUTCOMES ─── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Budget Allocation */}
                            <div className="group/section bg-gray-900/40 backdrop-blur-sm border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-2xl p-8 hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(99,102,241,0.25)] hover:border-indigo-400/60 hover:bg-gray-800/50 transition-all duration-500 cursor-default">
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3 pb-4 border-b border-white/10">
                                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Budget Allocation
                                </h3>
                                <div className="space-y-6 mb-6">
                                    {budgetEntries.map((entry, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-lg mb-2">
                                                <span className="text-gray-200 capitalize font-medium">{entry.channel.replace('_', ' ')}</span>
                                                <span className="text-white font-bold">₹{entry.amount.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="w-full bg-gray-950/50 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                                    style={{ width: `${(entry.amount / maxBudget) * 100}%` }}
                                                />
                                            </div>
                                            {entry.purpose && <p className="text-gray-400 text-base mt-2">{entry.purpose}</p>}
                                        </div>
                                    ))}
                                </div>
                                {budget.rationale && (
                                    <p className="text-gray-300 text-base italic border-t border-white/10 pt-6">{budget.rationale}</p>
                                )}
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-200 text-lg font-bold uppercase tracking-wide">Total</span>
                                        <span className="text-white font-bold text-2xl">₹{(budget.total || campaign.budget).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Expected Outcomes */}
                            <div className="group/section bg-gray-900/40 backdrop-blur-sm border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-2xl p-8 hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(99,102,241,0.25)] hover:border-indigo-400/60 hover:bg-gray-800/50 transition-all duration-500 cursor-default">
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3 pb-4 border-b border-white/10">
                                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    Expected Outcomes
                                </h3>
                                {outcomes.primary_kpi && (
                                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-6 mb-6 shadow-[0_4px_15px_rgba(245,158,11,0.1)]">
                                        <span className="text-amber-400 text-base font-bold uppercase tracking-wider block mb-2">Primary KPI</span>
                                        <p className="text-white font-bold text-xl">{outcomes.primary_kpi}</p>
                                    </div>
                                )}
                                {outcomes.secondary_kpis?.length > 0 && (
                                    <div className="space-y-4 mb-6">
                                        <h4 className="text-base text-gray-400 uppercase tracking-wider font-semibold mb-3">Secondary KPIs</h4>
                                        {outcomes.secondary_kpis.map((kpi: string, i: number) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                                <span className="text-gray-100 text-lg">{kpi}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {outcomes.success_criteria && (
                                    <div className="border-t border-white/10 pt-6">
                                        <h4 className="text-base text-gray-400 uppercase tracking-wider mb-3 font-semibold">Success Criteria</h4>
                                        <p className="text-gray-200 text-lg leading-relaxed">{outcomes.success_criteria}</p>
                                    </div>
                                )}
                                {/* Fallback for old strategy format */}
                                {!outcomes.primary_kpi && outcomes.reach && (
                                    <div className="space-y-4">
                                        <div><span className="text-gray-400 text-base uppercase font-semibold">Reach:</span><p className="text-gray-100 text-lg">{outcomes.reach}</p></div>
                                        {outcomes.engagement_rate && <div><span className="text-gray-400 text-base uppercase font-semibold">Engagement:</span><p className="text-gray-100 text-lg">{outcomes.engagement_rate}</p></div>}
                                        {outcomes.conversion_estimate && <div><span className="text-gray-300 text-sm uppercase font-semibold">Conversion:</span><p className="text-gray-200 text-base">{outcomes.conversion_estimate}</p></div>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ─── WEEKLY PLAN TIMELINE ─── */}
                        {plan.weekly_plan?.length > 0 && (
                            <div className="group/section bg-gray-900/40 backdrop-blur-sm border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-2xl p-8 hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(99,102,241,0.25)] hover:border-indigo-400/60 hover:bg-gray-800/50 transition-all duration-500 cursor-default">
                                <h3 className="text-base font-bold text-gray-100 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Campaign Timeline
                                </h3>
                                <div className="space-y-8">
                                    {plan.weekly_plan.map((week: any, wIdx: number) => (
                                        <div key={wIdx} className="relative">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="bg-indigo-500/20 text-indigo-300 text-sm font-bold px-4 py-2 rounded-lg">
                                                    Week {week.week}
                                                </div>
                                                <div>
                                                    <span className="text-white text-base font-semibold">{week.theme}</span>
                                                    {week.days_covered && <span className="text-gray-400 text-sm ml-2">({week.days_covered})</span>}
                                                </div>
                                            </div>
                                            <p className="text-gray-300 text-sm mb-4 ml-1">{week.goal}</p>

                                            {week.tactics?.length > 0 && (
                                                <div className="ml-5 border-l-2 border-gray-700 pl-5 space-y-3">
                                                    {week.tactics.map((tactic: any, tIdx: number) => {
                                                        const channelColor = tactic.channel === 'email' ? 'bg-blue-400'
                                                            : tactic.channel === 'whatsapp' ? 'bg-green-400'
                                                                : tactic.channel === 'instagram' ? 'bg-pink-400'
                                                                    : 'bg-gray-400';
                                                        return (
                                                            <div key={tIdx} className="relative flex items-start gap-3">
                                                                <div className={`absolute -left-[25px] top-2 w-3 h-3 rounded-full ${channelColor}`}></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2.5 flex-wrap">
                                                                        <span className="text-gray-400 text-sm font-mono">Day {tactic.day}</span>
                                                                        <span className={`text-sm font-semibold capitalize ${tactic.channel === 'email' ? 'text-blue-400' : tactic.channel === 'whatsapp' ? 'text-green-400' : 'text-pink-400'}`}>
                                                                            {tactic.channel}
                                                                        </span>
                                                                        <span className="text-white text-sm">{tactic.action}</span>
                                                                    </div>
                                                                    <p className="text-gray-400 text-sm mt-1">{tactic.description}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* â”€â”€â”€ NO CONTACT DATA ALERT â”€â”€â”€ */}
                        {plan.no_contact_data_notice && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 flex items-start gap-4">
                                <div className="bg-amber-500/20 p-2.5 rounded-lg flex-shrink-0">
                                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-amber-300 font-bold text-base mb-1">Customer Data Required</h4>
                                    <p className="text-amber-100/80 text-base leading-relaxed">{plan.no_contact_data_notice}</p>
                                    <p className="text-amber-200/60 text-sm mt-2">Your entire campaign is ready — emails written, WhatsApp messages crafted, Instagram posts designed. Upload a CSV with customer contacts to activate delivery.</p>
                                </div>
                            </div>
                        )}

                        {/* â”€â”€â”€ EXPORT BUTTON â”€â”€â”€ */}
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="outline"
                                className="text-gray-300 border-gray-600 hover:bg-gray-800 hover:text-white px-8 py-3 text-base"
                                onClick={handlePDFExport}
                                disabled={exportingPDF === 'strategy'}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                {exportingPDF === 'strategy' ? 'Opening…' : 'Export Strategy as PDF'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    const renderEmails = () => (
        <div className="grid gap-4 animate-in fade-in">
            {emails.map((email) => (
                <div key={email.id} className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden shadow-sm border border-white/10 hover:bg-white/10 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                        <div>
                            <span className="bg-amber-500/10 text-amber-500 text-xs font-bold px-2 py-1 rounded mr-3 border border-amber-500/20">Day {email.scheduled_day}</span>
                            <span className="text-gray-100 font-semibold">{email.subject}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className={`text-xs transition-colors ${copiedId === email.id ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-white/10'}`}
                                onClick={() => handleCopy(email.id, `Subject: ${email.subject}\n\n${stripHtml(email.body)}\n\nCTA: ${email.cta_text}`)}
                            >
                                {copiedId === email.id ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/30 font-medium shadow-sm group-hover:bg-indigo-500/20"
                                onClick={() => handleSendTest(email.id, 'email', email)}
                                disabled={sendingTest === email.id}
                            >
                                <Send className="w-3 h-3 mr-1" />
                                {sendingTest === email.id ? 'Sending...' : 'Send Test'}
                            </Button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="text-xs text-gray-300 mb-4 bg-white/5 inline-block px-3 py-1.5 rounded border border-white/10">
                            <strong className="text-white">Preview:</strong> {email.pre_header}
                        </div>
                        <div
                            className="prose prose-sm prose-invert max-w-none text-gray-200 bg-transparent p-5 rounded-lg border border-white/10 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: email.body }}
                        />
                        <div className="mt-4 flex justify-end">
                            <span className="text-xs text-gray-400 italic bg-white/5 px-2 py-1 rounded">CTA: {email.cta_text}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderWhatsApp = () => (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in py-4">
            {whatsappMessages.map((msg) => (
                <div key={msg.id} className="relative group bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                        <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                            Day {msg.scheduled_day}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase font-medium">{msg.message_type}</span>
                    </div>

                    <div className="flex items-end justify-center w-full">
                        <div className="flex flex-col gap-1 items-end w-full">
                            <div className="bg-[#005c4b] text-white p-4 rounded-xl rounded-tr-sm shadow-md text-sm leading-relaxed relative text-left w-full sm:w-[85%] ml-auto">
                                {msg.message_text}
                                <div className="text-[10px] text-green-200/70 text-right mt-2 flex items-center justify-end gap-1">
                                    <span>10:00 AM</span>
                                    <CheckCircle2 className="w-3 h-3 text-blue-400" />
                                </div>
                            </div>
                            <div className="w-full flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`text-xs transition-colors ${copiedId === msg.id ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    onClick={() => handleCopy(msg.id, msg.message_text)}
                                >
                                    {copiedId === msg.id ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 text-xs"
                                    onClick={() => handleSendTest(msg.id, 'whatsapp', msg)}
                                    disabled={sendingTest === msg.id}
                                >
                                    <Send className="w-3 h-3 mr-1" /> {sendingTest === msg.id ? 'Sending...' : 'Send Test Msg'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderSocial = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            {socialPosts.filter(p => p.post_type !== 'story').map((post) => (
                <SocialPostCard
                    key={post.id}
                    post={post}
                    onGenerateImage={handleGenerateImage}
                    generatingImageId={generatingImageId}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                />
            ))}
        </div>
    );

    const renderVideoAd = () => {
        if (!campaign.recommended_channels.includes('video_ad')) {
            return (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-900 rounded-xl border border-gray-800 text-center">
                    <Video className="w-12 h-12 text-gray-700 mb-4" />
                    <h3 className="text-white font-medium text-lg mb-2">Video Ads Not Recommended</h3>
                    <p className="text-gray-400 max-w-md">
                        Based on your budget of â‚¹{campaign.budget}, we recommend focusing on organic channels first. Increase budget to â‚¹25,000+ to unlock video ads.
                    </p>
                </div>
            );
        }

        return (
            <div className="max-w-md mx-auto">
                <VideoPlayer
                    videoUrl={campaign.video_url}
                    videoStatus={campaign.video_status}
                    videoStartedAt={campaign.video_started_at}
                    onCheckNow={checkVideoNow}
                    onCancel={campaign.heygen_video_id ? cancelVideoNow : undefined}
                    description="This is your main campaign video ad, optimized for Instagram Reels and YouTube Shorts."
                    script={campaign.video_script}
                    showScript={true}
                />
            </div>
        );
    };

    const renderVideoAdsPlaceholder = () => (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-900 rounded-xl border border-gray-800 text-center mb-8 shadow-[0_0_30px_rgba(255,122,0,0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FF7A00]/5 to-purple-500/5 blur-2xl z-0 group-hover:from-[#FF7A00]/10 transition-all duration-700"></div>
            <div className="w-16 h-16 bg-[#FF7A00]/10 border border-[#FF7A00]/30 rounded-full flex items-center justify-center mb-6 z-10 box-shadow-[0_0_15px_rgba(255,122,0,0.4)]">
                <Video className="w-8 h-8 text-[#FF7A00]" />
            </div>
            <h3 className="text-white font-bold text-2xl mb-3 z-10">Video Advertisements</h3>
            <p className="text-gray-300 max-w-md mb-8 z-10 text-lg">
                Coming soon. Be ready for the awesomeness! ✨
            </p>
            <Button variant="outline" disabled className="z-10 border-[#FF7A00]/50 text-[#FF7A00] bg-[#FF7A00]/5">In Development</Button>
        </div>
    );

    // Determine which tabs to show based on state
    // If Live, show "Campaign Live" first
    const tabs = [
        ...(isLive ? [{ id: 'campaign_live', label: 'Campaign Live', icon: CheckCircle2, show: true }] : []),
        { id: 'overview', label: 'Strategy', icon: LayoutDashboard, show: true },
        { id: 'emails', label: 'Emails', icon: Mail, show: true },
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, show: true },
        { id: 'social', label: 'Instagram', icon: Instagram, show: true },
        { id: 'video_ad', label: 'Video Ad', icon: Video, show: campaign.recommended_channels.includes('video_ad') },
        { id: 'execution_log', label: 'Execution Log', icon: LayoutDashboard, show: true }, // Always show log
        { id: 'video_ads_placeholder', label: 'Video Advertisements', icon: Video, show: true }
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-transparent text-white">
                {/* Navbar Area */}
                <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-3">
                                {campaign.product_name}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wide font-bold ${campaign.status === 'executing' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                                    campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                        campaign.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                    }`}>
                                    {campaign.status.replace('_', ' ')}
                                </span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Header controls removed Budget display */}

                        <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-300 border-gray-600 hover:bg-gray-800 hover:text-white"
                            onClick={handlePDFExport}
                            disabled={exportingPDF === 'strategy'}
                        >
                            <Download className="w-4 h-4 mr-2" /> {exportingPDF === 'strategy' ? 'Opening…' : 'Export Strategy'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-300 border-gray-600 hover:bg-gray-800 hover:text-white"
                            onClick={handleAssetsPDFExport}
                            disabled={exportingPDF === 'assets'}
                        >
                            <Download className="w-4 h-4 mr-2" /> {exportingPDF === 'assets' ? 'Opening…' : 'Download All Assets'}
                        </Button>

                        {/* Status Actions */}
                        {isLive && (
                            campaign.status === 'executing' ? (
                                <Button
                                    onClick={handlePauseResume}
                                    variant="outline"
                                    className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
                                >
                                    <PauseCircle className="w-4 h-4 mr-2" /> Pause Campaign
                                </Button>
                            ) : (
                                <Button
                                    onClick={handlePauseResume}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <PlayCircle className="w-4 h-4 mr-2" /> Resume Campaign
                                </Button>
                            )
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] h-[calc(100vh-73px)] overflow-hidden">

                    {/* LEFT PANEL - SCROLLABLE */}
                    <div className="border-r border-gray-800 bg-transparent overflow-y-auto p-6 custom-scrollbar">
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Campaign Video</h3>
                            <VideoPlayer
                                videoUrl={campaign.video_url}
                                videoStatus={campaign.video_status}
                                videoStartedAt={campaign.video_started_at}
                                onCheckNow={checkVideoNow}
                                onCancel={campaign.heygen_video_id ? cancelVideoNow : undefined}
                                script={campaign.video_script}
                            />
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Summary</h3>
                            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {campaign.marketing_plan?.strategy_summary?.slice(0, 200)}...
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Assets Generated</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm p-3 bg-gray-900 rounded border border-gray-800">
                                    <span className="text-gray-400">Emails</span>
                                    <span className="text-white font-mono">{emails.length}</span>
                                </div>
                                <div className="flex justify-between text-sm p-3 bg-gray-900 rounded border border-gray-800">
                                    <span className="text-gray-400">WhatsApp Msgs</span>
                                    <span className="text-white font-mono">{whatsappMessages.length}</span>
                                </div>
                                <div className="flex justify-between text-sm p-3 bg-gray-900 rounded border border-gray-800">
                                    <span className="text-gray-400">Social Posts</span>
                                    <span className="text-white font-mono">{socialPosts.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL - MAIN CONTENT */}
                    <div className="flex flex-col h-full bg-transparent overflow-hidden relative">

                        {/* Tabs */}
                        <div className="flex overflow-x-auto border-b border-gray-800 bg-transparent px-6 relative z-10">
                            {tabs.map(tab => {
                                if (tab.show === false) return null;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-300 whitespace-nowrap relative ${activeTab === tab.id
                                            ? tab.id === 'overview' ? 'border-purple-500 text-purple-400 bg-purple-500/10 shadow-[inset_0_-2px_10px_rgba(168,85,247,0.2),0_15px_30px_-5px_rgba(168,85,247,0.25)]'
                                                : tab.id === 'emails' ? 'border-amber-500 text-amber-400 bg-amber-500/10 shadow-[inset_0_-2px_10px_rgba(245,158,11,0.2),0_15px_30px_-5px_rgba(245,158,11,0.25)]'
                                                    : tab.id === 'whatsapp' ? 'border-green-500 text-green-400 bg-green-500/10 shadow-[inset_0_-2px_10px_rgba(34,197,94,0.2),0_15px_30px_-5px_rgba(34,197,94,0.25)]'
                                                        : tab.id === 'social' ? 'border-pink-500 text-pink-400 bg-gradient-to-t from-pink-500/10 to-transparent shadow-[inset_0_-2px_10px_rgba(236,72,153,0.3),0_15px_30px_-5px_rgba(236,72,153,0.25)]'
                                                            : tab.id === 'execution_log' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10 shadow-[inset_0_-2px_10px_rgba(6,182,212,0.2),0_15px_30px_-5px_rgba(6,182,212,0.25)]'
                                                                : tab.id === 'video_ads_placeholder' ? 'border-[#FF7A00] text-[#FF7A00] bg-[#FF7A00]/10 shadow-[inset_0_-2px_10px_rgba(255,122,0,0.2),0_15px_30px_-5px_rgba(255,122,0,0.25)]'
                                                                    : tab.id === 'campaign_live' ? 'border-[#FF7A00] text-[#FF7A00] bg-[#FF7A00]/15 font-bold shadow-[inset_0_-2px_14px_rgba(255,122,0,0.3),0_15px_35px_-5px_rgba(255,122,0,0.35)]'
                                                                        : 'border-indigo-500 text-indigo-400 bg-indigo-500/10 shadow-[inset_0_-2px_10px_rgba(99,102,241,0.2),0_15px_30px_-5px_rgba(99,102,241,0.25)]'
                                            : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-900/50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" /> {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="max-w-5xl mx-auto">

                                {/* Launch Section (Only visible on Strategy tab when plan_ready) */}
                                {campaign.status === 'plan_ready' && activeTab === 'overview' && (
                                    <LaunchSection
                                        campaignId={campaign.id}
                                        recipientCount={recipientCount}
                                        recommendedChannels={campaign.recommended_channels}
                                        emailCount={emails.length}
                                        whatsappCount={whatsappMessages.length}
                                        socialCount={socialPosts.length}
                                        onContactsUploaded={(count) => setRecipientCount(count)}
                                        onLaunchComplete={() => {
                                            // In Demo Mode, update the global object so state persists during navigation
                                            if (DEMO_MODE_ENABLED()) {
                                                DEMO_CAMPAIGN.status = 'executing';
                                            }

                                            setCampaign({ ...campaign, status: 'executing', campaign_start_date: new Date().toISOString().split('T')[0] });
                                            setActiveTab('campaign_live');
                                        }}
                                    />
                                )}

                                {activeTab === 'campaign_live' && isLive && (
                                    <div className="animate-fade-in">
                                        <CampaignTimeline
                                            campaignId={campaign.id}
                                            startDate={campaign.campaign_start_date || new Date().toISOString()}
                                            isPaused={campaign.status === 'paused'}
                                        />
                                    </div>
                                )}

                                {activeTab === 'overview' && <div className="animate-fade-in">{renderOverview()}</div>}
                                {activeTab === 'emails' && <div className="animate-fade-in">{renderEmails()}</div>}
                                {activeTab === 'whatsapp' && <div className="animate-fade-in">{renderWhatsApp()}</div>}
                                {activeTab === 'social' && <div className="animate-fade-in">{renderSocial()}</div>}
                                {activeTab === 'video_ad' && <div className="animate-fade-in">{renderVideoAd()}</div>}
                                {activeTab === 'video_ads_placeholder' && <div className="animate-fade-in">{renderVideoAdsPlaceholder()}</div>}
                                {activeTab === 'execution_log' && <div className="animate-fade-in"><ExecutionLog campaignId={campaign.id} /></div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
