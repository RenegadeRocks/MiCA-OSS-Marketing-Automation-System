import { supabase } from '../lib/supabase';
import { getApiKey } from '../lib/apiKeys';

interface ModelConfig {
  name: string;
  url: string;
  buildInput: (prompt: string) => Record<string, unknown>;
}

// Fallback chain: tries each model in order until one succeeds.
// nano-banana-pro is primary (best quality); nano-banana-2 is fallback.
// NOTE: Verify the Seedream model path on Replicate before relying on it.
const IMAGE_MODELS: ModelConfig[] = [
  {
    name: 'nano-banana-pro',
    url: '/api/replicate/models/google/nano-banana-pro/predictions',
    buildInput: (prompt) => ({
      prompt,
      width: 1080,
      height: 1080,
      num_outputs: 1,
      scheduler: 'K_EULER',
      num_inference_steps: 50,
    }),
  },
  {
    name: 'nano-banana-2',
    url: '/api/replicate/models/google/nano-banana-2/predictions',
    buildInput: (prompt) => ({
      prompt,
      num_outputs: 1,
      aspect_ratio: '1:1',
      resolution: '1K',
      output_format: 'jpg',
    }),
  },
  {
    name: 'nano-banana',
    url: '/api/replicate/models/google/nano-banana/predictions',
    buildInput: (prompt) => ({
      prompt,
      width: 1080,
      height: 1080,
      num_outputs: 1,
    }),
  },
  {
    // Seedream 3 — update path if needed ("Seedream 4" per user)
    name: 'seedream-3',
    url: '/api/replicate/models/bytedance/seedream-3/predictions',
    buildInput: (prompt) => ({
      prompt,
      aspect_ratio: '1:1',
      output_format: 'jpg',
    }),
  },
];

interface ImageGenerationOptions {
  prompt: string;
  width?: number;
  height?: number;
}

async function runPrediction(model: ModelConfig, prompt: string): Promise<string> {
  const apiToken = getApiKey('REPLICATE_API_TOKEN');
  const authHeader = { 'Authorization': `Bearer ${apiToken}` };

  // Retry up to 3 times on 429 rate-limit responses with exponential backoff.
  let createResponse!: Response;
  for (let attempt = 0; attempt < 3; attempt++) {
    createResponse = await fetch(model.url, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: model.buildInput(prompt) }),
    });
    if (createResponse.status !== 429) break;
    const waitMs = (attempt + 1) * 8000; // 8s, 16s, 24s
    console.log(`[ImageService] ${model.name} rate-limited (429), retrying in ${waitMs / 1000}s...`);
    await new Promise(resolve => setTimeout(resolve, waitMs));
  }

  if (!createResponse.ok) {
    throw new Error(`${model.name}: HTTP ${createResponse.status} ${createResponse.statusText}`);
  }

  let result = await createResponse.json();

  // Poll until completed or failed
  while (result.status !== 'succeeded' && result.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const getUrl = result.urls.get.replace('https://api.replicate.com/v1', '/api/replicate');
    const pollResponse = await fetch(getUrl, { headers: authHeader });
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(`${model.name}: generation failed — ${result.error || 'unknown error'}`);
  }

  return Array.isArray(result.output) ? result.output[0] : result.output;
}

/**
 * Generates an image via Replicate (with model fallback chain), then uploads
 * it to Supabase Storage so the URL persists (Replicate URLs expire ~1 hour).
 */
export async function generateImage({ prompt }: ImageGenerationOptions): Promise<string> {
  let lastError: Error = new Error('All image generation models failed');

  for (const model of IMAGE_MODELS) {
    try {
      console.log(`[ImageService] Trying ${model.name}...`);
      const replicateUrl = await runPrediction(model, prompt);
      console.log(`[ImageService] ${model.name} succeeded`);

      try {
        return await uploadToSupabaseStorage(replicateUrl);
      } catch (uploadErr) {
        console.warn('[ImageService] Supabase upload failed, using Replicate URL directly:', uploadErr);
        return replicateUrl;
      }
    } catch (err) {
      lastError = err as Error;
      console.warn(`[ImageService] ${model.name} failed, trying next fallback...`, err);
    }
  }

  throw lastError;
}

/**
 * Downloads an image from a URL and uploads it to Supabase Storage.
 * Returns the public URL from Supabase.
 */
async function uploadToSupabaseStorage(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Failed to download image from Replicate');

  const blob = await response.blob();

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const ext = blob.type.includes('png') ? 'png' : 'jpg';
  const fileName = `campaign-images/${timestamp}-${randomId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('campaign-assets')
    .upload(fileName, blob, {
      contentType: blob.type || 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from('campaign-assets')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Attempts to migrate an existing Replicate URL to Supabase Storage.
 * Returns the new persistent URL, or null if the image is no longer accessible.
 */
export async function migrateImageUrl(replicateUrl: string): Promise<string | null> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (replicateUrl.includes(supabaseUrl)) {
      return replicateUrl;
    }
    return await uploadToSupabaseStorage(replicateUrl);
  } catch {
    console.warn('[ImageService] Could not migrate image URL (likely expired):', replicateUrl);
    return null;
  }
}
