# Jacob [Lastname] — Recruiting Site

## Design System & Build Plan · v0.2

> A single-page, scroll-driven recruiting site whose one job is to make a college coach
> think *"I need to watch the rest of this kid's film"* within five seconds of opening the link.
> React + TypeScript, deployed on Vercel, custom domain, flawless on a MacBook and an iPhone.

**What changed since v0.1:** the video is now an **alpha (transparent) composite** — Jacob, the ball,
the defender, and the net are rotoscoped out in After Effects and rendered on a transparent background.
The *website* is the background. This dissolves the vertical-letterbox problem, unifies the site and the
film into one surface, and moves the "world" into responsive code while the *effects that travel with the
subjects* are built in AE. §1, §3, §6, §7 rewritten; new §6b (AE creative direction).

---

## 0. The one-paragraph thesis

The hero is the spin move. A coach lands on a near-black page, Jacob's name set huge, and as
they scroll the shot he sent plays *forward frame-by-frame under their thumb* — the beat-the-defender
turn resolves into the strike, the strike freezes, and the frozen frame releases into the facts a
coach actually needs. Because the composite is transparent, Jacob isn't playing *in a video box* — he's
**on the page itself**, floating on the same near-black the rest of the site is built from, lit by a
floodlight that's actually a CSS radial glow, the ball trailing a volt-mint streak that's the same accent
color as the stats below. The site and the clip are one continuous surface. We are not building a profile
page with a video on it; we are building the clip, and hanging the profile off it.

---

## 1. The core architecture decision: transparent composite

**AE renders the subjects + their effects on a transparent background. The site renders the world behind them.**

Why this, and not a baked-in background:

- **One surface.** Jacob floats on the page's `--bg-void`. No video box, no seam. The scrub feels like
  the *page* is moving, not a clip playing inside a frame.
- **The background becomes responsive and alive.** Built in CSS/canvas, it reacts to scroll (darker on the
  approach, a volt bloom at the strike), adapts per-breakpoint, and is always the exact same near-black as
  the rest of the site. A baked background can do none of that.
- **Dual-aspect for free.** Transparent subjects reposition trivially against a CSS background you control
  per orientation — instead of re-rendering a whole designed scene twice, you re-*place* the same subject
  sequence. (You still author two framings; see §6.)
- **Roto edges hide better.** A designed, slightly atmospheric dark background with a rim light on Jacob
  forgives imperfect mattes far better than a clean flat fill.

The tradeoff you're accepting: you do real rotoscoping work in AE, and the fast-motion frames (the strike)
will have imperfect edges. The whole design is built to hide that (§6b).

---

## 2. Reference websites (real, look at these before building)

Study these for *specific transferable moves*, not vibes.

**Scroll-scrub mechanic — canonical implementations**
- **Apple AirPods Pro / iPhone product pages** (apple.com) — image-sequence scrubbed on `<canvas>` pinned
  in a sticky viewport. Steal: the *calm* around the motion, type fading in on scroll-in and out on
  scroll-out, one motion at a time. Note how Apple floats transparent product renders on designed
  backgrounds — that's exactly our model.
- **Apple "Mac / AirPods" scroll stories** — the pin → scrub → release-into-content rhythm our hero uses.

**Athlete personal brands — the aesthetic register**
- **`allianceinteractive.com/blog/best-athlete-website-examples`** — open LeBron, Serena, and the younger
  athletes from here. Steal: bold above-the-fold name, single accent, generous black space, film where it
  can't be missed.
- **Nike athlete/campaign pages** — heavy condensed display type, full-bleed action, one accent, ruthless
  negative space.

**Motion / compositing references**
- **GSAP ScrollTrigger** docs — `scrub`, `pin`, `snap`. The engine (§7).
- **Framer Motion `useScroll` + `useTransform`** — lighter alternative.
- For the AE look: search **"speed ramp football edit," "roto motion trail after effects,"
  "trapcode particular ball trail"** — the vernacular of the effect you're building (§6b).

