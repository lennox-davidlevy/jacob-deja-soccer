# Jacob Deja — Project Plan & Master TODO

> **Goal:** the most impressive high-school soccer recruiting page available — a scroll-driven,
> cinematically-composited site that makes a college coach stop and watch the film — plus a separate
> agentic tool that drafts coach-outreach emails in Jacob's real voice.
>
> **Player:** Jacob Deja · **#10** · center mid. **Domain:** jacobdeja.com (owned). This file is the
> index and the checklist; the linked docs hold the detail.

---

## The documents

| Doc | What it covers | Status |
|---|---|---|
| **README.md** (this file) | Top-level TODO, status, index | living |
| **DESIGN-SYSTEM-v0.2.md** | The look: transparent composite thesis, color, type, layout, scrub spec, AE creative direction | current |
| **AFTER-EFFECTS-GUIDE.md** | Step-by-step AE for a Photoshop user: roto → grade → volt effects → dual-aspect alpha export | current |
| **ARCHITECTURE-DEPLOYMENT-v0.1.md** | Stack (Astro + GSAP), file structure, contact/PDF/share, Porkbun→Vercel deploy runbook | current |
| **EMAIL-SERVICE-PLAN-v0.1.md** | The agentic coach-outreach email tool (built after the site) | v0.1 planning |
| **JACOB-DATA.md** | Verbatim vitals + voice corpus from Jacob, photo inventory + Photoshop plan, gaps | current |
| **DESIGN-BRIEF.md** | Self-contained brief to hand to the design tool (with the `photo-*.jpeg` files) | current |

Read order for a newcomer: this file → design system → architecture → AE guide → email plan.

---

## What's decided (locked)

