# Jacob [Lastname] — Architecture & Deployment Plan · v0.1

> How the site is built, what it's built from, and how it ships. Companion to
> `DESIGN-SYSTEM-v0.2.md` (the look) and `AFTER-EFFECTS-GUIDE.md` (the footage).
> Stack chosen for one goal: a static, blazingly fast, animation-first recruiting page that
> deploys through the Vercel CLI you already know.

---

## 0. The decisions, up front

| Decision | Choice | Why |
|---|---|---|
| Framework | **Astro** (with a React island for the scrub) | Ships zero JS by default; only the scrub hydrates. Faster than Next for a static page, and you avoid the Next.js App-Router weight you're wary of. |
| Rendering | **Static** (`astro build` → static files) | First paint is HTML + poster frame, instant on cellular. No SSR needed for v0.1. |
| Animation | **GSAP + ScrollTrigger** via `@gsap/react` `useGSAP` | Free since 2025, the standard for scroll-scrubbing, auto-cleanup in React, `matchMedia` for responsive/reduced-motion. |
| Scrub render target | **`<canvas>`**, one draw per frame | GSAP conducts; canvas paints. One paint op/frame = smooth on a phone no matter how rich the composite. |
| Small animations | **Plain CSS** (count-ups, hovers, reveals) | ~80% of UI motion needs no library and no bundle cost. |
| Contact (v0.1) | **`mailto:` link** | Zero backend. Keeps the whole site static and CLI-deployable. Upgrade to a form later if wanted (§7). |
| One-pager | **Static PDF download** | Coaches expect a sheet. No backend; just a hosted asset. Highest value-to-effort feature. |
| Share | **Open Graph tags + optional Web Share button** | The link will get texted coach-to-coach regardless; make it unfurl beautifully. |
| Host | **Vercel**, deployed via CLI | You've done this. `astro build` output serves directly. |
| Domain | Bought at Vercel or any registrar | Vercel-bought = DNS auto-configures. Any registrar works with one record. |

**Net effect:** v0.1 is 100% static. No serverless functions, no env vars, no database. It builds to a
folder and deploys with `vercel`. Everything dynamic (a real form) is a deliberate later upgrade, not a
v0.1 dependency.

---

## 1. Why Astro over Next.js (for this specific page)

The Next.js criticisms you've heard are real but describe problems you wouldn't have: App-Router
complexity, server components, surprising caching, framework weight — all matter for large dynamic apps,
none matter for a static page where you'd use ~10% of the framework while still paying its overhead.

Astro is built for exactly this shape: mostly-static content with a few interactive **islands**.
- **Zero JS by default.** Hero, vitals, about, contact render as static HTML. No hydration cost.
- **Islands hydrate on demand.** The scrub is a React component marked `client:visible` — its JavaScript
  doesn't even load until the coach scrolls near it. The rest of the page never ships React at all.
- **React still works.** Official React integration; the GSAP scrub harness drops in as-is.
- **Same deploy you know.** `astro build` → static output → `vercel`. No new ritual.

If you already had a Next.js muscle-memory this would be closer, but given your CLI-Vercel comfort and
Next wariness, Astro is the lower-friction *and* faster choice here. Not a compromise — the right fit.

---

## 2. Stack & dependencies

```
Runtime/build:   Astro (latest), Node 20+
UI in islands:   React 18 + @astrojs/react
Animation:       gsap + @gsap/react           # ScrollTrigger ships inside gsap now
Styling:         plain CSS with the design-system custom properties (tokens.css)
                 (Tailwind optional via @astrojs/tailwind — not required; CSS vars are enough)
Fonts:           self-hosted via @fontsource/* or local files (Anton/Archivo, Inter/Geist, Geist Mono)
Deploy:          Vercel (static). Adapter only added later IF a server form is introduced.
Analytics:       @vercel/analytics (optional, drop-in) — see if coaches actually open it
```

