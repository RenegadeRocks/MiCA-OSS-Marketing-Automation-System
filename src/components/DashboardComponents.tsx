import React from 'react';
import { Download, Play, Pause, RefreshCw, Copy, Check, AlertTriangle, X } from 'lucide-react';
import { DEMO_MODE_ENABLED } from '../data/demoData';

const TYPICAL_VIDEO_MINUTES = 9;

function formatElapsed(startedAt: string | undefined): string {
    if (!startedAt) return '00:00';
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Video Player Component
interface VideoPlayerProps {
    videoUrl?: string; // If connected to real data
    posterUrl?: string;
    isGenerating?: boolean;
    videoStatus?: string;
    videoStartedAt?: string;
    onCheckNow?: () => void;
    onCancel?: () => void;
    /** @deprecated use onCheckNow */
    onRetry?: () => void;
    className?: string;
    description?: string;
    script?: string;
    showScript?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUrl,
    posterUrl,
    isGenerating,
    videoStatus,
    videoStartedAt,
    onCheckNow,
    onCancel,
    onRetry,
    className,
    description,
    script,
    showScript = false
}) => {
    const [isPlaying, setIsPlaying] = React.useState(true); // Generated video auto-plays
    const [isMuted, setIsMuted] = React.useState(false); // Default unmuted for dashboard
    const [elapsed, setElapsed] = React.useState(() => formatElapsed(videoStartedAt));
    const [isCheckingNow, setIsCheckingNow] = React.useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    // Resolve old onRetry → onCheckNow for backwards compat with existing call sites.
    const checkNowHandler = onCheckNow ?? onRetry;

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const generating = videoStatus === 'generating' || isGenerating === true;
    const failed = videoStatus === 'failed';
    const cancelled = videoStatus === 'cancelled';

    // Tick the elapsed counter every second while generating.
    React.useEffect(() => {
        if (!generating) return;
        const interval = setInterval(() => setElapsed(formatElapsed(videoStartedAt)), 1000);
        return () => clearInterval(interval);
    }, [generating, videoStartedAt]);

    const handleCheckNow = async () => {
        if (!checkNowHandler) return;
        setIsCheckingNow(true);
        try {
            await checkNowHandler();
        } finally {
            // Brief visual feedback even on instant responses
            setTimeout(() => setIsCheckingNow(false), 600);
        }
    };

    if (failed || cancelled) {
        return (
            <div className={`aspect-[9/16] bg-gray-900 rounded-2xl flex flex-col items-center justify-center p-6 border border-gray-800 ${className}`}>
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                    {cancelled ? <X className="w-6 h-6 text-red-400" /> : <AlertTriangle className="w-6 h-6 text-red-400" />}
                </div>
                <h3 className="text-white font-medium mb-2">
                    {cancelled ? 'Video generation cancelled' : 'Video generation failed'}
                </h3>
                <p className="text-gray-500 text-sm text-center max-w-xs">
                    {cancelled
                        ? 'You can re-run the campaign to try again.'
                        : 'HeyGen returned an error. Check your API key & credits, then re-run the campaign.'}
                </p>
            </div>
        );
    }

    if (generating) {
        return (
            <div className={`aspect-[9/16] bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl flex flex-col items-center justify-between p-6 border border-gray-800 ${className}`}>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mb-5" />
                    <h3 className="text-white font-medium mb-1">Your video is being generated</h3>
                    <p className="text-gray-400 text-xs mb-4 text-center">
                        HeyGen typically takes ~{TYPICAL_VIDEO_MINUTES} minutes for high-quality avatar videos. This is normal.
                    </p>
                    <div className="font-mono text-2xl tabular-nums text-indigo-300 mb-1">{elapsed}</div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-4">elapsed</p>
                    <p className="text-[11px] text-gray-500 text-center max-w-[14rem] leading-relaxed">
                        Feel free to leave this page and come back later — your video will be waiting for you.
                    </p>
                </div>
                <div className="flex gap-2 w-full mt-4">
                    {checkNowHandler && (
                        <button
                            onClick={handleCheckNow}
                            disabled={isCheckingNow}
                            className="flex-1 text-xs text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                        >
                            <RefreshCw className={`w-3 h-3 ${isCheckingNow ? 'animate-spin' : ''}`} />
                            {isCheckingNow ? 'Checking…' : 'Check now'}
                        </button>
                    )}
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="text-xs text-gray-400 hover:text-red-300 bg-white/5 hover:bg-red-500/10 px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                        >
                            <X className="w-3 h-3" /> Cancel
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!videoUrl) {
        return (
            <div className={`aspect-[9/16] bg-gray-900 rounded-2xl flex flex-col items-center justify-center p-6 border border-gray-800 ${className}`}>
                <div className="text-3xl mb-3">🎬</div>
                <p className="text-gray-400 font-medium mb-1">Video Not Ready Yet</p>
                <p className="text-gray-500 text-xs text-center mb-4">The video may still be processing on our servers.</p>
                {onRetry && (
                    <button onClick={onRetry} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 bg-indigo-500/10 px-4 py-2 rounded-lg hover:bg-indigo-500/20 transition-colors">
                        <RefreshCw className="w-3 h-3" /> Check Status
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <div className="relative rounded-2xl overflow-hidden group shadow-2xl bg-black aspect-[9/16]">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    poster={posterUrl}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    autoPlay
                    muted={isMuted} // Controlled by state
                    // Default to unmuted is tricky in browsers without interaction, but we try
                    onEnded={() => setIsPlaying(false)}
                />

                {/* Controls overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button
                        onClick={togglePlay}
                        className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
                    </button>
                </div>

                <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 bg-black/50 rounded-full text-white text-xs backdrop-blur-md"
                    >
                        {isMuted ? "🔇" : "🔊"}
                    </button>
                </div>
            </div>

            {/* Description / Script */}
            {(description || (showScript && script)) && (
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    {description && <p className="text-gray-400 text-sm mb-2">{description}</p>}
                    {showScript && script && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Video Script</h4>
                            <p className="text-gray-300 text-sm italic leading-relaxed">"{script}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Social Post Card with Image
interface SocialPostCardProps {
    post: any;
    onGenerateImage?: (postId: string, prompt: string) => void;
    generatingImageId?: string | null;
    onCopy?: (id: string, text: string) => void;
    copiedId?: string | null;
}

export const SocialPostCard: React.FC<SocialPostCardProps> = ({ post, onGenerateImage, generatingImageId, onCopy, copiedId }) => {
    const [imageError, setImageError] = React.useState(false);
    const [expanded, setExpanded] = React.useState(false);
    const isDemo = DEMO_MODE_ENABLED();

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:-translate-y-1 transition-all duration-300 group/card">
            {/* Image Area */}
            <div className="aspect-square bg-gray-950 relative group">
                {post.image_url && !imageError ? (
                    <>
                        <img
                            src={post.image_url}
                            alt="Social post"
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                        <div className={`absolute inset-0 ${isDemo ? '' : 'bg-black/60'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3`}>
                            <a
                                href={post.image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-100"
                            >
                                <Download className="w-4 h-4" /> Download
                            </a>
                            {onGenerateImage && (
                                <button
                                    onClick={() => onGenerateImage(post.id, post.image_suggestion)}
                                    disabled={generatingImageId === post.id}
                                    className="px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-indigo-400 disabled:opacity-50"
                                >
                                    <RefreshCw className="w-4 h-4" /> Regenerate
                                </button>
                            )}
                        </div>
                    </>
                ) : post.image_url && imageError ? (
                    /* Image URL exists but failed to load (expired Replicate URL) */
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="border-2 border-dashed border-red-800/50 rounded-xl inset-4 absolute" />
                        <div className="text-3xl mb-3">🖼️</div>
                        <p className="text-sm text-red-400 font-medium relative z-10 mb-2">Image Expired</p>
                        <p className="text-xs text-gray-500 relative z-10 mb-4 px-4">The original image URL has expired. Click below to regenerate.</p>
                        {onGenerateImage && (
                            <button
                                onClick={() => {
                                    setImageError(false);
                                    onGenerateImage(post.id, post.image_suggestion);
                                }}
                                disabled={generatingImageId === post.id}
                                className="relative z-10 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-500/30 disabled:opacity-50 flex items-center gap-2"
                            >
                                {generatingImageId === post.id ? (
                                    <><RefreshCw className="w-3 h-3 animate-spin" /> Regenerating...</>
                                ) : (
                                    <><RefreshCw className="w-3 h-3" /> Regenerate Image</>
                                )}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="border-2 border-dashed border-gray-800 rounded-xl inset-4 absolute" />
                        <p className="text-xs text-gray-500 italic relative z-10 mb-4 px-4">{post.image_suggestion || "No image suggestion"}</p>

                        {onGenerateImage && (
                            <button
                                onClick={() => onGenerateImage(post.id, post.image_suggestion)}
                                disabled={generatingImageId === post.id}
                                className="relative z-10 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {generatingImageId === post.id ? (
                                    <><RefreshCw className="w-3 h-3 animate-spin" /> Generating...</>
                                ) : (
                                    'Generate Image'
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Day Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                    Day {post.scheduled_day}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4">
                <p className={`text-sm text-gray-300 mb-1 ${expanded ? '' : 'line-clamp-3'}`}>
                    {post.caption}
                </p>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 mb-3 cursor-pointer"
                >
                    {expanded ? 'Show less' : 'Read more'}
                </button>
                <div className="flex flex-wrap gap-1">
                    {post.hashtags && post.hashtags.split(' ').map((tag: string, i: number) => (
                        <span key={i} className="text-[10px] text-blue-400">{tag}</span>
                    ))}
                </div>
                {onCopy && (
                    <button
                        onClick={() => onCopy(post.id, `${post.caption}\n\n${post.hashtags}`)}
                        className={`mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            copiedId === post.id ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {copiedId === post.id ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Caption &amp; Hashtags</>}
                    </button>
                )}
            </div>
        </div>
    );
};