> Coach-behavior reality check: coaches spend **seconds** on a first look and want **jersey number labeled,
> best action first, and a title card** with name, position, grad year, club, GPA, height, dominant foot,
> contact. The cinematic scrub is the hook; the facts must be **one glance away**, never buried behind it.

---

## 3. Color system

The site is dark, single accent. Because the accent now **originates in the AE composite** (the ball trail,
the floor glow, the rim light are all volt-mint), the site's accent and the film's accent are literally the
same color. That shared color is what makes the composite feel native to the page.

```css
:root {
  /* Canvas / structure — "stadium dark" */
  --bg-void:      #070B09;  /* page background, near-black with a green undertone. Jacob floats on THIS. */
  --bg-panel:     #0C1512;  /* raised sections, stat cards */
  --bg-elevated:  #12201B;  /* hover / active surfaces */
  --hairline:     #1E2F28;  /* 0.5px borders, dividers */

  /* Turf greens — the brand ramp / atmosphere */
  --turf-900:     #0A2019;
  --turf-700:     #0F3D2E;
  --turf-500:     #1D9E75;
  --turf-300:     #4FD9A6;

  /* Accent — "floodlight" electric mint. Lives in BOTH the AE comp and the CSS. Sparingly. */
  --volt:         #5CFFC0;  /* ball trail, floor glow, rim light, active stat, strike flash */
  --volt-dim:     #2FBF8F;

  /* Text on dark */
  --text-hi:      #F3F7F5;
  --text-mid:     #A9BBB4;
  --text-lo:      #6A7E77;

  /* Kit white for the frozen-strike bloom */
  --flash:        #FFFFFF;
}
```

### Usage rules
- `--volt` is the signature and it must read as **one color** whether it's on the ball trail in the video or
  the stat number in HTML. Match the AE effect color to this hex exactly.
- If `--volt` covers more than ~5% of the screen at once, cut it back.
- Never put text on `--volt`; use `--bg-void` as the text color if you must.
- Body text `--text-mid` on `--bg-void` must pass WCAG AA. Verify.

---

## 4. Typography

Heavy condensed display for the name/headers, clean grotesque for body, mono for stats.

| Role | Face | Why | Fallback |
|---|---|---|---|
| Display (name, section titles) | **Anton** or **Archivo Expanded (800)** | Broadcast-lower-third energy | `"Archivo", system-ui, sans-serif` |
| Body / supporting | **Inter** or **Geist** | Legible small on iPhone | `system-ui, -apple-system, sans-serif` |
| Data / stats / captions | **Geist Mono** or **JetBrains Mono** | Tabular figures = box-score feel | `ui-monospace, "SF Mono", monospace` |

> Self-host via `next/font` — no runtime Google Fonts. Load only the weights you use.

### Type scale (fluid laptop↔iPhone)
```css
--fs-hero:   clamp(3.5rem, 12vw, 9rem);
--fs-h2:     clamp(1.75rem, 4vw, 3rem);
--fs-stat:   clamp(2.5rem, 6vw, 4.5rem);
--fs-body:   clamp(1rem, 1.2vw, 1.15rem);
--fs-label:  0.8125rem;   /* uppercase, tracked +0.12em */
```
Name = UPPERCASE tight tracking. Sentence case elsewhere. Labels = uppercase mono, wide tracking. Two body
weights (400/500). Never fake-bold the mono.

---

## 5. Page structure (single scroll)

```
[00] STICKY NAV DOTS (right edge) — tiny, --volt active dot
[01] HERO / IDENTITY      JACOB DEJA huge · #10 · CM · CLASS OF [YEAR] · scroll cue ↓
                          + a quiet "Skip to film →" link, always visible in the hero
[02] THE SCRUB (sticky, ~350vh) — transparent composite on the coded background. THE SIGNATURE.
     approach → turn → strike freezes + volt bloom → releases into ↓
[03] VITALS (box score)   grad year · position · 2nd · foot · height · club · HS · GPA (count-up, --volt)
[04] FULL FILM            embedded highlight reel, #10 labeled, "game-speed"
[05] SEE HIM PLAY         upcoming schedule — tournaments, showcases, league fixtures, with dates + kit color
[06] ABOUT                2–3 sentences, playing style, what he wants, + one strong portrait photo
[07] CONTACT + REFERENCES copy-paste email/phone, club coach ref, one-pager download
```
Order is deliberate: **identity → spectacle → facts → film → where to watch him live → contact.** Two
additions carry real recruiting weight: the **"Skip to film" link** exists because the scrub must never stand
between a busy coach and the film — the spectacle is opt-in depth, not a toll — and the **schedule section**
exists because coaches decide by watching recruits live; "where can I see him next" is a question the page
must answer. A coach who bounces after the scrub has still seen name, move, and (with a nudge) vitals.

