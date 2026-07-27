# ACT5-MATCH-CUT.md — implementation spec for the harness

> **Scope:** replaces the current act-5 / title-card behavior in the scrub stage.
> Defines the volt-circle match cut from the ball's last tracked position into the title card.
> Companion to `DESIGN-SYSTEM-v0.2.md` §5b, §5c, §7. Written to be implemented as-is; every
> number below is measured, not preference.

---

## 0. The defect this replaces

The current build renders the name as a tint on the volt field: glyphs at `#71D2AA` on a field of
`#47C390`. Measured contrast **1.20:1** — the name is effectively invisible for the whole mint phase.

Do not fix this by crossfading the name from dark to light while the field fades from mint to void.
Both values travel through mid-luminance simultaneously and cross; a linear crossfade bottoms out at
**1.45:1**, which is worse than the current defect. The name's fill must **step**, not interpolate.
See §4.

---

## 1. Inherited constraints (non-negotiable)

- **Bidirectional law (§5c).** Everything below is a pure function of scroll progress. No fire-once
  animation, no stateful triggers, no "has played" flags. Scrolling up must retrace exactly.
- **No CSS transitions or keyframe animations** on any property in this spec — `transition` and
  `@keyframes` are time-based and will desync from a scrubbed timeline and break reverse scrub.
  Assign computed values directly inside the existing rAF draw loop.
- **No GSAP timelines** for these properties. Read `ScrollTrigger`'s scrub progress and compute.
- **Tokens only.** `--volt` `#5CFFC0`, `--bg-void` `#070B09`, `--text-hi` `#F3F7F5`. No literals.
- `prefers-reduced-motion: reduce` → none of this runs; the poster is shown (§7 non-negotiables).

---

## 2. Local progress

```ts
const q = clamp((p - A5_START) / (A5_END - A5_START), 0, 1);
```

`p` is the existing global scrub progress. Export all phase boundaries as one tunable object so the
timings can be adjusted by feel without touching logic:

```ts
export const A5 = {
  expandEnd:   0.14,
  holdEnd:     0.34,
  dissolveEnd: 0.58,
  settleEnd:   0.78,
  // release runs settleEnd → 1.0
} as const;
```

---

## 3. Circle origin — read it, never hardcode

The circle expands **from the ball's last on-screen position**, which is the final entry of
`ball-path.json` for the **currently active aspect set** (portrait and landscape have different
framings and therefore different end positions).

- Read the last coordinate pair from the active set's track data.
- Convert normalized `[0,1]` coords to canvas pixels using **the same place-math the frame draw
  uses**, so the circle and the final act-4 frame agree to the pixel.
- If the track data is absent (placeholder builds), fall back to viewport center and emit one
  `console.warn` — do not fail silently, and do not ship the fallback.

`R_full` = the distance from the origin to the farthest of the four viewport corners.

---

## 4. Phase behavior

### 4.1 EXPAND — `q 0 → A5.expandEnd`

Let `t = q / A5.expandEnd`.

- **Radius:** `r = R_full * (1 - Math.pow(1 - t, 3))` (ease-out cubic — fast departure, soft arrival).
- **Field alpha:** ramps `0 → 1` over `t ∈ [0, 0.7]`, then holds at 1. The field is solid `--volt`
  at that alpha, composited over the void.
- **Last act-4 frame** stays drawn beneath the circle until field alpha reaches 1; after that, skip
  drawing it for the remainder of act 5.

### 4.2 HOLD — `A5.expandEnd → A5.holdEnd`

Full-bleed `--volt` field. The name reads as a knockout (see §5). This is the beat; it is the only
place in the entire page where volt is permitted above 5% coverage.

### 4.3 DISSOLVE — `A5.holdEnd → A5.dissolveEnd`

Field alpha `1 → 0`, linear. The void — and the celebration loop layer beneath it — is revealed.
The name's fill steps during this phase (§5).

### 4.4 SETTLE — `A5.dissolveEnd → A5.settleEnd`

Celebration loop opacity ramps `0 → 0.18`. Name at `--text-hi` on `--bg-void` (17.95:1).

