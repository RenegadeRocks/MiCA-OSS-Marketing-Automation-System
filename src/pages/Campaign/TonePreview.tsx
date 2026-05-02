import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Check, ArrowRight, Sparkles, Mail, Instagram, MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layout } from '../../components/Layout';
import { callAI } from '../../services/aiService';
import { DEMO_MODE_ENABLED, DEMO_CAMPAIGN, DEMO_TONE_VARIANTS } from '../../data/demoData';

interface Campaign {
    id: string;
    product_name: string;
    product_description: string;
    target_audience: string;
    launch_date: string;
    budget: number;
    location: string;
    tone: string;
    tone_custom_words: string;
    tone_revision_used: boolean;
    tone_preview_content: TonePreviewData | null;
    product_document_url?: string; // We'd need to fetch content if this exists, skipping for now as per instructions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

interface TonePreviewData {
    tone_summary: string;
    sample_email: {
        subject: string;
        opening_paragraph: string;
    };
    sample_social_post: {
        caption: string;
        post_type: string;
    };
    sample_whatsapp: {
        message: string;
    };
    recommended_channels: string[];
    channel_reasoning: string;
}

const TONE_PREVIEW_SYSTEM_PROMPT = `You are MiCA, an expert AI marketing strategist specializing in campaigns for small businesses, solo entrepreneurs, and social impact organizations in India.

Your task is to generate a TONE PREVIEW — 3 short samples that show the user what their marketing campaign will feel and sound like. This is NOT the full campaign. This is a quick taste so the user can approve the tone before we invest in full generation.

You must respond in valid JSON format only. No markdown, no preamble, no explanation outside the JSON.

Response format:
{
  "tone_summary": "2-3 sentences describing the overall marketing tone and approach you'll take for this campaign",
  "sample_email": {
    "subject": "Email subject line (max 60 chars)",
    "opening_paragraph": "First paragraph of the email (3-4 sentences, ~80 words)"
  },
  "sample_social_post": {
    "caption": "Instagram caption (150-200 words, include 3-5 relevant hashtags at the end)",
    "post_type": "carousel | single_image | reel_script"
  },
  "sample_whatsapp": {
    "message": "WhatsApp message (60-100 words, conversational, include one emoji, include a clear CTA)"
  },
  "recommended_channels": ["email", "whatsapp", "instagram", "voice_agent", "video_ad"],
  "channel_reasoning": "1-2 sentences explaining why these channels were chosen based on the product type and budget"
}

Rules:
- Match the requested tone EXACTLY (Professional, Warm, Urgent, Casual, or Custom)
- Write for the Indian market context — use ₹ for currency, reference Indian cultural context where relevant
- Keep language simple and accessible (target audience may not be marketing-savvy)
- WhatsApp message should feel personal, like it's from a friend, not a corporation
- Email should be professional but engaging
- Social post should be scroll-stopping and visual-friendly
- For recommended_channels: ALWAYS include "email" and "whatsapp". Only add "instagram" if budget >= ₹5000. Only add "voice_agent" if budget >= ₹15000. Only add "video_ad" if budget >= ₹25000.`;

const CHANNEL_LABELS: Record<string, string> = {
    email: 'Email Marketing',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    video_ad: 'Video Ads',
};

const TONE_OPTIONS = ['Professional', 'Warm & Inspirational', 'Urgent', 'Casual', 'Custom'] as const;

export const TonePreview: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [previewData, setPreviewData] = useState<TonePreviewData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newTone, setNewTone] = useState('');
    const [customFeedback, setCustomFeedback] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isApproveHovered, setIsApproveHovered] = useState(false);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        fetchCampaign();
    }, [id]);
    /* eslint-enable react-hooks/exhaustive-deps */

    const fetchCampaign = async () => {
        if (!id) return;

        if (DEMO_MODE_ENABLED()) {
            setCampaign({ ...DEMO_CAMPAIGN, tone_revision_used: false });
            setNewTone(DEMO_CAMPAIGN.tone);
            setCustomFeedback(DEMO_CAMPAIGN.tone_custom_words || '');
            setPreviewData(DEMO_CAMPAIGN.tone_preview_content);
            setLoading(false);
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
            setNewTone(data.tone);
            setCustomFeedback(data.tone_custom_words || '');

            if (data.tone_preview_content) {
                setPreviewData(data.tone_preview_content);
                setLoading(false);
            } else {
                // If no preview content, generate it
                generatePreview(data);
            }
        } catch (error) {
            console.error('Error fetching campaign:', error);
            setError('Failed to load campaign data');
            setLoading(false);
        }
    };

    const buildUserPrompt = (campaignData: Campaign, toneOverride?: string, customWordsOverride?: string) => {
        const toneToUse = toneOverride || campaignData.tone;
        const customWordsToUse = customWordsOverride || campaignData.tone_custom_words;

        return `Generate a tone preview for this campaign:

PRODUCT NAME: ${campaignData.product_name}
PRODUCT DESCRIPTION: ${campaignData.product_description}
TARGET AUDIENCE: ${campaignData.target_audience}
LAUNCH DATE: ${campaignData.launch_date}
BUDGET: ₹${campaignData.budget.toLocaleString('en-IN')}
LOCATION: ${campaignData.location || 'India (general)'}
REQUESTED TONE: ${toneToUse}${toneToUse === 'Custom' ? ` — Custom tone words: ${customWordsToUse}` : ''}

Generate the tone preview samples now.`;
    };

    const generatePreview = async (campaignData: Campaign, isRevision = false) => {
        setGenerating(true);
        setError(null);

        // DEMO MODE BYPASS
        if (DEMO_MODE_ENABLED()) {
            setTimeout(() => {
                const toneKey = isRevision ? newTone : campaignData.tone;
                // Default to Warm & Inspirational if tone not found (or if Custom and no specific custom logic)
                const mockResponse = DEMO_TONE_VARIANTS[toneKey] || DEMO_TONE_VARIANTS["Warm & Inspirational"];

                setPreviewData(mockResponse);
                setCampaign(prev => prev ? ({
                    ...prev,
                    tone: toneKey,
                    tone_custom_words: isRevision ? customFeedback : prev.tone_custom_words,
                    tone_revision_used: isRevision ? true : prev.tone_revision_used,
                    tone_preview_content: mockResponse
                }) : null);

                setIsEditing(false);
                setGenerating(false);
                setLoading(false);
            }, 2000); // 2s simulated delay
            return;
        }

        try {
            // Build prompt
            const userPrompt = buildUserPrompt(
                campaignData,
                isRevision ? newTone : undefined,
                isRevision ? customFeedback : undefined
            );

            // Call AI
            const aiResponseString = await callAI({
                systemPrompt: TONE_PREVIEW_SYSTEM_PROMPT,
                userPrompt: userPrompt,
                temperature: 0.7
            });

            // Parse JSON
            let aiResponse: TonePreviewData;
            try {
                // Handle potential markdown code blocks
                const cleanJson = aiResponseString.replace(/```json\n?|\n?```/g, '').trim();
                aiResponse = JSON.parse(cleanJson);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                console.log("Raw Response:", aiResponseString);
                throw new Error("Failed to parse AI response. Please try again.");
            }

            // Save to database
            const updates: Partial<Campaign> & { tone_preview_content?: TonePreviewData; recommended_channels?: string[] } = {
                tone_preview_content: aiResponse,
                recommended_channels: aiResponse.recommended_channels
            };

            if (isRevision) {
                updates.tone = newTone;
                updates.tone_custom_words = customFeedback;
                updates.tone_revision_used = true;
            }

            const { error: dbError } = await supabase
                .from('campaigns')
                .update(updates)
                .eq('id', campaignData.id);

            if (dbError) throw dbError;

            // Update state
            setPreviewData(aiResponse);
            setCampaign(prev => prev ? ({ ...prev, ...updates }) : null);
            setIsEditing(false);

        } catch (err: unknown) {
            console.error("Generation Error:", err);
            setError(err instanceof Error ? err.message : "Failed to generate preview");
        } finally {
            setGenerating(false);
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!id) return;

        if (DEMO_MODE_ENABLED()) {
            navigate(`/campaign/${id}/generating`);
            return;
        }

        try {
            const { error } = await supabase
                .from('campaigns')
                .update({ status: 'tone_approved' })
                .eq('id', id);

            if (error) throw error;
            navigate(`/campaign/${id}/generating`);
        } catch (error) {
            console.error('Error approving tone:', error);
            setError('Failed to approve campaign');
        }
    };

    const handleRegenerate = () => {
        if (!campaign) return;
        generatePreview(campaign, true);
    };

    // Helper to check unsupported channels
    const isChannelSupported = (channel: string) => {
        return previewData?.recommended_channels.includes(channel);
    };

    const getBudgetUpgradeText = (channel: string) => {
        if (channel === 'instagram') return 'Budget < ₹5000';
        if (channel === 'video_ad') return 'Coming soon';
        return 'Not recommended';
    };

    if (loading || generating) {
        return (
            <Layout>
                <div className="flex flex-col h-[80vh] items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center max-w-md mx-auto px-4">
                        <h2 className="text-xl font-semibold text-white mb-2">
                            {generating ? "AI is crafting your preview..." : "Loading campaign..."}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            Analyzing your product and creating custom content samples in your chosen tone.
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!campaign || !previewData) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="text-red-400 mb-4 text-xl">
                        {error || "Campaign data unavailable"}
                    </div>
                    <Button onClick={() => window.location.reload()} variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
                        Retry
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-6xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 flex-wrap">
                            <span className="text-[#FF7A00]">Tone Preview</span> <span className="text-white text-lg font-normal">for {campaign.product_name}</span>
                        </h1>
                        <p className="text-gray-400">Review the AI's approach before we invest in full generation.</p>
                    </div>
                    <div className="bg-indigo-950/50 px-4 py-2 rounded-lg border border-indigo-500/30 backdrop-blur-sm">
                        <span className="text-xs text-indigo-300 uppercase tracking-wider font-bold block mb-1">Current Tone</span>
                        <div className="text-white font-medium capitalize flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" /> {campaign.tone}
                            {campaign.tone_revision_used && <span className="text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">(Revised)</span>}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-red-200 text-sm">{error}</p>
                    </div>
                )}

                {/* Tone Strategy Card */}
                <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 mb-8 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(99,102,241,0.25)] hover:border-indigo-400/60 hover:bg-gray-800/50 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Sparkles className="w-32 h-32 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-semibold text-white">AI Strategy & Channel Mix</h3>
                        </div>
                        <p className="text-gray-300 mb-6 max-w-4xl text-lg leading-relaxed">{previewData.tone_summary}</p>

                        <div className="flex flex-wrap gap-3">
                            {['email', 'whatsapp', 'instagram', 'video_ad'].map(channel => {
                                const supported = isChannelSupported(channel);
                                return (
                                    <div
                                        key={channel}
                                        className={`px-3 py-1.5 rounded-full text-sm border flex items-center gap-2
                                            ${supported
                                                ? 'bg-green-900/20 border-green-500/30 text-green-300'
                                                : 'bg-gray-800 border-gray-700 text-gray-500 opacity-60'
                                            }`}
                                    >
                                        {supported ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full bg-gray-600" />}
                                        {CHANNEL_LABELS[channel]}
                                        {!supported && <span className="text-xs ml-1 opacity-70">({getBudgetUpgradeText(channel)})</span>}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-3 italic">{previewData.channel_reasoning}</p>
                    </div>
                </div>

                {/* Preview Samples Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">

                    {/* Email Sample */}
                    <div className="bg-white/5 backdrop-blur-md text-white rounded-xl overflow-hidden border border-white/10 hover:bg-white/10 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:-translate-y-1.5 transition-all duration-300">
                        <div className="bg-white/5 px-4 py-4 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-amber-300 font-medium">
                                <Mail className="w-4 h-4" /> Email Preview
                            </div>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">AI GENERATED</span>
                        </div>
                        <div className="p-5">
                            <div className="mb-4 pb-4 border-b border-white/10">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Subject</p>
                                <p className="text-sm font-bold text-white leading-snug">{previewData.sample_email.subject}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Message Preview</p>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {previewData.sample_email.opening_paragraph}...
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Social Sample */}
                    <div className="bg-white/5 backdrop-blur-md text-white rounded-xl overflow-hidden border border-white/10 hover:bg-white/10 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:-translate-y-1.5 transition-all duration-300">
                        <div className="bg-white/5 px-4 py-4 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-pink-300 font-medium">
                                <Instagram className="w-4 h-4" /> Instagram
                            </div>
                            <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-bold">AI GENERATED</span>
                        </div>
                        <div className="p-5">
                            <div className="aspect-square bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-lg mb-4 flex items-center justify-center text-gray-400 text-xs text-center p-4 border border-pink-500/20 border-dashed">
                                <span className="opacity-70">Image / Video Placeholder<br />(Visuals generated in Session 3)</span>
                            </div>
                            <div className="mb-2">
                                <span className="text-[10px] uppercase font-bold text-pink-400/70 tracking-wider mr-2">{previewData.sample_social_post.post_type.replace('_', ' ')}</span>
                            </div>
                            <p className="text-sm text-gray-300 leading-normal">
                                {previewData.sample_social_post.caption}
                            </p>
                        </div>
                    </div>

                    {/* WhatsApp Sample */}
                    <div className="bg-[#E5DDD5] rounded-xl overflow-hidden shadow-lg border border-green-500/50 relative hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(37,211,102,0.2)] transition-all duration-300">
                        <div className="bg-[#075E54] p-4 flex justify-between items-center text-white shadow-sm z-10 relative">
                            <div className="flex items-center gap-2 font-medium">
                                <MessageSquare className="w-4 h-4" /> WhatsApp
                            </div>
                            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">AI GENERATED</span>
                        </div>
                        <div className="p-5" style={{
                          backgroundColor: '#efeae2',
                          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                          backgroundRepeat: 'repeat',
                          backgroundSize: '260px',
                          minHeight: 200,
                        }}>
                            <div className="flex justify-end mb-4">
                                <div className="bg-[#DCF8C6] text-gray-900 p-3 rounded-lg rounded-tr-none shadow-sm max-w-[85%] text-sm leading-snug relative">
                                    {previewData.sample_whatsapp.message}
                                    <div className="text-[10px] text-gray-500 text-right mt-1 opacity-70">10:00 AM • Read</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer / Controls */}
                <div className="bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 sticky bottom-4 shadow-2xl z-50">
                    <div className="flex-1 w-full">
                        {!campaign.tone_revision_used ? (
                            !isEditing ? (
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" onClick={() => setIsEditing(true)} leftIcon={<Edit2 className="w-4 h-4" />}>
                                        Adjust Tone
                                    </Button>
                                    <span className="text-sm text-gray-400">Not quite right? You have 1 revision available.</span>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-4 items-end animate-in fade-in slide-in-from-bottom-2 w-full">
                                    <div className="flex-1 w-full">
                                        <label className="text-xs text-gray-400 mb-1 block">Tone Style</label>
                                        <select
                                            value={newTone}
                                            onChange={(e) => setNewTone(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 text-white"
                                        >
                                            {TONE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-[2] w-full">
                                        <label className="text-xs text-gray-400 mb-1 block">Feedback / Instructions</label>
                                        <Input
                                            placeholder="e.g. 'Make it less formal, use more emojis'"
                                            value={customFeedback}
                                            onChange={(e) => setCustomFeedback(e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button size="sm" onClick={handleRegenerate} disabled={generating}>
                                            {generating ? 'Regenerating...' : 'Regenerate Preview'}
                                        </Button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg inline-flex items-center gap-2 border border-gray-700">
                                <Check className="w-4 h-4 text-green-500" />
                                <div>
                                    <span className="text-gray-200 font-medium block">Revision Used</span>
                                    This is your final preview.
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        size="lg"
                        onClick={handleApprove}
                        onMouseEnter={() => setIsApproveHovered(true)}
                        onMouseLeave={() => setIsApproveHovered(false)}
                        className="w-full md:w-auto text-white font-extrabold py-4 px-8 rounded-full border-none transition-all transform hover:scale-105"
                        style={{
                            backgroundColor: '#FF7A00',
                            boxShadow: isApproveHovered
                                ? '0 0 28px 8px rgba(255,122,0,0.9)'
                                : '0 0 18px 4px rgba(255,122,0,0.4)',
                        }}
                        rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                        Looks Great — Generate Full Campaign
                    </Button>
                </div>

            </div>
        </Layout>
    );
};
