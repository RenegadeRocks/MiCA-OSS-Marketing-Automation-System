# Security policy

## Reporting a vulnerability

If you've found a security issue in MiCA, **please don't open a public GitHub issue.** Email **satsin20@gmail.com** with:

- A description of the issue
- Steps to reproduce
- The affected version (`package.json` `version` field, or commit SHA)
- Your name / handle for credit (optional)

You'll get an acknowledgement within 7 days. We're a small volunteer team — please be patient.

## Supported versions

MiCA is in early open-source release. Only the **latest published release** receives security fixes. If you're running an older version, please update before reporting.

| Version | Supported |
| ------- | --------- |
| Latest release on `main` | ✅ |
| Older tags (`v0.1.0`, `v0.1.1`, etc.) | ❌ |

## Known architectural limitations (not vulnerabilities)

The following are documented design tradeoffs, not bugs. Please don't report them as vulnerabilities:

### Client-side API key handling

MiCA reads provider API keys (OpenRouter, Replicate, HeyGen) from `localStorage` or `import.meta.env` and calls those providers directly from the browser. This is **intentional** for self-hosted single-user deployments — there's no server in this architecture.

**Implications you should understand before deploying:**

- Anyone with access to the browser can read the keys (DevTools → Application → Local Storage).
- Network requests to OpenRouter / Replicate / HeyGen include the API key as a header — visible in DevTools → Network.
- A malicious browser extension could exfiltrate the keys.

**This means:** MiCA is **not safe to expose publicly** without putting AI calls behind a server-side proxy. If you do that and want to upstream the change, open an issue first — it's a sizeable architectural shift.

### Supabase Row-Level Security

The Supabase schema (`supabase/schema.sql`) ships with RLS policies enabled and ownership-scoped. If you modify those policies, **test them thoroughly** — a permissive RLS policy could let users read each other's campaigns.

If you find an RLS bypass that lets a logged-in user read another user's data, **that is a vulnerability** — please report it via the email above.

### Demo mode

Demo mode bypasses Supabase auth entirely and uses bundled local data. This is **intentional** so users can try MiCA without setup. Demo mode should never be enabled in a production / public deployment — the build flag `VITE_HIDE_DEMO_TOGGLE` exists for that purpose.

If you find a way to invoke real provider API calls from demo mode (which would burn through someone else's quota), **that is a vulnerability** — please report it.

## Disclosure timeline

Once a fix is ready, we'll:

1. Release a patched version.
2. Publish a GitHub Security Advisory describing the issue.
3. Credit the reporter (if they consented).

We aim for a 30-day turnaround on confirmed vulnerabilities, but small-team reality means it can take longer. If something is being actively exploited, say so in the email and we'll prioritize.
