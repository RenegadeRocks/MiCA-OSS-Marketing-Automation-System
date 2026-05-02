import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Mail, MessageSquare, Instagram, CheckCircle2, XCircle, Clock, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { DEMO_MODE_ENABLED, DEMO_CAMPAIGN } from '../../data/demoData';

interface ExecutionLogProps {
    campaignId: string;
}

interface LogEntry {
    id: string;
    channel: string;
    action: string;
    recipient: string;
    status_details: string;
    executed_at: string;
}

interface ScheduleEntry {
    id: string;
    channel: string;
    scheduled_day: number;
    scheduled_date: string;
    status: string;
    recipients_sent: number;
    recipients_total: number;
    recipients_failed: number;
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({ campaignId }) => {
    const [logs, setLogs] = useState<ScheduleEntry[]>([]);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [details, setDetails] = useState<Record<string, LogEntry[]>>({});
    const [loadingDetails, setLoadingDetails] = useState<string | null>(null);

    useEffect(() => {
        fetchLogs();

        if (DEMO_MODE_ENABLED()) return;

        // Subscribe to schedule updates
        const channel = supabase
            .channel('log-updates')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'execution_schedule',
                filter: `campaign_id=eq.${campaignId}`
            }, (payload) => {
                setLogs(prev => prev.map(log =>
                    log.id === payload.new.id ? { ...log, ...payload.new } : log
                ));
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [campaignId]);

    const fetchLogs = async () => {
        if (DEMO_MODE_ENABLED()) {
            // In Demo Mode, show execution schedule as logs
            setLogs(DEMO_CAMPAIGN.execution_schedule as any[]);
            return;
        }

        const { data } = await supabase
            .from('execution_schedule')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('scheduled_day', { ascending: true });

        if (data) setLogs(data);
    };

    const toggleExpand = async (entryId: string, channel: string) => {
        if (expandedRow === entryId) {
            setExpandedRow(null);
            return;
        }

        setExpandedRow(entryId);

        if (!details[entryId]) {
            setLoadingDetails(entryId);

            if (DEMO_MODE_ENABLED()) {
                // Filter demo logs for this specific entry/channel if possible, 
                // or just show a relevant subset based on the entry's channel
                // DEMO_CAMPAIGN.campaign_logs contains sample logs.
                const demoLogs = (DEMO_CAMPAIGN.campaign_logs as any[]).filter(l => l.channel === channel);
                // Just take first few to mimic detail look
                const entryLogs = demoLogs.slice(0, 3).map((l, i) => ({
                    ...l,
                    id: `${entryId}-log-${i}`, // fake unique id
                    executed_at: new Date().toISOString() // fake fresh time
                }));

                setDetails(prev => ({ ...prev, [entryId]: entryLogs }));
                setLoadingDetails(null);
                return;
            }

            try {
                const { data } = await supabase
                    .from('campaign_logs')
                    .select('*')
                    .eq('campaign_id', campaignId)
                    .eq('channel', channel)
                    .limit(50);

                if (data) {
                    setDetails(prev => ({ ...prev, [entryId]: data }));
                }
            } catch (err) {
                console.error("Failed to fetch details", err);
            } finally {
                setLoadingDetails(null);
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs border border-green-500/30 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Done</span>;
            case 'in_progress': return <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs border border-blue-500/30 flex items-center gap-1 w-fit animate-pulse"><Loader2 className="w-3 h-3 animate-spin" /> Live</span>;
            case 'failed': return <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs border border-red-500/30 flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Failed</span>;
            case 'paused': return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs border border-yellow-500/30 flex items-center gap-1 w-fit">Paused</span>;
            default: return <span className="bg-gray-800 text-gray-500 px-2 py-0.5 rounded text-xs border border-gray-700 w-fit">Scheduled</span>;
        }
    };

    // Results column should reflect actual status, not always show "Posted"/"Sent"
    const getResultsText = (log: ScheduleEntry) => {
        if (log.status === 'scheduled' || log.status === 'paused') {
            return <span className="text-gray-600">—</span>;
        }
        if (log.status === 'in_progress') {
            return <span className="text-blue-400 animate-pulse">Sending...</span>;
        }
        // Only show results for completed/failed
        if (log.channel === 'instagram') {
            return <span className="text-green-400">{log.status === 'completed' ? 'Posted' : 'Failed'}</span>;
        }
        return `${log.recipients_sent}/${log.recipients_total}`;
    };

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'email': return <Mail className="w-4 h-4" />;
            case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
            case 'instagram': return <Instagram className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-950 text-gray-400 uppercase font-medium text-xs">
                        <tr>
                            <th className="px-6 py-3 border-b border-gray-800">Day</th>
                            <th className="px-6 py-3 border-b border-gray-800">Channel</th>
                            <th className="px-6 py-3 border-b border-gray-800">Scheduled Date</th>
                            <th className="px-6 py-3 border-b border-gray-800">Status</th>
                            <th className="px-6 py-3 border-b border-gray-800">Results</th>
                            <th className="px-6 py-3 w-10 border-b border-gray-800"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                    <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <h3 className="text-white font-medium mb-1">No executions yet</h3>
                                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                                        Launch your campaign to see real-time performance results here.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <React.Fragment key={log.id}>
                                    <tr
                                        className={`hover:bg-gray-800/50 transition-colors cursor-pointer ${expandedRow === log.id ? 'bg-gray-800/50' : ''}`}
                                        onClick={() => toggleExpand(log.id, log.channel)}
                                    >
                                        <td className="px-6 py-4 font-mono text-gray-400">Day {log.scheduled_day}</td>
                                        <td className="px-6 py-4 flex items-center gap-2 capitalize text-white font-medium">
                                            <span className="p-1.5 bg-gray-800 rounded-md text-gray-500">{getChannelIcon(log.channel)}</span>
                                            {log.channel}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{format(new Date(log.scheduled_date), 'MMM d, yyyy')}</td>
                                        <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                                        <td className="px-6 py-4 font-mono text-gray-400">
                                            {getResultsText(log)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {expandedRow === log.id ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                                        </td>
                                    </tr>

                                    {expandedRow === log.id && (
                                        <tr className="animate-fade-in">
                                            <td colSpan={6} className="bg-gray-950 px-6 py-4 border-b border-gray-800 shadow-inner">
                                                <div className="max-w-3xl">
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Execution Log Details</h4>

                                                    {loadingDetails === log.id ? (
                                                        <div className="text-gray-400 text-sm flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Loading logs...</div>
                                                    ) : details[log.id] && details[log.id].length > 0 ? (
                                                        <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                                            {details[log.id].map(detail => (
                                                                <li key={detail.id} className="text-xs flex gap-3 text-gray-400 font-mono">
                                                                    <span className="text-gray-600">{format(new Date(detail.executed_at), 'HH:mm:ss')}</span>
                                                                    <span className={detail.action.includes('failed') ? 'text-red-500' : 'text-green-500'}>
                                                                        [{detail.action.toUpperCase()}]
                                                                    </span>
                                                                    <span>{detail.recipient}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <div className="text-gray-600 text-sm italic">
                                                            {log.status === 'scheduled' || log.status === 'paused'
                                                                ? 'This task has not been executed yet.'
                                                                : 'No detailed logs available for this entry.'}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
