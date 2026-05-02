# MiCA — AI Marketing Campaign Automation

> Describe your business once. Get a complete cross-channel marketing campaign — emails, WhatsApp messages, Instagram posts, and an AI-avatar launch video — in five minutes.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Vite](https://img.shields.io/badge/Vite-7-646cff.svg)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](https://www.typescriptlang.org/)

MiCA is an open-source marketing automation tool built on top of OpenRouter (text), Replicate (images), and HeyGen (avatar video). You give it a paragraph about your business; it builds a 4–6 week campaign across email, WhatsApp, and Instagram, complete with a personalized launch video.

> 🏆 Winners of Cohort 5 of the [AI Generalist Fellowship by Outskill](https://outskill.com) (Demo Day: 28 March 2026). Built by Satbir Singh, Sumanth Krishna, Rushin Savani, Sachin Sablok, and Aditya Ashutosh Panda — released to the community as MIT-licensed software.

> ⚠️ **Deployment scope.** MiCA is designed for **self-hosted or trusted single-user use**. In the current architecture, provider API keys (OpenRouter, Replicate, HeyGen) are read in the browser and called directly from the client — this is fine for personal use, internal tools, or a small trusted team, but **don't expose this app publicly without putting the AI calls behind your own server**. See [Limitations and roadmap](#limitations-and-roadmap) below.

---

## Try it without setup (Demo Mode)

The fastest way to see what MiCA does — no API keys, no Supabase, no signup.

```bash
git clone https://github.com/gamedesignersatbir-coder/MiCA-OSS-Marketing-Automation-System.git mica
cd mica
npm install
npm run dev
```

Open `http://localhost:5173`, click the **"Demo Mode"** toggle in the bottom-left corner, then click **Create Campaign**. The DoodleMap walks you through the prompts (type any text — it's a demo); the dashboard shows a real campaign generated for the Happiness Program by Art of Living, including a HeyGen avatar video, social posts, email sequences, and WhatsApp drafts.

Demo mode bundles all the assets locally — works offline, no internet required after `npm install`.

---

## Run it for real (your own campaigns)

To generate actual campaigns for your own business, you need three things: a free Supabase project, three API keys, and 10 minutes.

### 1. Set up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is enough)
2. In the Supabase dashboard:
   - **Settings → API** → copy your **Project URL** and **anon public key**
   - **SQL Editor → New query** → paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) → **Run**. This creates all the tables, RLS policies, and storage buckets MiCA needs.
   - If the SQL errors with `permission denied for table buckets`, your Supabase plan restricts SQL-based bucket creation. Follow the inline fallback instructions in `schema.sql` to create the 5 buckets manually via Storage → New bucket, then re-run the file.

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the Supabase URL + anon key. The AI keys are optional here — you can either set them in `.env` or paste them into MiCA's in-app **Settings** page (recommended for non-developers).

```bash
cp .env.example .env
# Edit .env — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 3. Get API keys

| Provider | What it powers | Where to get a key | Cost |
|---|---|---|---|
| [OpenRouter](https://openrouter.ai/keys) | All AI text (campaign strategy, copy, scripts) | Sign up → API Keys | Pay-per-use; ~$0.10 per campaign |
| [Replicate](https://replicate.com/account/api-tokens) | Social-post images | Sign up → API Tokens | ~$0.02 per image |
| [HeyGen](https://app.heygen.com/settings?nav=API) | Avatar launch video | Settings → API | One credit per video; free tier includes a few |

### 4. Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, sign up for a local account, click the **Settings** gear icon in the navbar, and paste your three API keys. Then click **Create Campaign** and follow the DoodleMap prompts.

---

## What MiCA does, end to end

1. **DoodleMap onboarding** — an interactive prompt-builder where you describe your product, audience, dates, budget, and tone of voice. Branching follow-up questions based on what you've already said.
2. **Strategy generation** — the AI agent builds a 4–6 week campaign strategy: phases (Problem → Agitate → Solve → Urgency), recommended channels, target audience refinement, key messages.
3. **Asset generation** — emails (with subject lines, preheaders, bodies, CTAs), WhatsApp message drafts, Instagram captions with hashtags + AI-generated images for each post.
4. **Avatar video** — a personalized launch video script, then a HeyGen avatar video reading it. Generation takes ~9 minutes; you can leave the page and come back — MiCA resumes polling automatically when you reopen the campaign.
5. **Dashboard** — a single page with all of it: video player, social posts (with regenerate-image buttons), email & WhatsApp tabs, execution log, launch button.

---

## Project structure

```
mica/
├─ src/
│  ├─ App.tsx                  — routing + global providers
│  ├─ context/                 — Auth, Animation, EyeballMood
│  ├─ pages/
│  │  ├─ LandingPage.tsx       — public marketing page
│  │  ├─ Auth/                 — Login, Signup
│  │  ├─ Settings.tsx          — paste-your-API-keys UI
│  │  └─ Campaign/
│  │     ├─ CreateCampaign.tsx (DoodleMap entry)
│  │     ├─ DoodleMap/         — interactive prompt-builder canvas
│  │     ├─ TonePreview.tsx
│  │     ├─ GeneratingCampaign.tsx
│  │     └─ Dashboard.tsx      — per-campaign hub
│  ├─ services/
│  │  ├─ aiService.ts          — OpenRouter calls
│  │  ├─ imageService.ts       — Replicate (with Supabase Storage upload)
│  │  └─ videoService.ts       — HeyGen (resumable across sessions)
│  ├─ lib/
│  │  ├─ supabase.ts           — Supabase client init
│  │  └─ apiKeys.ts            — localStorage-first / env-fallback resolver
│  └─ data/demoData.ts         — bundled demo campaign (Happiness Program)
├─ supabase/
│  └─ schema.sql               — paste into Supabase SQL Editor on first setup
├─ docs/
│  └─ heygen-webhook-setup.md  — optional: webhook-based video status
├─ public/
│  ├─ media/                   — landing-page videos
│  └─ demo-assets/             — bundled demo images + video
├─ .env.example
├─ LICENSE
└─ README.md
```

---

## Architecture notes worth knowing

- **Demo mode is the bypass path.** When `localStorage.mica_demo_mode === 'true'`, every Supabase and AI-provider call is short-circuited and pre-baked demo data is served. Use this to evaluate the UX without spending API credits.
- **API keys come from one of two places.** Per-user (in the Settings page → localStorage) wins over install-time (`.env`). Either works. Demo mode short-circuits both.
- **Video generation is resumable.** Once HeyGen accepts the job, the `video_id` is persisted to Supabase. The Dashboard polls HeyGen directly every 15 seconds — close the tab, come back hours later from any device, polling resumes. Completed videos are uploaded to Supabase Storage so the URL doesn't expire.
- **AuthProvider doesn't gate UI rendering.** Public routes (`/`, `/login`, `/signup`, `/settings`) render even if Supabase is unreachable. This avoids the "blank page when backend is down" failure mode.
- **No backend code** — MiCA is a pure frontend that talks directly to Supabase and the three AI providers. No server to deploy, no edge functions required (though [optional HeyGen webhooks](./docs/heygen-webhook-setup.md) are documented for advanced setups).

---

## Tech stack

- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **react-router-dom v7**
- **framer-motion** for animation
- **Supabase** (auth, Postgres, Storage)
- **OpenRouter** for LLM access (default model: `anthropic/claude-opus-4.6`)
- **Replicate** for image generation (nano-banana-pro fallback chain)
- **HeyGen** for AI avatar video generation

---

## Limitations and roadmap

- **Supabase Free tier** caps storage uploads at 50 MB per file. Most HeyGen videos fit comfortably (8–25 MB), but oversize videos transparently fall back to HeyGen's CDN URL (which expires after the provider's TTL). Upgrade to Supabase Pro for the 5 GB cap.
- **HeyGen video cancellation is a soft cancel** — HeyGen has no public abort API, so the in-app "Cancel" button stops MiCA from waiting but doesn't refund the credit. The video may still appear in your HeyGen library after generation.
- **No backend means no scheduled execution.** The "launch campaign" flow integrates with [n8n](https://n8n.io/) webhooks (optional) for actual email/WhatsApp/Instagram delivery. Without n8n, you get a beautifully drafted campaign you can copy-paste into your existing tools.
- **Single-user per Supabase project.** Row-level security is permissive by design. Multi-tenant support is on the roadmap.

---

## Contributing

PRs welcome — especially for: improved demo data, new tone-of-voice presets, better AI prompts, and translations.

Open an [issue](https://github.com/gamedesignersatbir-coder/MiCA-OSS-Marketing-Automation-System/issues) for bugs, feature requests, or questions. Discussion before large PRs is appreciated.

---

## Authors

MiCA was built during the AI Generalist Fellowship by [Outskill](https://outskill.com) (Cohort 5, Demo Day 28 March 2026), where it won the cohort.

- **Satbir Singh**
- **Sumanth Krishna**
- **Rushin Savani**
- **Sachin Sablok**
- **Aditya Ashutosh Panda**

---

## License

MIT — see [LICENSE](./LICENSE).

This project bundles demo content (the Happiness Program by Art of Living) for educational purposes. The Happiness Program is a real volunteer-led wellness program by [Art of Living](https://www.artofliving.org/) — included as a meaningful real-world example of what MiCA can produce.
