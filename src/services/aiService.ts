import { getApiKey } from '../lib/apiKeys';

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface AIRequestOptions {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
    temperature?: number;
}

export async function callAI({ systemPrompt, userPrompt, maxTokens = 8000, temperature = 0.7 }: AIRequestOptions): Promise<string> {
    const apiKey = getApiKey('OPENROUTER_API_KEY');
    // Use user-provided model or fall back to a sensible default
    const model = import.meta.env.VITE_OPENROUTER_MODEL || "anthropic/claude-opus-4-6";

    console.log("AI Service: Initiating call...", { model, maxTokens });

    if (!apiKey || apiKey.includes('your_openrouter_api_key')) {
        console.error("AI Service: Missing valid OpenRouter API Key");
        throw new Error("Missing OpenRouter API Key. Add it via Settings or set VITE_OPENROUTER_API_KEY in .env");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        console.log("AI Service: Request timed out after 300s");
        controller.abort();
    }, 300000); // 300 second timeout

    try {
        console.log("AI Service: Sending fetch request...");
        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "MiCA Marketing Platform"
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                max_tokens: maxTokens,
                temperature: temperature
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`AI API Error: ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error("AI request timed out. The model is taking too long to respond. Please try again.");
        }
        console.error("AI Service Error:", error);
        throw error;
    }
}