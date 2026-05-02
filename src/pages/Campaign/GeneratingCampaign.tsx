import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Layout } from '../../components/Layout';
import { callAI } from '../../services/aiService';
import { generateImage } from '../../services/imageService';
import { buildImagePrompt } from '../../services/imagePromptBuilder';
import { startVideo } from '../../services/videoService';
import { HEYGEN_CONFIG } from '../../config/heygen';
import { DEMO_MODE_ENABLED, DEMO_CAMPAIGN } from '../../data/demoData';
import MiCALogo from '../../components/MiCALogo';
import { useAnimationContext } from '../../context/AnimationContext';

function extractJson(response: string): string {
    const cleaned = response.replace(/```json\n?|\n?```/g, '').replace(/```\n?|\n?```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) return cleaned.slice(start, end + 1);
    return cleaned;
}

// Repair JSON that contains HTML with double-quoted attributes inside string values.
// The LLM often writes style="..." inside a JSON string, breaking the outer quotes.
function parseJsonWithHtml(jsonStr: string): any {
    try {
        return JSON.parse(jsonStr);
    } catch {
        // Replace double-quoted HTML attribute values with single-quoted ones.
        // Targets the most common HTML attributes that trigger this issue.
        const repaired = jsonStr.replace(
            /(href|src|style|class|id|type|target|rel|width|height|align|valign|bgcolor|border|cellpadding|cellspacing)="([^"]*)"/g,
            "$1='$2'"
        );
        return JSON.parse(repaired);
    }
}

interface Campaign {
    id: string;
    product_name: string;
    product_description: string;
    target_audience: string;
    tone: string;
    tone_custom_words: string;
    budget: number;
    recommended_channels: string[];
    creator_name?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

const STEPS = [
    { id: 'strategy', label: 'Building marketing strategy...' },
    { id: 'emails', label: 'Creating email templates...' },
    { id: 'content', label: 'Generating social & messaging content...' },
    { id: 'images', label: 'Creating branded images... (this takes 1-2 mins)' },
    { id: 'video_script', label: 'Writing video script...' },
    { id: 'video', label: 'Generating video introduction... (2-5 mins)' },
    { id: 'finalize', label: 'Finalizing campaign plan...' }
];

export const GeneratingCampaign: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [currentStep, setCurrentStep] = useState(0); // 0 to STEPS.length - 1
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [progressText, setProgressText] = useState("");
    const generationStartedRef = useRef(false);

    // Global Animation State Context
    const { setMode, setGenerationProgress, setGazeTarget } = useAnimationContext();

