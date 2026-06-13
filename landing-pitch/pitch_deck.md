# Barbequeue — 90-Second Pitch
### Stage packet · v5.2 (landing-as-deck · Charcoal & Ember) · English

**Tagline:** Nobody grills alone.
**Format:** 90 seconds · spoken in English · the deck *is* a scroll-driven landing page that wraps a stylized demo and ends on a live CTA.
**One line:** `grill-with-docs` sharpens one host's plan. Barbequeue does it for the whole team — and the team walks out aligned.

**Why this version:** the landing page does triple duty — it's the deck, it wraps the demo as a controlled animation (deterministic, no live-session risk), and it's the destination of the closing CTA. The reveal animation (Contributions resolving into one Answer Candidate) explains the mechanism better than the real UI ever could from the back of a room: the metaphor *is* the thesis — many human inputs -> one shared decision.

**Visual direction:** Charcoal & Ember, matching `DESIGN.md`. The page is dark warm-charcoal at rest, with restrained ember used only for brand/action/focus and functional flares used only when they carry meaning. No cream/sand backgrounds, no generic SaaS gradients, no literal fire, no decorative hero imagery. The energy comes from structured motion, type, and the logo marks — ● ● ● ■ — which become the animation vocabulary: simple geometric forms that appear, gather, object, and resolve.

**Design rules inherited from `DESIGN.md`:**
- **Base:** Charcoal `oklch(0.165 0.007 50)`, raised surfaces `oklch(0.210 0.008 50)` / `oklch(0.255 0.009 50)`, structural lines `oklch(0.32 0.011 50)`.
- **Brand:** Ember `oklch(0.68 0.115 48)` for primary actions, links, focus rings, active selection, and the final CTA. Ember never means "accepted".
- **Functional:** Accepted green, objected hot red, clarify/info blue. These appear only in the Reveal when the consensus mechanism needs to be legible.
- **Typography:** Helvetica Now Display for hero/session-scale text; Helvetica Now Text for body, labels, deck instructions, CTA support. Letter spacing never tighter than `-0.04em`.
- **Elevation:** Flat by default. Separate beats with lightness, lines, spacing, and state. The only standing glow is objection heat or a restrained ember action glow.
- **Product shape:** Structure over stream. The reveal must show Grilling Question -> Contributions -> Answer Candidate -> Session Consensus, not a chat feed.

---

## The script

Notes in `[ ]` are stage directions (what scroll beat fires / what appears). Everything in `>` is spoken aloud. The page is advanced by arrow key / clicker — never free-scrolled.

### HOOK · ~12s
*[Section: HERO — wordmark + tagline on charcoal. No hero card. Keep a hint of the next section visible below the fold on desktop and mobile. Subtle kinetic type only: the marks breathe in, the wordmark stays precise.]*

> "Some of the best ideas in human history were born around a fire — people, together, throwing ideas into the flames. AI gave us a bigger fire. But it took away the people."

### PROBLEM · ~12s
*[ADVANCE -> Section: PROBLEM — a single input line on a dark surface, isolated by scale and spacing. The cursor is ember because it is the active action point, not because it means consensus. Isolation is rendered as structure missing around the line, not as a chat screenshot.]*

> "Working through an idea with AI is usually private — you, alone in a chat window. The grill sharpens that plan brilliantly. But the hard part was never the idea — it's getting the team to agree."

### REVEAL + ANIMATION · ~33s
*[Section: REVEAL — the heart. Four stepped beats, each advanced in sync with the line.]*

> "So we built Barbequeue. One person lights the grill, drops in an idea, and shares a link."

`[ADVANCE -> beat 1: single marks (circles, echoing the logo) appear one by one in the charcoal field. Their default state is ink/muted; ember marks only the active arrival/focus state.]`

> "Everyone opens the same page. The AI asks the grilling questions —"

`[ADVANCE -> beat 2: the Grilling Question surfaces, rising to center screen inside a thin structural frame. It should read as the active object, not a chat prompt.]`

> "— and the whole team contributes. Together."

`[ADVANCE -> beat 3: short Contributions appear around the question, staggered and distinct. Ideas stay ink/muted; a Clarifying Contribution can use info blue; one Objection can flare hot red if needed.]`

