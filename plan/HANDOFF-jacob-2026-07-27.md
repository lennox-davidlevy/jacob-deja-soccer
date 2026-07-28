# HANDOFF — jacob-deja-soccer, session ending 2026-07-27

**Next session focus:** After Effects, Phase 2. Start with the milestone-1 proof (~10 rotoed frames of
the spin, styled, graded, on the void), then the full act-2 roto.

Save location note: this was written to the outputs directory. Move it to your OS temp dir or anywhere
outside the site repo — it does not belong in version control.

---

## Who / what

David is building a recruiting site for his nephew (class of 2027 soccer player). Site repo is Astro,
deployed on Vercel, production domain `jacobdeja.com` (DNS not yet cut over; a Vercel preview URL is
live). The hero feature is a scroll-scrubbed composite of one 15-second goal clip.

**David has never used Premiere or After Effects.** He is also **colourblind**. Both facts should shape
every instruction: one step at a time, and never ask him to judge a colour by eye.

---

## Read these first (do not duplicate — reference them)

| doc | path |
|---|---|
| Overall production order, phases, milestones | `plan/YOUR-RUNBOOK.md` |
| AE walkthrough — roto, grade, volt, export | `plan/AFTER-EFFECTS-GUIDE.md` |
| Premiere walkthrough | `plan/PREMIERE-GUIDE.md` |
| Visual system, palette, scroll shares, §5c act spec | `plan/DESIGN-SYSTEM-v0.2.md` |
| Player data, stills plan | `plan/JACOB-DATA.md` |
| Architecture / deploy | `plan/ARCHITECTURE-DEPLOYMENT-v0.1.md` |
| **Act-5 match cut spec (written this session)** | `ACT5-MATCH-CUT.md` — deliver to the harness |
| **Wacom config, all 4 apps (written this session)** | `WACOM-SETUP.md` |

---

## State: DONE

**Premiere — all three tasks complete.** Project `Jacob Sick Move.prproj` in
`~/Documents/VideoEditing/jacob-video/premiere/`.

Seven markers set. These exist only in the .prproj and here — **do not lose them**:

```
A1-APPROACH     00:00:00:00
A2-SPIN         00:00:00:17
A2B-SNAP        00:00:02:13
A3-STRIKE       00:00:03:17
A4-BALL         00:00:04:12
A4-END          00:00:05:13
A5-CELEBRATION  00:00:09:09
```

Exports in `~/Documents/VideoEditing/jacob-video/exports/`:
- `acts1-4_prores.mov` — 66.4 MB, QuickTime ProRes 422 HQ, 720×1280, 25 fps, no audio, In/Out = A1→A4-END. **This is AE's input.**
- `celebration.mp4` — 747 KB, H.264, 720 wide, VBR 2.5/3 Mbps, no audio, range 8:24–11:04. Already copied to `public/celebration.mp4`, replacing the placeholder. Lumetri applied: Temp −15.5, Sat 29.5, Shadows −32.1, Blacks −45.1.

**Wacom** — Intuos Pro PTH-651 fully configured for all four apps, settings backed up via Wacom Center.
See `WACOM-SETUP.md`. AE-specific highlights worth reminding him of in the moment: Touch Ring top-left =
Page Up/Page Down (frame propagation), left-column keys = Cmd+Z / Cmd+S / Opt+W / Opt+4, right-column
Opt held = subtract stroke, and the **pen's eraser end is mapped to Option**, so flipping the pen is a
subtract stroke.

---

## State: NOT DONE

- All of Phase 2 (AE). Nothing rotoed yet.
- Phase 3 (Photoshop stills). The About-section portrait is currently the raw OPSM step-and-repeat photo — red sponsor logos, completely off-palette. It is the most off-brand element on the live site. Needs Select Subject → cut out → void background → volt rim.
- Jersey number still `[TBD]` in three places on the site.
- Film link, schedule rows, About copy all `[TBD]`.

---

## Decisions made this session that override the plan docs

### 1. No clean master. Locked to the 720p source.
Jared never responded. The source is an Instagram re-encode: **720×1280, 25.584 fps (3198/125),
15.361 s, H.264 + AAC, ~9.3 MB, @OPSMSOCCER watermark burned in.**

