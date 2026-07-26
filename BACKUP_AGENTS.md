# AGENTS.md — jacobdeja.com

Recruiting website for Jacob Deja (#10, center mid). The plan docs live in `plan/` and are the source of truth —
read them before writing code, and re-read the relevant section before each phase.

## Read order
1. `plan/README.md` — master TODO (tasks A0–A9, B1–B6), current status, changelog. Start every session here.
2. `plan/DESIGN-SYSTEM-v0.2.md` — visual system: tokens, type, page structure, scrub spec, AE direction.
3. `plan/ARCHITECTURE-DEPLOYMENT-v0.1.md` — stack, file structure, content pipeline, deploy runbook.
4. `plan/AFTER-EFFECTS-GUIDE.md` — footage pipeline (human-executed; code consumes its outputs).
5. `plan/EMAIL-SERVICE-PLAN-v0.1.md` — Track B, separate build, do not start until Track A ships.
6. `plan/JACOB-DATA.md` — verbatim vitals + voice corpus + photo inventory. The ONLY source for real data.
7. `plan/DESIGN-BRIEF.md` — the brief the mockups were designed against.

## Design reference
Mockups live in `design/` (HTML and/or screenshots exported from Claude Design). They are authoritative
for **layout, spacing, and type treatment ONLY**. All data, copy, URLs, emails, dates, and durations in
them are **PLACEHOLDER** — real values come from `plan/` docs (especially JACOB-DATA.md) and the content
sheet. Known fakes in the mockups: "4:32 · 1080p", "SPRING 2026 HIGHLIGHTS", all fixture dates,
"RESPONDS FAST", and `contact@jacobdeja.com` (the real address is `jacob@jacobdeja.com`). The stick-figure
scrub frames are choreography diagrams — real AE alpha frames replace them. If a design HTML export
exists, treat it as visual reference, NOT starter code: the site is built from scratch in Astro per the
plans. Where `design/` and `plan/` conflict on behavior or data, `plan/` wins.

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
- The scrub is a **five-act diorama** (DESIGN-SYSTEM §5b/§5c): act-based frame loading (act-prefixed
  filenames), scroll pacing mirrors the edit's rhythm (two slow-mo peaks: spin AND strike), the act-4
  match cut is code-driven (volt circle from the tracked ball position), act-5 celebration is a muted
  `<video>` loop — never scrubbed frames.
- **Everything in the scrub is a pure function of scroll progress p.** No fire-once animations, no
  stateful triggers. Scroll up must rewind everything (trail retracts, flash un-flashes, defender
  un-dissolves). The only time-based element is the celebration loop.
- The volt ball-trail renders in code from the AE-tracked ball-path JSON, not from baked pixels.
- **No jersey number is ever rendered over the footage** — the number motif (currently #10, still
  unconfirmed) lives in UI text only, as a single swappable constant.
- `prefers-reduced-motion` → no scrub, static `poster.jpg`, page fully usable. Non-negotiable.
- Frame sets: ~60–90 frames, <5 MB compressed per set, ≤1280px long edge, load ONE set via matchMedia.
- Colors/type come from `tokens.css` only. The accent is `#5CFFC0` (`--volt`) — never a different green.
- Content (schedule/bio/links) renders from the Google Sheet fetch in `src/lib/content.ts` at build time
  (ARCHITECTURE §7b). Parse defensively: skip bad rows, never fail the build on content. Filter schedule
  to `date >= today`.
- Contact email renders as visible selectable text AND a `mailto:`. OG image is the 1200×630 `og-image.jpg`.

## Commands (Bun)
- `bun install` — deps (Vercel auto-detects the Bun lockfile and uses it for builds)
- `bun run dev` — local dev
- `bun run build` — must pass with zero errors before any task is "done"
- `bunx astro check` — type/astro diagnostics
- Deploy: `bunx vercel` (preview), `bunx vercel --prod` (production). Domain DNS is at Porkbun — see ARCHITECTURE §8.

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
- Assets land in `public/frames/{landscape,portrait}/` (act-prefixed: `a1_001.webp`…), `public/poster.jpg`,
  `public/og-image.jpg`, `public/celebration.mp4`, and `public/ball-path.json` — produced by the human via
  AFTER-EFFECTS-GUIDE. If they don't exist yet, build against generated placeholders with the same naming
  (solid shapes on transparency for frames; a synthetic ball-path JSON) so the whole pipeline, including
  the match cut and trail, is testable end to end before any real footage lands.
- Don't add dependencies beyond the locked stack without flagging why.
- Don't restructure the plan docs; append to plan/README.md's changelog instead.
