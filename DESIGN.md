<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: Barbequeue
description: Repo-grounded multiplayer grilling sessions — heat held in reserve, structure always visible.
---

# Design System: Barbequeue

## 1. Overview

**Creative North Star: "The Cold Forge"**

A forge is cool most of the time. It glows only at the instant metal is being
shaped — and that glow is the whole point. Barbequeue works the same way: calm,
neutral, instrumented surfaces where the structure of a decision is always legible,
and a single hot accent appears only at the moments that carry heat — an open
objection, an unresolved question, a stance that blocks consensus. The interface
stays out of the way so the *content* of the grill carries the tension.

The personality is **sharp, spirited, deliberate**. It borrows Linear's crisp,
opinionated, keyboard-first precision and 37signals' (HEY / Campfire) characterful,
deliberately anti-enterprise voice — confident and a little wry, never loud. Heat
lives in copy, in the one reserved accent, and in the few moments of
tension/resolution; never in decorative chrome.

This system explicitly rejects three things: the **corporate enterprise tool**
(heavy gray Jira/Confluence density, bureaucratic, joyless), the **generic SaaS
template** (cream/sand backgrounds, hero-metric blocks, identical icon+heading+text
card grids, gradient accents), and the **chat/Slack clone** (a message stream where
the structured consensus workflow dissolves into a flat feed).

**Key Characteristics:**
- Cool/neutral base; one hot accent on ≤10% of any screen, reserved for tension.
- Structure over stream: questions, contributions, answer candidates, and consensus
  state always read as distinct, ordered things.
- Flat and instrumented at rest; restrained motion that confirms state, never performs.
- One technical-sans superfamily (Helvetica Now Display + Now Text) carrying the whole hierarchy by weight and optical size.

## 2. Colors

A cool, near-neutral foundation with a single hot accent held in reserve. The
strategy is **Restrained**: the accent earns its rarity by marking only what carries
heat.

### Primary
- **Reserved Heat** (hot accent — ember/red-orange family, exact value `[to be resolved during implementation]`): The one hot color. Used on ≤10% of any screen, reserved for moments of tension — an active **Objection**, an unresolved **Grilling Question**, a blocking consensus state, a primary commit action. Its scarcity is what makes it read as heat.

### Neutral
- **Cool base** (`[to be resolved during implementation]`): Page and surface backgrounds. Cool/neutral, not warm — no cream, sand, or parchment.
- **Ink** (`[to be resolved during implementation]`): Primary text. Must clear ≥4.5:1 on the base; resist the urge to go light-gray "for elegance".
- **Muted** (`[to be resolved during implementation]`): Secondary text, metadata, timestamps. Still ≥4.5:1 for body-sized use.
- **Line** (`[to be resolved during implementation]`): Borders and dividers that carry the structure between workflow stages.

### Named Rules
**The Reserved Heat Rule.** The hot accent is forbidden as decoration. It appears only where there is real tension in the workflow — an open objection, a blocking stance, an unresolved question, the one primary action. If it's on more than ~10% of the screen, the forge is too hot; cool it down.

**The No-Warm-Neutral Rule.** Neutrals are cool, never cream/sand/parchment. Warmth in this product is the *accent's* job, released deliberately — not a default tint baked into the background.

## 3. Typography

**Display Font:** Helvetica Now Display (with system sans fallback: `-apple-system, "Segoe UI", Roboto, sans-serif`) — headlines and large text only
**Body Font:** Helvetica Now Text (same superfamily, the small-size optical cut) — body, labels, UI text
**Label/Mono Font:** `[a monospace to be chosen at implementation]` — for repo-grounded material (paths, identifiers, code excerpts in shared context)

**Character:** One neo-grotesque superfamily carries the entire hierarchy by weight and optical size, not by mixing typefaces. Helvetica Now Display (`ui/fonts/`, full Hairline → Black ramp + italics) sets the large display register; Helvetica Now Text (`ui/fonts/`, full ramp, web-ready woff2/woff) handles everything at reading size, where its wider spacing and sturdier forms stay legible. Contrast comes from weight, size, and optical cut — clean, fast, tool-like, no font-pairing fuss. *Implementation note:* switch from Display to Text at roughly the headline/title boundary (~20–24px); below that, always Text.

### Hierarchy
- **Display** (Now Display, Bold/ExtraBold, large clamp `[to be resolved]`, tight line-height): Session titles, room headers. Tighten letter-spacing no further than -0.04em.
- **Headline** (Now Display, Bold/Medium): Grilling question text — the thing the group is resolving.
- **Title** (Now Text or Now Display, Medium, ~20–24px boundary): Section labels, answer-candidate headers, participant names.
- **Body** (Now Text, Regular): Contributions, reasons, answer-candidate prose. Cap line length at 65–75ch.
- **Label** (Now Text, Medium, small, optional uppercase with restraint): Consensus state tags (pending / accepted / abstained / objected), metadata.

### Named Rules
**The One-Superfamily Rule.** Hierarchy is built from the Helvetica Now superfamily alone — Now Display for large text, Now Text at reading size. Do not introduce a third sans; if more contrast is needed, change weight or optical cut, not typeface.

## 4. Elevation

Flat by default. Motion is **Restrained** (state changes only), and depth follows:
surfaces sit on the cool base and are separated by **lines and spacing**, not by
shadow stacks. Depth and emphasis are conveyed by the structure of the workflow and
the reserved accent — not by floating cards.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Any shadow appears only as a brief response to direct interaction (a dragged item, an open menu, a focused control) — never as ambient decoration on resting cards.

## 5. Components

<!-- No components exist yet (pre-implementation). This section will be populated on the next /impeccable document scan-mode run, once ui/ has source. -->

## 6. Do's and Don'ts

### Do:
- **Do** keep the workflow structure visible: questions, contributions, answer candidates, and consensus state must always read as distinct, ordered things.
- **Do** reserve the hot accent for tension (objections, unresolved questions, blocking stances, the one primary action) and keep it on ≤10% of any screen.
- **Do** build the whole type hierarchy from the Helvetica Now superfamily — Now Display for large text, Now Text at reading size.
- **Do** keep neutrals cool and text contrast at ≥4.5:1 for body, ≥3:1 for large text.
- **Do** keep surfaces flat at rest; convey separation with lines and spacing.
- **Do** make raising and resolving an objection feel cheap and safe — it's the point of a grill.

### Don't:
- **Don't** make it look like a **corporate enterprise tool** — no heavy gray Jira/Confluence density, no bureaucratic, joyless chrome.
- **Don't** make it look like a **generic SaaS template** — no cream/sand/parchment backgrounds, no hero-metric blocks, no identical icon+heading+text card grids, no decorative gradient accents.
- **Don't** let the consensus workflow collapse into a **chat/Slack clone** — no undifferentiated message-stream feed.
- **Don't** use the hot accent decoratively, or on more than ~10% of a screen.
- **Don't** use warm default-tinted neutrals; warmth is the accent's job, released deliberately.
- **Don't** add ambient shadows to resting surfaces, or set body/UI text in Now Display (use Now Text below ~20–24px), or introduce a sans outside the Helvetica Now superfamily.
