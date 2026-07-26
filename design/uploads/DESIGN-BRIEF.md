# DESIGN-BRIEF.md — jacobdeja.com

> Hand this file (plus the four `photo-*.jpeg` files and, when ready, the video frames) to the design
> tool. It is self-contained: everything needed to design the site is here. Full specs live in
> `DESIGN-SYSTEM-v0.2.md` — where this brief and that doc conflict, the design system wins on tokens,
> this brief wins on story.

---

## The one-liner
A recruiting site for **Jacob Deja** — 2027 CAM/CDM, MLS Next, 4.0 GPA — whose hero is his own
beat-the-defender spin move, rotoscoped onto transparency and **scrubbed frame-by-frame under the
visitor's scroll**. The audience is college coaches who give a link five seconds. The site's job:
make them stop, watch, and reach the film and facts in one tap.

## The audience truth that governs everything
Coaches decide in seconds, on their phones, between training sessions. So: the spectacle is opt-in
depth, never a toll — a **"Skip to film" link lives in the hero**, the facts are one glance away, and
mobile (390px, iOS Safari) is the primary canvas. Impress *and* respect their time.

## The brand story (real, not invented)
- His kit literally says **MAESTRO**. He models his game on **Özil** — the playmaker, tempo-dictator,
  high-IQ archetype — not the flashy scorer.
- In his own words, he wears **10 because "it is also the number to my house and it represents home."**
  ⚠️ Number pending final confirmation (one photo shows #12) — design the number as a swappable motif.
- His self-description vocabulary: *dictate the tempo · high IQ · explosive · creative · final third ·
  make plays happen.* The design should feel like that: controlled, intelligent, with one explosive accent.

## Visual system (locked tokens — use exactly)
- **Mode:** dark only. Page background `#070B09` ("stadium void" — near-black with a green undertone).
- **Surfaces:** `#0C1512` panels, `#12201B` elevated, `#1E2F28` hairlines.
- **Turf ramp:** `#0A2019` → `#0F3D2E` → `#1D9E75` → `#4FD9A6` (atmosphere, category).
- **THE accent — "volt":** `#5CFFC0`. It appears in the video itself (ball trail, rim light, strike
  flash) and in the UI (stat numbers, active states). **≤5% of any screen.** One color across film + UI
  is the signature cohesion move.
- **Text:** `#F3F7F5` high / `#A9BBB4` mid / `#6A7E77` low.
- **Type:** heavy condensed display (Anton or Archivo Expanded 800, UPPERCASE, tight) for the name and
  section titles — broadcast lower-third energy; Inter/Geist for body; **Geist Mono for all stats and
  labels** (uppercase, tracked +0.12em) so numbers read like a box score.
- **Texture:** 3–5% grain over dark gradients; a radial "floodlight" vignette behind the subject.
- **Photography treatment (applies to every image):** desaturate to ~70–80%, blacks crushed to
  `#070B09`, cool midtones, grain — stills and video share one grade.

## Page structure (design each; order is fixed)
1. **HERO** — `JACOB DEJA` huge, eyebrow `#10 · CAM · CLASS OF 2027 · THE ISLAND FC WEST (MLS NEXT)`,
   scroll cue, quiet **"Skip to film →"** link.
2. **THE SCRUB** — full-viewport pinned stage; Jacob floats transparent on the coded background
   (floodlight radial + faint turf gradient rising + grain). Scroll drives the move; at the strike:
   volt/white flash, then the frame releases into →
3. **VITALS** — box score, mono type, count-up numbers in volt:
   `CLASS OF 2027 · CAM / CDM · RIGHT FOOT · 5'10" · MLS NEXT — THE ISLAND FC WEST · COMSEWOGUE HS · 4.0 GPA`.
   **No goals/assists line** (untracked; never invent).
4. **FULL FILM** — the reel, large, labeled with his number + kit color. This is the section the skip
   link targets; it must feel like the destination, not an afterthought.
5. **SEE HIM PLAY** — upcoming schedule as a clean list/table: date · event · location · kit. (Data
   arrives from a sheet; design for 2–8 rows, empty-state included.)
6. **ABOUT** — 2–3 sentences in his voice + the portrait. Candidate pull-quote, verbatim from him:
   *"10 is the number to my house. It represents home."*
7. **CONTACT** — email (visible text + mailto), one-pager PDF download button, "club coach reference
   on request." Dead simple, high contrast.
- Persistent: tiny nav dots (right edge, volt active), footer minimal.

## Assets available
- `photo-portrait-opsm.jpeg` — straight-on portrait, white MAESTRO kit → About + one-pager (will be
  cut out onto `#070B09` with a volt rim).
- `photo-maestro-bw.jpeg` — B&W editorial walk, "MAESTRO" visible → the mood/brand image.
- `photo-snow-12.jpeg` — cinematic night-snow shot (⚠️ shows #12; crop above the number until resolved).
- `photo-training-black.jpeg` — spare; use only if a layout needs it.
- Video: transparent alpha frame sequences (landscape + portrait) + a strike-frame poster — in
  production; design with a placeholder silhouette of a player mid-turn.

## Also design
- **The one-pager PDF** (US Letter): same system on `#070B09` — portrait, vitals box score, film QR/link,
  schedule, contacts. Coaches file these.
- **OG card** 1200×630 (the strike or the portrait, name + eyebrow).
- Favicon/avatar: his number or "JD" monogram on the void.

## Anti-goals (as important as the goals)
- No template energy: no card grids of features, no gradient-blob SaaS hero, no light mode, no stock
  photography, no badge/logo walls.
- No fireworks: volt stays ≤5%; one motion at a time; calm around the signature.
- Nothing between a coach and the film: every design choice yields to that.
- Don't fabricate: no invented stats, no fake crest, no number he doesn't wear.

## Deliverables wanted from this brief
Hi-fi mockups, **mobile (390px) and desktop (1440px)**, of: hero, scrub stage (three moments: approach /
strike flash / release-into-vitals), vitals, film, schedule, about, contact — plus the one-pager PDF.
Every color/size decision should map cleanly onto the tokens above, because the build renders them as
CSS custom properties in a static Astro site.