Install sketch:
```bash
npm create astro@latest jacob-site      # choose "Empty" or "Minimal", TypeScript: Strict
cd jacob-site
npx astro add react                      # adds @astrojs/react
npm i gsap @gsap/react
npm i @fontsource/anton @fontsource/inter @fontsource/geist-mono   # or bring local font files
npm i -D @vercel/analytics               # optional
```

Deliberately **not** installing: Effect (`effect-ts`) — it's a superb library for typed async/error
handling in complex apps, but it does nothing for animation, scroll, or render speed. On a static
animation page it's pure overhead. Skip it here. (If a future elaborate backend appears, reconsider then.)

---

## 3. File structure

```
jacob-site/
├─ public/
│  ├─ frames/
│  │  ├─ landscape/   frame_0001.webp …   (alpha, from AE → cwebp)
│  │  └─ portrait/    frame_0001.webp …   (alpha)
│  ├─ poster.jpg                          # strike frame on dark bg: reduced-motion hero + preload placeholder
│  ├─ og-image.jpg                        # 1200×630 crop of the strike — link previews (OG/Twitter)
│  ├─ jacob-onepager.pdf                  # the downloadable sheet
│  └─ favicon / og assets
├─ src/
│  ├─ pages/
│  │  └─ index.astro                      # the whole single page, composed of sections
│  ├─ components/
│  │  ├─ Hero.astro                       # static: name, eyebrow, scroll cue
│  │  ├─ ScrubStage.tsx                   # React island (client:visible) — the canvas scrub
│  │  ├─ CodedBackground.tsx              # React island OR CSS — floodlight/turf/grain, reacts to progress
│  │  ├─ Vitals.astro                     # static markup; count-up via tiny CSS/IntersectionObserver
│  │  ├─ Film.astro                       # lazy <iframe> embed of the full reel
│  │  ├─ About.astro                      # static
│  │  ├─ Contact.astro                    # static: mailto, phone, PDF download, share
│  │  └─ NavDots.astro                    # static anchors; active state via IntersectionObserver
│  ├─ lib/
│  │  ├─ frames.ts                        # frame manifests (portrait+landscape) + preloader + matchMedia pick
│  │  └─ content.ts                       # build-time fetch of Google Sheet CSVs (schedule/bio/links) — §7b
│  ├─ styles/
│  │  └─ tokens.css                       # design-system §3 + §4 custom properties
│  └─ layout/
│     └─ Base.astro                       # <head>, fonts, meta/OG, analytics
├─ astro.config.mjs
└─ package.json
```

Everything is `.astro` (static, zero JS) **except** `ScrubStage.tsx` and optionally `CodedBackground.tsx`,
which are React islands. That split is the whole performance story: one interactive island, the rest static.

---

## 4. How the scrub island works (integration shape)

The mechanics live in the design doc §7; here's how it plugs into Astro without shipping JS to the whole page.

```astro
---
// index.astro
import ScrubStage from "../components/ScrubStage.tsx";
import { LANDSCAPE_SET, PORTRAIT_SET } from "../lib/frames";
---
<section id="scrub">
  <ScrubStage
    client:idle                  {/* hydrate during idle after first paint — see the note below */}
    sets={[PORTRAIT_SET, LANDSCAPE_SET]}
    scrollLength="350vh"
    strikeAt={0.85}
    poster="/poster.jpg"
  />
</section>
```

- `client:idle` — deliberately not `client:load` and not `client:visible`. The scrub needs *lead time*:
  ~5 MB of frames must be fetched before the coach reaches it, so `client:visible` hydrates too late (they'd
  scroll into a loader), while `client:load` competes with the hero's LCP. Idle hydration starts right after
  first paint without blocking it; on hydrate, immediately begin fetching the matchMedia-chosen frame set at
  low network priority and warm the initial decoded window (design doc §7).
