# YOUR-RUNBOOK.md — David's personal TODO

> This is YOUR checklist, not the harness's. The harness builds the site; this is everything only you
> can do, in the fastest order, with the Premiere Pro + After Effects division of labor spelled out.
> Deep AE detail lives in `AFTER-EFFECTS-GUIDE.md` — this doc tells you when to open which app and why.

**The one-line strategy:** Premiere is the kitchen knife (cutting, trimming, marking, exporting video).
After Effects is the scalpel (roto, compositing, effects, alpha). Photoshop is for stills. The harness
builds against placeholders the whole time, so every phase below runs in parallel with the site build.

---

## PHASE 0 — Tonight, before any app opens (20 min)

- [ ] **Text Jacob, two asks:** (1) "Ask Jared for the clean full-res export of your highlight clip —
      no watermark. This week if possible." (2) "What number are you wearing this season?"
      The clean master is the highest-value item in the project. **If Jared is responsive, WAIT for the
      master before starting roto** — roto hours on the compressed 720p IG file are partially wasted if
      1080p arrives Tuesday. Everything else below proceeds on the current file.
- [ ] **Kick off the harness** with the GPT-5.6-sol prompt (A1 scaffold). It runs parallel to all of this.
- [ ] **Make a project folder** on a fast drive: `jacob-video/` with subfolders `source/`, `premiere/`,
      `ae/`, `exports/`. Copy the clip into `source/`. Never work off Downloads.

---

## PHASE 1 — Premiere Pro: mark, trim, and hand off (first session, ~1 hr)

**Never used Premiere? Open `PREMIERE-GUIDE.md`** — it walks all four Premiere tasks click by click.
Summary of what happens in this phase:

### 1a. Setup
- [ ] New Project → name it, save into `premiere/`.
- [ ] Import the clip (Cmd/Ctrl+I or drag into the Project panel).
- [ ] Drag the clip onto the **New Item** button (bottom of Project panel) — this makes a Sequence that
      exactly matches the clip's resolution and frame rate. (Same trick as AE's new-comp-from-footage.)

