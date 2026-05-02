import React, { useState, useCallback } from 'react';
import { Rocket, AlertTriangle, Upload } from 'lucide-react';
import Papa from 'papaparse';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { generateExecutionSchedule, triggerWebhook } from '../../services/executionService';
import { useAnimationContext } from '../../context/AnimationContext';

interface LaunchSectionProps {
    campaignId: string;
    recipientCount: number;
    recommendedChannels: string[];
    onLaunchComplete: () => void;
    onContactsUploaded?: (newCount: number) => void;
}

export const LaunchSection: React.FC<LaunchSectionProps> = ({
    campaignId,
    recipientCount,
    recommendedChannels,
    onLaunchComplete,
    onContactsUploaded
}) => {
    const [isLaunching, setIsLaunching] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setMode, setEyeballHidden } = useAnimationContext();

    // Dialog-local CSV upload state
    const [dialogIsUploading, setDialogIsUploading] = useState(false);
    const [dialogUploadDone, setDialogUploadDone] = useState(false);
    const [dialogRecipientCount, setDialogRecipientCount] = useState(0);
    const [dialogError, setDialogError] = useState<string | null>(null);

    const handleLaunch = async () => {
        setIsLaunching(true);
        setError(null);
        setEyeballHidden(false); // Fade eyeball in before rocket arrives
        setMode('launching'); // Trigger eyeball rocket sequence

        try {
            // Blastoff animates for exactly ~3.4s before exiting frame.
            const blastoffWait = new Promise(resolve => setTimeout(resolve, 3400));

            if (campaignId.startsWith('demo-')) {
                await blastoffWait;
            } else {
                await Promise.all([
                    generateExecutionSchedule(campaignId).then(() =>
                        triggerWebhook('campaign_launched', {
                            campaign_id: campaignId,
                            action: 'campaign_launched',
                            start_date: new Date().toISOString()
                        })
                    ),
                    blastoffWait
                ]);
            }

            // Rocket is off-screen. Switch page now!
            onLaunchComplete();
            setShowConfirm(false);

            // Wait for crash down & giggle animation to complete BEFORE setting mode 'idle'
            await new Promise(resolve => setTimeout(resolve, 2400));
        } catch (err: any) {
            console.error("Launch failed:", err);
            setError(err.message || 'Failed to launch campaign');
        } finally {
            setIsLaunching(false);
            setMode('idle'); // Reset mode
            setEyeballHidden(true); // Fade eyeball back out after animation
        }
    };

    const handleDialogFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith('.csv')) {
            setDialogError('Please upload a CSV file');
            return;
        }

        setDialogIsUploading(true);
        setDialogError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const rows = results.data as Record<string, unknown>[];
                    if (rows.length === 0) {
                        setDialogError('CSV file is empty or has no valid data rows');
                        setDialogIsUploading(false);
                        return;
                    }

                    const contactsToInsert = rows.map((row: any) => ({
                        campaign_id: campaignId,
                        name: row.name || row.Name || row.full_name || '',
                        email: row.email || row.Email || row.email_address || '',
                        phone: row.phone || row.Phone || row.mobile || row.whatsapp || '',
                    })).filter(c => c.email || c.phone);

                    if (contactsToInsert.length === 0) {
                        setDialogError('No valid contacts found. CSV must have "email" or "phone" columns.');
                        setDialogIsUploading(false);
                        return;
                    }

                    const { error: insertError } = await supabase
                        .from('customer_data')
                        .insert(contactsToInsert);

                    if (insertError) throw insertError;

                    setDialogUploadDone(true);
                    setDialogRecipientCount(contactsToInsert.length);
                    if (onContactsUploaded) {
                        onContactsUploaded(contactsToInsert.length);
                    }
                } catch (err: any) {
                    console.error('CSV upload failed:', err);
                    setDialogError(err.message || 'Failed to upload contacts');
                } finally {
                    setDialogIsUploading(false);
                }
            },
            error: (parseError) => {
                setDialogError('Failed to parse CSV: ' + parseError.message);
                setDialogIsUploading(false);
            }
        });
    }, [campaignId, onContactsUploaded]);

    // ── COMPACT BANNER: Always visible when not confirming ──
    if (!showConfirm) {
        return (
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 hover:border-[#FF7A00]/60 hover:shadow-[0_20px_60px_rgba(255,122,0,0.25)] hover:-translate-y-2 rounded-xl p-6 md:p-8 mb-10 relative overflow-hidden group transition-all duration-500 cursor-default mt-4">
                {/* Glows */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF7A00]/5 via-transparent to-[#FF7A00]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl -z-10"></div>
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF7A00]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-5 text-left flex-1">
                        <div className="inline-flex items-center justify-center p-4 bg-[#FF7A00]/10 rounded-full ring-1 ring-[#FF7A00]/40 shadow-[0_0_20px_rgba(255,122,0,0.3)] shrink-0 group-hover:bg-[#FF7A00]/20 transition-colors duration-500">
                            <Rocket className="w-8 h-8 text-[#FF7A00]" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                                MiCA has created your personalized strategy. Check it out!
                            </h2>
                            <div className="flex items-center gap-2 text-[#FF7A00] font-medium text-lg mt-2 animate-bounce">
                                <span>Scroll down to review</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                        <Button
                            variant="custom"
                            onClick={() => setShowConfirm(true)}
                            className="bg-[#FF7A00] hover:bg-[#FF6600] text-white px-8 py-4 text-lg rounded-full shadow-[0_0_20px_rgba(255,122,0,0.5)] group-hover:shadow-[0_10px_35px_rgba(255,122,0,0.6)] transform group-hover:scale-[1.05] hover:-translate-y-1 transition-all duration-300 font-bold flex items-center gap-2 border border-[#FF7A00] group-hover:border-white/50"
                        >
                            <Rocket className="w-5 h-5 text-white" /> LAUNCH CAMPAIGN NOW
                        </Button>
                        <p className="text-xs text-indigo-300/50 mt-2 text-right">
                            {recipientCount > 0
                                ? `${recipientCount} recipients • ${recommendedChannels.length} channels`
                                : `${recommendedChannels.length} channels planned`}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── CONFIRMATION MODAL ──
    const hasNoContacts = recipientCount === 0 && !dialogUploadDone;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-indigo-500/10 rounded-full flex-shrink-0">
                            <Rocket className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Confirm Campaign Launch?</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {recipientCount > 0
                                    ? <>Messages will be sent to <strong>{recipientCount} recipients</strong> according to the schedule.</>
                                    : 'This will start your campaign automation immediately.'
                                }
                            </p>
                        </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 flex gap-3 text-sm text-yellow-200">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        <div>
                            Once launched, the schedule is locked. You can pause the campaign, but you cannot undo sent messages.
                            {hasNoContacts && (
                                <p className="mt-1 text-amber-300">No contacts uploaded — emails and WhatsApp messages won't be sent.</p>
                            )}
                        </div>
                    </div>

                    {/* Optional CSV upload inside dialog */}
                    {recipientCount === 0 && (
                        <div className="border border-indigo-500/20 rounded-xl p-5 mb-6 bg-indigo-500/5">
                            <p className="text-sm text-gray-300 mb-3">
                                <span className="text-indigo-300 font-medium">Add customer contacts (optional)</span>
                                <br />
                                Add email and phone numbers to automatically send emails and WhatsApp messages to your audience.
                            </p>
                            {!dialogUploadDone ? (
                                <label className="flex items-center gap-3 cursor-pointer border border-dashed border-gray-600 hover:border-indigo-400 rounded-lg p-4 text-sm text-gray-400 hover:text-gray-200 transition-colors">
                                    <Upload className="w-4 h-4 shrink-0" />
                                    <span>{dialogIsUploading ? 'Uploading…' : 'Upload CSV (email and/or phone columns)'}</span>
                                    <input type="file" accept=".csv" className="hidden" onChange={handleDialogFileInput} />
                                </label>
                            ) : (
                                <p className="text-green-400 text-sm flex items-center gap-2">
                                    ✓ {dialogRecipientCount} contacts added
                                </p>
                            )}
                            {dialogError && <p className="text-red-400 text-xs mt-2">{dialogError}</p>}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => setShowConfirm(false)}
                            disabled={isLaunching}
                            className="text-gray-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="custom"
                            onClick={handleLaunch}
                            disabled={isLaunching}
                            className="bg-[#FF7A00] hover:bg-[#FF6600] text-white min-w-[160px] relative overflow-hidden shadow-[0_0_15px_rgba(255,122,0,0.4)] border border-[#FF7A00]"
                        >
                            {isLaunching ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Launching...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    🚀 Yes, Launch It
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