- **Player identity:** Jacob Deja — 2027, CAM/CDM, right foot, 5'10", The Island FC West (MLS Next HG),
  Comsewogue HS, **4.0 GPA**, kits white/black/blue. Verbatim source: JACOB-DATA.md. **Jersey number
  UNCONFIRMED** (he says 10 — "it represents home" — but a game photo shows #12): treat as swappable
  `#[nn]` motif; confirming it **blocks AE labeling** (JACOB-DATA §2).
- **No published goals/assists** — untracked. Box score leads with MLS Next · 4.0 · CAM/CDM. Never invent.
- **Domain:** jacobdeja.com — bought at **Porkbun**, privacy/lock/auto-renew on. DNS stays at Porkbun.
- **Contact email:** jacob@jacobdeja.com via Porkbun forwarding (set up at launch).
- **Framework:** **Astro** (static) with a single React island for the scrub. Not Next.js.
- **Animation:** **GSAP + ScrollTrigger** (`@gsap/react`), canvas frame-scrub. Plain CSS for small motion.
- **Video approach:** **transparent alpha composite** from After Effects — Jacob/ball/defender/net rotoscoped
  out, the *website* is the background. Volt-mint accent `#5CFFC0` lives in both the comp and the CSS.
- **Contact (v0.1):** `mailto:` + downloadable PDF one-pager + Open Graph tags. Fully static.
- **Content updates:** no admin portal. Jacob edits a **Google Sheet** (schedule/bio/links tabs); the site
  fetches it at build time and a "Publish site" button in the sheet triggers a Vercel deploy hook
  (ARCHITECTURE §7b). Site stays 100% static; he can't break production.
- **"Effect" library:** **not** used on the site (wrong tool for a static page). It's a candidate for the
  *email service* instead, where the async research loop justifies it.
- **Source clip:** `jacob-sick-move.mov` — 720×1280 vertical, 24fps, HEVC, ~15.4s.

## What's still open

- **Jersey number confirmation** (blocks A2's labeling step).
- Highlight reel (Jacob is cutting it) + host choice (Mux / YouTube / Vimeo).
- Voice-corpus gaps: Q3 (casual text) + Q12 (real sent emails) — see JACOB-DATA §3/§5.
- Coach Bowen's confirmed permission to be a reference; about-copy approval (assemble from Q2/Q5/Q8).
- Exact trim in/out of the move in the source clip (set in AE).
- alpha WebP vs PNG sequence — final call once AE edge quality is visible.
- One line of "about" copy in Jacob's voice + which coach references to list.
- Email service: interface (standalone vs a route on the site) and its stack — deferred by design.

---

## MASTER TODO

### Track A — Website (do first)

**A0 · Gather the facts** ◐ *(mostly done 2026-07-25 — JACOB-DATA.md)*
Vitals, photos, and the voice corpus are in. Remaining: jersey number (blocks A2 labeling), the reel + host
choice, Q3/Q12 voice gaps, coach-reference permission, about-copy approval.

**A1 · Scaffold** ☑ *(completed 2026-07-27)* — *ARCHITECTURE §2–3, §8*
Astro + React + GSAP project. Wire design tokens (DESIGN-SYSTEM §3–4) into `tokens.css`, self-host fonts.
Deploy an empty dark page to a Vercel preview URL to prove the pipeline. Don't connect the domain yet.

**A2 · After Effects composite** ☐ — *AFTER-EFFECTS-GUIDE (whole doc), DESIGN-SYSTEM §6b*
The long pole — start early, runs parallel to A1–A3. Trim → rotoscope Jacob/ball/defender/net to transparent
→ grade into palette → build volt effects (ball trail, floor glow, rim light, strike flash) → frame for
landscape + portrait → export two alpha sequences + a poster frame → transcode to alpha WebP (<5MB/set).
Do not add a jersey-number overlay to the footage; the unconfirmed motif stays swappable in website UI.

**A3 · Coded background** ☑ *(completed 2026-07-27)* — *DESIGN-SYSTEM §7, ARCHITECTURE §4*
CSS floodlight radial + turf gradient + grain + volt strike-bloom. Build before the scrub so there's a world
to composite onto.

**A4 · The scrub (the hard part — do it early)** ☑ *(placeholder pipeline completed 2026-07-27)* — *DESIGN-SYSTEM §7, ARCHITECTURE §4*
`ScrubStage.tsx` React island: `useGSAP` + ScrollTrigger pin/scrub → canvas draw, landscape set, desktop.
Verify: `clearRect` each draw (no smearing), rAF throttle, draw-on-change only. This is the whole project —
if this isn't smooth, nothing else matters.

**A5 · Responsive + reduced-motion** ◐ *(implemented 2026-07-27; real-iPhone verification pending)* — *DESIGN-SYSTEM §8, ARCHITECTURE §4*
`gsap.matchMedia()`: portrait set on phones, landscape on laptops. Reduced-motion → static poster. Test on a
**real iPhone** (momentum scroll, address-bar resize) — where scroll bugs live.

**A6 · Static sections** ◐ *(structure implemented 2026-07-27; final content/motion pending)* — *DESIGN-SYSTEM §5, ARCHITECTURE §3*
Hero (JACOB DEJA, swappable number motif, eyebrow, **"Skip to film" quick link**), Vitals box-score with scroll-in count-up,
Film (lazy embed), **See him play** (upcoming schedule — coaches recruit by watching live), About (+ one
strong portrait photo), Contact, NavDots. Wire the strike → vitals release.

**A6b · Content pipeline (the "admin portal")** ◐ *(live Sheet wired; test-row cleanup + publish hook pending)* — *ARCHITECTURE §7b*
Google Sheet (schedule/bio/links tabs) → published-CSV → build-time fetch in `content.ts` → "Publish site"
Apps Script button firing a Vercel deploy hook. Half a day; schedule/bio/links sections render from the
sheet, past dates auto-drop, Jacob updates everything from his phone forever.

**A7 · Contact / one-pager / share** ◐ *(static contact, PDF, metadata implemented; phone/final OG verification pending)* — *ARCHITECTURE §6*
`mailto:jacob@jacobdeja.com` + phone, downloadable PDF one-pager (build this — coaches file sheets), Open
Graph tags (OG image = the poster frame), optional Web Share button.

**A8 · Performance + accessibility pass** ◐ *(automated structural checks clean; Lighthouse/device pass pending)* — *ARCHITECTURE §5*
Lighthouse mobile 90+ perf / 100 a11y, contrast, keyboard focus, reduced motion. Hit the frame/LCP budget.

**A9 · Ship** ☐ — *ARCHITECTURE §8*
Connect jacobdeja.com via Porkbun DNS → Vercel (A + CNAME records Vercel shows; root canonical, www
redirects). Set up Porkbun email forwarding for jacob@jacobdeja.com. Verify OG unfurl on the real domain.
`vercel --prod`.

### Track B — Agentic email service (after the site)

**B1 · Capture Jacob's voice** ☐ — *EMAIL-SERVICE §3*
The heart of the tool. Collect real writing samples, run a short voice interview, hand-craft 2–3
gold-standard emails. Produce the voice profile. Nothing else starts first.

**B2 · Profile object** ☐ — *EMAIL-SERVICE §5*
Encode Jacob's vitals + film URL once (same facts as the site), reused every email.

**B3 · Research step (the agentic part)** ☐ — *EMAIL-SERVICE §4*
Agent loop: school → research → real, checkable facts + one genuine hook. Prove it surfaces specifics before
wiring to generation. Never fabricates; flags uncertainty.

**B4 · Generation pipeline** ☐ — *EMAIL-SERVICE §5*
Voice profile + hook → subject + body + 1–2 variants, with a self-check pass (real facts? in-voice? short?
film up top?).

**B5 · Interface** ☐ — *EMAIL-SERVICE §6*
Simplest usable shell (standalone vs a route on jacobdeja.com — decide here). Engine first, shell second.

**B6 · Guardrails + real-world tune** ☐ — *EMAIL-SERVICE §8–9*
Verify never-auto-sends / never-fabricates / stays-in-voice. Run on real target programs, read drafts
critically with Jacob, tighten voice + hook logic.

---

## The critical path, in one breath

Get the vitals (A0), scaffold (A1), and **in parallel** grind the After Effects composite (A2) since it's the
long pole. Build the coded background (A3), then win or lose the whole project on making the scrub smooth
(A4–A5). Hang the static sections and contact off it (A6–A7), polish (A8), point the domain and ship (A9).
Then, separately, build the email tool voice-first (B1) before anything else in Track B.

**The one thing that matters most:** A4/A5, the scrub. Everything else is comparatively easy. Do it early,
test it on a real phone, and don't move on until it's buttery.

---

---

## Review pass — 2026-07-25 (what changed and why)

A full-plan review made these corrections across the docs:

- **Recruiting substance.** Added a **"See him play" schedule section** — coaches decide by watching live,
  and "where can I see him next" is a question the page must answer — and a **"Skip to film" link in the
  hero**, so the cinematic scrub is opt-in depth, never a toll between a busy coach and the film
  (DESIGN-SYSTEM §5). Added an **NCAA recruiting-calendar section** to the email plan: D1 coaches generally
  can't reply before June 15 after sophomore year, so pre-date silence is normal, not rejection; the
  club-coach channel works earlier and every email offers him as a reference (EMAIL-SERVICE §1b).
- **Technical corrections.** Added the **decoded-memory budget** for the frame scrub — pre-decoding the
  whole set costs `w×h×4` bytes per frame (hundreds of MB) and kills iOS Safari; the fix is compressed
  `Image`s for all frames plus a sliding `createImageBitmap` window (DESIGN-SYSTEM §7, ARCHITECTURE §5).
  Frame sets trimmed to **~60–90** and capped at **1280 px** with `-resize` baked into the transcode
  commands (AE-GUIDE §10, DESIGN-SYSTEM §7). Scrub hydration changed **`client:visible` → `client:idle`**
  so frames preload with lead time instead of hydrating as the coach arrives (ARCHITECTURE §4). Split the
  poster into `poster.jpg` + a dedicated **1200×630 `og-image.jpg`** so link previews don't get cropped
  (ARCHITECTURE §3/§6c, AE-GUIDE §10, DESIGN-SYSTEM §10). Contact email now also renders as visible
  selectable text, since `mailto:` silently fails on desktops with no mail client (ARCHITECTURE §6a).

What the review deliberately did **not** change: the Astro + GSAP + canvas architecture (correct), the
transparent-composite direction (ambitious, with a sane opaque-scrub escape hatch), the AE workflow and
export settings (accurate), and the Porkbun→Vercel runbook (right).

---

---

## Data drop — 2026-07-25 (Jacob's responses received)

Vitals, four photos, and the voice corpus landed; all captured **verbatim in JACOB-DATA.md** (never
paraphrase the corpus — the tool learns from his exact words). Docs updated: position corrected to
**CAM/CDM** everywhere, 2027 locked, box score redefined to lead with MLS Next + 4.0 GPA with **no
goals/assists line**, jersey number downgraded to **unconfirmed `#[nn]`** pending his answer (blocks AE
labeling), AE guide warning added, email plan §3 now points at the seed corpus and notes the Gmail-sends
decision. New **DESIGN-BRIEF.md** created as the self-contained handoff for the design tool, including the
"Maestro" brand story (his kit wordmark + Özil + "10 = home") and the photo treatment plan (all stills get
the video's grade: desaturate, crush to #070B09, grain).

---

## Narrative-arc upgrade — 2026-07-25 (evening)

The scrub now uses the **full clip as a five-act scroll story** (DESIGN-SYSTEM §5b): approach → slow-mo spin
(centerpiece, ~40% of scroll) → strike → ball-at-camera ending in a **code-driven match cut** (volt circle
expands from the ball into the TITLE CARD: name + ball motif) → **celebration footage as a muted graded loop
behind the title card** (never scrubbed — it's the emotional payoff and the "teammates love him" message).
Roto scope stays acts 1–3 only; act 4 is framed footage into the match cut; act 5 is a 2–3s compressed video
loop. Budget: ~80–100 scrubbed frames total, act-prefixed filenames, progressive per-act loading. AE guide
and DESIGN-BRIEF updated to match. Design tool: first mockups received and reviewed; strike-glow restraint
and real-photo placeholder feedback sent.

---

## A1/A3–A5 implementation — 2026-07-27

Built the static Astro/React/GSAP scaffold, exact design tokens, self-hosted fonts, and the coded stadium
background. The five-act scrub now runs end to end against reproducible generated stand-ins: act-based
portrait/landscape alpha WebP loading, one rAF-throttled canvas, bounded ±10-frame `createImageBitmap` LRU,
tracked/reversible ball trail, accelerated act 4, code-driven match cut, and the act-5 celebration/title
payoff. Reduced motion requests no scrub assets and renders the poster directly; automated Chromium checks
covered 390px/desktop selection, reverse scrolling, rapid scroll and aspect changes, failed-frame fallback,
and delayed path loading. `astro check` and the static build are clean; each frame set is ~2 MB. Remaining
before A5 fully closes: verify it on a real iPhone Safari. The A1 pipeline is proven at
`jacob-deja-soccer-jk8f5avvz-david-levys-projects-7b271567.vercel.app` (Vercel-authenticated preview).
A2 real footage remains untouched and can replace the stand-ins under the same contract.

---

*Living index. Domain owned, stack locked, placeholder site built. Next actions: confirm the jersey number,
produce the A2 ten-frame proof, remove the Sheet's temporary test rows, wire its deploy hook, and verify the
scrub on a real iPhone.*

---

## A6 implementation — 2026-07-27

Added static Astro sections for identity, vitals, film placeholder, upcoming schedule, about, contact, and
nav dots. The confirmed facts render in the box score; the jersey motif is a single `#[TBD]` constant until
confirmed. The scrub remains the sole `client:idle` hydrated island. Final reel embedding, approved bio,
schedule data, phone, count-up/release tuning, and public reference details remain pending.

---

## A6b–A8 static work — 2026-07-27

Added a failure-tolerant build-time CSV reader for the published Google Sheet: bad rows and failed tab fetches
fall back safely, past fixtures drop automatically, bio vitals preserve Sheet row order and accept new rows,
and no runtime data dependency was introduced. The three live CSV tabs are wired and verified with temporary
`[TEST]` schedule/link rows; those rows must be removed after visual verification. Added
the real portrait derivative, visible mail contact with a prefilled subject, generated one-page recruiting
PDF, canonical/Open Graph/Twitter metadata, and favicon. The current alpha-frame sets remain ~1.8 MB each,
OG/poster dimensions are correct, all ordinary text-token contrast checks pass WCAG AA, only the scrub
hydrates, and `astro check`/the static build are clean. Remaining: wire the Sheet's deploy hook, add the
reel/phone/approved copy, replace the placeholder OG media, run Lighthouse,
and verify on real iPhone Safari.
