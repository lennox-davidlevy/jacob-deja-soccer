# WACOM-SETUP.md — Intuos Pro PTH-651, full configuration

Device: **Intuos Pro M (PTH-651)** · macOS · driver **6.4.9-2** (last version supporting this device — do not update)

The "default label" column is what each dropdown reads on a fresh install, so this doc can rebuild the
whole setup from scratch if the backup is ever lost.

---

## 0. Before any mapping

| item | setting |
|---|---|
| Driver version | 6.4.9-2 — auto-update **off** |
| System Settings → Privacy & Security → **Accessibility** | Wacom listed and enabled |
| System Settings → Privacy & Security → **Input Monitoring** | Wacom listed and enabled |
| Orientation | ExpressKeys Left (set this **first** — changing it renumbers the keys) |
| Backup | Wacom Center → Backup Settings → save outside the repo |

---

## 1. ALL OTHER — the global default

Applies everywhere not listed below. Set with **Grip Pen** selected in the Tool row.

### Mapping

| control | set to |
|---|---|
| Orientation | ExpressKeys Left |
| Mode | Pen |
| Screen Area | your monitor |
| Force proportions | checked |
| Tablet Area | Full |

### Pen

| control | set to |
|---|---|
| Upper side switch | Pan/Scroll |
| Lower side switch | Right click |
| Tip Feel | one notch toward Firm |
| Tip Double Click Distance | **Off** |

### Eraser

| control | set to |
|---|---|
| Eraser tip | Erase |

---

## 2. ADOBE PREMIERE PRO

### ExpressKeys — Tool row: **Functions**

| position | default label | set to | what it does |
|---|---|---|---|
| Left 1 (top) | Touch on/off | Keystroke → **M** | drop a marker at the playhead |
| Left 2 | Settings | Keystroke → **I** | Mark In |
| Left 3 | Precision mode | Keystroke → **O** | Mark Out |
| Left 4 | Display toggle | Keystroke → **Cmd+S** | save |
| Right 1 (top) | Modifier — Shift | leave | |
| Right 2 | Modifier — Cmd | leave | |
| Right 3 | Modifier — Opt | leave | |
| Right 4 (bottom) | Pan/Scroll | Keystroke → **Spacebar** | play / stop |

### Touch ring

| position | default label | set to | ccw · cw | slider |
|---|---|---|---|---|
| Top-left | Auto Scroll/Zoom | Keystroke → name `Frame Step` | `Left Arrow` · `Right Arrow` | slow |
| Top-right | Keystroke (Cycle Layers) | Keystroke → name `Timeline Zoom` | `-` · `=` | mid |
| Bottom-left | Rotate | **Auto Scroll/Zoom** | — | mid |
| Bottom-right | Keystroke (Brush Size) | **Skip** | — | — |

### Grip Pen
Inherits **All Other**. Nothing app-specific.

> ⚠️ M, I and O only fire when the **Timeline panel has focus**. Click inside the timeline first.

---

## 3. ADOBE AFTER EFFECTS

### ExpressKeys — Tool row: **Functions**

| position | default label | set to | what it does |
|---|---|---|---|
| Left 1 (top) | Touch on/off | Keystroke → **Cmd+Z** | undo |
| Left 2 | Settings | Keystroke → **Cmd+S** | save |
| Left 3 | Precision mode | Keystroke → **Opt+W** | cycle Roto Brush ⇄ Refine Edge |
| Left 4 | Display toggle | Keystroke → **Opt+4** | show alpha channel (matte as white-on-black) |
| Right 1 (top) | Modifier — Shift | leave | |
| Right 2 | Modifier — Cmd | leave | |
| Right 3 | Modifier — Opt | **leave — most important key** | hold while painting = **subtract** from matte |
| Right 4 (bottom) | Pan/Scroll | leave | |

### Touch ring

| position | default label | set to | ccw · cw | slider |
|---|---|---|---|---|
| Top-left | Auto Scroll/Zoom | Keystroke → name `Frame Step` | `Page Up` · `Page Down` | ⅓ from left |
| Top-right | Keystroke (Cycle Layers) | Keystroke → name `Brush Size` | `[` · `]` | mid |
| Bottom-left | Rotate | Keystroke → name `Zoom` | `,` · `.` | mid |
| Bottom-right | Keystroke (Brush Size) | **Skip** | — | — |

### Grip Pen

