---
target: landing-pitch/src/main.tsx
total_score: 30
p0_count: 0
p1_count: 2
timestamp: 2026-06-13T14-27-22Z
slug: landing-pitch-src-main-tsx
---
# Impeccable Critique: landing-pitch

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Stage rail and reveal beats are clear; CTA destination depends on env URL. |
| 2 | Match System / Real World | 4 | Campfire/grill metaphor now matches product language without generic AI slogan. |
| 3 | User Control and Freedom | 3 | Keyboard/rail navigation exists; mobile long sections need compact content. |
| 4 | Consistency and Standards | 3 | Charcoal/ember system is consistent; QR/CTA now follows same structure. |
| 5 | Error Prevention | 3 | Reveal cards no longer clip; CTA buttons are explicit. |
| 6 | Recognition Rather Than Recall | 3 | Section progression is visible; QR panel labels the expected action. |
| 7 | Flexibility and Efficiency | 3 | Keyboard, dots, and beat controls support fast stage navigation. |
| 8 | Aesthetic and Minimalist Design | 3 | Hero and CTA are cleaner; remaining risk is large display type crowding on narrow phones. |
| 9 | Error Recovery | 2 | No runtime error states are needed for this deck, but external link failure is not handled. |
| 10 | Help and Documentation | 3 | Pitch narrative explains what to do; QR supports after-pitch action. |
| **Total** | | **30/40** | **Solid, with remaining polish mostly in responsive edge cases.** |

## Anti-Patterns Verdict

The prior CTA looked AI-generated because it leaned on a generic AI/HI slogan and lacked product-specific stakes. The revised CTA is more specific: bring the room, keep the repo local, scan after the pitch.

Deterministic scan found one real issue before fixes: a thick one-sided border used for the answer checkmark. That was removed. Remaining detector warnings are Helvetica false positives because Helvetica Now is explicitly required by DESIGN.md.

## Priority Issues Addressed

- **[P1] Reveal contribution cards clipped or felt misaligned**: Repositioned contributions to safe stage coordinates and verified bounding boxes against the stage rectangle.
- **[P1] CTA end section felt sloppy/generic**: Replaced the AI/HI lockup with a product-specific closing section, primary/secondary actions, and a QR panel.
- **[P2] Hero lost too much visual character**: Restored lightweight orbiting circle/square marks and slightly brightened the heat lens while preserving text contrast.
- **[P2] Next-peek copy was weaker than the campfire metaphor**: Replaced with “Welcome to your digital campfire”.
- **[P2] Detector side-tab warning**: Replaced CSS border-drawn checkmark with a text glyph.

## Persona Red Flags

**Pitch Viewer**: Needs to understand the product in seconds. The revised hero and CTA now carry the message without needing presenter explanation.

**Host Engineer**: Cares that repository access remains controlled. The CTA headline and reveal/outcome language now repeat this trust boundary clearly.

**Mobile Viewer**: The CTA was too tall after redesign. It was compacted and the QR was made responsive.

## Minor Observations

- The stage rail overlaps the far top-right on narrow mobile, but it does not block primary content.
- The current marketplace URL is local in development, so QR renders `127.0.0.1:5174` until env vars are set.

## Questions Skipped

The requested fixes were specific and implementation-ready, so no clarification was needed.
