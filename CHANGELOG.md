# Changelog

All notable changes to MiCA (the open-source release).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project follows [semantic versioning](https://semver.org/) — though we're still in 0.1.x, so minor bumps may include polish, fixes, and small improvements together.

## [0.1.7] — 2026-05-03

### Added
- `engines.node` field in `package.json` (`>=20`) and a Node 20+ prerequisite note in the README's Demo Mode quickstart.
- One-liner about Vite's port fallback so users don't follow `localhost:5173` to the wrong app when another Vite dev server is running.
- This `CHANGELOG.md` file, with full history extracted from the v0.1.0–v0.1.6 release commits.

### Why
A self-DX audit identified that visitors on Node 16/18 might hit cryptic errors with no guidance, and that the empty Releases tab made the project look unmaintained. Both fixes are 5-minute hygiene wins that materially improve first-impression quality.

## [0.1.6] — 2026-05-03

### Added
- Vendor chunk splitting in `vite.config.ts`: react/react-dom/react-router-dom → `react-vendor`, framer-motion → `motion-vendor`, @supabase/supabase-js → `supabase-vendor`.
- `docs/screenshots/` folder with four production screenshots (landing, dashboard strategy, Instagram tab, WhatsApp tab) embedded in the README under a new "A look at MiCA" section.

### Changed
- Main `index.js` bundle size: **593 KB → 248 KB** (-58%, gzip 180 KB → 78 KB). Vendor libs now cache independently across app-only redeploys.
- README: WhatsApp screenshot replaces the earlier Emails one (more illustrative of MiCA's voice).
- README: landing screenshot retaken with floating mascot hidden and the typewriter frozen on a complete phrase ("feels like magic") — no more mid-typing artifacts.

## [0.1.5] — 2026-05-03

### Changed
- Replaced ~44 `any` types with proper types across `Dashboard.tsx`, `GeneratingCampaign.tsx`, `CampaignTimeline.tsx`, `LaunchSection.tsx`, `ExecutionLog.tsx`, `DashboardComponents.tsx`, `demoData.ts`, `executionService.ts`. New `Strategy`, `Stage`, `ChannelPlan` interfaces in `GeneratingCampaign`. Catch-block errors now use `unknown` with `instanceof Error` guards.
- Annotated 9 React hooks dependency warnings with `eslint-disable-next-line` comments and rationale (intentional choices: typewriter config knobs, fetch-on-id-change patterns, mount-only effects, polling on stable identifiers).
- Demoted `react-refresh/only-export-components` to a per-file disable for context hooks (`useAnimationContext`, `useEyeballMood`) — dev-experience nag, not a runtime issue.

### Result
Lint went from 53 warnings to **0 errors / 0 warnings**.

### Known
- `marketing_plan: any` is retained in `Dashboard.tsx` with an `eslint-disable` comment. Modeling the full LLM-output schema is its own project; tracked tech debt.

## [0.1.4] — 2026-05-03

### Added
- Real OSS identity in `package.json`: `name`, `description`, `version: 0.1.4`, `license`, `homepage`, `repository`, `bugs`. Flipped `private: true → false`.
- Deployment-scope warning banner near the top of the README — explicit that MiCA is for self-hosting or trusted single-user use, not public multi-tenant deployment.
- `CONTRIBUTING.md` with PR/issue guidelines, areas where help is welcome, and architectural don'ts.
- `SECURITY.md` with vulnerability reporting process, supported versions, and documented architectural limitations (client-side keys, RLS).
- `.github/workflows/ci.yml` running `npm ci → lint → build → test` on PRs and pushes to `main`.

### Fixed
- `LICENSE` copyright collapsed to a single line so GitHub's Licensee detector recognizes MIT (was previously showing "Other").
- Build was failing on three unused `LaunchSection.tsx` props (`emailCount`, `whatsappCount`, `socialCount`) — removed from interface, destructuring, and caller.

### Changed
- Lint went from **70 errors / 9 warnings** to **0 errors / 53 warnings**. Real correctness bugs fixed:
  - `AmbientEyeballs.tsx` — replaced `useRef` lazy-init pattern with `useState` lazy initializer (refs-during-render).
  - `useTypewriter.ts`, `DoodleNode.tsx`, `FloatingHeroEyeball.tsx` (×3), `MiCALogo.tsx`, `AuthContext.tsx`, `EyeCharacter.tsx` (×2), `PeekingVignette.tsx` — deferred 8 setState-in-effect violations via `setTimeout(0)`.
  - `LandingPage.tsx` — precomputed char offsets array instead of mutating during `.map()` (render-time variable mutation).
  - `EyeCharacter.tsx`, `OldEyeCharacter.tsx` — replaced `Date.now()` impure call inside `useRef` initial value.
  - `DemoModeToggle.tsx` — hoisted `toggleDemoMode` above the effect that closes over it (TDZ).
- Demoted `@typescript-eslint/no-explicit-any` to `warn` in `eslint.config.js` (visible tech debt without CI-blocking).

## [0.1.3] — Pre-OSS-launch (2026-05-02)

### Changed
- Code-review polish pass after initial public release: M1, M3, I5 issues addressed; recovery-flow comments added.

## [0.1.2] — Pre-OSS-launch (2026-05-02)

### Fixed
- Corrected copyright in `LICENSE` to attribute the full team of five (Satbir Singh, Sumanth Krishna, Rushin Savani, Sachin Sablok, Aditya Ashutosh Panda) instead of single-author.

## [0.1.1] — Pre-OSS-launch (2026-05-02)

### Fixed
- Two critical paths from external code review.

## [0.1.0] — 2026-05-02

### Initial open-source release.

First public release after winning Cohort 5 of the [AI Generalist Fellowship by Outskill](https://outskill.com) (Demo Day: 28 March 2026).

**What MiCA is:** A React + Vite + TypeScript marketing automation app. The user describes their business once; MiCA builds and launches a complete 4–6 week campaign across email, WhatsApp, and Instagram, including a personalized HeyGen avatar launch video.

**Architecture at release:**
- Demo mode bundled with real demo data (Happiness Program by Art of Living) — works offline.
- Per-user API keys via in-app Settings page (localStorage), with `.env` fallback.
- Supabase for auth + Postgres + Storage. RLS-scoped, idempotent schema in `supabase/schema.sql`.
- AI providers: OpenRouter (text), Replicate (images), HeyGen (avatar video).
- Self-hosted single-user deployment model — provider keys are read in the browser.

[0.1.7]: https://github.com/gamedesignersatbir-coder/MiCA-OSS-Marketing-Automation-System/releases/tag/v0.1.7
[0.1.6]: https://github.com/gamedesignersatbir-coder/MiCA-OSS-Marketing-Automation-System/releases/tag/v0.1.6
[0.1.5]: https://github.com/gamedesignersatbir-coder/MiCA-OSS-Marketing-Automation-System/releases/tag/v0.1.5
[0.1.4]: https://github.com/gamedesignersatbir-coder/MiCA-OSS-Marketing-Automation-System/releases/tag/v0.1.4
[0.1.3]: https://github.com/gamedesignersatbir-coder/MiCA-OSS-Marketing-Automation-System/releases/tag/v0.1.3
[0.1.2]: https://github.com/gamedesignersatbir-coder/MiCA-OSS-Marketing-Automation-System/releases/tag/v0.1.2
[0.1.1]: https://github.com/gamedesignersatbir-coder/MiCA-OSS-Marketing-Automation-System/releases/tag/v0.1.1
[0.1.0]: https://github.com/gamedesignersatbir-coder/MiCA-OSS-Marketing-Automation-System/releases/tag/v0.1.0