---

## 6. Dual-aspect strategy (replaces the old vertical problem)

The composite is transparent, so you're not fighting the source's portrait orientation anymore — you're
**authoring two framings of the same isolated subjects** and letting the site pick one by viewport.

**Author two renders from one AE project:**
- **Landscape set** — 16:9 (or 21:9). Subjects positioned for a wide frame: Jacob center-left, room for the
  strike to travel right into negative space where the stats will resolve.
- **Portrait set** — 9:16 or 4:5. Subjects re-centered vertically for phone; the move reads top-to-bottom.

Same subject sequence, two compositions. Because the background is CSS (not baked), you only re-place the
subjects and re-export the alpha sequence per aspect — the "world" is identical, generated by the site.

**Site behavior:**
- `< 768px` → load the **portrait** frame set, full-bleed.
- `≥ 768px` → load the **landscape** frame set, centered, coded background fills the frame.
- Pick at load by viewport/matchMedia; don't load both.

**The coded background per aspect** (see §7) simply changes the vignette center and the volt-bloom origin to
match where the strike lands in that framing.

---

## 6b. After Effects creative direction — the composite

This is where "sick" is won. Spend your effort here.

### Roto & export
1. **Trim** the ~15s source to the **~4–6s** containing the move (in, turn, strike, one beat of follow-through).
2. **Rotoscope** Jacob, the ball, the defender, and the net onto **transparent** (Roto Brush 2 + refine edge;
   expect to hand-clean the fast frames). The ball especially — it carries the eye.
