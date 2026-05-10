# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server on :5173 (next free port if taken)
npm run build     # tsc -b && vite build  (CI runs this)
npm run lint      # eslint .
npm run preview   # serve the production build locally
npm run test      # vitest in watch mode
npm run test -- --run                     # one-shot run (what CI uses)
npm run test -- src/components/ui/Button.test.tsx   # single file
npm run test -- -t "renders the label"    # single test by name
```

Node ≥20 is required (enforced in `package.json` engines and CI).

CI (`.github/workflows/ci.yml`) runs lint → build → test on push and PR to `main`.

## Big-picture architecture

**No backend.** MiCA is a pure frontend that talks directly to Supabase (auth, Postgres, Storage) and three AI providers (OpenRouter, Replicate, HeyGen). There are no edge functions, no server, no API layer of our own. This shapes most of the architectural quirks below.

### Two execution modes

1. **Real mode** — talks to Supabase + AI providers. Requires the Supabase schema to be applied (`supabase/schema.sql`, pasted into the Supabase SQL Editor) and `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` set.
2. **Demo mode** — when `localStorage.mica_demo_mode === 'true'`, every Supabase and AI call is short-circuited at the service layer and pre-baked content from `src/data/demoData.ts` is served instead. Toggled by `DemoModeToggle` (bottom-left UI). Hidden in production via `VITE_HIDE_DEMO_CONTROLS`. **When debugging, always check whether demo mode is active — it changes which code paths execute.**

### API key resolution (`src/lib/apiKeys.ts`)

For each AI provider key, resolution is: `localStorage[mica_api_<NAME>]` (set via Settings page) → `import.meta.env.VITE_<NAME>` (install-time `.env`). localStorage always wins. Supabase keys are env-only — they're infrastructure, not per-session.

Don't read `import.meta.env` directly for AI keys; always go through `getApiKey()`.

### Vite dev proxy (CORS workaround)

`vite.config.ts` proxies `/api/replicate` → `https://api.replicate.com/v1` and `/api/heygen` → `https://api.heygen.com` to bypass CORS during local dev. **These proxies do not exist in production builds** — `npm run build` output calls providers directly from the browser. If you add a new provider that doesn't allow browser CORS, you'll need either a similar dev proxy plus a deployment-side proxy, or a server.

### Resumable HeyGen video generation

`src/services/videoService.ts` persists the HeyGen `video_id` to Supabase as soon as the job is accepted. The Dashboard polls HeyGen every 15s. Closing the tab and reopening from any device resumes polling. Completed videos are uploaded to Supabase Storage to avoid HeyGen URL expiry. An optional webhook path is documented in `docs/heygen-webhook-setup.md`.

### Routing & provider chain (`src/App.tsx`)

```
Router → AuthProvider → AnimationProvider → EyeballMoodProvider → AppShell
```

Note the typo'd `src/contexts/` (plural) directory holds `EyeballMoodContext` while `src/context/` (singular) holds `AuthContext` and `AnimationContext`. Both exist; check both when looking for a context.

Public routes (`/`, `/login`, `/signup`, `/settings`) render even if Supabase is unreachable — `AuthProvider` does not block UI rendering. Protected routes (`/campaigns`, `/create-campaign`, `/campaign/:id/*`) sit under `<ProtectedRoute>`. All campaign routes are lazy-loaded via `React.lazy` for code-splitting.

### Build chunk strategy

`vite.config.ts` manually splits `react-vendor`, `motion-vendor`, and `supabase-vendor` into their own chunks. Keep heavy libs in those buckets when adding deps, otherwise the cache benefit erodes.

### Campaign flow (the user-facing pipeline)

`CreateCampaign` (DoodleMap onboarding) → `TonePreview` → `GeneratingCampaign` (strategy + assets generation) → `Dashboard` (video, social posts, emails, WhatsApp tabs, launch button). State for in-flight generation lives in Supabase rows keyed by campaign id, so any step can be resumed by URL.

### Optional integrations

- **n8n webhooks** for actually delivering campaigns (`VITE_N8N_CAMPAIGN_LAUNCH_WEBHOOK`, `VITE_N8N_SEND_TEST_EMAIL_WEBHOOK`). Without them, the "launch" UI is essentially a no-op.
- **Custom OpenRouter model** via `VITE_OPENROUTER_MODEL` (default: `anthropic/claude-opus-4.6`).

## Deployment scope (security-critical)

**MiCA is for self-hosting or trusted single-user use.** Provider API keys live in the browser (localStorage or `import.meta.env`) and AI providers are called directly from the client. Do not deploy this app on a public, multi-tenant URL without first putting AI calls behind a server-side proxy. See `SECURITY.md`.

Demo mode bypasses Supabase auth entirely. Never enable demo mode on a production deployment that's serving real users — use `VITE_HIDE_DEMO_CONTROLS` to remove the toggle from the build.

## Git workflow

The repo lives at `https://github.com/RenegadeRocks/MiCA-OSS-Marketing-Automation-System`. Default branch is `main`.

For any code change: create a `fix/` or `feat/` branch, push it, and open a PR via `gh pr create`. Do not push directly to `main` — the maintainer prefers the PR audit trail even on solo work.
