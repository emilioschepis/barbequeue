<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: Barbequeue
description: Repo-grounded multiplayer grilling sessions — heat held in reserve, structure always visible.
---

# Design System: Barbequeue

## 1. Overview

**Creative North Star: "Charcoal & Ember"**

A grill at rest is dark warm charcoal. Heat lives in it as a steady ember glow — and
when something flares up, you see it instantly against the dark. Barbequeue works the
same way: dark warm-charcoal surfaces where the structure of a decision is always
legible, a restrained **ember** as the brand's steady glow (primary actions,
selection, focus), and distinct, louder **functional colors** that flare only where
meaning demands it — a green accept, a hot-red objection. The interface stays dark and
calm so the *content* of the grill carries the tension.

The personality is **sharp, spirited, deliberate**. It borrows Linear's crisp,
opinionated, keyboard-first precision and 37signals' (HEY / Campfire) characterful,
deliberately anti-enterprise voice — confident and a little wry, never loud. Heat
lives in copy, in the ember brand, and in the few functional flares of
tension/resolution; never in decorative chrome.

This system explicitly rejects three things: the **corporate enterprise tool**
(heavy gray Jira/Confluence density, bureaucratic, joyless), the **generic SaaS
template** (cream/sand backgrounds, hero-metric blocks, identical icon+heading+text
card grids, gradient accents), and the **chat/Slack clone** (a message stream where
the structured consensus workflow dissolves into a flat feed).

**Key Characteristics:**
- Dark warm-charcoal base; **ember** as the restrained brand glow; functional colors
  kept deliberately distinct from the brand so brand never reads as meaning.
- Structure over stream: questions, contributions, answer candidates, and consensus
  state always read as distinct, ordered things.
- Flat and instrumented at rest; restrained motion that confirms state, never performs.
  The one permitted glow is ember/objection heat — a signature, not decoration.
- One technical-sans superfamily (Helvetica Now Display + Now Text) carrying the whole hierarchy by weight and optical size.

## 2. Colors

A dark warm-charcoal foundation, a restrained **ember** brand, and a small set of
distinct **functional** colors. The strategy is **Restrained**: ember is the only
brand color and functional hues flare only where meaning demands. The defining move is
the split — **brand colors and functional colors must never be confused.**

### Primary (Brand)
- **Ember** (`oklch(0.68 0.115 48)`; bright `oklch(0.75 0.13 52)`, dim `oklch(0.50 0.09 45)`): The brand's steady glow. Used for primary actions (Advance, submit), current selection, focus rings, and links. Chroma is held **low on purpose** (~0.11) — a glowing coal, not an acid orange. White/near-white text on ember fills (verify ≥3:1 for button labels).

### Neutral (Charcoal)
- **Charcoal base** (`oklch(0.165 0.007 50)`): Page background. Dark warm-neutral — the grill at rest. This warmth is the brand's own; it is *not* the banned light cream/sand.
- **Surface** (`oklch(0.210 0.008 50)`) / **Surface-2** (`oklch(0.255 0.009 50)`): Panels, cards, inputs — raised by lightness, not shadow.
- **Line** (`oklch(0.32 0.011 50)`): Borders and dividers that carry the structure between workflow stages.
- **Ink** (`oklch(0.95 0.006 60)`): Primary text. Clears ≥7:1 on charcoal.
- **Muted** (`oklch(0.70 0.010 55)`): Secondary text, metadata, timestamps. ≥4.5:1 on charcoal.

### Functional (Semantic — deliberately not the brand)
- **Accepted** (`oklch(0.74 0.15 150)`, green): An accepted consensus state.
- **Objected** (`oklch(0.60 0.195 20)`, hot red): A blocking objection — redder and more saturated than ember, so it reads as alarm, never as brand. The one element permitted a subtle glow.
- **Clarify / Info** (`oklch(0.72 0.115 230)`, cool blue): Clarifying contributions and informational cues.
- **Abstained / Pending**: no hue — `muted` fill (abstained) or a hollow `line` outline (pending). Absence of color is itself the signal.

### Named Rules
**The Brand-Is-Not-Meaning Rule.** Ember is brand; it never encodes a consensus state. Functional colors (green/red/blue) encode meaning; they are never used decoratively or as brand. Keep them distinct in hue *and* saturation so a glance never mistakes a primary action for an accepted state.

**The Steady-Glow Rule.** Ember chroma stays ~0.11. If it starts to glow acid-bright, it's competing with the functional flares; pull it back. The only element allowed real glow (a soft shadow) is an active objection.

**The Dark-Warmth Rule.** The warm tint belongs to *dark* charcoal surfaces only. Light warm near-whites (cream/sand/parchment) remain banned — that warmth is the AI-default cliché; ours lives in the brand and the dark base, never a light background.

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
surfaces sit on the charcoal base and are separated by **lightness, lines, and
spacing**, not by shadow stacks. Depth and emphasis are conveyed by the structure of
the workflow and the ember brand — not by floating cards.

The one exception is **ember/objection glow**: an active objection (and, sparingly,
the primary ember action) may carry a soft colored shadow. That glow is the system's
signature — heat visible in the dark — not generic elevation.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Neutral shadows appear only as a brief response to direct interaction (an open menu, a focused control), never as ambient decoration on resting cards. The sole standing glow permitted is the ember/objection heat.

## 5. Components

<!-- No components exist yet (pre-implementation). This section will be populated on the next /impeccable document scan-mode run, once ui/ has source. -->

## 6. Do's and Don'ts

### Do:
- **Do** keep the workflow structure visible: questions, contributions, answer candidates, and consensus state must always read as distinct, ordered things.
- **Do** keep ember (brand) and functional colors strictly separate — ember for actions/selection/focus, functional hues for meaning only.
- **Do** keep ember restrained (chroma ~0.11); let the green/red functional flares be the saturated moments.
- **Do** build the whole type hierarchy from the Helvetica Now superfamily — Now Display for large text, Now Text at reading size.
- **Do** keep text contrast at ≥4.5:1 for body, ≥3:1 for large text on the charcoal base.
- **Do** keep surfaces flat at rest; convey separation with lightness, lines, and spacing.
- **Do** make raising and resolving an objection feel cheap and safe — it's the point of a grill.

### Don't:
- **Don't** make it look like a **corporate enterprise tool** — no heavy gray Jira/Confluence density, no bureaucratic, joyless chrome.
- **Don't** make it look like a **generic SaaS template** — no cream/sand/parchment backgrounds, no hero-metric blocks, no identical icon+heading+text card grids, no decorative gradient accents.
- **Don't** let the consensus workflow collapse into a **chat/Slack clone** — no undifferentiated message-stream feed.
- **Don't** encode a consensus state in ember, or use a functional color (green/red/blue) as decoration or brand.
- **Don't** use **light** warm-tinted neutrals (cream/sand/parchment); warmth lives only in the ember brand and the dark charcoal base.
- **Don't** add ambient neutral shadows to resting surfaces (the sole standing glow is ember/objection heat), set body/UI text in Now Display (use Now Text below ~20–24px), or introduce a sans outside the Helvetica Now superfamily.
