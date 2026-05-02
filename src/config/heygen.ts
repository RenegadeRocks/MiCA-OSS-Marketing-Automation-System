// HeyGen integration knobs.
//
// We only use the prompt-based video_agent endpoint, so avatar / voice / scene
// settings (which would otherwise live here) are configured in the HeyGen
// account itself. This file just holds the runtime toggle and the fallback.

export const HEYGEN_CONFIG = {
    // Pre-generated video to use when API_ENABLED=false. Bundled with the repo
    // so demo mode and "skip generation" work offline.
    FALLBACK_VIDEO_URL: "/demo-assets/campaign-video.mp4",

    // Set to false to skip HeyGen API calls entirely and always serve the
    // fallback video. Useful while iterating on the rest of the campaign
    // pipeline without spending HeyGen credits on every run.
    API_ENABLED: true,
};
