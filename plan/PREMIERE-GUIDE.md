# PREMIERE-GUIDE.md — Premiere Pro for exactly four tasks

> You've never opened Premiere. You don't need to learn Premiere — you need to do FOUR tasks in it:
> mark the act boundaries, export a ProRes handoff for AE, export the celebration loop, and (later) cut
> the highlight reel. This guide covers those and nothing else. Companion to YOUR-RUNBOOK.md Phase 1.

---

## 0. Orientation (3 minutes)

Premiere's screen, mapped to what you know:
- **Project panel** (bottom-left) — your imported media library. Like Bridge/the Layers-panel's source.
- **Timeline** (bottom-right) — clips arranged left-to-right in time. This is where you work.
- **Program monitor** (top-right) — plays whatever the timeline playhead is on.
- **Source monitor** (top-left) — previews raw clips before they're in the timeline. You'll barely use it.

Controls you need: **Space** = play/pause. **J / K / L** = back / stop / forward (tap L twice for 2x).
**Left/Right arrows** = one frame at a time (crucial for finding exact cut points). **Cmd/Ctrl+S** = save
constantly, same religion as AE.

If the layout ever looks broken: Window → Workspaces → Reset to Saved Layout. (Same trick as AE.)

---

## TASK 1 — Project setup + mark the six acts (~20 min)

1. Open Premiere → **New Project**. Name it `jacob-hero`, set location to your `premiere/` folder, Create.
   (Ignore every other option in that dialog.)