| tab | control | set to |
|---|---|---|
| Pen | Upper side switch | Pan/Scroll |
| Pen | Lower side switch | Right click |
| Pen | Tip Feel | one notch toward Firm |
| Pen | Tip Double Click Distance | Off |
| **Eraser** | Eraser tip | **Modifier → Option** |
| Mapping | Screen Area | your monitor |
| Mapping | Force proportions | checked |

> Flipping the pen over now holds Option, which turns the eraser end into a **subtract stroke**.
> Pen down = add to matte. Pen flipped = take away.

---

## 4. ADOBE PHOTOSHOP

### ExpressKeys — Tool row: **Functions**

| position | default label | set to | what it does |
|---|---|---|---|
| Left 1 (top) | Touch on/off | Keystroke → **X** | swap foreground / background colour |
| Left 2 | Settings | Keystroke → **Cmd+Z** | undo |
| Left 3 | Precision mode | Keystroke → **Cmd+S** | save |
| Left 4 | Display toggle | Keystroke → **Opt+Cmd+G** | clip layer to the one below |
| Right 1 (top) | Modifier — Shift | leave | constrain, straight lines |
| Right 2 | Modifier — Cmd | leave | |
| Right 3 | Modifier — Opt | leave | sample colour, set clone source |
| Right 4 (bottom) | Pan/Scroll | leave | |

### Touch ring

| position | default label | set to | ccw · cw |
|---|---|---|---|
| Top-left | Auto Scroll/Zoom | Keystroke → name `Brush Size` | `[` · `]` |
| Top-right | Keystroke (Cycle Layers) | Keystroke → name `Layer` | `Opt+[` · `Opt+]` |
| Bottom-left | Rotate | Keystroke → name `Zoom` | `Cmd+-` · `Cmd+=` |
| Bottom-right | Keystroke (Brush Size) | **Skip** | — |

### Grip Pen

| tab | control | set to |
|---|---|---|
| Pen | Upper side switch | Pan/Scroll |
| Pen | Lower side switch | Right click |
| Pen | Tip Feel | one notch toward **Soft** |
| Pen | Tip Double Click Distance | Off |
| Eraser | Eraser tip | **Erase** (Photoshop has a real eraser) |
| Mapping | Screen Area | your monitor |
| Mapping | Force proportions | checked |

---

## 5. ADOBE ILLUSTRATOR

### ExpressKeys — Tool row: **Functions**

| position | default label | set to | what it does |
|---|---|---|---|
| Left 1 (top) | Touch on/off | Keystroke → **V** | Selection tool |
| Left 2 | Settings | Keystroke → **A** | Direct Selection tool |
| Left 3 | Precision mode | Keystroke → **Cmd+Z** | undo |
| Left 4 | Display toggle | Keystroke → **Cmd+S** | save |
| Right 1 (top) | Modifier — Shift | leave | constrain angles and scaling |
| Right 2 | Modifier — Cmd | leave | |
| Right 3 | Modifier — Opt | leave | Opt-drag duplicates an object |
| Right 4 (bottom) | Pan/Scroll | leave | |

### Touch ring

| position | default label | set to | ccw · cw |
|---|---|---|---|
| Top-left | Auto Scroll/Zoom | Keystroke → name `Arrange` | `Cmd+[` · `Cmd+]` |
| Top-right | Keystroke (Cycle Layers) | Keystroke → name `Zoom` | `Cmd+-` · `Cmd+=` |
| Bottom-left | Rotate | **Auto Scroll/Zoom** | — |
| Bottom-right | Keystroke (Brush Size) | **Skip** | — |

### Grip Pen

| tab | control | set to |
|---|---|---|
| Pen | Upper side switch | Pan/Scroll |
| Pen | Lower side switch | Right click |
| Pen | Tip Feel | one notch toward Firm |
| Pen | Tip Double Click Distance | Off |
| Eraser | Eraser tip | Erase |
| Mapping | Screen Area | your monitor |
| Mapping | Force proportions | checked |

---

## 6. Not used

| tab | why |
|---|---|
| Display toggle | single monitor — nothing to toggle between |
| On-Screen Shortcuts | the Radial Menu; worth building later, not needed yet |

---

## 7. Reference — the physical device

- 8 ExpressKeys: 4 above the Touch Ring, 4 below
- Touch Ring with a centre **Toggle** button cycling the ring modes; modes set to *Skip* drop out of
  the cycle, so each app cycles 3 instead of 4
- Grip Pen: tip, eraser, 2-way rocker switch, tilt and pressure
- Multi-touch surface with a hardware on/off switch on the tablet edge
- Combined ExpressKey presses work — hold two modifiers at once
