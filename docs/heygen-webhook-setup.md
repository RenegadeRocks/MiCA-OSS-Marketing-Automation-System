# HeyGen webhook setup (advanced, optional)

By default, MiCA polls HeyGen every 15 seconds while a video is being generated. This works fine for most users — videos take 8–10 minutes, and the dashboard reflects completion as soon as the next poll lands.

If you'd rather have HeyGen **push** completion events instead of MiCA polling for them, you can wire up a webhook. This is purely a performance / cost optimization (fewer API calls). Functionality is identical.

**Skip this entire document unless you specifically want push-based updates.** Polling works.

---

## What changes with a webhook

| | Polling (default) | Webhook (this doc) |
|---|---|---|
| HeyGen API calls per video | ~32–40 | 1 |
| Time-to-completion in UI | up to 15 seconds after HeyGen finishes | within ~1 second of HeyGen finishing |
| Setup effort | none | 15–30 minutes |
| Self-host requirement | none | a publicly reachable HTTPS endpoint |

For `v0.1.0` the polling path is the recommended default. The webhook path requires deploying a Supabase Edge Function (or any other public HTTPS endpoint) and is suitable for users who already self-host with custom infrastructure.

---

## Prerequisites

- A Supabase project (you already have this — same one as the app)
- The Supabase CLI installed locally: `npm install -g supabase`
- A HeyGen account on a plan that supports webhooks (check HeyGen's docs for current plan tiers)

---

## Step 1 — Create a Supabase Edge Function

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase functions new heygen-webhook
```

This creates `supabase/functions/heygen-webhook/index.ts`. Replace its contents with:

```ts
// supabase/functions/heygen-webhook/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const WEBHOOK_SECRET = Deno.env.get('HEYGEN_WEBHOOK_SECRET');

serve(async (req) => {
  // Verify the shared secret HeyGen sends with each call.
  const incomingSecret = req.headers.get('x-heygen-signature');
  if (!WEBHOOK_SECRET || incomingSecret !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: { event_type?: string; event_data?: { video_id?: string; url?: string } };
  try {
    body = await req.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const videoId = body?.event_data?.video_id;
  if (!videoId) return new Response('Missing video_id', { status: 400 });

  // Map HeyGen event_type → MiCA video_status
  let videoStatus: string | null = null;
  let videoUrl: string | null = null;
  switch (body.event_type) {
    case 'avatar_video.success':
      videoStatus = 'completed';
      videoUrl = body.event_data?.url ?? null;
      break;
    case 'avatar_video.fail':
      videoStatus = 'failed';
      break;
    default:
      return new Response('OK (ignored event)', { status: 200 });
  }

  const updates: Record<string, string> = { video_status: videoStatus };
  if (videoUrl) updates.video_url = videoUrl;

  const { error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('heygen_video_id', videoId);

  if (error) {
    console.error('Update failed:', error);
    return new Response(`DB update failed: ${error.message}`, { status: 500 });
  }
  return new Response('OK', { status: 200 });
});
```

> **Note:** This handler writes the HeyGen URL straight to `video_url`. HeyGen URLs expire after a TTL (typically 7–30 days). For permanent storage, the Edge Function would also need to download the MP4 and upload it to the `campaign-videos` bucket. The simplest pattern is to leave that to the existing client-side `persistVideoToStorage` — the Dashboard's poll loop will run the upload the first time someone opens the campaign after webhook fires. Slightly more code; same result.

## Step 2 — Set the secret and deploy

```bash
# Generate a random secret
openssl rand -hex 32

# Save it as a Supabase Function secret
supabase secrets set HEYGEN_WEBHOOK_SECRET=<the-secret-from-above>

# Deploy
supabase functions deploy heygen-webhook --no-verify-jwt
```

The `--no-verify-jwt` flag is important: HeyGen doesn't send Supabase auth tokens; we authenticate with our own shared secret instead.

The function URL will be:

```
https://<your-project-ref>.supabase.co/functions/v1/heygen-webhook
```

## Step 3 — Register the webhook with HeyGen

HeyGen's webhook configuration UI is at: https://app.heygen.com/settings → **Webhooks** (or call `POST /v1/webhook/endpoint.add` directly). Create an endpoint with:

- **URL:** the function URL from Step 2
- **Events:** `avatar_video.success`, `avatar_video.fail`
- **Secret / signature header:** the same secret you set in Step 2 (HeyGen will include this in every request as the `x-heygen-signature` header)

## Step 4 — Disable polling on the client (optional)

With the webhook reliably writing to `campaigns.video_status`, you can reduce or remove the client-side polling. The simplest way: change the poll interval in `src/pages/Campaign/Dashboard.tsx` from `15000` to a much larger number (e.g., `120000` — every 2 minutes) so it acts as a safety net but doesn't hammer HeyGen.

Do **not** remove the polling loop entirely — keep it as a fallback so a missed webhook doesn't strand a campaign in `'generating'` forever.

## Step 5 — Test

1. Open MiCA and trigger a real campaign (non-demo mode).
2. Watch your Edge Function logs: `supabase functions logs heygen-webhook --tail`.
3. When the video completes, you should see one POST with `event_type: avatar_video.success`, then the campaign row's `video_status` flips to `completed` in Supabase.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `401 Unauthorized` in function logs | `x-heygen-signature` header doesn't match `HEYGEN_WEBHOOK_SECRET`. Double-check the secret in both places. |
| Function returns 200 but the campaign never updates | Check `heygen_video_id` actually matches what HeyGen sends. Run `select id, heygen_video_id from campaigns where heygen_video_id is not null;` in Supabase SQL Editor. |
| Webhook never fires at all | HeyGen's webhook config might be paused; check the Webhooks page in HeyGen dashboard. Some plan tiers have webhook delivery disabled. |
| `video_url` is null after webhook | HeyGen sometimes sends success events without the URL on the first delivery. Polling will pick it up on the next run. |

---

*This doc is optional. The default polling implementation is fine for personal use, small teams, and most production scenarios. Webhooks are recommended only if you're running MiCA at meaningful scale or want sub-second reactivity.*