> "Then it does the real work. It mediates — compares every contribution, amplifies the best, and grills the room…"

`[ADVANCE -> beat 4: the scattered Contributions drift inward and resolve into one Answer Candidate at center. Acceptance uses functional green only after the objections are gone; ember remains reserved for the primary CTA.]`

*(1–2s silence — the only silent beat — point to the screen)*

> "…until you land on one."

### CLOSE + CTA · ~28s
*[ADVANCE -> Section: OUTCOME — the two outputs side by side: a Documentation Change ready for host review AND an aligned team with a visible Session Record. Use structured bands/panels, not floating marketing cards.]*

> "You don't just leave with a sharper idea — documented, ready. You leave as a team that finally agrees on it. The idea is what you cooked. The alignment is why you lit the fire. This is Artificial Intelligence — powered by Human Intelligence."

`[ADVANCE -> Section: CTA — final frame: "AI · powered by · HI", "Try it on the Codex marketplace ->", QR code, "Tell us what you think." Ember is allowed here because this is the primary action.]`

> "Barbequeue is live on the Codex marketplace. Go grill something with your team — and tell us what you think. Nobody grills alone. HI."

*Optional restore (if you have margin): before "This is Artificial Intelligence," add — "The smartest thing in the room was never the machine — it was all of us."*

---

## Landing-as-deck — section map

The page is five full-viewport, scroll-snap sections. On stage you advance by keypress; as a public landing it reads top-to-bottom on its own.

1. **HERO** — *spoken over: Hook.* Wordmark + tagline "Nobody grills alone" on charcoal. Dark, quiet, unmistakably Barbequeue.
2. **PROBLEM** — *spoken over: Problem.* One private input line, missing the surrounding Consensus Workflow. "The fire, lit for one."
3. **REVEAL** — *spoken over: Reveal.* The four-beat mechanism (below): team joins, Grilling Question, Contributions, Answer Candidate.
4. **OUTCOME** — *spoken over: start of Close.* Two outputs: Documentation Change ready for host review + Session Consensus the team can trust.
5. **CTA** — *held during the CTA line.* AI · powered by · HI, Codex marketplace link, QR, feedback ask. Ember owns the primary action.

## Reveal animation — the four beats (spec for handoff)

This is the moment the whole pitch hangs on. Each beat is a discrete step (recommended over scrub-on-scroll for stage reliability) that plays its sub-animation on entry, triggered by keypress:

1. **Team joins.** Single geometric marks — circles, echoing the logo — appear one at a time in the charcoal field. People arriving via the Invite Link are rendered as pure form, not avatars. Reads as "a room forming."
2. **The Grilling Question.** One line of Helvetica Now Display rises and settles at center, with a thin `line` frame or rule system around it. Calm, single focus.
3. **Contributions arrive.** Short text fragments appear as distinct Contributions, staggered in timing and position — parallel, simultaneous, a little unruly. Keep it structured: no chat bubbles, no message stream. If needed, use info blue for one clarifying contribution and hot red for one objection.
4. **Session Consensus.** The Contributions drift inward and resolve into a single Answer Candidate. Once no unresolved Objections remain, the accepted state lands in functional green. The thesis made visible: many -> one. Hold this frame.

## Design-aligned landing requirements

These are non-negotiable for the build handoff:

- **No white landing canvas.** Use charcoal as the page background. White/near-white is ink, not the environment.
- **No decorative color.** Ember is brand/action/focus only. Functional colors carry consensus meaning only.
- **No chat metaphor.** Contributions can be spatial and kinetic, but the structure must stay legible as a Consensus Workflow.
- **No generic landing tropes.** Avoid hero metrics, identical feature cards, gradient text, cream backgrounds, glass panels, and decorative shadows.
- **No ambient card stack.** Use full-width sections, structural lines, and raised surfaces by lightness. Cards are acceptable only for repeated objects if the build needs them.
- **No literal fire imagery.** The metaphor lives in language, ember actions, and motion. The UI remains a serious product surface.
- **Motion is stateful.** Every animation explains arrival, question focus, objection, synthesis, acceptance, or CTA. Add a reduced-motion path in implementation.
- **CTA continuity.** The public landing must open on the same hero seen on stage, then allow normal scroll. Stage mode uses deterministic keyboard advances.

