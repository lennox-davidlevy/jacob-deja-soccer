Read AGENTS.md, then plan/README.md, in full, before doing anything.

This repo builds jacobdeja.com — a recruiting site for my nephew. The five plan
docs in plan/ are the source of truth; AGENTS.md has the locked stack and hard
constraints. Do not relitigate decisions marked as locked.

Current task: A1 (Scaffold) from plan/README.md's Track A.
- Astro + React + TypeScript strict + GSAP, per plan/ARCHITECTURE-DEPLOYMENT-v0.1.md §2–3
- Create src/styles/tokens.css from plan/DESIGN-SYSTEM-v0.2.md §3–4 exactly
- Wire self-hosted fonts
- Empty dark page rendering the tokens (bg --bg-void, hero type placeholder)
- npm run build and astro check must pass clean

Real assets (frames, poster) don't exist yet — where the plan calls for them,
generate placeholder alpha sequences with the correct naming per AGENTS.md so
A3/A4 can be built and tested before the After Effects work lands.

Work one task at a time. When A1 is done, show me what you built, update the
plan/README.md checkbox and changelog, and stop for my review before starting
A2's code-side prep or A3.

Questions about intent → ask me. Questions about specs → the docs answer them.