Consequences:
- The `AFTER-EFFECTS-GUIDE` assumption of a higher-res master is void.
- The design system's landscape frame set caps at 1280 wide; the subject will need upscaling. Expect softness in the landscape set and consider prioritising portrait.
- **Interpret Footage** in AE to a fixed frame rate before doing anything — 3198/125 is a VFR artifact, and if AE and Premiere disagree on frame numbering, the ball-track JSON indices will drift against the exported frames.
- The watermark disappears for free in acts 1–3 (roto discards the background it sits in). It survives only in the celebration loop, where it is acceptable — that clip plays at ~18% opacity behind the title card. Do not attempt to remove it; it moves between shots and the punch-in trick won't track it.

### 2. Defenders get stylised — "Sin City" flat treatment. **This changes how roto must start.**
Rationale: 720p compression damage lives in texture and gradients; flat fills delete exactly that. It
also collapses the roto quality bar on the defenders, which is where most wasted effort would go. It is
consistent with DESIGN-SYSTEM §5c ("the defender drifts out of the floodlight and dissolves into the
void") and with the harness's own placeholder rendering.

**Critical consequence:** `AFTER-EFFECTS-GUIDE.md` §4 recommends rotoing Jacob + ball + defender as a
single foreground matte. **That advice no longer applies.** Subjects must be rotoed on **separate
layers**. Discovering this after rotoing acts 1–3 means doing it twice. The final export still flattens
to one alpha sequence, so no harness change is needed.

Defender fill — value band chosen numerically (contrast vs `--bg-void` / vs Jacob's near-white kit):

| fill | vs void | vs Jacob |
|---|---|---|
| `#28382F` | 1.60:1 | 11.5:1 |
| **`#2E3F38` ← recommended** | **1.78:1** | **10.3:1** |
| `#0F3D2E` (turf-700, strict palette) | 1.63:1 | 11.3:1 |
| `#425449` | 2.45:1 | 7.5:1 |

Below ~1.6:1 the figure disappears against the void; above ~2.5:1 it competes with Jacob.

AE recipe: roto → `Effect > Generate > Fill` at the chosen hex → `Simple Choker` −1 to −2 →
`Fast Box Blur` 1px. For more form, substitute `Black & White` → `Levels` crushed toward two-tone →
`Tint` mapping black `#0A2019` / white `#38493F`. `Directional Blur` on the beat-him frames.
**Never put volt on a defender.**

Guardrail: keep the unmodified clip at game speed in the film section [04] so a coach can verify the
opposition. That is what makes the stylisation safe.

### 3. Act 4 was 4.88 s of which ~3.8 s was dead air.
Hence the `A4-END` marker. Real durations after the fix:

| act | length | notes |
|---|---|---|
| A1 approach | 0.66 s | |
| A2 spin | 1.84 s | centrepiece, ~30% scroll share |
| A2b snap | 1.16 s | only ~5% share — thin aggressively |
| A3 strike | 0.81 s | **≈20 frames total — do NOT thin act 3** |
| A4 ball | 1.04 s | |
| A5 celebration | 6.01 s | never scrubbed |

Acts 1–4 = 5.51 s ≈ 130 usable frames against a budget of 80–100.

### 4. Act-5 match cut respecified.
Live build renders the name at 1.20:1 on the volt field — effectively invisible. Do **not** fix by
crossfading the name colour (bottoms out at 1.45:1, worse). The name must **step** from `--bg-void` to
`--text-hi` at a field alpha of **0.49**, which is where both give equal contrast (~4.28:1) and is
therefore the guaranteed floor. Full spec, phases, and acceptance criteria in `ACT5-MATCH-CUT.md`.

---

## Working method — this is the important part

**David cannot judge colour. Every colour decision must be converted to a number.**

- Type hex values into pickers. Never use the eyedropper, never nudge a colour wheel.
- Use AE's **Info panel** (Window → Info) to verify by hovering — it reads out R/G/B.
- Judge roto in the **alpha channel** (`Opt+4` in the Comp panel). Matte errors are luminance problems there, not colour problems, and he reads those fine.
- Use **Lumetri Scopes** in Premiere (RGB Parade) rather than the image.
- Palette as decimal triplets, so he can verify by hovering:

| token | hex | R, G, B |
|---|---|---|
| bg-void | `#070B09` | 7, 11, 9 |
| bg-panel | `#0C1512` | 12, 21, 18 |
| bg-elevated | `#12201B` | 18, 32, 27 |
| hairline | `#1E2F28` | 30, 47, 40 |
| turf-900 | `#0A2019` | 10, 32, 25 |
| turf-700 | `#0F3D2E` | 15, 61, 46 |
| turf-500 | `#1D9E75` | 29, 158, 117 |
| turf-300 | `#4FD9A6` | 79, 217, 166 |
| **volt** | **`#5CFFC0`** | **92, 255, 192** |
| volt-dim | `#2FBF8F` | 47, 191, 143 |
| text-hi | `#F3F7F5` | 243, 247, 245 |
| text-mid | `#A9BBB4` | 169, 187, 180 |
| text-lo | `#6A7E77` | 106, 126, 119 |

**Offer to measure his renders.** He uploads a PNG; run PIL/numpy and report volt coverage percentage,
black point, whether alpha is genuinely transparent vs near-black-opaque, and defender-vs-Jacob value
separation. This converts his blind spots into numbers and is the single most valuable thing you can do
for him. Do this on the milestone-1 proof before he invests hours.

**Interaction style.** He asked explicitly for one step at a time and got frustrated when given multi-step
blocks. Give one action, wait for confirmation, give the next. He is highly motivated and will not quit —
the constraint is comprehension load, not willingness.

---

## Open findings on the live site (not yet fixed)

- Built with **Astro 5.18**, not React/Next as DESIGN-SYSTEM §4 specifies. Fine, arguably better — but the `next/font` self-hosting instruction doesn't apply; confirm fonts aren't fetched from Google at runtime.
- `og:image` points at `https://jacobdeja.com/og-image.jpg` while served from the preview domain — the Phase 5 iMessage OG check will fail until DNS cuts over.
- Visible horizontal seam in the hero: the 3–5% grain overlay (§7) is applied to lower sections but not the hero. Measured — above the seam the background is a uniform `#0B0E0D`, below it dithers.
- Measured page black is `#0B0E0D` vs the `#070B09` token. Consistent with grain on top or a screenshot colour profile; settle it from `src/styles/tokens.css`, which has not yet been audited.
- Contrast audit done: `text-mid` on bg-void = 9.85:1 (passes, resolves the §3 open question). **`text-lo` on `bg-panel` = 4.30:1 — fails AA for normal text.** Restrict text-lo to large/uppercase labels.
- Volt coverage measured: spin frame 0.2%, ball frame 0.6%, match cut 88%. The acts are *under*-using the accent; the 5% figure is a ceiling, not a target.

---

## Environment note

Images generated inside the sandbox (extracted video frames, cropped panels) **do not render back to the
model** — only images the user uploads through chat are visible. Numeric analysis of files on disk works
fine. So: measure programmatically, and ask the user to upload screenshots when visual judgement is
actually required.

---

## Suggested skills

- **`file-reading`** — for reading `plan/*.md` and any uploaded assets not already in context.
- **`frontend-design`** — only if touching the site's UI; the visual language is already fixed by DESIGN-SYSTEM v0.2, so treat that doc as authoritative over any generic guidance.
- No document-generation skill is needed; deliverables here are markdown specs and measurement output.
- Reusable capability, not a formal skill: a PIL/numpy measurement pass over uploaded frames (volt coverage, black point, alpha integrity, WCAG contrast). Rebuild it in the first session and keep it handy.

---

## Immediate next actions

1. Open AE, `File > New Project`, save as `ae/jacob-hero.aep` **before** importing anything.
2. Import `exports/acts1-4_prores.mov`. **Interpret Footage → fixed frame rate.**
3. New comp from footage. Trim to the A2 spin range using the timecodes above.
4. Roto ~10 frames only. Jacob on his own layer; defender on a separate layer.
5. Apply the grade + volt rim to Jacob, flat `#2E3F38` fill to the defender, drop on a `#070B09` solid.
6. Export those 10 frames as PNGs and have them measured before going further.
