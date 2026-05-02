export function buildImagePrompt(imageSuggestion: string, productName: string, tone: string): string {
    const toneStyles: Record<string, string> = {
        "Professional & Trustworthy": "clean, minimal, professional style, soft lighting, muted elegant tones",
        "Warm & Inspirational": "warm golden light, hopeful, uplifting atmosphere, natural tones, soft focus",
        "Urgent & Action-Oriented": "bold, high contrast, dynamic, energetic composition",
        "Casual & Friendly": "bright, warm, cheerful, relatable, lifestyle feel",
        "Custom": "modern, clean, visually appealing, professional marketing style"
    };

    const toneStyle = toneStyles[tone] || toneStyles["Custom"];

    return `High-impact Instagram marketing image for "${productName}". ${imageSuggestion} Visual style: ${toneStyle}. Square 1:1 composition. No watermarks, no logos. High resolution, visually distinctive enough to stop a scroll.`;
}
