# Jacob Deja — Agentic Coach-Outreach Email Service · Plan v0.1

> A programmatic tool that drafts first-contact recruiting emails to college coaches **in Jacob's own
> voice**, each one specific enough that the coach believes Jacob actually knows their program, their
> roster needs, and how he'd fit. Separate build from the website; may or may not attach to it later.
>
> Part of the Jacob Deja project. See `README.md` for how it fits the whole plan.

---

## 0. The problem this solves

College coaches drown in recruiting email. The overwhelming majority are obviously mass-produced — same
body, mail-merged school name, no evidence the kid knows anything about the program. Those get deleted.

The ones that get replies do three things: they **sound like a real person**, they **prove the player
actually looked at this specific program**, and they **make the film effortless to reach**. This tool exists
to produce that, at volume, without it ever feeling automated. The entire value is voice + specificity. If a
draft reads like a template, the tool has failed, no matter how efficient it is.

**Non-negotiable ethic:** it drafts, Jacob (or you) sends. It never auto-sends, never fabricates facts about
Jacob, and never invents a stat. Coaches verify everything; one made-up claim ends a recruitment.

---

## 1. What "good" looks like (the target output)

A good email is short (a coach reads it on a phone between sessions), and it hits, in order:

1. **A subject line** that states position, grad year, and something concrete — not "Recruiting Inquiry."
2. **One specific, true line about their program** — a recent result, their style, a roster need at his
   position — that proves he looked. This is the line that earns the read.
3. **Who he is in one line** — Jacob Deja, #10, center mid, grad year, club, GPA.
4. **How he'd fit *their* team** — tied to what he just referenced about them. Not "I'm a hard worker."
5. **The film, up top and effortless** — the jacobdeja.com link (or direct film link).
6. **A low-pressure close** — his schedule/showcases, contact, thanks. No demands.

It reads like a focused 16-year-old who did his homework wrote it in ten careful minutes. That's the bar.

---

## 1b. Recruiting-calendar awareness (rules the tool must respect)

Outreach lands inside NCAA recruiting rules, and the tool must know them so silence gets read correctly:

- **D1 (and most D2):** coaches generally may not initiate contact with — or reply to — a recruit until
  **June 15 after sophomore year** (verify the current men's-soccer rules at ncaa.org before build; they
  change). Jacob can and should email *earlier* — coaches read and file — but the tool must set the
  expectation clearly: **no reply before that date is normal, not rejection.** Log every send and queue a
  short, polite re-ping for just after he becomes contactable.
- **D3 / NAIA:** essentially no contact restrictions — replies can come anytime. The target list and
  follow-up expectations should reflect the division split.
- **The club-coach channel:** college coaches *can* talk to club and HS coaches before the contact date.
  Every first email should offer the club coach as a reference (name + contact, with his permission), and
  for priority programs, the club coach sending a parallel note is worth more than any wording tweak the
  tool can make.
- **What rides along in every email:** film link up top, the **upcoming schedule** (tournaments/showcases
  with dates — coaches recruit by watching live, and this is the single most actionable thing an email can
  give them), jersey **#10** + kit color so he's findable on the field, GPA with transcript-on-request, and
  the one-pager link.

The contact log (§6) records school, coach, division, date sent, and reply status — the calendar logic
operates on that record.

---

## 2. The core insight: voice + research are the two hard parts

Everything else (formatting, sending, tracking) is plumbing. The two things that actually determine whether
this works:

- **Voice** — it must sound like Jacob, not like an AI or a template. Solved by capturing real samples of how
  he writes and talks, and grounding every draft in them (§3).
- **Research** — each email must reference something *true and specific* about that program. Solved by an
  agentic research step that looks the program up before writing (§4). This is the part that makes it
  "agentic" rather than a mail-merge.

Get these two right and the tool is great. Get them wrong and it's spam with better grammar.

---

## 3. Capturing Jacob's voice (do this before any code)

The raw material the whole system depends on. Collect from Jacob:

- **Real writing samples** — texts, DMs, a few emails, anything in his actual words. 10–20 samples is plenty.
- **A short voice interview** — have him answer a few questions out loud/in writing: why he plays, how he'd
  describe his own game, what he wants from a program. Capture the phrasing he naturally uses.
- **Guardrails on register** — he's a student-athlete writing to an adult authority figure. The voice is
  *himself, but polite and focused* — not slang-heavy, not stiff-formal. Warm, direct, a little humble.

Distill this into a **voice profile**: a short document of his tone, characteristic phrasings, words he'd
never use, and 2–3 gold-standard example emails written in his true voice (hand-crafted with him). Those
examples become the few-shot anchor for every generation. **This artifact is the heart of the tool.**

---

## 4. The research step (what makes it agentic)

