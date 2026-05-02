import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../../lib/supabase';
import { Mail, MessageSquare, Instagram, CheckCircle2, Clock, Calendar, PauseCircle, X, Zap } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { DEMO_MODE_ENABLED, DEMO_CAMPAIGN } from '../../data/demoData';

interface ScheduleEntry {
    id: string;
    channel: string;
    asset_type: string;
    asset_id: string;
    scheduled_day: number;
    scheduled_date: string;
    status: string;
    recipients_total: number;
    recipients_sent: number;
    completed_at?: string;
    asset_title?: string;
}

interface CampaignTimelineProps {
    campaignId: string;
    startDate: string;
    isPaused?: boolean;
}

// ── Repeating typewriter hook (type → hold → erase → loop) ────────
function useTypewriter(text: string, typeSpeed = 75, eraseSpeed = 45, holdMs = 1000) {
    const [displayed, setDisplayed] = useState('');
    useEffect(() => {
        let i = 0;
        let erasing = false;
        let timeout: ReturnType<typeof setTimeout>;
        const tick = () => {
            if (!erasing) {
                i++;
                setDisplayed(text.slice(0, i));
                if (i < text.length) {
                    timeout = setTimeout(tick, typeSpeed);
                } else {
                    // hold at full text, then start erasing
                    timeout = setTimeout(() => { erasing = true; tick(); }, holdMs);
                }
            } else {
                i--;
                setDisplayed(text.slice(0, i));
                if (i > 0) {
                    timeout = setTimeout(tick, eraseSpeed);
                } else {
                    // brief pause at empty, then retype
                    erasing = false;
                    timeout = setTimeout(tick, 300);
                }
            }
        };
        tick();
        return () => clearTimeout(timeout);
    }, [text]);
    return displayed;
}

// ── Sequential title computation ──────────────────────────────────
function computeTitles(entries: ScheduleEntry[]): ScheduleEntry[] {
    const counts: Record<string, number> = {};
    return entries.map(entry => {
        counts[entry.channel] = (counts[entry.channel] || 0) + 1;
        const seq = counts[entry.channel];
        const day = entry.scheduled_day;
        let title = '';
        switch (entry.channel) {
            case 'email':
                if (day === 1) title = 'Welcome Email';
                else if (day === 5) title = 'Value Proposition';
                else if (day === 28) title = 'Closing Email';
                else title = 'Follow-up Email';
                break;
            case 'whatsapp':
                title = seq === 1 ? 'Intro Message' : 'Nurture Message';
                break;
            case 'instagram':
                title = `Social Post #${seq}`;
                break;
            default:
                title = `${entry.channel} Content`;
        }
        return { ...entry, asset_title: title };
    });
}

