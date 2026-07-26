You are building jacobdeja.com, a recruiting website for a high-school soccer
player. This repo contains complete plans — your job is to execute them, not
redesign them.

STEP 0 — READ BEFORE ANY CODE, in this order:
1. AGENTS.md (repo root) — locked stack, hard constraints, definition of done
2. plan/README.md — master task list (Track A) and current status
3. plan/ARCHITECTURE-DEPLOYMENT-v0.1.md — stack, file structure, pipelines
4. plan/DESIGN-SYSTEM-v0.2.md — tokens, page structure, the five-act scrub spec

Skim the other plan/ docs as needed. Ignore these root files: prompt.md,
what-i-got-to-do.md, BACKUP_AGENTS.md (superseded notes, not instructions).
Never modify anything in media/ or design/.

DESIGN MOCKUP: design/"Jacob Deja - Hero + Scrub.dc.html" (with support.js) is
a Claude Design export. It is VISUAL REFERENCE ONLY — layout, spacing, and type
treatment. It is NOT source code: never import from it, never copy its JS/CSS,
never reuse support.js. It covers hero + scrub only; all other sections follow
plan/DESIGN-SYSTEM-v0.2.md §5. Every date, duration, URL, and email in it is
placeholder — real data comes ONLY from plan/JACOB-DATA.md.

NON-NEGOTIABLES (full detail in AGENTS.md — these are absolute):
- Astro static output + React islands + TypeScript strict. NOT Next.js.
- Bun for everything: bun install, bun run, bunx. No npm.
- Only the scrub island hydrates (client:idle). Everything else is .astro
  with zero JS.
- GSAP + ScrollTrigger for the scrub, rendering to ONE canvas. Never
  pre-decode all frames — sliding createImageBitmap window (±10–15 frames,
  LRU). Hard memory constraint; violating it crashes iOS Safari.
- Everything in the scrub is a pure function of scroll progress. No
  fire-once animations. Scrolling up must rewind everything.
- prefers-reduced-motion: skip the scrub entirely, show poster.jpg,
  page fully usable.
- Colors/type come only from tokens.css (built from DESIGN-SYSTEM §3–4).
  The accent is #5CFFC0 and appears on ≤5% of any screen.
- No jersey number rendered over footage; number is one swappable UI
  constant (currently unconfirmed).
- Do not add dependencies beyond the locked stack. No Effect, no state
  libraries, no CSS frameworks.

CURRENT TASK — A1 (Scaffold) only:
- Astro + React + GSAP project, TypeScript strict, Bun, in the repo root
  (site code in src/ and public/ per ARCHITECTURE §3; do not nest a
  subdirectory project)
- src/styles/tokens.css exactly from plan/DESIGN-SYSTEM-v0.2.md §3–4
- Self-hosted fonts (Anton or Archivo Expanded 800 / Inter or Geist /
  Geist Mono) via fontsource — no runtime Google Fonts
- A dark page rendering the tokens: bg --bg-void, hero type placeholder
- bun run build and bunx astro check must pass with zero errors

Real media assets don't exist yet. Where plans reference frames,
ball-path.json, celebration.mp4, or poster.jpg, generate placeholders with
the exact naming from AGENTS.md (act-prefixed frames like a1_001.webp as
solid shapes on transparency; a synthetic ball-path JSON) so the full
pipeline is testable end to end before real footage lands.

STOP CONDITION: when A1 is done, show me the result, update the checkbox
and changelog in plan/README.md, and stop for my review. Do not proceed
to A3/A4 without my go-ahead.

If a question is about intent or preference, ask me. If it's about specs
or data, the answer is in plan/ — find it there first.
