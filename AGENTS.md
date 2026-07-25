# AGENTS.md — jacobdeja.com

Recruiting website for Jacob Deja (#10, center mid). The plan docs live in `plan/` and are the source of truth —
read them before writing code, and re-read the relevant section before each phase.

## Read order
1. `plan/README.md` — master TODO (tasks A0–A9, B1–B6), current status, changelog. Start every session here.
2. `plan/DESIGN-SYSTEM-v0.2.md` — visual system: tokens, type, page structure, scrub spec, AE direction.
3. `plan/ARCHITECTURE-DEPLOYMENT-v0.1.md` — stack, file structure, content pipeline, deploy runbook.
4. `plan/AFTER-EFFECTS-GUIDE.md` — footage pipeline (human-executed; code consumes its outputs).
5. `plan/EMAIL-SERVICE-PLAN-v0.1.md` — Track B, separate build, do not start until Track A ships.

## Stack (locked — do not relitigate)
- **Astro** (static output) + **React islands** + TypeScript strict. NOT Next.js.
- **GSAP + ScrollTrigger** via `@gsap/react` `useGSAP` for the scrub. Plain CSS for minor motion.
- Styling: plain CSS with custom properties from `tokens.css` (DESIGN-SYSTEM §3–4). No Tailwind unless asked.
- Fonts self-hosted via `@fontsource/*`. No runtime Google Fonts.
- Deploy: Vercel, static. No serverless functions in v1. No env vars. No database. No auth.
- **Do NOT add the Effect library** (or any agent framework) to this repo. That's Track B, separate repo.

## Hard constraints (violating these = wrong, regardless of tests passing)
- Site is 100% static. Any change requiring a server runtime is out of scope — flag it, don't build it.
- Only `ScrubStage.tsx` (and optionally its background) hydrate. Everything else is `.astro`, zero JS.
- Scrub hydration is `client:idle` (not load, not visible) — rationale in ARCHITECTURE §4.
- **Decoded-memory budget:** never pre-decode all frames. Compressed `Image`s for all + sliding
  `createImageBitmap` window (±10–15 frames, LRU). Math in DESIGN-SYSTEM §7. This is the #1 way to
  silently ship something that crashes iOS Safari.
- Canvas scrub: `clearRect` before every draw (frames are transparent), rAF-throttled, draw-on-change only.
- `prefers-reduced-motion` → no scrub, static `poster.jpg`, page fully usable. Non-negotiable.
- Frame sets: ~60–90 frames, <5 MB compressed per set, ≤1280px long edge, load ONE set via matchMedia.
- Colors/type come from `tokens.css` only. The accent is `#5CFFC0` (`--volt`) — never a different green.
- Content (schedule/bio/links) renders from the Google Sheet fetch in `src/lib/content.ts` at build time
  (ARCHITECTURE §7b). Parse defensively: skip bad rows, never fail the build on content. Filter schedule
  to `date >= today`.
- Contact email renders as visible selectable text AND a `mailto:`. OG image is the 1200×630 `og-image.jpg`.

## Commands
- `npm run dev` — local dev
- `npm run build` — must pass with zero errors before any task is "done"
- `npx astro check` — type/astro diagnostics
- Deploy: `vercel` (preview), `vercel --prod` (production). Domain DNS is at Porkbun — see ARCHITECTURE §8.

## Definition of done (per task)
- `npm run build` clean, `astro check` clean.
- Mobile-first verified: the design must work at 390px width and on desktop. iOS Safari is the target
  device — when in doubt, optimize for the phone.
- Lighthouse targets before ship (task A8): mobile performance 90+, accessibility 100.
- Keyboard focus visible; all interactive elements reachable; film embed labeled.
- Update `plan/README.md` checkboxes and add a line to its changelog when a task completes.

## Working style
- One task from plan/README.md's Track A at a time, in order (A1 → A9). A4/A5 (the scrub) is the critical path —
  surface problems there immediately rather than working around them.
- Placeholder data is fine until Jacob's real vitals arrive (A0); mark placeholders `[TBD]` so they're
  greppable.
- Assets land in `public/frames/{landscape,portrait}/`, `public/poster.jpg`, `public/og-image.jpg` — produced
  by the human via AFTER-EFFECTS-GUIDE. If they don't exist yet, build against a generated placeholder
  sequence (solid shapes on transparency) with the same naming so the pipeline is testable end to end.
- Don't add dependencies beyond the locked stack without flagging why.
- Don't restructure the plan docs; append to plan/README.md's changelog instead.
