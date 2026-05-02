import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, BarChart2, MoreVertical, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { DEMO_MODE_ENABLED, DEMO_CAMPAIGN } from '../data/demoData';

interface Campaign {
    id: string;
    product_name: string;
    status: string;
    created_at: string;
    launch_date: string;
    tone: string;
}

export const CampaignList: React.FC = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchCampaigns();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchCampaigns = async () => {
        try {
            // DEMO MODE CHECK
            if (DEMO_MODE_ENABLED()) {
                const demoCampaign: Campaign = {
                    id: DEMO_CAMPAIGN.id,
                    product_name: DEMO_CAMPAIGN.product_name,
                    status: DEMO_CAMPAIGN.status,
                    created_at: new Date().toISOString(),
                    launch_date: DEMO_CAMPAIGN.launch_date,
                    tone: DEMO_CAMPAIGN.tone
                };
                setCampaigns([demoCampaign]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCampaigns(data || []);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'tone_preview': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'tone_approved': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'generating': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'plan_ready': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'executing': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-gray-800 text-gray-400 border-gray-700';
        }
    };

    const getLink = (campaign: Campaign) => {
        if (campaign.status === 'tone_preview') return `/campaign/${campaign.id}/tone-preview`;
        if (campaign.status === 'tone_approved') return `/campaign/${campaign.id}/generating`;
        if (campaign.status === 'generating') return `/campaign/${campaign.id}/generating`;
        return `/campaign/${campaign.id}/dashboard`;
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Campaigns</h1>
                        <p className="text-gray-400">Manage and track your marketing initiatives.</p>
                    </div>
                    <Link to="/create-campaign">
                        <Button leftIcon={<Plus className="w-5 h-5" />}>New Campaign</Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-xl animate-fade-in shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        <div className="bg-indigo-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <Sparkles className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No campaigns yet</h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Create your first campaign and let MiCA handle the marketing.
                        </p>
                        <Link to="/create-campaign">
                            <Button size="lg" className="shadow-[0_4px_12px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.6)]">Create Campaign →</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 animate-fade-in">
                        {campaigns.map((campaign, index) => (
                            <Link
                                key={campaign.id}
                                to={getLink(campaign)}
                                className="block bg-gray-900/60 backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] group"
                                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                                {campaign.product_name}
                                            </h3>
                                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase tracking-wide font-bold ${getStatusColor(campaign.status)}`}>
                                                {campaign.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" /> Launch: {campaign.launch_date}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5" /> Tone: {campaign.tone}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-600 group-hover:text-gray-400 transition-colors">
                                        <BarChart2 className="w-5 h-5" />
                                        <div className="w-px h-8 bg-gray-800 hidden md:block"></div>
                                        <MoreVertical className="w-5 h-5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};
