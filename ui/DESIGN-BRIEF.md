# Design Brief — barbequeue chat surface

> Confirmed via `/impeccable shape`. Hand to `/impeccable craft` to build.
> Register: `product` (see `ui/PRODUCT.md`).

## 1. Feature summary
The shared chat session is the product: a hosted URL where a mixed product team (PM, design, eng) brainstorms *together* with the agent (a Codex plugin). We are shaping its visual identity. The agent is a participant in the room — not a reply that appears under a prompt box.

## 2. Primary user action
Read the room and add to it: follow who said what and where the group is converging, then contribute a thought — to the humans or to the agent — without friction.

## 3. Design direction
- **Scene sentence:** *A mixed product team gathered around a grill at dusk — low ambient light, ember glow on focused faces, unhurried but alive — thinking out loud together.* Forces **dark**, not light. Warmth is firelight against char, not a beige page.
- **Color strategy: Committed.** Charcoal/char ground (near-black, faint warm tint — justified because the environment IS the brand: a grill). The **ember crimson is the singular brand voice = the agent / the fire.** A lighter amber-flame accent carries highlights and secondary state. **Human authors get a small set of distinct warm-neutral tints** so attribution never borrows the ember — that color belongs to the agent. Dodges the cream/beige AI default: warmth lives in the glow, not the surface.
- **Palette anchor (OKLCH, direction not final tokens):**
  - Primary / ember (agent): `oklch(0.564 0.231 29)` — the brand seed, hue 29°.
  - Ground / char: near-black charcoal, very low warm tint (~chroma 0.01, hue ~40).
  - Surface: char lifted slightly toward ink for panels/turns.
  - Ink: warm off-white (low chroma toward warm).
  - Accent / flame: lighter amber-gold (~`oklch(0.80 0.14 70)`) for highlights, links, secondary state.
  - Human author tints: small distinct warm-neutral set, none competing with the ember.
  - Constraints: ink ≥7:1 vs ground; white text on ember/amber fills; attribution never by color alone.
- **Anchor references:** (1) **Linear dark mode** — chrome restraint, one accent doing all the state work; (2) **A24 / MUBI** — confident near-black grounds, mature warmth, never cute; (3) the literal **cast-iron grill at ember dusk** — warm light glowing against dark; (4) **Helvetica Now Display** (committed, `ui/font/`) as the type voice.
- **Type:** one family — Helvetica Now Display across weights. No display/body pairing. Fixed rem scale (product), ~1.125–1.2 ratio.

## 4. Scope
**Static mockup only — mid-fi visual exploration.** No real interaction, no live streaming, no fully-hardened error handling. Build the *look* of the **core chat surface**: shared transcript, composer, multi-human attribution, agent-vs-human turn distinction, plus empty and active states shown statically. One coherent screen. Not a single isolated component; not the whole app shell. All files under `/ui`.

## 5. Layout strategy
**A shared transcript, not a bubble chat.** Bubbles-left-right is iMessage/generic-AI-chat and breaks down with 3+ authors. Instead: a single full-width column of turns, attribution-led — each turn shows author identity (name + warm tint), the content, and idea-state. **The agent's turns are visually distinct** (ember-edged / faintly ember-lit) — it's the fire in the room. Minimal persistent chrome — thin presence indication, no Slack sidebar. Composer pinned at bottom, low and quiet.

## 6. Key states
Default (active conversation) · **Empty / first-open** (teach the room — what barbequeue is for) · single human + agent · **multi-human active** (attribution under load) · **agent thinking/streaming** (shown statically at this fidelity) · agent error/unreachable · presence (who's here now) · **idea-state** (fresh → "on the grill" → settled — the "cooked, not raw" principle) · long session (density/scroll).

## 7. Interaction model
*(Represented statically at this scope.)* Type & send; address the agent vs. the humans; agent streams a response with clear "is in the room" presence; signal convergence on an idea (the cooking metaphor); see who's present. 150–250ms state transitions; motion conveys state only — no page-load choreography.

## 8. Content requirements
Author names + tint/avatar; agent name & voice; composer placeholder; empty-state copy that teaches the room (not "no messages yet"); agent-thinking and error copy; idea-state labels. Realistic ranges: 1 human + agent up to ~5 authors; sessions from a few turns to long scrollback.

## 9. Recommended references for build
`layout.md` (transcript hierarchy/density), `colorize.md` (ember-on-char committed system + attribution tints), `animate.md` (agent presence + state transitions), `harden.md` (empty/multi-author edge states), `clarify.md` (empty-state and agent copy).

## 10. Anti-references (from PRODUCT.md)
Not Slack/Discord (chrome-heavy team chat) · not corporate SaaS (navy, safe rounded cards) · not playful/cartoonish (mascots, bouncy motion) · not generic AI chat (centered gray bubbles, sparkle icon) · not the cream/sand/terracotta warm-neutral default.