2. **Import:** Cmd/Ctrl+I → pick the clip (the OPSM master if it's arrived; otherwise the current file).
   It appears in the Project panel.
3. **Make the sequence:** drag the clip from the Project panel onto the **New Item** button (bottom-right
   corner of the Project panel, looks like a page with a folded corner). This creates a timeline that
   exactly matches the clip — resolution, frame rate, everything. Never make a sequence manually.
4. **Mark the acts:** play through (Space), and at each transition press **M** to drop a marker. Use the
   arrow keys to land on the exact frame — the speed changes (full→slow-mo) are your landmarks and they're
   unmistakable when you step frame by frame. **Double-click each marker** on the timeline ruler and name
   it: `A1-APPROACH`, `A2-SPIN`, `A2B-SNAP`, `A3-STRIKE`, `A4-BALL`, `A5-CELEBRATION`.
5. **Write the timecodes down** (they're shown in the marker dialog, or hover). Put them in a note — the
   harness needs them for scroll tuning and they're your AE map.

---

## TASK 2 — Export the ProRes handoff for AE (~10 min)

AE will roto acts 1–4; it wants a clean, scrub-friendly file, not the HEVC original.

1. Move the playhead to the `A1-APPROACH` marker → press **I** (sets the In point).
2. Move to the END of act 4 (just after the ball reaches the goal, before celebration) → press **O**
   (Out point). The timeline shows a highlighted range.
3. **File → Export → Media** (Cmd/Ctrl+M). In the export dialog:
   - **Format: QuickTime**
   - **Preset:** pick an **Apple ProRes 422 HQ** preset (in the Video tab, Video Codec = Apple ProRes
     422 HQ if you need to set it manually)
   - Resolution/frame rate: leave matching source (don't touch)
   - **Audio: uncheck** (Export Audio off — you don't need it)
   - Range: it should say In/Out or Custom — meaning it exports only your selection. Verify the duration
     shown is a few seconds, not the full clip.
   - File name/location: `exports/acts1-4_prores.mov`
4. **Export.** The file will be large (ProRes is chunky) — that's correct and good. This is AE's input.

---

## TASK 3 — Export the celebration loop (~15 min)

This is the act-5 video the site plays behind the title card. It never goes to AE.

1. Clear old In/Out first: right-click the timeline ruler → Clear In and Out.
2. Set **I** and **O** around the best 2–3 seconds of the mobbing — tight on the hug, out before the
   group disperses. Step with arrow keys to choose kind cut points.
3. **Grade it** (this is Photoshop-ACR knowledge, new panel): Window → **Lumetri Color**. Select the clip
   in the timeline first (click it once), then in Lumetri's Basic Correction:
   - **Blacks** and **Shadows**: pull down hard — near-black
   - **Saturation**: down to ~25–35 (it plays dim behind text; it should feel like a memory)
   - **Temperature**: a touch cool
4. **Watermark check:** if the @OPSMSOCCER mark sits badly in frame and you're still on the IG file:
   select the clip → **Effect Controls** panel (top-left area) → Motion → **Scale** to ~108–112 to punch
   in past it. Adjust **Position** if needed to keep the hug centered.
5. Export (Cmd/Ctrl+M):
   - **Format: H.264**
   - Video tab: **width 1280** (it'll keep aspect), Bitrate Settings → **VBR 1 pass, Target 2–3 Mbps**
   - **Audio off**
   - Name: `exports/celebration.mp4`
6. Check the file size — **~0.5–1 MB is the target.** If it's over ~1.5 MB, drop the bitrate to 2 and
   re-export. Hand the file to the harness as `public/celebration.mp4`.

---

## TASK 4 — LATER: cut the full highlight reel (when Jacob's clips arrive)

The 3–5 minute film for section [04]. Same skills, bigger scale:

1. New sequence from the best clip (same drag-to-New-Item trick). Import all raw clips into a bin
   (right-click Project panel → New Bin → `raw`).
2. **Order is the entire craft: best actions FIRST.** Coaches decide in the first 30 seconds. Goals and
   the filthiest moves up top; buildup play and defensive work after; nothing that needs context.
3. To add a clip: double-click it (opens in Source monitor) → set I/O around the action (start ~2s before
   the touch, end ~1–2s after the outcome) → drag from the Source monitor into the timeline after the
   previous clip. Repeat. Straight cuts — **no transitions, no dissolves, no effects.**
4. Optional but good: after any hard-to-read moment, let the source's replay/slow-mo carry it, or
   duplicate the clip and slow it (right-click → Speed/Duration → 50%) ONCE. The site's film section
   promises "every clip full-speed, then the read shown once at half-speed" — this is that.
5. One title at the front, 3 seconds: black screen, white text — name, grad year, position, club, GPA,
   jersey number + kit color. (Graphics workspace → Type tool, or make it in Photoshop and import the PNG.)
6. **No montage music.** Coaches watch muted or hate the song. Natural sound or silence.
7. Light Lumetri pass on the whole thing if clips vary wildly (consistency > style here — this is game
   film, not the hero composite; keep it natural, just tame mismatched clips).
8. Export: H.264, 1080p, YouTube preset is fine → upload (unlisted is fine) → link goes in the content
   sheet and the one-pager.

---

## Traps (the ones you'll actually hit)

- **"Export is rendering the whole clip, not my selection."** The Range dropdown in the export dialog is
  set to Entire Source/Sequence — change it to **In/Out**.
- **"Lumetri does nothing."** No clip selected in the timeline. Click the clip first; Lumetri applies to
  the selected clip.
- **"Playback is choppy."** Bottom-right of the Program monitor, set playback resolution to **1/2**.
  Preview only — exports are always full quality.
- **"I dragged the clip and the sequence looks wrong / letterboxed."** You made a sequence manually with
  wrong settings. Delete it; use the drag-onto-New-Item trick — it can't be wrong.
- **"M isn't dropping markers."** The Timeline panel isn't focused — click once inside it, then M.
- **"My exports look washed out vs Premiere."** Color management mismatch — usually fine at these sizes;
  if it bugs you, Sequence Settings → working color space Rec. 709, and check on the actual site, which
  is the only screen that matters.

---

*Total Premiere time for tasks 1–3: about an hour. Task 4 is a separate afternoon when the clips exist.
Everything deeper than this lives in After Effects — see AFTER-EFFECTS-GUIDE.md.*
