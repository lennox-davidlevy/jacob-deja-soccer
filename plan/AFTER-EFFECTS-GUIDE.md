# After Effects Guide — Jacob's Recruiting Clip

## From raw phone footage to a transparent, stylized, web-ready frame sequence

> Written for someone fluent in Photoshop who has never opened After Effects.
> Goal: isolate Jacob (+ ball, defender, net) onto a **transparent** background, stylize it with
> the volt-mint effects from the design system, and export two clean alpha sequences (landscape +
> portrait) that the website composites onto its own coded background.
>
> Companion to `DESIGN-SYSTEM-v0.2.md`. Read §6b of that doc for *what* the look should be; this is *how*.
>
> **Player:** Jacob Deja. **⚠️ Jersey number unconfirmed — do NOT label a number in the composite until
> Jacob confirms what he wears in this video (JACOB-DATA.md §2).** One photo shows #12, he says 10.
> Volt-mint accent is `#5CFFC0` throughout. Source clip: `jacob-sick-move.mov`, 720×1280, 24fps, HEVC, ~15.4s.

---

## 0. The mental model (read this first — it saves you an hour of confusion)

**AE is Photoshop with a timeline.** Almost every instinct transfers, with new names:

| Photoshop | After Effects | Note |
|---|---|---|
| Document | **Composition** ("comp") | Your canvas + its dimensions, frame rate, duration. |
| Layers panel | **Timeline panel** | Same stacking (top = front), but each layer now has a duration bar. |
| Layer | **Layer** | Same idea. Footage, text, solids, adjustment layers all exist. |
| Adjustment layer | **Adjustment layer** | *Identical* concept — affects everything beneath it. |
| Layer mask | **Mask** or **Alpha matte** | Masks exist; roto creates an animated alpha. |
| Smart filter | **Effect** (in Effect Controls) | Non-destructive, live-adjustable, stacked. |
| Blend mode | **Blending mode** | Same modes, same names. |
| Adobe Camera Raw sliders | **Lumetri Color** effect | Your color-grading home. Feels like Lightroom/ACR. |
| Transform (Cmd+T) | **Transform** properties (P/S/R/T) | Position, Scale, Rotation, Opacity — press the letter to reveal. |
| — | **Keyframe** | The one genuinely new concept. A saved value *at a point in time*. §7. |

The single new idea is the **keyframe**: you set a property's value at time A and a different value
at time B, and AE interpolates between them. That's all animation is. A stopwatch icon ⏱ next to any
property turns keyframing on for it.

**Panels move.** AE's screen is a grid of dockable panels called a **Workspace** (top-right, or
`Window > Workspace`). We'll switch workspaces a couple times. If your screen ever looks "wrong,"
it's just a workspace — reset it with `Window > Workspace > Reset to Saved Layout`.

---

## 1. Before you touch AE — prep the clip

Your source is `jacob-sick-move.mov`: **720×1280 vertical, 24 fps, HEVC, ~15.4 s**. Two prep facts matter.

1. **The whole clip is now used, but only ~part of it gets roto'd** (DESIGN-SYSTEM §5b). Mark SIX act
   in/out points by scrubbing in QuickTime, following the edit's own speed changes: APPROACH (full speed) /
   SPIN (slow-mo) / SNAP (brief full-speed) / STRIKE (slow-mo) / BALL-INTO-NET (full speed) / CELEBRATION
   (full speed). The two slow-mo sections are your dense-frame acts — they carry the scrub. **Roto only acts 1–3** (approach through strike, ~4–6s — the plan below). Act 4 exports as
   normal framed footage up to the ball's mid-flight (the site's code takes over from there with a match
   cut). Act 5 (celebration) is NOT frames at all — export it as a short opaque video loop (see §10).
   Rotoscoping is per-frame work; the acts you don't roto save you days.
