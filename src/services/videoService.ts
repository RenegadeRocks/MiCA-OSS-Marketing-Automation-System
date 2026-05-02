import { getApiKey } from '../lib/apiKeys';
import { supabase } from '../lib/supabase';

// In dev, Vite proxies /api/heygen/* to the real HeyGen API (see vite.config.ts).
// In a production build, that proxy is gone — fall back to direct URLs.
// HeyGen's API supports browser CORS for the endpoints we use.
const HEYGEN_BASE = import.meta.env.DEV ? "/api/heygen" : "https://api.heygen.com";
const HEYGEN_API_URL = `${HEYGEN_BASE}/v1/video_agent/generate`;
const HEYGEN_STATUS_URL = `${HEYGEN_BASE}/v1/video_status.get`;
const VIDEO_BUCKET = 'campaign-videos';

// HeyGen does not expose a public "cancel in-progress generation" endpoint.
// Their /v1/video.delete is for removing completed videos — not what we want.
// So our "cancel" is a soft cancel: we stop polling and mark the campaign as
// cancelled locally. The video generation continues server-side and the
// credit is consumed regardless. The Dashboard surfaces this honestly to the
// user via the confirm dialog before cancelling.

export type HeyGenStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'unknown';

export interface VideoStatusResult {
    status: HeyGenStatus;
    videoUrl?: string;
    error?: string;
}

interface StartVideoOptions {
    prompt: string;
}

/**
 * Kicks off a HeyGen video generation. Returns the video_id immediately
 * (typically within a few seconds) — does NOT wait for the video to render.
 *
 * The caller is responsible for persisting the video_id (e.g. to Supabase)
 * so the generation can be polled / resumed across sessions, tabs, devices.
 */
export async function startVideo({ prompt }: StartVideoOptions): Promise<string> {
    const apiKey = getApiKey('HEYGEN_API_KEY');
    if (!apiKey) {
        throw new Error("Missing HeyGen API key. Add it via Settings or set VITE_HEYGEN_API_KEY in .env");
    }

    const response = await fetch(HEYGEN_API_URL, {
        method: 'POST',
        headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`HeyGen API Error: ${response.status} ${response.statusText}${errorText ? ` — ${errorText.slice(0, 200)}` : ''}`);
    }

    const data = await response.json();
    const videoId = data?.data?.video_id;

    if (!videoId) {
        throw new Error("HeyGen did not return a video_id");
    }

    return videoId as string;
}

/**
 * One-shot status check. Safe to call from anywhere — the Dashboard polls
 * this on resume, the Generating page polls it during initial creation,
 * the manual "Check now" button calls it on demand.
 *
 * Network/HTTP errors throw. Non-200 responses surface a status of 'unknown'
 * with the raw error so the caller can decide whether to keep polling.
 */
export async function checkVideoStatus(videoId: string): Promise<VideoStatusResult> {
    const apiKey = getApiKey('HEYGEN_API_KEY');
    if (!apiKey) {
        throw new Error("Missing HeyGen API key. Add it via Settings or set VITE_HEYGEN_API_KEY in .env");
    }

    const response = await fetch(`${HEYGEN_STATUS_URL}?video_id=${encodeURIComponent(videoId)}`, {
        headers: { 'X-Api-Key': apiKey },
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return {
            status: 'unknown',
            error: `HTTP ${response.status} ${response.statusText}${errorText ? ` — ${errorText.slice(0, 200)}` : ''}`,
        };
    }

    const body = await response.json();
    const raw = body?.data?.status as string | undefined;
    const status = normalizeStatus(raw);

    if (status === 'completed') {
        return { status, videoUrl: body?.data?.video_url };
    }
    if (status === 'failed') {
        return { status, error: body?.data?.error || 'Unknown error' };
    }
    return { status };
}

// Intentionally no `cancelVideo` exported — HeyGen has no public cancel API.
// Callers should mark the campaign cancelled in their own database; the Cancel
// flow lives in Dashboard.tsx for that reason.

/**
 * Downloads a HeyGen video URL and uploads it to Supabase Storage so the URL
 * never expires. Returns the new public URL. If anything fails (network, CORS,
 * Supabase down, bucket misconfigured), returns the original HeyGen URL — the
 * video still works short-term, just with HeyGen's TTL.
 */
export async function persistVideoToStorage(
    heygenUrl: string,
    campaignId: string,
): Promise<string> {
    try {
        // HeyGen URLs allow public GET; this should be a normal CORS-permitted fetch.
        const response = await fetch(heygenUrl);
        if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
        const blob = await response.blob();

        const timestamp = Date.now();
        const fileName = `${campaignId}/${timestamp}.mp4`;

        const { error: uploadError } = await supabase.storage
            .from(VIDEO_BUCKET)
            .upload(fileName, blob, {
                contentType: blob.type || 'video/mp4',
                cacheControl: '31536000', // 1 year — videos are immutable
                upsert: false,
            });
        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

        const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(fileName);
        return data.publicUrl;
    } catch (err) {
        console.warn('[videoService] persistVideoToStorage failed, using HeyGen URL directly:', err);
        return heygenUrl;
    }
}

function normalizeStatus(raw: string | undefined): HeyGenStatus {
    switch (raw) {
        case 'pending':
        case 'processing':
        case 'completed':
        case 'failed':
            return raw;
        case 'cancelled':
        case 'canceled':
            return 'cancelled';
        default:
            return 'unknown';
    }
}

/**
 * Convenience: fire-and-poll. Kicks off generation, polls every 5s, returns
 * the final video URL. NOT recommended for new code — the in-memory polling
 * is lost when the tab closes. Use startVideo + checkVideoStatus instead and
 * persist the video_id. Kept here only for backwards compatibility with any
 * call site that expects the old all-in-one signature.
 */
export async function generateVideo({ prompt }: StartVideoOptions): Promise<string> {
    const videoId = await startVideo({ prompt });
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const result = await checkVideoStatus(videoId);
        if (result.status === 'completed') return result.videoUrl || '';
        if (result.status === 'failed') throw new Error(`Video generation failed: ${result.error}`);
        if (result.status === 'cancelled') throw new Error('Video generation cancelled');
    }
}