### 1b. Mark the six act boundaries (the most important 20 minutes of the project)
Play through and press **M** to drop a marker at each transition. Double-click a marker to name it:
- [ ] `A1-APPROACH` — start of usable action (full speed)
- [ ] `A2-SPIN` — the moment slow-mo begins
- [ ] `A2B-SNAP` — slow-mo ends, brief full-speed
- [ ] `A3-STRIKE` — second slow-mo begins
- [ ] `A4-BALL` — full speed, ball toward camera/net
- [ ] `A5-CELEBRATION` — the mobbing begins
Write the timecodes down (they go to the harness later for scroll-share tuning, and they're your AE map).

### 1c. Export the AE handoff (acts 1–4)
- [ ] Set the **In point (I)** at A1 and **Out point (O)** at the end of A4.
- [ ] File → Export → Media: **Format: QuickTime, Preset/codec: Apple ProRes 422 HQ**, match source
      resolution/framerate, no audio. Export to `exports/acts1-4_prores.mov`.
      This is what you'll roto in AE — ProRes scrubs smoothly where the HEVC original chokes.
      (Pro alternative once you're comfortable: right-click the clip → *Replace With After Effects
      Composition* for a live Dynamic Link. Skip it for now; the ProRes handoff is simpler and safer.)

### 1d. Export the celebration loop (act 5) — done entirely in Premiere, never touches AE roto
- [ ] In/Out points around the best 2–3 seconds of the mobbing (tight on the hug, before it disperses).
- [ ] **Lumetri Color panel** (Window → Lumetri Color): this is ACR — you know these sliders. Crush
      **Blacks** and **Shadows** hard toward near-black, **Saturation** down to ~25–35 (it plays at low
      opacity behind the title card — it should feel like a memory, not a broadcast), **Temperature**
      slightly cool.
- [ ] Export: **H.264**, 1280 wide is plenty, **target bitrate ~2–3 Mbps**, no audio →
      `exports/celebration.mp4`. Under ~1 MB ideal. Hand to the harness as `public/celebration.mp4`.
- [ ] ⚠️ Watermark check: if the @OPSMSOCCER mark sits ugly in this crop and the clean master hasn't
      arrived, punch in slightly (Effect Controls → Scale ~110%) to crop it out.

### 1e. LATER (not now): cut the full highlight reel here
When Jacob's raw clips arrive, Premiere is where the 3–5 min reel gets made: best actions FIRST, one
simple name/class/club title card up front, **no montage music** (coaches mute it; the site's film
section already promises "no montage music, no filler" — honor that), light Lumetri grade using the same
principles, export 1080p H.264, upload (YouTube unlisted works fine), link goes in the content sheet.

---

## PHASE 2 — After Effects: the composite (multiple sessions — the long pole)

Open `AFTER-EFFECTS-GUIDE.md` and follow it top to bottom. Import `exports/acts1-4_prores.mov` as your
source. Your act markers from Premiere are the map. The strategy overlay on top of that guide:

- [ ] **Session 1 — grade test + spin roto begins.** Before rotoing everything: roto ~10 frames of the
      spin, apply the full grade + volt rim, drop on a `#070B09` solid, and LOOK at it. This proves the
      look works before you invest the hours. Screenshot it — send it to me if you want a check.
- [ ] **Milestone 1 — Act 2 (the spin) complete first.** Roto'd, frozen, edges refined, graded, exported
      as an alpha PNG sequence, thinned to the scaffold's 40 A2 frames, transcoded to WebP, and used to
      replace only `a2_001.webp…a2_040.webp` in both aspect folders. Keep every other generated placeholder;
      this milestone judges alpha, grade, placement, and scrub feel—not final trail alignment.
      **This is the moment you see him rotate under your thumb.** Do this before anything else — it
      validates the entire pipeline end to end and fuels the rest of the grind.
- [ ] **Then acts 1 and 3** (approach, strike) — same pipeline, now routine.
- [ ] **Act 4:** framed footage to mid-flight (no roto of the flying ball), + extract the **net** once.
- [ ] **Ball track → JSON** (guide §9a): one verified pass in each final aspect comp → two raw track JSONs;
      the web handoff thins/reindexes them with the frames into `ball-path.json`.
- [ ] **Both aspect exports** (landscape + portrait re-staging), **poster.jpg + og-image.jpg**.
- [ ] Hand everything to the harness per the AGENTS.md asset manifest.

---

## PHASE 3 — Photoshop: the stills (~1 hr, anytime)

Per `JACOB-DATA.md` §4:
- [ ] Build ONE adjustment-layer group (desat to ~75%, blacks→#070B09, cool midtones, 3–5% grain), save
      as a template, apply to all photos — one grade across stills and video is the consistency that
      reads as designed.
- [ ] Portrait: cut out (Select Subject), on void, volt rim → About section + one-pager.
- [ ] Maestro B&W: split-tone into the palette → the brand image.
- [ ] og-image.jpg at exactly 1200×630 (from the strike frame or portrait).

---

## PHASE 4 — Integration milestones (you + harness, alternating)

- [ ] Harness has A1–A5 built on placeholders → your act-2 frames drop in → **first real scrub test.**
      Judge it on a real iPhone, not just your laptop.
- [ ] Full frames + ball path + celebration in → tune scroll shares against the real feel (the % splits
      in DESIGN-SYSTEM §5b are starting points, not law — your thumb is the judge).
- [ ] Content sheet built (ARCHITECTURE §7b), Jacob's real schedule rows in, publish button tested
      **by Jacob from his phone**.
- [ ] One-pager PDF made (design/ mockup is the template), dropped in `/public`.
- [ ] About copy: assemble from Jacob's verbatim answers, **he approves it**, replaces placeholder.

## PHASE 5 — Ship checklist

- [ ] Real film link in (even if the reel is v1 — ship, don't wait for perfect)
- [ ] Porkbun DNS → Vercel (ARCHITECTURE §8), email forwarding live, `jacob@jacobdeja.com` tested
- [ ] OG card verified in a real iMessage
- [ ] Lighthouse mobile 90+/100, real-iPhone scroll test, reduced-motion test
- [ ] Parents have seen it and are on board
- [ ] `vercel --prod` — then Jacob sends the first email

---

## HOW IT GETS *SICK* — where the quality actually lives

Not more effects. These five things, done with care, are the whole gap between good and crazy:

1. **One grade everywhere.** Video, stills, celebration loop — identical treatment. Consistency is what
   reads as "designed by someone expensive."
2. **The spin frames are the product.** Hand-clean the 10 worst roto frames of act 2 like they're going
   in a museum. Everything else can be 90%; the spin at slowest scrub is where every viewer lingers.
3. **The volt discipline.** One trail, one rim, one flash, ≤5% of the screen. Every time you're tempted
   to add glow, remove some instead. Restraint is the flex.
4. **The rhythm.** Fast–slow–snap–slow–accelerate. If the scroll pacing honors the edit's own rhythm,
   the page feels choreographed; if every act scrubs at the same speed, it feels like a gimmick.
5. **The title card lands ON the beat.** Ball fills lens → name appears → boys mobbing him behind it.
   Tune that single transition until it gives YOU chills. If it moves you, it'll wreck his friends.

*Fastest path through: Phase 0 tonight → Phase 1 tomorrow (one sitting) → Milestone 1 of Phase 2 this
week → everything else follows. The harness never waits on you; you never wait on the harness.*