2. **HEVC can be sluggish to scrub in AE.** Optional but recommended: transcode the trimmed section to
   ProRes first so AE is responsive. If you have the ffmpeg from the design doc handy:
   ```bash
   # trim to your move (adjust -ss start and -t duration) AND transcode to an edit-friendly codec
   ffmpeg -ss 00:00:04 -t 5 -i jacob-sick-move.mov -c:v prores_ks -profile:v 3 -an jacob-move.mov
   ```
   `-ss 00:00:04` = start at 4s, `-t 5` = keep 5 seconds, `-an` = drop audio (you don't need it).
   If you'd rather not touch a terminal, skip this — just do the trim inside AE in the next step. It'll
   work, only slower.

---

## 2. Project setup (the first 5 minutes in AE)

1. Open AE. On the Home screen click **New Project**.
2. **Import the clip:** `File > Import > File` (or double-click empty Project panel), pick your `.mov`.
   It lands in the **Project panel** (top-left) — this is your "library," not your canvas yet.
3. **Make a comp from the footage:** drag the clip onto the **New Composition** icon at the bottom of
   the Project panel (or right-click the footage → *New Comp from Selection*). This creates a comp that
   exactly matches the clip's resolution and frame rate — important, so you're at 24 fps, 720×1280.
4. **Save now, save often:** `Cmd/Ctrl+S`. Name it `jacob-recruiting.aep`. AE can crash during roto;
   turn on `Preferences > Auto-Save`.
5. **Trim here if you didn't in §1:** drag the ends of the layer's duration bar in the timeline, or set
   the work area (B = begin, N = end at the playhead) and `Composition > Trim Comp to Work Area`.

> **Checkpoint:** you should see Jacob in the big **Composition panel** (center), and one layer in the
> **Timeline** (bottom). Press Spacebar to play. (First play caches to RAM and may be slow; second play
> is real-time.)

---

## 3. The workflow, top to bottom

You'll do these in order. Each has its own section below.

```
1. Roto — isolate Jacob + ball + defender + net onto transparent      (§4–5)  ← the hard part
2. Clean the matte edges                                               (§6)
3. Grade the subjects (crush blacks, cool midtones, desaturate)        (§7)
4. Build the volt effects (ball trail, floor glow, rim light, strike)  (§8)
5. Frame for two aspects (landscape + portrait)                        (§9)
6. Export two alpha sequences + a poster frame                         (§10)
7. Sanity-check the alpha                                              (§11)
```

---

## 4. Rotoscoping with Roto Brush 3 (isolating the subjects)

This is 70% of your effort. Modern AE does it with AI, but the strike (fast motion) will need hand-cleanup.

**Which tool:** recent AE has **Roto Brush 3 ("Next-Gen")** and newer **Object Matte** AI tools. If your
toolbar shows an Object Matte icon where Roto Brush used to be, either works; the steps below are Roto
Brush, the more documented path.

### Step by step
1. **Open the layer in the Layer panel.** Double-click the footage layer in the timeline. A *new* panel
   opens showing just that clip — Roto Brush **only works in the Layer panel**, not the Comp panel. (This
   trips up every beginner. If the Roto Brush won't draw, you're in the wrong panel.)
2. **Select the Roto Brush tool:** `Option/Alt + W`, or the brush icon in the top toolbar.
3. **In Effect Controls, set Version to 3.0** (Next-Gen) and Quality to **Best**.
4. **Pick a good starting frame** — one where Jacob is fully visible and not motion-blurred. Move the
   playhead there.
5. **Paint a green stroke** *down the middle* of Jacob — not the edges. One stroke through his torso and
   legs. AE guesses the boundary (you'll see a magenta outline). It'll grab roughly his shape.
6. **Add/subtract:** paint more green to *add* missed areas; hold `Option/Alt` and paint **red** to
   *remove* background it grabbed by mistake. Work until the magenta outline hugs him on this one frame.
7. **Propagate:** press `Page Down` (or the frame-forward arrow) to step forward one frame. AE tracks the
   selection automatically. Watch the outline. Every few frames it'll drift — nudge it with a small green
   or red stroke, then continue forward. **You don't fix every frame**, only where it slips.
8. **Do the whole trimmed range** forward from your start frame. (You can also go backward from the start
   frame with `Page Up`.)

### The four subjects — a decision
You need Jacob, the ball, the defender, and the net. Two approaches:

- **Simplest: one matte for everything you want to keep.** Roto Jacob + ball + defender + net together as
  a single foreground. Fastest, and since they're all "the play," it usually reads fine.
- **Cleaner but more work: separate mattes on duplicate layers.** Duplicate the footage layer
  (`Cmd/Ctrl+D`) once per subject, roto each layer to a different subject, so you can (for example) put the
  ball trail *behind* the ball but *in front* of the net. Do this only if you find you need that control.

Start with the simple approach. Upgrade to separate layers only for the ball if the trail effect (§8)
needs to sit behind it.

### The ball is the tricky one
It's small and fast. On the strike it may be a motion-blurred streak. Don't fight to get a razor edge on
those frames — a soft/blurred ball reads as *speed*, which you want. If Roto loses it entirely on 2–3
strike frames, you'll paint it back in §8 with the trail effect anyway.

### Freeze when done
When the whole range looks right, click **Freeze** (the Freeze button in the Layer panel, or in Effect
Controls). This caches the matte so AE stops re-analyzing — huge speed-up, and it locks your work. It takes
a minute to compute. **Freeze before you move on.**

> **Reality check:** a clean roto of a 5-second sports clip is a few hours for a first-timer. That's
> normal. Podcast in, do it in passes, save constantly. The design (dark background, volt rim light) is
> built to forgive imperfect edges — you do **not** need VFX-studio perfection.

---

## 5. If Roto Brush struggles: fallbacks

- **Shaky footage** is roto's enemy. If the camera moves a lot, the edges will chatter. Consider applying
  **Warp Stabilizer** (`Effect > Distort > Warp Stabilizer`) to a duplicate *before* roto, or just accept
  some chatter — the trail/glow effects hide it.
- **Object Matte / AI Select** (newest AE): if present, try it — click the subject, let AI select, propagate,
  freeze. Often faster than brushing.
- Don't rabbit-hole. "Good enough that the rim light sells the edge" is the bar, not "perfect."

---

## 6. Refining the matte edge

Once frozen, tighten edges so Jacob doesn't have a haloed or chewed outline.

1. With the Roto Brush effect selected, open **Refine Edge**: use the **Refine Edge tool** (hidden under
   the Roto Brush in the toolbar) and paint along tricky borders — hair, fingers, the fuzzy edge of a
   moving limb. This tells AE "this border is soft, compute it carefully."
2. In **Effect Controls** under Roto Brush & Refine Edge, the sliders that matter:
   - **Feather** — softens the whole edge. A tiny amount (1–2) helps it sit on the background. Too much = mushy.
   - **Contrast** — hardens the edge decision. Raise if edges look muddy.
   - **Shift Edge** — chokes (negative) or spreads (positive) the matte. A slight **negative** shift
     (−1 to −3) eats the last pixels of background fringe. Very useful.
   - **Reduce Chatter** — averages the matte across frames to calm frame-to-frame wobble. Raise if edges shimmer.
3. Add **Refine Matte** effect (`Effect > Matte > Refine Hard Matte`) on top if you want another pass of
   the same controls independent of the roto.

> Goal: no bright halo of old background around him, no obviously "cut-out" hard edge. A hair of feather +
> a slight negative Shift Edge is usually the whole fix.

---

## 7. Grading the subjects (Lumetri Color)

Now make Jacob look like he belongs on the site's near-black. This is the ACR/Lightroom-style step, and
it's the move that makes him feel *on the page, not over it*.

1. **Add an adjustment layer** *above* your footage, clipped to affect only it: `Layer > New > Adjustment
   Layer`. (If you have separate subject layers, either grade each or put the adjustment layer directly
   above them all — it affects everything below, exactly like Photoshop.)
2. Select it and apply **`Effect > Color Correction > Lumetri Color`**. The Lumetri panel is your ACR:
   - **Basic Correction:** pull **Shadows** and **Blacks** *down* hard — you want his dark tones to sink
     toward `#070B09` so they melt into the page. Nudge **Temperature** slightly cool (toward blue) and
     **Tint** slightly green to sit in the turf palette. Keep **Highlights**/**Whites** clean (his kit
     stays crisp white).
   - **Curves:** optionally crush the bottom of the RGB curve (drag the lower-left point up-and-right) for
     that "shadows dissolve into black" look.
   - **HSL Secondary or Saturation:** **desaturate everything** a touch — you want the *ball and the volt
     effects* to be the only saturated things in frame, so color acts as a spotlight. Drop global
     Saturation to ~70–80%.
3. **Keyframe the grade for the strike (optional, high-impact):** at the strike moment, briefly lift
   Exposure/Whites so there's a flash of brightness on him as the ball is struck. (Keyframes: §see below.)

### Keyframes in 30 seconds (you'll use them constantly from here)
- Reveal a property: select the layer, press **P** (Position), **S** (Scale), **R** (Rotation),
  **T** (Opacity), or **U** to show anything already keyframed.
- Click the **stopwatch ⏱** next to a property → this creates your first keyframe at the current time and
  turns on animation for that property.
- Move the playhead to a new time, change the value → AE auto-adds a keyframe. Done — it animates between them.
- For effect sliders (like a glow's intensity), the stopwatch is next to the slider in **Effect Controls**.
- Smooth the motion: select keyframes, press **F9** for *Easy Ease* (removes the robotic linear feel).

---

## 8. The volt effects (where "sick" is won)

All effects use the design system's accent, **volt-mint `#5CFFC0`**, so the video's accent and the site's
accent are literally one color. Build these on **new layers above** the graded footage. Keep it restrained —
one of each, not a light show. (Design doc §6b.)

### 8.1 Ball motion trail — the highest-impact effect
Three ways, easiest first:

- **Easiest (Echo):** duplicate the ball (or the whole subject) layer, apply `Effect > Time > Echo` to the
  copy. Set **Echo Time** small negative (−0.02), **Number of Echoes** 4–8, **Decay** ~0.6, **Echo
  Operator** *Add*. Then tint the echoes volt: add `Effect > Color Correction > Tritone` or a `Tint` and
  push it to `#5CFFC0`, or a `Fill` effect set to volt on that echo layer, and lower its opacity. This
  smears a glowing trail behind the moving ball.
- **Cleaner (hand-animated shape trail):** with the Pen tool, draw a path along the ball's route across the
  turn. Apply a **Stroke** effect (or use a shape layer stroke), color it `#5CFFC0`, and use **Trim
  Paths** (add to a shape layer: *Add > Trim Paths*) keyframed 0→100% so the line *draws on* following the
  ball, then trails off. Add a **Glow** effect on top. This is the "designed streak" look.
- **Best (Trapcode Particular)** if you own it: emit volt particles from the ball's position (parented to a
  tracked null). Overkill unless you're comfortable; the two above look great.

Add `Effect > Stylize > Glow` to whichever trail you build. Set glow color to volt, threshold/radius to
taste. The glow is what makes it read as *light*, not paint.

### 8.2 Floor contact glow (anchors the turn)
Jacob's planted foot on the cut needs a floor that doesn't exist. Make a **new solid** (`Layer > New >
Solid`, any color), draw an **ellipse mask** on it under his foot, fill/tint it `#5CFFC0`, feather the mask
heavily (Mask Feather ~40–80), drop opacity to ~30–50%, blending mode **Add** or **Screen**. **Keyframe its
Position** to stay under his foot through the turn, and its Opacity to bloom up on the plant and fade after.

### 8.3 Rim light on Jacob (separates him from the black, hides rough edges)
Duplicate the graded Jacob layer. On the copy: apply a **Fill** effect set to `#5CFFC0` (now it's a volt
silhouette), then **Channel > Set Matte** or a heavy **Simple Choker** + **Fast Box Blur** so only a thin
bright edge shows, blending mode **Add**, low opacity. The result is a faint volt outline hugging his
contour. This does double duty: it's stylish *and* it visually papers over any imperfect roto edge.

### 8.4 The strike (the release beat)
At the strike frame (~85% through the clip, matching the site's `strikeAt: 0.85`):
- **Flash:** a full-frame white or volt **solid**, blending mode Add, Opacity keyframed to spike for 2–3
  frames then fall. This is the "hit."
- **Trail burst:** ramp the ball trail's glow/particle count up for that instant.
- **Optional ball bloom:** on the 1–2 struck-ball frames, add a small bright `Glow`/white blob so the ball
  reads as exploding off his foot. This is also where you paint the ball back if roto lost it.

> Restraint rule: volt should occupy ~5% of the frame at rest. One trail, one floor glow, one rim light,
> one strike flash. If it looks like a fireworks ad, delete an effect. "Remove one accessory before you leave."

---

## 9. Framing for two aspects (landscape + portrait)

The site loads a **landscape** set on laptops and a **portrait** set on phones (design doc §6, §9). You'll
produce both from this one project by rendering through two differently-sized comps. Because the background
is transparent, you're only re-*placing* the subjects, not rebuilding a scene.

1. **Pre-compose your finished work:** select all your layers (roto footage + grade + effects),
   right-click → **Pre-compose** → *Move all attributes*. Name it `JACOB_COMPOSITE`. Now all your work is a
   single nested layer you can position as one unit. (Pre-comp = Photoshop's "convert layers to a Smart
   Object / group.")
2. **Landscape comp:** `Composition > New Composition`, 1920×1080, 24 fps, same duration. Drag
   `JACOB_COMPOSITE` in. Scale/position it so Jacob sits center-left with room on the right for the strike
   to travel into (that negative space is where the site's stats resolve). Because the comp background is
   empty, everything around him is transparent — perfect.
3. **Portrait comp:** `Composition > New Composition`, 1080×1920 (or 1080×1350 for 4:5), 24 fps. Drag the
   *same* `JACOB_COMPOSITE` in. Re-position so the move reads top-to-bottom and he's vertically centered.
4. You now have two comps pointing at one source of truth. Fix an effect once in `JACOB_COMPOSITE` and both
   aspects update.

> Keep the subjects a little inside the frame edges in both — the site may crop a few percent responsively.

---

## 10. Exporting the alpha sequences (the settings that actually matter)

You need **transparent** output. This is where beginners lose an afternoon to a black background, so follow
exactly. We export a **PNG sequence** (cleanest alpha for our web pipeline), once per aspect.

### For each comp (landscape, then portrait):
1. Select the comp in the Project panel. `Composition > Add to Render Queue`. The **Render Queue** panel
   opens at the bottom.
2. Click the blue text next to **Output Module** (it says something like "Lossless").
3. In the dialog:
   - **Format: PNG Sequence.**
   - **Channels: RGB + Alpha.** ← *This is the whole ballgame.* If you leave it on RGB, you get a black
     background. RGB + Alpha is what gives transparency.
   - **Color: Straight (Unmatted)** if offered. (Straight alpha keeps edge colors clean for compositing;
     "Premultiplied" bakes a background color into the edges. Our web transcode assumes straight. If you
     only see one option, that's fine.)
   - Depth: Millions of Colors+ (the "+" is the alpha).
4. Click the blue text next to **Output To** → choose/create a folder, e.g. `ae_out_landscape/`, and set a
   filename like `frame_[####].png` so you get `frame_0001.png, frame_0002.png, …`.
5. Click **Render** (top-right of the queue). AE writes one PNG per frame.
6. Repeat for the portrait comp into `ae_out_portrait/`.

### Why PNG sequence, not a ProRes .mov
The website scrubs an **image sequence on a canvas**, so it wants frames, not a movie file. PNG sequence is
lossless with clean straight alpha and needs no unwrapping. (ProRes 4444 with the **"High Quality with
Alpha"** preset is the correct choice if you ever need a single transparent *movie* file — note: use "High
Quality with Alpha," **not** the old "Lossless with Alpha," which used the Animation codec and now produces
QuickTime files that won't play. But for this site, export PNG frames.)

### Additional exports for the staging model (design doc §5c)
- **Ball path data:** apply AE's point tracker to the ball across acts 2–4; copy the tracked Position
  keyframes out (or via a script) as per-frame x,y — normalized to the comp size — into a small JSON. The
  site draws the volt trail from this. One tracker pass, huge payoff.
- **The net as its own element:** roto/extract the net once (it barely moves) as a single transparent
  still or short sequence — the site stretches it as the act-4 foreground scrim.
- **Subject grouping stays as planned:** acts 1–3 roto Jacob + defender + ball together as one foreground
  (occlusion makes separation misery). The defender's act-2 "dissolve into the void" is done by the site
  masking/fading the region, OR — cleaner if you're willing — export act 2 as TWO sequences (Jacob-only and
  defender-only) since the spin is the one act where they separate meaningfully. Your call based on how the
  roto is going; the single-group export is the safe default.
- **Direction:** if any act's action doesn't travel left→right, flip it horizontally at export (design doc
  §5c) — unless kit text is legible at final size.

### Then hand off to the web pipeline
The design doc's transcode turns your PNGs into web-sized alpha WebP:
```bash
# from AE's PNG output → compressed alpha WebP the site loads
# landscape: cap at 1280 wide. For the portrait set use  -resize 720 0  (720 wide) instead.
for f in ae_out_landscape/*.png; do
  cwebp -q 82 -alpha_q 90 -resize 1280 0 "$f" -o "frames_landscape/$(basename "${f%.png}").webp"
done
```
**Always downscale in this step** — the AE comps are 1920×1080 / 1080×1920 for compositing quality, but the
web must never receive frames that large (browser memory, not just bandwidth — design doc §7 has the math).
Target **~80–100 scrubbed frames per set total, allocated per act** (design doc §5b): sparse on the approach
(~15), dense on the slow-mo spin (~40–50), short on the strike (~10), ~15–20 on ball-at-camera. Thin by
deleting PNGs before transcoding; name frames with act prefixes (`a1_001…`, `a2_001…`) so the site can load
acts progressively.

**The celebration (act 5) is a video, not frames:** trim the mobbing/hug to 2–3s, grade it like everything
else, export H.264 (or WebM), heavily compressed (~0.5–1 MB), muted, no roto. It autoplays as a low-opacity
loop behind the title card.

### The poster frame
Also export the strike frame flattened *with* a dark background (temporarily drop a `#070B09` solid at the
bottom of the comp), as **two** JPGs: `poster.jpg` (the full frame — the site's reduced-motion fallback and
preload placeholder) and `og-image.jpg` (a **1200×630** landscape crop of the same moment — the link-preview
image when a coach texts the site to another coach; that aspect is the standard, and anything else gets
cropped badly by iMessage/Slack).

---

## 11. Sanity-check the alpha (60 seconds, saves embarrassment)

Before you hand off frames, confirm they're actually transparent:
- **In AE:** click the **transparency-grid button** (⊞ checkerboard icon) at the bottom of the Comp panel.
  If you see a checkerboard behind Jacob, the comp is transparent. If you see black, a layer is filling the
  background — find and delete/hide it.
- **After export:** drag a PNG onto a *dark* and a *light* background (e.g. open in Preview/Photoshop over a
  colored layer). Edges should be clean, no black halo, no leftover rectangle. If edges have a dark fringe,
  re-export with **Straight** alpha and/or a slight negative **Shift Edge** in the roto refine (§6).

---

## 12. Common beginner traps (the ones you'll actually hit)

- **"Roto Brush won't draw."** You're in the Comp panel. Double-click the layer to open the **Layer panel**.
- **"My export has a black background."** Channels was RGB, not **RGB + Alpha**. Re-do the Output Module.
- **"The .mov won't play / is black."** You used the old "Lossless with Alpha" (Animation). Irrelevant for
  us — export **PNG Sequence**. (If you must have a movie, use "High Quality with Alpha.")
- **"Edges shimmer/chatter frame to frame."** Raise **Reduce Chatter**, add a hair of **Feather**, slight
  negative **Shift Edge**. Accept some — the rim light and dark bg hide it.
- **"AE is crawling."** HEVC source is heavy; transcode to ProRes first (§1). **Freeze** the roto matte.
  Lower Comp panel resolution to Half/Quarter while working (dropdown at the bottom of the Comp panel — only
  affects preview, not the render).
- **"It crashed and I lost work."** Turn on `Preferences > Auto-Save`, and `Cmd/Ctrl+S` after every good
  pass. Especially before Freeze and before Render.
- **"The volt color looks different in the browser."** Make sure your Comp/Lumetri isn't in a wide color
  space that shifts on export; keep it sRGB-ish. Match the effect color to the exact hex `#5CFFC0`.
- **Colors shift after render generally:** `Composition Settings > Advanced > Color` / working space
  mismatch. Keep it simple (sRGB) so what you see is what the site gets.

---

## 13. If AE proves too much: an honest escape hatch

Rotoscoping is legitimately the hardest part of this whole project. If it's eating days:
- **Skip isolation entirely** and grade + add effects to the full framed clip (opaque scrub). ⚠️ This
  hatch is now much weaker than when written: the footage is bright daylight, and framed sunny footage
  drops awkwardly into a near-black site. If roto truly fails, expect the opaque version to need a heavy,
  moody grade (deep duotone toward the palette) to sit on the page at all — the transparency is
  load-bearing for the aesthetic, not just a flourish.
- Or roto **only the hero seconds** (just the turn + strike) and let the approach be the full frame,
  cutting between them.
- The transparent composite is the ceiling; a graded opaque scrub is the floor. Both make a coach stop.

---

## 14. Checklist before you hand me the frames

- [ ] Clip trimmed to the ~4–6s move.
- [ ] Subjects rotoscoped, matte **frozen**, edges refined (slight feather + negative shift edge).
- [ ] Graded: blacks crushed toward `#070B09`, cool/green tint, global desaturation ~70–80%.
- [ ] Volt effects built: ball trail + floor glow + rim light + strike flash, all `#5CFFC0`, restrained.
- [ ] Work pre-composed into `JACOB_COMPOSITE`.
- [ ] Two comps: landscape (1920×1080) + portrait (1080×1920 or 1080×1350), subjects re-placed in each.
- [ ] Exported **PNG Sequence, RGB + Alpha, Straight**, one folder per aspect.
- [ ] Transcoded to alpha WebP, each set **under ~5 MB**, ~90–120 frames.
- [ ] One poster JPG of the strike on a dark bg.
- [ ] Alpha sanity-checked on light and dark backgrounds.

Hand me `frames_landscape/`, `frames_portrait/`, and `poster.jpg`, plus Jacob's real vitals, and I'll build
the `CodedBackground` + `ScrubStage` against them.

---

*Companion to DESIGN-SYSTEM-v0.2.md. The look is defined there; this is the how. Save often. You've got this.*