3. **Grade the subjects** (bake in, so it's free at runtime):
   - Crush Jacob's blacks toward `--bg-void` (#070B09) so his kit shadows melt into the page — this is the
     single move that makes him feel *on* the page, not *over* it.
   - Lift a cool teal into midtones; keep highlights clean white.
   - **Desaturate everything except the ball and the volt effects** — color becomes a spotlight, so the eye
     goes to the ball and the strike because they're the only saturated things in frame.
4. **Export with alpha** as an image sequence (see §7 for format): **WebP or PNG sequence, straight/unmultiplied
   alpha**, at the two aspects from §6.

### Effects that travel with the subjects (all volt/turf-toned, so they live in the site palette)
- **Ball motion trail** — a volt-mint (`#5CFFC0`) streak/echo tracing the ball through the turn, firing forward
  at the strike. **Highest-impact effect on the page.** This is what makes the accent color originate in the
  footage. (Trapcode Particular, or echo/CC Force Motion Blur, or a hand-animated shape trail.)
- **Floor contact glow** — a soft elliptical volt-tinted glow under Jacob's planted foot on the cut, anchoring
  him to a floor that doesn't literally exist. Sells the weight of the turn.
- **Rim light on Jacob** — a faint `--volt` edge light on his contour so he separates cleanly from the near-black
  *even where the roto is rough*. Doubles as edge-hiding and as style.
- **Defender separation** — a subtle directional smear/speed-line on the defender at the beat-him moment. Keep
  it quiet; it's punctuation, not a headline.
- **The strike** — volt flash + a burst of the trail + one or two frames of near-white bloom on the ball. This
  is the release beat into the stats; time it to land at ~0.85 scroll progress.

### What NOT to do
- No baked background, no stadium photo, no literal field. The page is the world.
- Don't over-key the whole frame with glow; the volt must stay ~5% of screen. One trail, one floor glow, one
  rim light, one strike — not a fireworks show.
- Don't color the effects off-palette. Match `#5CFFC0` exactly.

### Where the roto will fight you, and the plan for it
The strike is the fastest motion and the worst mattes. Design *around* it: at the strike, the volt bloom and
white flash are at max, which is precisely when rough edges are least visible. Let the effect cover the effort.

---

## 7. Scroll-scrub functional spec (what the code must do)

**Technique:** transparent image-sequence scrub on `<canvas>` (`globalCompositeOperation` default over the
coded background), pinned in a sticky viewport. Not `<video>` `currentTime` scrubbing (janky on iOS Safari).

### Frame format & extraction
- **Format: WebP sequence with alpha** (recommended) — clean edges, per-frame scrub control, good compression.
  PNG sequence is the fallback if a tool in your chain won't do alpha WebP; larger payload, same behavior.
  (Alpha *video* — WebM/VP9 — is smaller but has rougher edges and shakier old-Safari support; we want clean
  mattes and canvas scrub control, so sequence wins here.)
- If you export a master with alpha from AE (e.g. ProRes 4444 or PNG seq), transcode to WebP — **and
  downscale here**; never ship the AE comp resolution to the web:
  ```bash
  # landscape set: cap at 1280 wide (repeat for portrait with -resize 720 0, i.e. 720 wide)
  # keep total payload < ~5 MB per set; ~60–90 frames
  for f in ae_out_landscape/*.png; do
    cwebp -q 82 -alpha_q 90 -resize 1280 0 "$f" -o "frames_landscape/$(basename "${f%.png}").webp"
  done
  ```
- Target **~60–90 frames/set**, **total < 5 MB/set** compressed. AE gives you 120 at 24fps × 5s; dropping
  every other frame is invisible in a scroll scrub and halves both payload and memory. A coach on cellular
  must not wait.
- **Decoded-memory budget — the hidden tab-killer.** Compressed WebP held in memory is cheap (<5 MB total),
  but a *decoded* frame costs `width × height × 4` bytes: 1280×720 ≈ 3.7 MB, so pre-decoding 100 frames ≈
  370 MB and **iOS Safari kills the tab**. Never `createImageBitmap` the whole set. Instead: hold compressed
  `Image` objects for all frames, and maintain a **sliding decoded window** — `createImageBitmap` for ±10–15
  frames around the current index, LRU-evicting outside it — and warm the initial window plus the strike
  frames during idle. Cap web frames at ~1280 px on the long edge; the math above is why.
- Skip @2x/retina variants unless the memory math above still clears — sharpness is not worth a dead tab.

### The coded background (behind the transparent scrub)
Rendered as a CSS/canvas layer *under* the scrub canvas, driven by the same scroll progress:
- Base `--bg-void`.
- **Radial floodlight vignette** centered on Jacob (center differs per aspect, §6) — subtle, brighter behind
  him, falling to near-black at edges.
- **Turf atmosphere** — a very faint `--turf-700`→transparent gradient rising from the bottom third.
- **Grain/noise** overlay at 3–5% opacity to kill banding and add filmic texture.
- **Scroll reactivity:** cooler/darker on the approach (progress 0→0.6), then a fast **volt bloom** at the
  strike (progress ~0.85) that shares timing with the AE flash. Because it's code, it syncs to the scrub.

### Runtime behavior (the harness)
1. **Pick frame set** by viewport (portrait `<768px` / landscape `≥768px`); preload only that set.
2. **Preload** all frames into `Image` objects; minimal loader until first ~8 decode, then reveal. Draw frame 0.
3. Pin section [02] with a sticky inner stage inside a tall spacer (`~350vh`; taller = slower scrub).
4. Map section scroll progress `0→1` to frame index `Math.round(progress*(N-1))`; draw only on index change.
5. **rAF throttle** — never draw synchronously in the scroll handler.
6. Canvas sized to box × `devicePixelRatio` (cap 2); redraw on resize. Because frames are transparent, the
   coded background shows through — **clear the canvas each draw** (`clearRect`), don't fill it.
7. Position the subject frame per aspect (center-crop / place math differs landscape vs portrait).
8. **Strike:** at progress > ~0.85 drive the coded-background volt bloom + begin fading up [03] vitals so the
   freeze "releases" into content. The AE flash and the CSS bloom fire together.
9. Fade scroll-cue out after progress > ~0.04; fade the name/identity overlay per progress.

### Engine
- **Recommended: GSAP + ScrollTrigger** (`pin`, `scrub`). Handles resize/refresh; least fighting the browser.
- Alt: Framer Motion `useScroll`/`useTransform`. Alt: native `IntersectionObserver` + `sticky` + rAF (zero deps).

### `<ScrubStage>` interface (drop-in)
```ts
type Aspect = "portrait" | "landscape";

interface FrameSet {
  aspect: Aspect;
  frameCount: number;
  framePath: (i: number) => string;   // i => `/frames/${aspect}/frame_${String(i+1).padStart(3,"0")}.webp`
  width: number;                       // intrinsic px of the exported frames
  height: number;
}

interface ScrubStageProps {
  sets: FrameSet[];            // [portrait, landscape]; harness picks by matchMedia
  scrollLength?: string;       // e.g. "350vh" — controls scrub speed
  strikeAt?: number;           // 0–1 progress where flash/bloom/release begin (~0.85)
  poster: string;              // reduced-motion + preload fallback (a rendered strike frame ON the bg)
  onProgress?: (p: number) => void;   // lets the coded background + vitals react
}
```

### Non-negotiables
- `prefers-reduced-motion: reduce` → **skip the scrub**, show the poster (a pre-composited strike frame on the
  coded background) as a static hero. Page fully usable.
- The scrub is decorative; the **film in [04] is the real content** and must be reachable, labeled, focusable.
- Touch: don't hijack; read scroll position. Test iOS momentum scroll + address-bar resize specifically.
- Transparent frames: **always `clearRect` before draw**, or trails will smear across frames.

---

## 8. Responsive rules

| Breakpoint | Behavior |
|---|---|
| `< 768px` (iPhone) | **Portrait** frame set, full-bleed. Coded bg vignette centered for portrait. Hero name 2 lines. Vitals 2-up. Film full-width. |
| `768–1200px` | **Landscape** set, centered ~80vh stage. Vitals 3-up. |
| `> 1200px` (laptop+) | **Landscape** set, centered, full coded background + left-gutter label/progress. Vitals 4-up. Content max ~1100px. |

- Test matrix: **iPhone Safari (real device), Chrome desktop, Safari desktop.** iOS Safari is where scrub bugs
  live — momentum scroll, address-bar resize, low-power mode.
- Fluid via `clamp()`; avoid fixed pixel heights except the stage max-height.

---

## 9. Tech stack & harness

```
Framework:   Next.js (App Router) + TypeScript
Styling:     CSS Modules or Tailwind (tokens from §3 as CSS vars)
Motion:      gsap + @gsap/react (ScrollTrigger)   # or framer-motion
Fonts:       next/font (self-hosted Anton/Archivo, Inter/Geist, Geist Mono)
Media:       /public/frames/{portrait,landscape}/*.webp ; full reel via Mux or YouTube/Vimeo embed
Deploy:      Vercel (git push → preview → prod). Custom domain via Vercel DNS.
```

```
/public/frames/portrait/    frame_001.webp … (alpha)
/public/frames/landscape/   frame_001.webp … (alpha)
/public/poster.jpg          composited strike frame ON the coded bg (reduced-motion + OG)
/src/app/page.tsx
/src/app/layout.tsx         fonts, metadata, Open Graph
/src/components/
   Hero.tsx  ScrubStage.tsx  CodedBackground.tsx  Vitals.tsx  Film.tsx  About.tsx  Contact.tsx  NavDots.tsx
/src/lib/frames.ts          frame manifests (portrait+landscape) + preloader + matchMedia pick
/src/styles/tokens.css      §3 + §4
```

---

## 10. Performance budget

| Metric | Target | How |
|---|---|---|
| Frame payload | **< 5 MB per set** | 90–120 frames, alpha WebP `-q 82`, load one set only |
| LCP | < 2.0 s | Hero is type + poster, not the frame set |
| First frame drawn | immediate | Draw frame 0 as soon as it decodes |
| Scrub jank | 0 dropped frames | rAF throttle, draw-on-change, clearRect each draw |
| CLS | ~0 | self-host fonts, `font-display: swap`, size-adjust |
| Lighthouse (mobile) | 90+ perf, 100 a11y | reduced-motion, alt text, focus, contrast |

Two flattened strike-frame assets, not one: `poster.jpg` (full frame on the coded bg — reduced-motion hero +
preload placeholder) and `og-image.jpg` (a dedicated **1200×630** landscape crop of the strike for link
previews). Don't reuse the poster as the OG image — it's the wrong aspect and iMessage/Slack will crop it
badly, and the link preview is the first impression when a coach forwards the site to another coach.

---

## 11. Copy & metadata (locked names; bracketed facts still TBD)

**Locked:** player is **Jacob Deja**, jersey **#10**. Domain is **jacobdeja.com**. Contact email will be
**jacob@jacobdeja.com** (via forwarding). The **10** is a recurring motif — the playmaker's number — and
should surface in the design (hero, film label, favicon), though the domain deliberately stays name-only.

- **Title / OG:** `Jacob Deja · #10 · CM · Class of [year] — Recruiting`
- **OG description:** `Center mid, [Club]. Watch the film.`
- **Hero:** `JACOB DEJA` / eyebrow `#10 · CENTER MID · CLASS OF [YEAR] · [CLUB]`
- **Scrub caption (tiny, optional):** `[event], [month year]`
- **Vitals labels (mono, uppercase):** GRAD YEAR · POSITION · SECOND POSITION · DOMINANT FOOT · HEIGHT · CLUB ·
  HIGH SCHOOL · GPA
- **Film heading:** `Full film` / sub `#10, [color] kit. Game-speed.`
- **Contact:** `jacob@jacobdeja.com` · `[phone]` · `Club coach reference on request`

Plain and specific. No hype adjectives — the film is the hype.

---

## 12. Build order (v0.2 → v1)

1. **Scaffold:** Next.js + TS on Vercel, tokens.css, fonts, empty dark page deployed to a preview URL.
2. **AE:** trim → roto to alpha → grade → build the volt effects → export **both** aspect sequences → transcode to alpha WebP.
3. **CodedBackground.tsx:** the responsive floodlight/turf/grain layer, reacting to a `progress` prop. Build this before the scrub so there's a world to composite onto.
4. **`<ScrubStage>`:** transparent canvas scrub over the coded bg, landscape set, desktop. The risk — do it early. Verify `clearRect` (no smearing).
5. **Dual-aspect:** portrait set + matchMedia pick, full-bleed on a real iPhone.
6. **Reduced-motion:** poster fallback; verify page fully works with scrub off.
7. **Sections:** Hero, Vitals (count-up), Film embed, About, Contact, NavDots. Wire the strike→vitals release.
8. **Polish:** strike flash/bloom sync, scroll cues, hover/focus, meta/OG.
9. **Perf + a11y:** Lighthouse, real-device Safari, contrast, keyboard. Hit §10.
10. **Domain + ship:** custom domain on Vercel, OG card verified in a real link preview.

---

## 13. Open questions to resolve before v1

**Resolved:** name = Jacob Deja, number = #10, domain = jacobdeja.com (bought, Porkbun).

**Still open:**
- Remaining vitals: kit color, grad year, positions (primary/secondary), dominant foot, height, club, HS, GPA.
- Full highlight reel host (Mux vs YouTube vs Vimeo) — affects [04].
- Exact trim in/out of the move in the source (you set in AE).
- Final call on alpha WebP vs PNG sequence once you see edge quality out of AE.
- One line of about copy in Jacob's voice + which references to list.

---

*v0.2 — living document. The composite is transparent; the site is the background. Revise as AE lands.*
