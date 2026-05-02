export const HEYGEN_CONFIG = {
    // Avatar and voice IDs from your HeyGen account
    AVATAR_ID: "YOUR_AVATAR_ID_HERE",  // TODO: Replace
    VOICE_ID: "YOUR_VOICE_ID_HERE",    // TODO: Replace

    // Video settings
    BACKGROUND_COLOR: "#0F172A",
    DIMENSION: { width: 720, height: 1280 },  // Portrait 9:16

    // Polling
    POLL_INTERVAL_MS: 10000,
    MAX_POLL_ATTEMPTS: 50,

    // FALLBACK: Pre-generated video URL to use when API credits are exhausted
    // Replace this with one of your pre-made HeyGen videos
    FALLBACK_VIDEO_URL: "/demo-assets/campaign-video.mp4",

    // Set to false to skip HeyGen API calls entirely and always use fallback
    // Useful during development to conserve credits
    API_ENABLED: true,  // Set to false during dev/testing, true for Demo Day
};