### 4.5 RELEASE — `A5.settleEnd → 1.0`

Section [03] VITALS fades up per existing behavior. Name holds.

---

## 5. The name — knockout, then step

**The name never animates its opacity.** It is rendered at full opacity, above the field layer, for
the whole of act 5. Its fill is a function of the field's current alpha:

```ts
// alpha is the field's current alpha, 0..1
nameFill = alpha > 0.49 ? 'var(--bg-void)' : 'var(--text-hi)';
```

This produces the intended mechanic for free: before the circle arrives, the name is `--bg-void` on
`--bg-void` and is invisible; the expanding mint circle sweeps over it and **develops** it. No reveal
animation is needed or wanted.

**Why 0.49.** That is the field alpha at which a void-filled name and a white-filled name give equal
contrast against the field — 4.30:1 and 4.26:1 respectively. Stepping there guarantees the worst
moment in the entire transition is **≈4.28:1**, above WCAG AA, versus 1.45:1 for a crossfade.

| field alpha | field colour | void name | white name |
|---|---|---|---|
| 1.00 | `#5CFFC0` | **15.57:1** | 1.18:1 |
| 0.74 | `#46C090` | **8.68:1** | 2.11:1 |
| 0.55 | `#36916E` | **5.12:1** | 3.58:1 |
| **0.49** | `#31856A` | **4.30:1** | **4.26:1** ← step here |
| 0.35 | `#256049` | 2.68:1 | **6.82:1** |
| 0.00 | `#070B09` | 1.00:1 | **18.32:1** |

Key the step to **alpha**, not to a `q` value, so it stays correct if the phase boundaries in §2 are
retuned later.

Implementation: the name stays DOM text. Set one CSS custom property on it from the draw loop
(`el.style.setProperty('--name-fill', …)`); do not toggle classes and do not re-render the node.

---

## 6. The ball motif

The circle *is* the ball — do not draw a separate ball during EXPAND or HOLD.

From `A5.holdEnd` onward, a single `--volt` dot persists at the circle origin, scaling down as the
field dissolves and coming to rest at **≤14px diameter** as part of the title lockup. This is the
"JACOB DEJA + ball motif" of §5b and it is the *only* volt element remaining after the dissolve.

---

## 7. Volt budget

- `q ∈ [A5.expandEnd, A5.holdEnd]` is an explicit, documented exception to the 5% rule.
- For `q ≥ A5.dissolveEnd`, total volt coverage of the stage must be **≤5%**. With only the dot
  remaining, expect well under 1%.
- Do not add glow, bloom, particles, or a second accent anywhere in this sequence.

---

## 8. Acceptance criteria

1. **Contrast floor.** Sampling `q` at 0.01 intervals across act 5, the computed contrast between the
   name fill and the composited field beneath it is **≥4.2:1 at every sample**.
2. **Reversibility.** Rendering at 20 ascending `q` values and then the same 20 descending produces
   pixel-identical output at each matching `q`. Any divergence means state leaked in.
3. **No time-based animation.** Grep the act-5 code path: zero `transition`, `@keyframes`,
   `animate()`, `setTimeout`, or GSAP `.to()` on radius, field alpha, name fill, dot scale, or
   celebration opacity.
4. **Origin fidelity.** The circle centre equals the final `ball-path.json` coordinate for the active
   aspect within 1px, verified for both portrait and landscape.
5. **Reduced motion.** With `prefers-reduced-motion: reduce`, no circle, no field, no dot; poster
   only; page fully usable.
6. **Volt coverage.** At `q = 0.8`, volt-coloured pixels are ≤5% of the stage.

---

## 9. Notes for the implementer

- The field is a fill on the existing scrub canvas layer (or a sibling canvas above it), cleared each
  draw with `clearRect` per §7 — never `fillRect` the background, or transparent frames will smear.
- Draw order, bottom to top: coded background → celebration loop → act-4 alpha frame → volt field →
  ball dot → name.
- All six boundaries in `A5` are meant to be tuned by feel on a real phone. The logic must not assume
  any particular ordering beyond `expandEnd < holdEnd < dissolveEnd < settleEnd`.