- Inside `ScrubStage.tsx`, use `useGSAP` (from `@gsap/react`) with a `ScrollTrigger` that `pin`s the stage
  and `scrub`s a value from 0→1, then draws the matching frame to `<canvas>` (one `clearRect` + one
  `drawImage` per change; transparent frames composite over the coded background — design doc §7).
- Use `gsap.matchMedia()` to pick the portrait vs landscape frame set and to **disable the scrub entirely
  under `prefers-reduced-motion`**, showing `poster.jpg` instead. This is required (design doc §7).

> The coded background can be a sibling island that also reads the 0→1 progress (via a shared store or a
> simple callback prop), OR — simpler — pure CSS: a fixed radial-gradient + turf gradient + grain overlay,
> with the volt strike-bloom done as a CSS class toggled at `strikeAt`. Prefer the CSS version unless you
> need per-frame background reactivity; less JS.

---

## 5. Performance plan (how "blazingly fast" is actually achieved)

Speed here is architectural, not something you bolt on at the end.

- **Static HTML first paint.** Hero name + `poster.jpg` are in the initial HTML; they render before any JS.
  Target LCP < 1.5s on mobile.
- **One island.** Only the scrub ships React/GSAP, and only when scrolled to (`client:visible`).
- **Frame budget.** Alpha WebP, ~60–90 frames/set, **< 5 MB per set** compressed, capped at ~1280 px on the
  long edge, and the browser loads **one** set (matchMedia), not both. Draw frame 0 as soon as it decodes.
- **Decoded-memory budget.** Never pre-decode the whole set — decoded bitmaps cost `w × h × 4` bytes each
  (1280×720 ≈ 3.7 MB; ~100 frames ≈ 370 MB → iOS Safari kills the tab). Hold compressed `Image`s for all
  frames; keep a sliding `createImageBitmap` window of ±10–15 frames around the current index, LRU-evicted,
  warmed during idle. Full math in design doc §7.
- **One paint per frame.** The scrub is a single canvas draw, not N animated DOM nodes. Constant cost.
- **rAF-throttled scroll**, draw-on-change only, `clearRect` each draw (transparent frames).
- **Self-hosted fonts**, `font-display: swap`, only the weights used → ~0 CLS.
- **Lazy film embed.** The full-reel `<iframe>` loads on scroll (`loading="lazy"`), not up front.
- **Image optimization.** Astro's `<Image>` / asset handling for the poster and any stills.
- **Targets:** Lighthouse mobile 90+ performance, 100 accessibility. Verify before ship.

---

## 6. Contact, one-pager, and share (v0.1 = all static)

### 6a. Contact — `mailto:` (build today, no backend)
A prominent, styled link:
```html
<a href="mailto:you@example.com?subject=Recruiting%20—%20Jacob%20[Lastname]%20(CM%2C%20'27)">
  Email about Jacob
</a>
```
Pre-filling the subject makes it one tap for a coach. Show the phone as a `tel:` link too. For a recruiting
page this is genuinely enough — coaches reach out from their own mail client constantly.

### 6b. One-pager PDF — the highest-value feature
A `jacob-onepager.pdf` in `/public`, linked as a download:
```html
<a href="/jacob-onepager.pdf" download>Download one-pager (PDF)</a>
```
Contents coaches expect: name, grad year, position + secondary, dominant foot, height, club, high school,
GPA, key stats, coach references, and the film URL. Design it to match the site (dark, volt accent, same
type). This respects how coaches actually work — they file and forward sheets. Build this first.

### 6c. Share — OG tags (matter most) + optional Web Share button
The link *will* get forwarded coach-to-coach; make it unfurl well. In `Base.astro` `<head>`:
```html
<meta property="og:title" content="Jacob Deja · #10 · CM · Class of [year]" />
<meta property="og:description" content="Center mid, [Club]. Watch the film." />
<meta property="og:image" content="https://jacobdeja.com/og-image.jpg" />  {/* 1200×630 strike crop */}
<meta name="twitter:card" content="summary_large_image" />
```
Optional button using the native share sheet (phones):
```tsx
<button onClick={() => navigator.share?.({ title: "Jacob [Lastname]", url: location.href })}>
  Share
</button>
```
Guard for browsers without `navigator.share` (fall back to copy-link). `og-image.jpg` is a dedicated
**1200×630** crop of the strike (not the raw poster, which is the wrong aspect and gets cropped badly) —
verify it in a real iMessage/Slack link preview before you call it done.