The final state of beat 4 should be the frame held through the entire close.

## Scroll-sync rules (stage control)

- **Never free-scroll.** Drive the page with arrow keys or a clicker. Each section / beat is a deliberate, repeatable step.
- **Advance leads the line by half a second** — the beat lands *as* the words announce it, not after.
- **One silent beat only:** the condensation into one (end of Reveal beat 4). Let it breathe 1–2s. Everything else is spoken over.
- **Hold the last reveal frame** (the single condensed answer) through the OUTCOME and into the close.

## Delivery notes

- **The pause in the closer needs air:** "This is Artificial Intelligence — *(beat)* — powered by Human Intelligence."
- **The CTA frame doubles the slide trick:** "AI · powered by · HI" on screen lets your voice take its time on the line.
- **End on "HI" — hard stop.** Here it does double duty: brand *and* a parting greeting. Pause, drop it, done. Nothing after.
- **Frame it honestly.** This is "here's the experience / here's how it works," not a recording of a finished product. The CTA — "try it and tell us what you think" — signals early-stage on its own, which reads as confident and inviting, not as a gap.

## CTA — make the landing the destination

- Final frame shows a **QR code + a short URL**; test both from the back of the room.
- The page they land on should **open on the same charcoal hero** they just watched — instant continuity ("oh, it's the thing from the slide").
- The marketplace link / QR action uses ember. The feedback ask stays ink/muted unless it becomes a second explicit action.
- Keep the spoken ask verbatim and warm: **"Go grill something with your team — and tell us what you think."**

## Pre-flight checklist (before you walk on)

- Page open in fullscreen / presentation mode; cursor hidden.
- Keyboard / clicker tested; you know exactly how many advances the pitch takes.
- Reveal animation pre-warmed (load the page once so fonts/assets are cached).
- QR + short URL verified live, on a phone, from a distance.
- Type scale set so the back row can read the Grilling Question, Contributions, and Answer Candidate.
- Contrast checked on the actual display: body text >=4.5:1, large text >=3:1.
- Reduced-motion mode checked: the pitch still advances deterministically without choreography.
- Decide who speaks and who drives the page (see split below).

## Optional 2-presenter split

For 90 seconds, one voice usually lands cleaner than three:

- **Presenter A — voice.** Delivers the whole script. Owns rhythm, pauses, and the close.
- **Presenter B — driver.** Silent. Advances each beat half a second ahead of A, holds the final reveal frame.
- **Third teammate:** backup laptop / runs the clicker, or joins A for one shared "HI" at the very end (only if rehearsed).

## Timing budget

Hook ~12s · Problem ~12s · Reveal ~33s · Close + CTA ~28s ≈ **~85s**, leaving a few seconds of margin. If you run hot: tighten the Reveal narration first; the Problem is already at its short form.

---

## Notes to seed the handoff (next step)

This doc is the source of truth; the build handoff will spec it out. Key constraints to carry forward:

- **Dual purpose:** stage deck (keyboard-advanced, fullscreen) *and* a public landing page (reads on its own, mobile-friendly — judges will scan the QR on phones).
- **Brand direction:** Charcoal & Ember from `DESIGN.md`, not pure black and white. Dark warm-charcoal base, restrained ember brand/action/focus, functional colors only for accepted/objected/clarify states. Spacious and minimal, but not empty-white minimalism. Type: Helvetica Now Display (headings) + Helvetica Now Text (body). Use the existing Barbequeue wordmark. The logo marks (● ● ● ■) are the animation vocabulary.
- **Mechanics:** full-viewport scroll-snap sections + keyboard navigation; the Reveal as four stepped sub-beats with entry animations.
- **CTA is live now:** the Codex marketplace link and feedback destination must be real on launch.
- **Placeholder content to replace at build:** the sample Grilling Question, the set of Contributions, one optional Objection, and the final Answer Candidate (pick a short, vivid example plan to grill).
