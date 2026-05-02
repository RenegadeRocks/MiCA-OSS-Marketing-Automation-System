# Contributing to MiCA

Thanks for considering a contribution. MiCA is maintained by a small team of five and was released as MIT-licensed software after winning Cohort 5 of the AI Generalist Fellowship by Outskill. We treat contributions seriously, but please be patient with response times — none of us work on this full-time.

## Before you open an issue

1. **Search existing issues first.** A surprising fraction of "bugs" are already reported.
2. **Try Demo Mode.** If a problem reproduces in Demo Mode (no API keys, no Supabase), it's a frontend / app-logic bug — easy to triage. If it only happens with your own keys, include which provider (OpenRouter / Replicate / HeyGen / Supabase) and the exact error message from the browser console.
3. **Include your environment.** OS, Node version (`node -v`), browser. Screenshots help.

## Before you open a PR

1. **Open an issue first** for anything non-trivial. We'd rather discuss the approach than have you spend hours on a PR we then ask you to redo.
2. **Run the basics locally:**
   ```bash
   npm install
   npm run lint
   npm run build
   npm run test -- --run
   ```
   All three should pass before you push.
3. **Keep PRs focused.** One concern per PR. A PR titled "fixes + cleanup + new feature" is much harder to review than three small ones.
4. **Don't commit secrets.** `.env` is gitignored — keep it that way. If you accidentally commit a key, rotate it immediately and tell us.

## Areas where help is especially welcome

- **TypeScript hygiene.** There are still `any` types we'd love to see properly typed (especially in `Dashboard.tsx`, `GeneratingCampaign.tsx`, and the AI services).
- **Tests.** We currently have minimal test coverage. Tests around campaign generation flows, the DoodleMap state machine, and the demo-mode bypass would all be valuable.
- **Self-hosting docs.** If you successfully deploy MiCA to Vercel / Netlify / your own VPS and run into pitfalls, a "deployment notes" PR would help others.
- **Provider integrations.** If you want to add support for an alternate AI provider (e.g., Claude/Anthropic via direct API, Stable Diffusion via Replicate alternatives), open an issue first to discuss the abstraction.

## Code style

- TypeScript strict mode is on. Don't disable it.
- Prefer existing patterns over introducing new ones. Component conventions, file structure, and naming should match what's already in the repo.
- Tailwind for styling. Brand orange is `#FF7A00`.
- Don't add new top-level dependencies without justification in the PR description.

## Architectural don'ts

These are documented in `CLAUDE.md` and apply to human contributors too:

- **Don't move API calls back into the client without discussion.** The current client-side approach is documented as a self-hosting tradeoff. If you're adding multi-user / public-deployment support, that requires a server-side proxy — please open an issue to discuss before coding.
- **Don't gate public routes (`/`, `/login`, `/signup`) on Supabase auth state.** The landing page must render even when Supabase is unreachable. This was a real bug we fixed.
- **Don't break Demo Mode.** It's the "try without setup" path. If your change touches `src/data/demoData.ts`, the demo toggle, or auth bypass, test that the demo flow still works end-to-end.

## Code of conduct

Be kind. We'll close issues and reject PRs that involve harassment, discrimination, or hostile behavior toward maintainers or other contributors. That's it — there's no formal CoC document yet because there's been no need for one.

## Questions?

Open a [Discussion](https://github.com/gamedesignersatbir-coder/MiCA-OSS-Marketing-Automation-System/discussions) on the repo, or email satsin20@gmail.com.