One more contact detail: always render the email address as **visible, selectable text** next to the
`mailto:` link. On desktops without a configured mail client, `mailto:` silently does nothing — a coach who
hits that dead end must still be able to copy `jacob@jacobdeja.com` by hand.

---

## 7. If you later want a real contact form (deliberate upgrade, not v0.1)

Only if you decide `mailto:` isn't enough (e.g. you want to capture the coach's name + school in a form and
get it emailed to you):

1. `npx astro add vercel` — adds the Vercel adapter, switches output to `"server"` (or keep static pages +
   just the one endpoint via `hybrid`/on-demand).
2. Add `src/pages/api/contact.ts` — a POST endpoint that validates and sends email.
3. Use **Resend** (`npm i resend`) with an API key in a Vercel env var (`RESEND_API_KEY`).
4. Spam guard: a honeypot field + basic rate limiting. No CAPTCHA needed at this scale.

This is a clean, contained upgrade — it doesn't touch the rest of the static site. Start without it.

---

## 7b. Content updates — the Google Sheet pipeline (Jacob edits, no code)

Jacob must be able to update the schedule, bio, and links himself, from his phone, without touching code.
No admin portal, no auth, no database — content lives in a **Google Sheet** and the site rebuilds from it.

### The sheet
One Sheet, owned by you, shared with Jacob as editor. Three tabs:
- **`schedule`** — columns: `date` (YYYY-MM-DD), `event`, `location`, `kit`, `notes`
- **`bio`** — key/value rows: `about`, `gpa`, and any vital that may change
- **`links`** — columns: `label`, `url`, `show` (yes/no)