    // Refs for step DOM elements so the Eyeball can look at them
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        setMode('generating');
        return () => {
            setMode('idle');
            setGenerationProgress(0);
            setGazeTarget(null);
        };
    }, [setMode, setGenerationProgress, setGazeTarget]);

    // Update Eyeball progress and gaze whenever currentStep changes
    useEffect(() => {
        // Calculate progress (0 to 1)
        const progress = Math.min((currentStep + 1) / STEPS.length, 1);
        setGenerationProgress(progress);

        // Calculate DOM position of current step for Eyeball to look at
        const stepEl = stepRefs.current[currentStep];
        if (stepEl) {
            const rect = stepEl.getBoundingClientRect();
            // Point roughly at the center-left of the step element
            setGazeTarget({ x: rect.left + 50, y: rect.top + rect.height / 2 });
        }
    }, [currentStep, setGenerationProgress, setGazeTarget]);

    useEffect(() => {
        fetchCampaign();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchCampaign = async () => {
        if (!id) return;

        // DEMO MODE CHECK
        if (DEMO_MODE_ENABLED()) {
            setCampaign(DEMO_CAMPAIGN as any);
            if (!generationStartedRef.current) {
                simulateGeneration();
            }
            return;
        }

        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setCampaign(data);

            // If already generated, redirect to dashboard
            if (data.status === 'plan_ready' || data.status === 'approved' || data.status === 'executing') {
                navigate(`/campaign/${id}/dashboard`);
            } else if (!generationStartedRef.current && (data.status === 'tone_approved' || data.status === 'generating')) {
                // Auto-start generation. Also restart if stuck in 'generating' state
                // (e.g. previous session failed mid-way due to an API error).
                await supabase.from('campaigns').update({ status: 'tone_approved' }).eq('id', data.id);
                startGeneration({ ...data, status: 'tone_approved' });
            }

        } catch (error) {
            console.error('Error fetching campaign:', error);
            setError('Failed to load campaign data');
        }
    };

    const simulateGeneration = async () => {
        if (generationStartedRef.current) return;
        generationStartedRef.current = true;

        // Helper to wait
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // 1. Strategy
        setCurrentStep(0);
        await wait(1500);
        setCompletedSteps(prev => [...prev, 'strategy']);

        // 2. Emails
        setCurrentStep(1);
        await wait(1500);
        setCompletedSteps(prev => [...prev, 'emails']);

        // 3. Content
        setCurrentStep(2);
        await wait(2000);
        setCompletedSteps(prev => [...prev, 'content']);

        // 4. Images
        setCurrentStep(3);
        const totalImages = 5;
        for (let i = 1; i <= totalImages; i++) {
            setProgressText(`Generating image ${i} of ${totalImages}...`);
            await wait(800); // Fast simulation
        }
        setProgressText("");
        setCompletedSteps(prev => [...prev, 'images']);

        // 5. Video Script
        setCurrentStep(4);
        await wait(1200);
        setCompletedSteps(prev => [...prev, 'video_script']);

        // 6. Video
        setCurrentStep(5);
        await wait(3000);
        setCompletedSteps(prev => [...prev, 'video']);

        // 7. Finalize
        setCurrentStep(6);
        await wait(1000);
        setCompletedSteps(prev => [...prev, 'finalize']);

        // Done
        setTimeout(() => {
            navigate(`/campaign/${DEMO_CAMPAIGN.id}/dashboard`);
        }, 800);
    };

    // --- PRE-PROCESSING: Build rich context before any AI calls ---
    interface CampaignContext {
        productDocContent: string;
        contactCount: number;
        hasContactData: boolean;
        campaignDuration: number;
        channels: string[];
    }

    const prepareContext = async (campaignData: Campaign): Promise<CampaignContext> => {
        // 1. Extract product document content (if uploaded)
        let productDocContent = '';
        if (campaignData.product_document_url) {
            try {
                const { data: fileData, error: downloadError } = await supabase.storage
                    .from('product-documents')
                    .download(campaignData.product_document_url);

                if (!downloadError && fileData) {
                    const text = await fileData.text();
                    // Truncate to ~6000 chars to avoid blowing up token limits
                    productDocContent = text.slice(0, 6000);
                }
            } catch (err) {
                console.warn('Could not extract product document:', err);
            }
        }

        // 2. Count customer contacts
        let contactCount = 0;
        try {
            const { count } = await supabase
                .from('customer_data')
                .select('*', { count: 'exact', head: true })
                .eq('campaign_id', campaignData.id);
            contactCount = count || 0;
        } catch (err) {
            console.warn('Could not count contacts:', err);
        }

        // 3. Calculate campaign duration from launch date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const launchDate = new Date(campaignData.launch_date);
        launchDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const campaignDuration = Math.min(45, Math.max(1, diffDays));

        return {
            productDocContent,
            contactCount,
            hasContactData: contactCount > 0,
            campaignDuration,
            channels: campaignData.recommended_channels || [],
        };
    };

    const startGeneration = async (campaignData: Campaign) => {
        if (generationStartedRef.current) return;
        generationStartedRef.current = true;
        setError(null);

        try {
            // Update status to generating
            await supabase.from('campaigns').update({ status: 'generating' }).eq('id', campaignData.id);

            // 0. Pre-process: extract document, count contacts, calculate duration
            setProgressText("Analyzing product data...");
            const context = await prepareContext(campaignData);

            // 1. Marketing Strategy
            setCurrentStep(0);
            const strategy = await generateStrategy(campaignData, context);
            setCompletedSteps(prev => [...prev, 'strategy']);

            // 2. Email Templates
            setCurrentStep(1);
            await generateEmails(campaignData, strategy, context);
            setCompletedSteps(prev => [...prev, 'emails']);

            // 3. WhatsApp & Social Content
            setCurrentStep(2);
            await generateContent(campaignData, strategy, context);
            setCompletedSteps(prev => [...prev, 'content']);

            // 4. Image Generation
            setCurrentStep(3);
            await generateImages(campaignData);
            setCompletedSteps(prev => [...prev, 'images']);

            // 5. Video Script
            setCurrentStep(4);
            const script = await generateVideoScript(campaignData, strategy);
            setCompletedSteps(prev => [...prev, 'video_script']);

            // 6. Video Generation (fire-and-forget — don't block the user)
            setCurrentStep(5);
            // Set video_status BEFORE firing background task so dashboard sees 'generating' immediately
            await supabase.from('campaigns').update({ video_status: 'generating' }).eq('id', campaignData.id);
            // Start video generation in the background — it updates the DB when done.
            // We don't await it because HeyGen takes 7-9 minutes.
            generateCampaignVideo(campaignData, script).catch(err => {
                console.error("Background video generation failed:", err);
            });
            setCompletedSteps(prev => [...prev, 'video']);

            // 7. Finalize
            setCurrentStep(6);
            await finalizeCampaign(campaignData.id, strategy);
            setCompletedSteps(prev => [...prev, 'finalize']);

            // Done!
            setTimeout(() => {
                navigate(`/campaign/${campaignData.id}/dashboard`);
            }, 800);

        } catch (err: any) {
            console.error("Generation Sequence Error:", err);
            setError(err.message || "An error occurred during generation. Please try again.");
            generationStartedRef.current = false; // Allow retry
        }
    };

    // --- API CALL 1: STRATEGY ---
    const generateStrategy = async (campaignData: Campaign, context: CampaignContext) => {
        const toneDescription = campaignData.tone === 'Custom'
            ? `Custom — ${campaignData.tone_custom_words}`
            : campaignData.tone;

        // Build the product knowledge section
        const productKnowledge = context.productDocContent
            ? `\n\nDETAILED PRODUCT DOCUMENT (uploaded by user):\n${context.productDocContent}`
            : '';

        const contactInfo = context.hasContactData
            ? `CUSTOMER CONTACT LIST: ${context.contactCount} contacts uploaded (these are the people who will receive WhatsApp messages and emails directly)`
            : `CUSTOMER CONTACT LIST: Not yet provided. Generate the strategy anyway — the user will upload contacts before launching. Note this in your response.`;

        const channelList = 'email, whatsapp, instagram';

        const prompt = `Analyze this product and design the optimal marketing campaign. You must CHOOSE the best marketing methodology for this specific product — do NOT use a generic template.

=== PRODUCT INFORMATION ===
PRODUCT NAME: ${campaignData.product_name}
PRODUCT DESCRIPTION: ${campaignData.product_description}${productKnowledge}
PRODUCT LINKS: ${campaignData.product_links || 'Not provided'}

=== CAMPAIGN PARAMETERS ===
TARGET AUDIENCE: ${campaignData.target_audience}
LOCATION: ${campaignData.location || 'India (general)'}
MARKETING BUDGET (this is the client's ad spend — NOT the product price): ₹${campaignData.budget.toLocaleString('en-IN')}
CAMPAIGN TONE: ${toneDescription}
CHANNELS TO USE: ${channelList}
CAMPAIGN DURATION: ${context.campaignDuration} days (campaign starts today and must build up TO the launch date)
LAUNCH DATE: ${campaignData.launch_date || 'Immediately'}
${contactInfo}

=== YOUR TASK ===
1. ANALYZE the product type, price point (only if mentioned in description), audience psychology, and market positioning.
2. CHOOSE the best marketing methodology from: AIDA (Attention→Interest→Desire→Action), PAS (Problem→Agitation→Solution), Storytelling (Emotional narrative arc), Scarcity (Urgency + limited availability), Social_Proof (Testimonials + community), Educational (Authority building + value-first). Explain WHY you chose it.
3. DECIDE the optimal number of content pieces per channel. This is NOT fixed — it depends on the campaign duration, product type, and channel purpose:
   - EMAIL: Personal nurture sequence to known contacts. Each email builds on the previous. Decide count based on duration (typically 1 email every 3-5 days).
   - WHATSAPP: Personal, conversational messages to known contacts. Higher frequency than email. Messages feel like they come from a trusted person, not a corporation.
   - INSTAGRAM: Public broadcast to general audience. Each post MUST stand alone — viewers may not have seen previous posts. Focus on awareness, social proof, and brand building. Count: between 5 and 15 posts.
4. DESIGN journey stages for each channel — what purpose does each message serve in the overall conversion journey?
5. ALLOCATE the marketing budget across channels with reasoning.

=== CRITICAL RULES ===
- NEVER mention or invent a product price/cost unless specific pricing appears in the product description above.
- NEVER fabricate statistics, testimonials, or specific numbers. Only use facts from the product description.
- The campaign builds up TO the launch date — it's a pre-launch buildup, not a post-launch maintenance campaign.
- Adapt content volume to the ${context.campaignDuration}-day duration. A 7-day campaign needs fewer but more impactful touchpoints than a 30-day campaign.

=== REQUIRED JSON OUTPUT ===
{
  "campaign_name": "string — creative name reflecting the product and campaign essence",
  "methodology": {
    "name": "string — one of: AIDA, PAS, Storytelling, Scarcity, Social_Proof, Educational",
    "reasoning": "string — 2-3 sentences explaining why this methodology is the best fit for this specific product and audience"
  },
  "campaign_duration_days": ${context.campaignDuration},
  "strategy_summary": "string — 4-5 sentences describing the overall strategic approach, positioning, key message, and how the campaign builds momentum toward launch day",
  "target_persona": {
    "description": "string — 3-4 sentence detailed archetype of the ideal customer",
    "pain_points": ["string — 3-4 pain points"],
    "motivations": ["string — 3-4 motivations/desires"]
  },
  "key_messages": ["string — 3-5 core messages the entire campaign will reinforce across all channels"],
  "channel_plan": {
    "email": {
      "total_count": "number — decided by you based on duration and product type",
      "journey_type": "nurture_sequence",
      "rationale": "string — why this many emails, what the journey achieves",
      "stages": [{ "stage_name": "string", "day_range": [start, end], "count": "number", "purpose": "string — what this stage achieves", "content_direction": "string — what the content should focus on" }]
    },
    "whatsapp": {
      "total_count": "number — decided by you",
      "journey_type": "personal_nurture",
      "audience_context": "string — describe who receives these messages",
      "rationale": "string",
      "stages": [{ "stage_name": "string", "day_range": [start, end], "count": "number", "purpose": "string", "content_direction": "string" }]
    },
    "instagram": {
      "total_count": "number — between 5 and 15",
      "journey_type": "broadcast_awareness",
      "rationale": "string",
      "content_mix": { "educational": "number", "social_proof": "number", "storytelling": "number", "engagement": "number", "product_showcase": "number" },
      "stages": [{ "stage_name": "string", "day_range": [start, end], "count": "number", "purpose": "string", "content_direction": "string — describe the static image content concept, NOT video or reel ideas" }]
    }
  },
  "budget_allocation": {
    "breakdown": { "channel_name": { "amount": "number", "purpose": "string — what this budget covers" } },
    "total": ${campaignData.budget},
    "rationale": "string — why this allocation strategy"
  },
  "weekly_plan": [{ "week": "number", "theme": "string", "goal": "string", "days_covered": "string (e.g. 'Days 1-7')", "tactics": [{ "day": "number", "channel": "string", "action": "string", "description": "string — 2 actionable sentences", "stage_reference": "string — which journey stage this belongs to" }] }],
  "expected_outcomes": {
    "primary_kpi": "string — the single most important metric",
    "secondary_kpis": ["string"],
    "success_criteria": "string — what does success look like after the campaign"
  }${!context.hasContactData ? ',\n  "no_contact_data_notice": "string — note explaining the campaign is ready but customer contact data is needed for WhatsApp and email delivery"' : ''}
}`;

        const systemPrompt = `You are MiCA, a senior AI marketing strategist with deep expertise in digital marketing for small businesses, solo entrepreneurs, and social impact organizations in India. You understand:

- Marketing methodologies: AIDA, PAS, Storytelling, Scarcity, Social Proof, Educational — and when to use each
- Channel psychology: WhatsApp and Email are PERSONAL channels for nurturing known contacts through a journey. Instagram is a BROADCAST channel where each post must stand alone for new viewers.
- Indian market dynamics: local buying behaviour, cultural nuances, WhatsApp-first culture, Instagram as a discovery platform, price sensitivity, trust-building through personal connection
- Campaign pacing: how to adjust content volume and intensity based on campaign duration (1-45 days)

You DO NOT use templates. You ANALYZE each product deeply and CHOOSE the optimal strategy.

BE CONCISE. Every field in the JSON should be clear and precise — not verbose. String values should be 1-3 sentences max. The weekly_plan tactics should be brief action descriptions, not essays. Clarity over length.

Return ONLY valid JSON. No markdown, no code fences, no preamble.`;

        const response = await callAI({ systemPrompt, userPrompt: prompt, temperature: 0.7, maxTokens: 10000 });
        const strategyJson = JSON.parse(extractJson(response));

        // Save strategy to DB
        await supabase.from('campaigns').update({ marketing_plan: strategyJson }).eq('id', campaignData.id);
        return strategyJson;
    };

    // --- API CALL 2: EMAILS ---
    const generateEmails = async (campaignData: Campaign, strategy: any, context: CampaignContext) => {
        const toneDescription = campaignData.tone === 'Custom'
            ? `Custom — ${campaignData.tone_custom_words}`
            : campaignData.tone;

        // Get email plan from strategy
        const emailPlan = strategy.channel_plan?.email;
        const emailCount = emailPlan?.total_count || 5;
        const emailStages = emailPlan?.stages
            ? `\n\nJOURNEY STAGES (follow this sequence):\n${emailPlan.stages.map((s: any) => `- ${s.stage_name} (Days ${s.day_range?.[0]}-${s.day_range?.[1]}): ${s.purpose}. Content direction: ${s.content_direction}`).join('\n')}`
            : '';

        const productKnowledge = context.productDocContent
            ? `\n\nDETAILED PRODUCT DOCUMENT:\n${context.productDocContent}`
            : '';

        const prompt = `Generate ${emailCount} complete marketing emails for this campaign. Each email must be a FULL, ready-to-send email.

CAMPAIGN CONTEXT:
PRODUCT NAME: ${campaignData.product_name}
PRODUCT DESCRIPTION: ${campaignData.product_description}${productKnowledge}
TARGET AUDIENCE: ${campaignData.target_audience}
LOCATION: ${campaignData.location || 'India (general)'}
MARKETING BUDGET (this is the client's ad spend — NOT the product price): ₹${campaignData.budget.toLocaleString('en-IN')}
CAMPAIGN TONE: ${toneDescription}
CAMPAIGN NAME: ${strategy.campaign_name}
STRATEGY SUMMARY: ${strategy.strategy_summary}
TARGET PERSONA: ${typeof strategy.target_persona === 'object' ? strategy.target_persona.description : strategy.target_persona}
METHODOLOGY: ${strategy.methodology?.name} — ${strategy.methodology?.reasoning}
KEY MESSAGES: ${strategy.key_messages?.join('; ') || 'Not specified'}
CAMPAIGN DURATION: ${context.campaignDuration} days${emailStages}

Output JSON format:
{
  "emails": [
    {
      "template_order": 1,
      "subject": "string — compelling subject line (max 60 chars)",
      "pre_header": "string — preview text that complements the subject (max 90 chars)",
      "body": "string — complete HTML email body. IMPORTANT: ALL HTML attributes must use single quotes — style='...' and href='...' not double quotes. Structure: (1) greeting with {{first_name}}, (2) 2-3 paragraphs of engaging content using <p>, <strong>, <ul>, <li> tags, (3) REQUIRED: end with a styled CTA button using this exact HTML pattern: <a href='LINK_HERE' style='background-color:#F59E0B;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;margin-top:16px;'>CTA_TEXT →</a> — for LINK_HERE: scan the PRODUCT DESCRIPTION and PRODUCT DOCUMENT for any registration URL, website link, or product page link and use it directly; if no link is found use {{cta_link}} as the placeholder. Write in the exact campaign tone. Use ₹ for currency. Aim for 200-300 words.",
      "cta_text": "string — clear, action-oriented call-to-action button text (max 5 words)",
      "scheduled_day": 1
    }
  ]
}

Rules:
- ${emailCount} emails total, distributed across ${context.campaignDuration} days
- Each email must follow the journey stages above — progressing the reader through the ${strategy.methodology?.name || 'conversion'} journey
- Match the tone EXACTLY: ${toneDescription}
- Write for the Indian market — use ₹ for currency, reference Indian cultural context where relevant
- Every email must be complete and ready to send — use {{first_name}} and {{cta_link}} as template variables; do NOT use bare placeholders like [Name] or [Link]
- The CTA button is MANDATORY in every email — do not omit it
- NEVER mention or invent a product price/cost. The marketing budget is NOT the product's price. Only mention pricing if specific pricing info appears in the PRODUCT DESCRIPTION above.
- NEVER fabricate statistics, testimonials, or specific numbers. Only use factual claims from the PRODUCT DESCRIPTION.`;

        const systemPrompt = `You are MiCA, an expert AI marketing email copywriter specializing in campaigns for small businesses and entrepreneurs in India. You write complete, high-converting marketing emails that match the requested tone exactly. Keep emails focused and readable — 200-300 words in the body, no padding. You follow the campaign's chosen marketing methodology to structure the email sequence as a deliberate journey. Return ONLY valid JSON. No markdown, no preamble.

CRITICAL JSON RULE: The body field contains HTML. ALL HTML attribute values MUST use single quotes (') — never double quotes ("). Example: style='color:red' and href='https://...' — not style="color:red". Double quotes inside a JSON string break the JSON.`;

        const response = await callAI({ systemPrompt, userPrompt: prompt, temperature: 0.7, maxTokens: 10000 });
        const emailsJson = parseJsonWithHtml(extractJson(response));

        const emailsToInsert = emailsJson.emails.map((e: any) => ({
            campaign_id: campaignData.id,
            ...e
        }));

        const { error } = await supabase.from('email_templates').insert(emailsToInsert);
        if (error) throw error;
    };

    // --- API CALL 3: CONTENT (WhatsApp + Instagram) ---
    const generateContent = async (campaignData: Campaign, strategy: any, context: CampaignContext) => {
        const toneDescription = campaignData.tone === 'Custom'
            ? `Custom — ${campaignData.tone_custom_words}`
            : campaignData.tone;

        const productKnowledge = context.productDocContent
            ? `\nDETAILED PRODUCT DOCUMENT:\n${context.productDocContent}`
            : '';

        // WhatsApp Generation
        {
            const waPlan = strategy.channel_plan?.whatsapp;
            const waCount = waPlan?.total_count || 8;
            const waStages = waPlan?.stages
                ? `\n\nJOURNEY STAGES (follow this sequence):\n${waPlan.stages.map((s: any) => `- ${s.stage_name} (Days ${s.day_range?.[0]}-${s.day_range?.[1]}): ${s.purpose}. Direction: ${s.content_direction}`).join('\n')}`
                : '';

            const waPrompt = `Generate ${waCount} complete WhatsApp messages for a ${context.campaignDuration}-day marketing campaign. Each message must be a COMPLETE, ready-to-send WhatsApp message — personal, conversational, and action-oriented.

CAMPAIGN CONTEXT:
PRODUCT NAME: ${campaignData.product_name}
PRODUCT DESCRIPTION: ${campaignData.product_description}${productKnowledge}
TARGET AUDIENCE: ${campaignData.target_audience}
LOCATION: ${campaignData.location || 'India (general)'}
MARKETING BUDGET (this is the client's ad spend — NOT the product price): ₹${campaignData.budget.toLocaleString('en-IN')}
CAMPAIGN TONE: ${toneDescription}
CAMPAIGN NAME: ${strategy.campaign_name}
METHODOLOGY: ${strategy.methodology?.name} — ${strategy.methodology?.reasoning}
KEY MESSAGES: ${strategy.key_messages?.join('; ') || 'Not specified'}
${waPlan?.audience_context ? `AUDIENCE CONTEXT: ${waPlan.audience_context}` : ''}${waStages}

Output JSON: { "whatsapp_messages": [{ "message_order": 1, "message_text": "string", "message_type": "string", "scheduled_day": 1 }] }

Content Rules:
- ${waCount} messages total across ${context.campaignDuration} days
- Length: 60-120 words per message (conversational, not too long)
- Must feel personal — like a message from a trusted friend, NOT a corporate blast
- Include at least 1 relevant emoji per message (naturally placed)
- Every message must have a clear CTA (e.g. "Reply YES", "Click here", "DM us", "Call now")
- Follow the journey stages above — each message has a specific purpose in the ${strategy.methodology?.name || 'conversion'} journey
- message_type options: announcement | follow_up | offer | testimonial | reminder | engagement
- Vary the message types to keep the sequence fresh
- NEVER mention or invent a product price/cost. Only mention pricing if in the PRODUCT DESCRIPTION.
- NEVER fabricate statistics or testimonials. Only use facts from the PRODUCT DESCRIPTION.`;

            const waResponse = await callAI({
                systemPrompt: `You are MiCA, an expert WhatsApp marketing copywriter for Indian small businesses. You write messages that feel personal and human — like they come from a trusted local business. Your messages follow a deliberate journey based on the campaign's marketing methodology. Conversational, warm, culturally relevant to India. Return ONLY valid JSON. No markdown, no preamble.`,
                userPrompt: waPrompt,
                temperature: 0.8,
                maxTokens: 8000
            });
            const waJson = JSON.parse(waResponse.replace(/```json\n?|\n?```/g, '').trim());

            if (waJson.whatsapp_messages?.length > 0) {
                const waToInsert = waJson.whatsapp_messages.map((m: any) => ({
                    campaign_id: campaignData.id,
                    ...m
                }));
                const { error } = await supabase.from('whatsapp_messages').insert(waToInsert);
                if (error) throw error;
            }
        }

        // Instagram Generation
        {
            const igPlan = strategy.channel_plan?.instagram;
            // Guardrail: 5-15 posts
            const igCount = Math.min(15, Math.max(5, igPlan?.total_count || 10));
            const igStages = igPlan?.stages
                ? `\n\nJOURNEY STAGES:\n${igPlan.stages.map((s: any) => `- ${s.stage_name} (Days ${s.day_range?.[0]}-${s.day_range?.[1]}): ${s.purpose}. Direction: ${s.content_direction}`).join('\n')}`
                : '';
            const contentMix = igPlan?.content_mix
                ? `\n\nCONTENT MIX (follow this distribution):\n${Object.entries(igPlan.content_mix).map(([type, count]) => `- ${type}: ${count} posts`).join('\n')}`
                : '';

            const socialPrompt = `Generate ${igCount} complete Instagram posts for a ${context.campaignDuration}-day marketing campaign. Each post must be a COMPLETE, scroll-stopping caption — ready to publish as-is.

IMPORTANT: Each Instagram post MUST stand alone. Viewers may NOT have seen any previous posts. Do NOT reference "as we mentioned" or "in our last post". Every post introduces the product fresh.

CAMPAIGN CONTEXT:
PRODUCT NAME: ${campaignData.product_name}
PRODUCT DESCRIPTION: ${campaignData.product_description}${productKnowledge}
TARGET AUDIENCE: ${campaignData.target_audience}
LOCATION: ${campaignData.location || 'India (general)'}
MARKETING BUDGET (this is the client's ad spend — NOT the product price): ₹${campaignData.budget.toLocaleString('en-IN')}
CAMPAIGN TONE: ${toneDescription}
CAMPAIGN NAME: ${strategy.campaign_name}
METHODOLOGY: ${strategy.methodology?.name}
KEY MESSAGES: ${strategy.key_messages?.join('; ') || 'Not specified'}${contentMix}${igStages}

Output JSON: { "social_posts": [{ "post_order": 1, "caption": "string", "hashtags": "string", "scheduled_day": 1, "image_suggestion": "string" }] }

Content Rules:
- ${igCount} posts total across ${context.campaignDuration} days (distribute evenly, not every day)
- caption: 60-90 words MAX. Hook (1 line) → 2-3 very short punchy lines → CTA. Brevity is essential — stressed, busy people do not read long captions
- hashtags: 5-8 relevant hashtags as a single string. Mix broad and niche. Include India-specific tags.
- image_suggestion: Describe ONE clear, focused visual for this post — a single scene, subject, or graphic that captures the post's core message. If the post covers multiple things, pick the single most powerful one. Can be: a lifestyle scene (person in a relatable real-life situation), a bold text card (ideal for quotes or statistics — state the exact text to display), or a clean focused environment/object. AVOID: icon collections, clipart, multiple unrelated symbols, or cluttered compositions — these look cheap and confusing. NEVER suggest a specific named real person's face (e.g. the instructor's face) — the model cannot render real individuals and will hallucinate a wrong face. General anonymous people in scenes are fine. Must be a STATIC IMAGE — no videos, no reels.
- All posts use STATIC IMAGES only — no reels, no video formats.
- Each post must STAND ALONE — no references to previous posts
- NEVER mention or invent a product price/cost. Only mention pricing if in the PRODUCT DESCRIPTION.
- NEVER fabricate statistics or testimonials. Only use facts from the PRODUCT DESCRIPTION.`;

            const socialResponse = await callAI({
                systemPrompt: `You are MiCA, an expert Instagram content strategist for Indian small businesses. You create scroll-stopping captions that build genuine connection and drive action. Each post stands alone. Be CONCISE — captions must be short and punchy (60-90 words max). Busy, stressed people do not read long posts. Every word must earn its place. Return ONLY valid JSON. No markdown, no preamble.`,
                userPrompt: socialPrompt,
                temperature: 0.8,
                maxTokens: 8000
            });
            const socialJson = JSON.parse(socialResponse.replace(/```json\n?|\n?```/g, '').trim());

            if (socialJson.social_posts?.length > 0) {
                const postsToInsert = socialJson.social_posts.map((p: any) => ({
                    campaign_id: campaignData.id,
                    ...p,
                    platform: 'instagram'
                }));
                const { error } = await supabase.from('social_posts').insert(postsToInsert);
                if (error) throw error;
            }
        }
    };

    // --- API CALL 4: IMAGES ---
    const generateImages = async (campaignData: Campaign) => {

        // Fetch posts that need images
        const { data: posts } = await supabase
            .from('social_posts')
            .select('*')
            .eq('campaign_id', campaignData.id)
            .eq('platform', 'instagram')
            .order('scheduled_day', { ascending: true });

        if (!posts || posts.length === 0) return;

        let completed = 0;
        const total = posts.length;

        for (const post of posts) {
            if (!post.image_suggestion) continue;

            completed++;
            setProgressText(`Generating image ${completed} of ${total}...`);

            try {
                const prompt = buildImagePrompt(post.image_suggestion, campaignData.product_name, campaignData.tone);
                const imageUrl = await generateImage({ prompt });

                // Save to generated_images
                await supabase.from('generated_images').insert({
                    campaign_id: campaignData.id,
                    image_url: imageUrl,
                    image_prompt: prompt,
                    image_order: post.post_order,
                    image_type: 'social'
                });

                // Update social post
                await supabase.from('social_posts').update({ image_url: imageUrl }).eq('id', post.id);
            } catch (err) {
                console.error(`Failed to generate image for post ${post.id}`, err);
                // Continue to next image even if one fails
            }

            // Brief pause between images to avoid Replicate rate limits
            if (completed < total) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        setProgressText("");
    };

    // --- API CALL 5: VIDEO SCRIPT ---
    const generateVideoScript = async (campaignData: Campaign, strategy: any) => {
        const creatorName = campaignData.creator_name || 'Business Owner';

        const userPrompt = `CONTEXT:
CREATOR_NAME: ${creatorName}
PRODUCT: ${campaignData.product_name}
STRATEGY SUMMARY: ${strategy.strategy_summary}
CHANNELS: ${campaignData.recommended_channels.join(', ')}

Please write the detailed Video Agent prompt.`;

        const systemPrompt = `You are an expert video director for AI marketing campaigns. Write a comprehensive prompt for the HeyGen Video Agent.

The prompt must follow this EXACT structure:

Create a [Duration]-second vertical (9:16) video with [Avatar Description]. Background: [Background Description].

TONE: [One sentence describing the emotional tone and delivery style — e.g. "Conversational friend explaining over chai, excited FOR the client"]

---

SCRIPT:

[SCENE 1 - Opening (0-12 seconds)]
Avatar speaks with [Emotion/Tone]:
"[Spoken words]"
[Visual: Text overlay or action description]

[SCENE 2 - The Problem (12-25 seconds)]
Avatar speaks:
"[Spoken words]"
[Visual: ...]

[SCENE 3 - The Strategy & Channels (25-50 seconds)]
Avatar gestures:
"[Spoken words]"
[Visual: Split screen or animation description]

[SCENE 4 - Results/Closing (50-65 seconds)]
Avatar speaks:
"[Spoken words]"
[Visual: Final frame description]

---

VISUAL NOTES FOR VIDEO AGENT:
- [Specific note about avatar behavior/gestures]
- [Text overlay timing and font style]
- [Transition style]
- [Background music direction]
- Color scheme: [Specific colors matching the product/brand]

Requirements:
1. Format: Vertical (9:16) aspect ratio for mobile viewing.
2. Avatar: Professional Indian male or female (based on brand tone), 30-38 years, smart casual attire. Confident and approachable.
3. Background: Modern home studio or office, plants, soft warm lighting.
4. Script Content & Tone:
   - Address the Creator: Start with "Namaste ${creatorName}!" or "Hello ${creatorName}!"
   - Acknowledge their specific product (${campaignData.product_name}) and their audience's real challenge
   - Present the campaign as the solution MiCA has built FOR THEM
   - Walk through the specific channel strategy as concrete tools working for them
   - Include timecodes on all scene headings
   - End with a motivating, personal closing line
   - Style: Warm, encouraging — like a knowledgeable friend over chai
5. Duration: 60-75 seconds total.
6. Include ALL: scene timecodes, avatar direction, visual cues, and the full VISUAL NOTES section.

Return ONLY valid JSON in this format:
{
  "video_agent_prompt": "The entire formatted text block — including the opening 'Create a...' line, TONE line, all SCRIPT scenes with timecodes and visual directions, and the VISUAL NOTES section. This is NOT just spoken words — it is the full director's brief."
}`;

        const response = await callAI({ systemPrompt, userPrompt, temperature: 0.7, maxTokens: 2000 });

        let scriptJson;
        try {
            scriptJson = JSON.parse(extractJson(response));
        } catch (e) {
            console.error("JSON Parse Error in Video Script:", e);
            console.log("Raw Response:", response);
            scriptJson = { video_agent_prompt: response.replace(/```json\n?|\n?```/g, '').trim() };
        }

        await supabase.from('campaigns').update({ video_script: scriptJson.video_agent_prompt }).eq('id', campaignData.id);
        return scriptJson.video_agent_prompt;
    };

    // --- API CALL 6: VIDEO GENERATION (kick off only) ---
    // We only START the video here — completion polling happens on the Dashboard.
    // This means the user can close the tab the moment HeyGen accepts the job
    // and the Dashboard will pick up polling whenever they return.
    const generateCampaignVideo = async (campaignData: Campaign, script: string) => {
        // HeyGen Fallback Logic — used when API is disabled (dev mode, no credits, etc.)
        if (!HEYGEN_CONFIG.API_ENABLED) {
            await supabase.from('campaigns').update({
                video_url: HEYGEN_CONFIG.FALLBACK_VIDEO_URL,
                video_status: 'fallback'
            }).eq('id', campaignData.id);
            return;
        }

        try {
            // Mark as generating + record start time BEFORE calling HeyGen,
            // so the Dashboard's elapsed-time UI works even if start succeeds
            // but our follow-up update fails for any reason.
            await supabase.from('campaigns').update({
                video_status: 'generating',
                video_started_at: new Date().toISOString(),
            }).eq('id', campaignData.id);

            // Initiate generation and persist the video_id immediately. Once
            // this row is written, the job is recoverable from any session.
            const videoId = await startVideo({ prompt: script });
            await supabase.from('campaigns').update({
                heygen_video_id: videoId,
            }).eq('id', campaignData.id);

            // We DO NOT poll here. The user is free to close the tab — the
            // Dashboard will resume polling using heygen_video_id whenever
            // the campaign is opened next.

        } catch (err) {
            console.error("Video Generation kick-off failed:", err);
            await supabase.from('campaigns').update({
                video_status: 'failed'
            }).eq('id', campaignData.id);
        }
    };

    // --- API CALL 7: FINALIZE ---
    const finalizeCampaign = async (campaignId: string, _strategy: any) => {
        await supabase.from('campaigns').update({ status: 'plan_ready' }).eq('id', campaignId);
    };


    const handleRetry = () => {
        if (campaign) {
            generationStartedRef.current = false;

            if (DEMO_MODE_ENABLED()) {
                simulateGeneration();
            } else {
                startGeneration(campaign);
            }
        }
    };

    if (!campaign && !error) {
        return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 pt-10">
                <div className="mb-8 md:mb-12 w-full z-20 relative text-center">
                    <MiCALogo variant="header" />
                </div>
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-[#FF7A00]/10 rounded-full mb-6 relative">
                        <Sparkles className="w-12 h-12 text-[#FF7A00] animate-pulse" />
                        <div className="absolute inset-0 border-4 border-[#FF7A00]/20 rounded-full animate-spin-slow"></div>
                    </div>
                    <h1 className="text-3xl font-bold mb-3">Creating Your Campaign</h1>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        MiCA is designing your assets, generating images, and producing your strategy video.
                    </p>
                </div>

                <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <div className="space-y-6">
                        {STEPS.map((step, index) => {
                            const isCompleted = completedSteps.includes(step.id);
                            const isCurrent = currentStep === index && !error;
                            // const isPending = !isCompleted && !isCurrent;

                            return (
                                <div key={step.id} ref={el => { stepRefs.current[index] = el; }} className="flex items-center gap-4 transition-all duration-500">
                                    <div className="flex-shrink-0">
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-6 h-6 text-green-500 animate-in zoom-in" />
                                        ) : isCurrent ? (
                                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                        ) : (
                                            <Circle className="w-6 h-6 text-gray-700" />
                                        )}
                                    </div>
                                    <div className={`text-base font-medium flex-1 ${isCompleted ? 'text-gray-400' :
                                        isCurrent ? 'text-white' :
                                            'text-gray-600'
                                        }`}>
                                        {step.label}
                                        {isCurrent && progressText && step.id === 'images' && (
                                            <div className="text-sm text-[#FF7A00] mt-1">{progressText}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {error && (
                        <div className="mt-8 p-4 bg-red-900/20 border border-red-800 rounded-xl text-center animate-in fade-in">
                            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                            <p className="text-red-200 text-sm mb-4">{error}</p>
                            <Button onClick={handleRetry} className="w-full bg-red-600 hover:bg-red-700">
                                Retry Generation
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-xs text-gray-500">
                    Do not close this window while generation is in progress.
                </div>
            </div>
        </Layout>
    );
};