Before writing, the agent gathers real, specific facts about the target program so the email can prove Jacob
looked. For each coach/school, it should try to surface:

- **The program:** division, conference, recent season results, playing style/identity, notable recent games.
- **The coach:** name (spelled right — table stakes), role, anything public about how they build a team.
- **Roster fit:** whether they appear to need a center mid in his grad-year class; who plays his position now.
- **A hook:** the single most specific, genuine thing to reference — a result, a stat, a style, a need.

Sourcing, in priority order: the program's official athletics site (roster, schedule, results), reputable
public coverage, and structured recruiting data where available. **Every referenced fact must be real and
checkable** — the agent flags anything it's unsure about rather than inventing it. If it can't find a genuine
hook, it says so and asks for a human steer rather than manufacturing enthusiasm.

This is a classic agent loop: *given a school → research → extract the hook → hand facts to the writer.* It's
real async orchestration (multiple lookups, then synthesis), which is where a proper agent framework or a
typed-effects library genuinely earns its place — unlike on the static website, where such tools were
overhead. Stack decision deferred to build time (§7).

---

## 5. The generation pipeline (inputs → draft)

```
INPUTS
  ├─ Jacob's profile        (name, #10, CM, grad year, club, HS, GPA, height, foot, key stats, film URL)
  ├─ Jacob's voice profile  (§3 — tone + gold-standard examples, constant across all emails)
  └─ Target coach/school    (name, program) → triggers the research step (§4)

STEP 1  Research the program (§4) → a small structured "facts + hook" object
STEP 2  Draft in Jacob's voice, grounded in the voice profile + the researched hook
STEP 3  Produce: subject line + body + 1–2 variants (he picks, doesn't send blind)
STEP 4  Self-check: is every program fact real? does it sound like the samples? is it short? film up top?
        → if it reads generic, regenerate with a sharper hook

OUTPUT  A ready-to-edit draft Jacob reviews, tweaks, and sends himself.
```

Design principles baked in:
- **Personalization per coach is the point** — the profile and voice are constant; the hook is per-school.
- **Variants, not one blind draft** — give him a choice so he stays in the loop and it stays his.
- **Short by construction** — cap the length; long recruiting emails don't get read.
- **Never auto-send** — his hand is always on the button.

---

## 6. Interface (kept deliberately simple)

The minimum that's genuinely usable:

- Paste/enter a coach's name + school → the tool researches, drafts, and shows subject + body + variants.
- Jacob edits inline, copies, and sends from his own `jacob@jacobdeja.com`.
- A lightweight record of who he's contacted and when, so he doesn't double-email a program.

Form factor is open: a small standalone web tool, a CLI, or eventually a route bolted onto the website —
**that's the "decide later."** The engine (voice + research + generation) is the same regardless of the shell,
so build the engine first and decide the interface after.

---

## 7. Stack (deferred, but noted)

Unlike the static site, this is a real async, tool-using program — the place where heavier tooling pays off:
- An **agent framework** for the research→write loop, and/or a **typed-effects library (e.g. Effect)** for
  orchestrating the multi-step lookups with clean error handling and retries. This is the project where the
  "Effect" praise actually applies.
- A model with tool use for the research step + generation.
- Same deploy target (Vercel) if it becomes a web tool; env vars for any API keys.

Decide concretely at build time. **Do not let any of this touch the website** — the site stays static.

---

## 8. Build order (when the site is done)

1. **Voice capture (§3)** — collect samples, run the voice interview, hand-craft 2–3 gold-standard emails.
   Produce the voice profile. Nothing else starts until this exists.
2. **Profile object** — encode Jacob's vitals + film URL once, reused every email (same facts as the site).
3. **Research step (§4)** — the agent loop that turns a school into a real facts+hook object. Prove it
   surfaces genuine, checkable specifics before wiring it to generation.
4. **Generation (§5)** — voice profile + hook → subject + body + variants, with the self-check pass.
5. **Interface (§6)** — the simplest usable shell; decide standalone vs website route here.
6. **Guardrails pass** — verify: never auto-sends, never fabricates, flags uncertainty, stays short and in-voice.
7. **Real-world tune** — run it on a handful of real target programs, read the drafts critically with Jacob,
   tighten the voice profile and hook logic from what you see.

---

## 9. Open questions

- Interface: standalone tool vs a route on jacobdeja.com (deferred by design).
- Which model + agent/effects stack for the research→write loop (§7).
- Data sources for research and how to keep every referenced fact verifiable.
- How Jacob wants to review/approve — inline edit, pick-a-variant, or both.
- Whether to track replies/follow-ups later, or keep v0.1 to first-contact drafting only.

---

*v0.1 — planning only. The two hard parts are voice and research; everything else is plumbing. Drafts, never
sends. Sounds like Jacob, proves he did his homework, makes the film effortless.*