### The plumbing
1. Each tab: File → Share → **Publish to web** → that tab → **CSV**. Yields a stable public URL per tab —
   no auth, no API key, no secrets in the repo (it's schedule data headed for a public site anyway).
2. `src/lib/content.ts` fetches those URLs **at build time** (papaparse, build-only) and the sections render
   from the parsed rows. Filter `schedule` to `date >= today` — past events auto-drop on every rebuild, so
   the "See him play" section can never look stale to a coach.
3. **Deploy hook:** Vercel → project → Settings → Git → Deploy Hooks → create one (it's just a URL; hitting
   it triggers a rebuild). Wire a tiny Apps Script custom menu in the sheet — a **"Publish site"** button
   that fetches the hook URL. Jacob's whole workflow: edit sheet on phone → tap Publish site → live in ~1
   minute. (Fallback: give him the hook URL as a bookmark; visiting it also triggers the deploy.)

### Why this shape
Zero auth (Google is the login), zero runtime dependency (data is baked in at build — Google down ≠ site
down), and Jacob can't break production: a bad edit produces a failed build at worst, and Vercel keeps
serving the last good deploy.

### Gotchas
- **Published-CSV caching:** Google caches the public CSV for up to ~5 minutes, so edit-then-instant-publish
  can rebuild with stale data. Either the Apps Script sleeps ~60s before firing the hook, or Jacob learns
  "wait a minute, then publish."
- **Parse defensively:** he *will* typo a date or half-fill a row eventually. Skip invalid rows silently;
  never let a bad row fail the build.

Cost: ~half a day total (sheet 20 min, fetch code ~1 hr, hook + Apps Script ~30 min).

---

## 8. Deploy runbook (the CLI flow you already know)

```bash
# one-time
npm i -g vercel                 # if not already
git init && git add -A && git commit -m "jacob site v0.1"

# from the project root
astro build                     # outputs static site to ./dist
vercel                          # first run links/creates the project; deploys a preview URL
vercel --prod                   # promote to production
```
- Vercel auto-detects Astro (build command `astro build`, output `dist`). If prompted, accept defaults.
- Or connect the GitHub repo in the Vercel dashboard for auto-deploy on every push + preview URLs per PR.
- **Env vars:** none for v0.1 (fully static). Only needed if you add the form (§7: `RESEND_API_KEY`).

### Domain — jacobdeja.com (bought, Porkbun) ✓
Domain is registered at **Porkbun**. Contact privacy ON, domain lock ON, auto-renew ON. DNS stays at
Porkbun (do **not** move nameservers to Vercel). Connect it at deploy time:

1. **Vercel** → Project → Settings → **Domains** → add `jacobdeja.com` (and `www.jacobdeja.com`). Mark the
   root (no-www) as primary; let Vercel redirect `www` → root.
2. Vercel shows the exact records to create — typically an **A record** for the root (`@` → the IP Vercel
   gives; historically `76.76.21.21` but use whatever Vercel shows) and a **CNAME** for `www` →
   `cname.vercel-dns.com`. Use Vercel's shown values, not these from memory.
3. **Porkbun** → the domain's **DNS Records** editor → add exactly those records (type, host, value). Save.
4. Back in Vercel it auto-verifies and issues HTTPS. Propagation is usually minutes on Porkbun, up to a few
   hours — wait rather than assume breakage.
5. Verify the OG card unfurls on the real domain (paste the link into iMessage/Slack).

**Email for the contact link:** `jacob@jacobdeja.com` via **Porkbun email forwarding** (free; forwards to a
real inbox) — enough for a recruiting `mailto:`. Uses MX records, independent of the A/CNAME above, so set it
up right before launch without disturbing the site. Porkbun paid email hosting is the upgrade if a real
mailbox is ever wanted.

---

## 9. Build order (ties the three docs together)

1. **Scaffold** Astro + React + GSAP, `tokens.css` from design-system §3/§4, fonts wired. Deploy an empty
   dark page to a Vercel preview URL to confirm the pipeline.
2. **AE** (separate track, `AFTER-EFFECTS-GUIDE.md`): roto → grade → volt effects → export both alpha
   sequences + poster. Transcode PNG → alpha WebP into `public/frames/{landscape,portrait}`.
3. **CodedBackground** (CSS-first): floodlight radial + turf gradient + grain + volt strike-bloom class.
4. **ScrubStage.tsx** island: `useGSAP` + ScrollTrigger pin/scrub → canvas draw, landscape set, desktop.
   The risk; do it early. Verify `clearRect` (no smearing), rAF throttle, draw-on-change.
5. **Dual-aspect + reduced-motion** via `gsap.matchMedia()`: portrait set on phones, poster fallback. Test
   on a real iPhone (momentum scroll, address-bar resize).
6. **Static sections:** Hero, Vitals (count-up on scroll-in), Film (lazy embed), About, Contact, NavDots.
   Wire the strike → vitals release.
7. **Contact/PDF/share:** mailto + phone, one-pager PDF, OG tags, optional share button.
8. **Perf + a11y pass:** Lighthouse mobile 90+/100, contrast, keyboard focus, reduced motion. Hit §5 budget.
9. **Domain + ship:** custom domain, verify OG unfurl, `vercel --prod`.

---

## 10. Open questions (deployment-flavored)

**Resolved:** domain = jacobdeja.com (Porkbun) · framework = Astro · contact = `mailto:` for v0.1 ·
Effect library = not used here.

**Still open:**
- Full reel host (Mux / YouTube / Vimeo) — drives the `Film.astro` embed.
- Jacob's remaining vitals + one-pager content.
- Whether the contact form upgrade (§7) is ever wanted, or `mailto:` stays.

---

*v0.1 — static-first, Astro + GSAP, CLI-deployed to Vercel. Domain jacobdeja.com on Porkbun. Upgrade paths
(form, analytics) are additive.*