// ── Channel helpers ───────────────────────────────────────────────
const CHANNEL_STYLE: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
    email:     { icon: <Mail className="w-3.5 h-3.5" />,        color: '#FF7A00', bg: 'rgba(255,122,0,0.12)',  border: 'rgba(255,122,0,0.3)' },
    whatsapp:  { icon: <MessageSquare className="w-3.5 h-3.5" />, color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)'  },
    instagram: { icon: <Instagram className="w-3.5 h-3.5" />,    color: '#EC4899', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)' },
};
const ch = (channel: string) => CHANNEL_STYLE[channel] ?? { icon: <Clock className="w-3.5 h-3.5" />, color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' };

// ── Main component ─────────────────────────────────────────────────
export const CampaignTimeline: React.FC<CampaignTimelineProps> = ({ campaignId, startDate, isPaused = false }) => {
    const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewItem, setPreviewItem] = useState<ScheduleEntry | null>(null);
    const [previewContent, setPreviewContent] = useState<string>('');
    const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
    const [previewImageAlt, setPreviewImageAlt] = useState<string>('');
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showAllUpcoming, setShowAllUpcoming] = useState(false);

    const headlineText = isPaused ? 'CAMPAIGN PAUSED' : 'CAMPAIGN LIVE';
    const typed = useTypewriter(headlineText, 65);

    // ── Data fetching ──────────────────────────────────────────────
    useEffect(() => {
        fetchSchedule();
        let pollInterval: ReturnType<typeof setInterval>;
        if (!DEMO_MODE_ENABLED()) {
            pollInterval = setInterval(() => fetchSchedule(true), 2000);
            const channel = supabase
                .channel(`execution-updates-${campaignId}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'execution_schedule', filter: `campaign_id=eq.${campaignId}` }, (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        setSchedule(prev => prev.map(e => e.id === (payload.new as any).id ? { ...e, ...(payload.new as any) } : e));
                    } else if (payload.eventType === 'INSERT') {
                        fetchSchedule();
                    }
                })
                .subscribe();
            return () => { clearInterval(pollInterval); supabase.removeChannel(channel); };
        }
    }, [campaignId]);

    const fetchSchedule = async (silent = false) => {
        try {
            if (DEMO_MODE_ENABLED()) {
                const start = new Date(startDate);
                const raw = DEMO_CAMPAIGN.execution_schedule.map(item => ({
                    ...item,
                    scheduled_date: addDays(start, item.scheduled_day - 1).toISOString()
                }));
                const enriched = computeTitles(raw as ScheduleEntry[]);
                setSchedule(enriched);
                if (!silent) setLoading(false);
                const day1Tasks = enriched.filter(t => t.scheduled_day === 1 && t.status === 'scheduled');
                if (day1Tasks.length > 0) simulateDemoProgress(enriched);
                return;
            }
            const { data, error } = await supabase.from('execution_schedule').select('*').eq('campaign_id', campaignId).order('scheduled_day', { ascending: true });
            if (error) throw error;
            setSchedule(computeTitles(data));
        } catch (err) {
            console.error('Failed to fetch schedule:', err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const simulateDemoProgress = (initialSchedule: ScheduleEntry[]) => {
        let cur = [...initialSchedule];
        const day1Indices = cur.map((t, i) => t.scheduled_day === 1 && t.status !== 'completed' ? i : -1).filter(i => i !== -1);
        if (!day1Indices.length) return;
        let taskIndex = 0;
        const processNext = () => {
            if (taskIndex >= day1Indices.length) return;
            const ri = day1Indices[taskIndex];
            const task = cur[ri];
            const total = task.recipients_total || 1;
            cur[ri] = { ...task, status: 'in_progress', recipients_sent: 0 };
            setSchedule([...cur]);
            let progress = 0;
            const iv = setInterval(() => {
                progress += Math.floor(total / 5);
                if (progress >= total) {
                    clearInterval(iv);
                    const done = { ...task, status: 'completed', recipients_sent: total, completed_at: new Date().toISOString() };
                    cur[ri] = done;
                    setSchedule([...cur]);
                    if (DEMO_MODE_ENABLED()) {
                        const gi = DEMO_CAMPAIGN.execution_schedule.findIndex(t => t.id === task.id);
                        if (gi !== -1) DEMO_CAMPAIGN.execution_schedule[gi] = done as any;
                    }
                    taskIndex++;
                    setTimeout(processNext, 500);
                } else {
                    cur[ri] = { ...task, status: 'in_progress', recipients_sent: progress };
                    setSchedule([...cur]);
                }
            }, 600);
        };
        setTimeout(processNext, 1000);
    };

    // ── Preview ────────────────────────────────────────────────────
    const openPreview = async (item: ScheduleEntry) => {
        setPreviewItem(item);
        setPreviewContent('');
        setPreviewImageUrl('');
        setPreviewImageAlt('');
        setLoadingPreview(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setModalVisible(true)));

        try {
            if (DEMO_MODE_ENABLED()) {
                let content: any = null;
                if (item.asset_type === 'email_template') {
                    content = (DEMO_CAMPAIGN.email_templates as any[]).find(e => e.id === item.asset_id);
                    if (content) setPreviewContent(`**Subject:** ${content.subject}\n\n**Preview:** ${content.pre_header}\n\n${content.body}\n\n_CTA: ${content.cta_text}_`);
                } else if (item.asset_type === 'whatsapp_message') {
                    content = (DEMO_CAMPAIGN.whatsapp_messages as any[]).find(m => m.id === item.asset_id);
                    if (content) setPreviewContent(content.message_text);
                } else if (item.asset_type === 'social_post') {
                    content = (DEMO_CAMPAIGN.social_posts as any[]).find(p => p.id === item.asset_id);
                    if (content) {
                        setPreviewContent(`${content.caption}\n\n${content.hashtags || ''}`);
                        if (content.image_url) setPreviewImageUrl(content.image_url);
                        if (content.image_suggestion) setPreviewImageAlt(content.image_suggestion);
                    }
                }
                if (!content) setPreviewContent('Content not found in demo data.');
                return;
            }
            let table = '';
            if (item.asset_type === 'email_template') table = 'email_templates';
            else if (item.asset_type === 'whatsapp_message') table = 'whatsapp_messages';
            else if (item.asset_type === 'social_post') table = 'social_posts';
            if (!table) { setPreviewContent('Preview not available.'); return; }
            const { data } = await supabase.from(table).select('*').eq('id', item.asset_id).single();
            if (data) {
                if (table === 'email_templates') setPreviewContent(`**Subject:** ${data.subject}\n\n**Preview:** ${data.pre_header}\n\n${data.body}\n\n_CTA: ${data.cta_text}_`);
                else if (table === 'whatsapp_messages') setPreviewContent(data.message_text);
                else if (table === 'social_posts') {
                    setPreviewContent(`${data.caption}\n\n${data.hashtags || ''}`);
                    if (data.image_url) setPreviewImageUrl(data.image_url);
                    if (data.image_suggestion) setPreviewImageAlt(data.image_suggestion);
                }
            } else setPreviewContent('Content not found.');
        } catch { setPreviewContent('Failed to load preview.'); }
        finally { setLoadingPreview(false); }
    };

    const closePreview = () => {
        setModalVisible(false);
        setTimeout(() => { setPreviewItem(null); setPreviewContent(''); setPreviewImageUrl(''); setPreviewImageAlt(''); }, 220);
    };

    // ── Derived state ──────────────────────────────────────────────
    if (loading) return <div className="p-8 text-center text-gray-600 text-sm">Loading timeline...</div>;

    const completed = schedule.filter(s => s.status === 'completed' || s.status === 'failed');
    const inProgress = schedule.filter(s => s.status === 'in_progress');
    const upcoming = schedule.filter(s => s.status === 'scheduled' || s.status === 'paused');
    const today = new Date();
    const start = new Date(startDate);
    const diffDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const currentDay = Math.min(Math.max(diffDays, 1), 28);
    const progressPct = schedule.length > 0 ? Math.round((completed.length / schedule.length) * 100) : 0;
    const visibleUpcoming = showAllUpcoming ? upcoming : upcoming.slice(0, 6);

    // ── Render ─────────────────────────────────────────────────────
    return (
        <>
        <div className="rounded-2xl mb-8 overflow-hidden transition-all duration-300"
            style={{ background: 'rgba(10,20,40,0.6)', border: '1px solid rgba(255,122,0,0.25)', boxShadow: '0 0 0 1px rgba(255,122,0,0.05), 0 24px 48px rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.boxShadow = '0 0 0 1px rgba(255,122,0,0.08), 0 0 48px rgba(255,122,0,0.35), 0 24px 48px rgba(0,0,0,0.35)'; el.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.boxShadow = '0 0 0 1px rgba(255,122,0,0.05), 0 24px 48px rgba(0,0,0,0.3)'; el.style.transform = 'translateY(0)'; }}
        >

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between gap-4">
                    {/* Left: dot + headline + day */}
                    <div className="flex items-start gap-3">
                        {/* Pulse dot — offset to centre on the first line only (text-2xl = 32px line-height, dot = 12px) */}
                        <div className="relative flex-shrink-0 mt-[10px]">
                            <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-[#FF7A00]'}`} />
                            <div className={`absolute inset-0 rounded-full animate-ping opacity-50 ${isPaused ? 'bg-yellow-500' : 'bg-[#FF7A00]'}`} />
                        </div>
                        <div>
                            {/* Typewriter headline */}
                            <span className="text-2xl font-black tracking-tight" style={{ color: '#FF7A00', textShadow: '0 0 20px rgba(255,122,0,0.4)' }}>
                                {typed}<span className="animate-pulse opacity-80">|</span>
                            </span>
                            {/* Day counter on its own stable line */}
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-white text-xl font-bold">Day {currentDay}</span>
                                <span className="text-gray-400 text-base">/ 28</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: % complete + date range stacked */}
                    <div className="text-right flex-shrink-0">
                        <div className="text-3xl font-black tabular-nums" style={{ color: '#FF7A00' }}>{progressPct}%</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">complete</div>
                        <div className="text-xs text-gray-400 font-medium mt-1">
                            {format(start, 'MMM d')} → {format(addDays(start, 28), 'MMM d, yyyy')}
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 w-full bg-gray-800/60 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${progressPct}%`, background: isPaused ? '#EAB308' : 'linear-gradient(90deg,#FF7A00,#FFB347)', boxShadow: '0 0 8px rgba(255,122,0,0.5)' }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                    <span>{completed.length} completed</span>
                    <span>{upcoming.length} queued</span>
                </div>
            </div>

            <div className="p-5 space-y-6">

                {/* ── IN PROGRESS ──────────────────────────────────── */}
                {inProgress.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-3.5 h-3.5 animate-pulse" style={{ color: '#FF7A00' }} />
                            <span className="text-xs font-semibold uppercase tracking-widest animate-pulse" style={{ color: '#FF7A00' }}>Sending now</span>
                        </div>
                        {inProgress.map(item => {
                            const s = ch(item.channel);
                            const pct = Math.round((item.recipients_sent / Math.max(item.recipients_total, 1)) * 100);
                            return (
                                <div key={item.id} className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'rgba(255,122,0,0.07)', border: '1px solid rgba(255,122,0,0.25)' }}>
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                                                {s.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: '#FF7A00' }}>Day {item.scheduled_day}</span>
                                                    <span className="text-sm font-semibold text-white">{item.asset_title}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {item.channel === 'instagram' ? 'Publishing…' : `Sending to ${item.recipients_total.toLocaleString()} recipients…`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-40 flex-shrink-0">
                                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                                <span>Progress</span>
                                                <span style={{ color: '#FF7A00' }}>{pct}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-300"
                                                    style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#FF7A00,#FFB347)', boxShadow: '0 0 6px rgba(255,122,0,0.6)' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── COMPLETED ────────────────────────────────────── */}
                {completed.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-semibold text-green-400">Completed</span>
                            <span className="text-xs font-bold text-green-400/60 ml-0.5">({completed.length})</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-800">
                            {completed.map(item => {
                                const s = ch(item.channel);
                                return (
                                    <div key={item.id}
                                        className="min-w-[170px] flex-shrink-0 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
                                        style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}
                                        onClick={() => openPreview(item)}
                                        onMouseEnter={e => (e.currentTarget.style.border = '1px solid rgba(34,197,94,0.45)')}
                                        onMouseLeave={e => (e.currentTarget.style.border = '1px solid rgba(34,197,94,0.2)')}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-400 font-medium">Day {item.scheduled_day}</span>
                                            <span style={{ color: s.color }}>{s.icon}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-white mb-3">{item.asset_title}</div>
                                        <div className="flex items-center gap-1.5 pt-2.5" style={{ borderTop: '1px solid rgba(34,197,94,0.15)' }}>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                            <span className="text-sm text-green-400 font-medium">
                                                {item.channel === 'instagram' ? 'Published' : `${item.recipients_sent.toLocaleString()} sent`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── PAUSED ───────────────────────────────────────── */}
                {isPaused && !inProgress.length && (
                    <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)' }}>
                        <PauseCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        <div>
                            <div className="text-yellow-300 font-medium text-sm">Campaign Paused</div>
                            <div className="text-xs text-yellow-200/50 mt-0.5">No tasks will execute until you resume.</div>
                        </div>
                    </div>
                )}

                {/* ── COMING UP ────────────────────────────────────── */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300 font-semibold">Coming Up</span>
                        <span className="text-xs font-bold text-gray-300 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>{upcoming.length}</span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {visibleUpcoming.map(item => {
                            const s = ch(item.channel);
                            return (
                                <div key={item.id}
                                    className="rounded-lg p-3 cursor-pointer group transition-all"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    onClick={() => openPreview(item)}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,122,0,0.08)'; e.currentTarget.style.border = '1px solid rgba(255,122,0,0.3)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-300">Day {item.scheduled_day}</span>
                                        <span style={{ color: s.color }}>{s.icon}</span>
                                    </div>
                                    <div className="text-xs text-white font-semibold leading-snug mb-2 line-clamp-2">{item.asset_title}</div>
                                    <div className="text-xs text-gray-400 font-medium">{format(new Date(item.scheduled_date), 'MMM d')}</div>
                                </div>
                            );
                        })}
                    </div>
                    {upcoming.length > 6 && (
                        <button onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                            className="mt-3 text-sm text-gray-400 hover:text-[#FF7A00] transition-colors font-medium">
                            {showAllUpcoming ? '▲ Show less' : `▼ Show all ${upcoming.length} upcoming`}
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* ── PREVIEW MODAL (portal, so fixed works correctly) ───── */}
        {previewItem && ReactDOM.createPortal(
            <div
                style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
                    background: 'rgba(5,12,28,0.75)', backdropFilter: 'blur(8px)',
                    opacity: modalVisible ? 1 : 0, transition: 'opacity 0.22s ease' }}
                onClick={closePreview}
            >
                <div
                    style={{ background: 'linear-gradient(135deg,#0d1117,#111927)', border: '1px solid rgba(255,122,0,0.25)',
                        borderRadius: '16px', width: '100%', maxWidth: '520px', boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
                        transform: modalVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(12px)',
                        transition: 'transform 0.22s ease' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '8px', borderRadius: '10px', background: ch(previewItem.channel).bg, border: `1px solid ${ch(previewItem.channel).border}`, color: ch(previewItem.channel).color }}>
                                {ch(previewItem.channel).icon}
                            </div>
                            <div>
                                <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{previewItem.asset_title}</div>
                                <div style={{ color: '#6B7280', fontSize: '11px' }}>Day {previewItem.scheduled_day} · {format(new Date(previewItem.scheduled_date), 'MMM d, yyyy')}</div>
                            </div>
                        </div>
                        <button onClick={closePreview} style={{ padding: '6px', borderRadius: '8px', color: '#6B7280', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <X size={18} />
                        </button>
                    </div>
                    {/* Body */}
                    <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto', fontSize: '13px', color: '#D1D5DB', lineHeight: '1.7' }}>
                        {loadingPreview
                            ? <span style={{ color: '#4B5563' }}>Loading preview…</span>
                            : <>
                                {previewImageUrl && (
                                    <div style={{ marginBottom: '16px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(236,72,153,0.2)', background: 'rgba(236,72,153,0.05)' }}>
                                        <img
                                            src={previewImageUrl}
                                            alt={previewImageAlt || 'Instagram post'}
                                            style={{ width: '100%', display: 'block', objectFit: 'contain' }}
                                            onError={e => {
                                                // image not found — show the suggestion text as a placeholder
                                                const el = e.currentTarget.parentElement!;
                                                e.currentTarget.style.display = 'none';
                                                if (previewImageAlt) {
                                                    el.innerHTML = `<div style="padding:16px;font-size:12px;color:#9CA3AF;font-style:italic;line-height:1.6"><strong style="color:#EC4899;font-style:normal">Image concept:</strong><br/>${previewImageAlt}</div>`;
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                                <div dangerouslySetInnerHTML={{ __html: previewContent
                                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:white">$1</strong>')
                                    .replace(/_(.*?)_/g, '<em style="color:#9CA3AF">$1</em>')
                                    .replace(/\n/g, '<br/>') }} />
                            </>}
                    </div>
                    {/* Footer */}
                    <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px',
                            background: previewItem.status === 'completed' ? 'rgba(34,197,94,0.15)' : previewItem.status === 'in_progress' ? 'rgba(255,122,0,0.15)' : 'rgba(255,255,255,0.06)',
                            color: previewItem.status === 'completed' ? '#22C55E' : previewItem.status === 'in_progress' ? '#FF7A00' : '#9CA3AF' }}>
                            {previewItem.status === 'completed' ? '✓ Sent' : previewItem.status === 'in_progress' ? '⚡ Sending' : '⏱ Scheduled'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#374151' }}>click outside to close</span>
                    </div>
                </div>
            </div>,
            document.body
        )}
        </>
    );
};
