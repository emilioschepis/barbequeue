# Product

## Register

product

## Users

Small, tight-knit software teams that work remotely or asynchronously and plan
with agent assistance around a shared repository (the **Target Team**).

Two roles in any grilling session:

- **Host** — starts the session, owns the repo-backed Codex environment, is the
  only one with repository access, participates in consensus, and advances the
  session once consensus is reached. Context: deep in a concrete plan or decision,
  wants the group to pressure-test it without losing control of the repo.
- **Participant** — invited via an invite link into a browser-based **Participant
  Room**; contributes ideas, abstentions, and objections without installing Codex
  or touching the host's repository. Context: dropping in for a focused decision,
  often on a different device, possibly async.

The job to be done: turn a half-formed plan into a group-owned decision that the
agent can write back into repo documentation — fast, on the record, no meeting.

## Product Purpose

Barbequeue extends the `grill-with-docs` workflow into a multiplayer experience: an
agent challenges a plan with **Grilling Questions**, the group resolves each one by
converging on an **Answer Candidate** with no unresolved **Objections**, and accepted
outcomes flow back into repository documentation.

It exists because repo-grounded planning is currently single-player. Barbequeue keeps
the underlying skill's question generation and documentation behavior, but adds
participant discussion and **Session Consensus** on top — without turning the hosted
room into a repository mirror (raw repo files stay in the host's environment; the
service only persists shared session material).

Success looks like: a team finishes a session with a recorded **Accepted Outcome** per
question, every objection either resolved or explicitly dismissed with a reason, and a
clean **Documentation Change** ready for host review — all without anyone scheduling a
call or exposing the repo.

## Brand Personality

**Sharp, spirited, deliberate.**

Lean into the "grill" metaphor — there is real heat in pressure-testing a plan — but
the heat lives in the *content*, not the chrome. Confident and a little playful, never
loud or gimmicky. The interface should make challenging a plan feel productive and
even satisfying, while keeping the gravity of a real decision being made.

Voice: direct, plain, a touch wry. It respects engineers' time and intelligence.
Emotional goal: the host feels in control; participants feel it's safe and cheap to
object; everyone trusts that the record is accurate.

## Anti-references

- **Corporate enterprise tool** — heavy gray Jira/Confluence density, bureaucratic
  chrome, joyless. Barbequeue is for tight teams, not approval workflows.
- **Generic SaaS template** — cream/sand backgrounds, hero-metric blocks, identical
  icon + heading + text card grids, decorative gradient accents. The 2026 AI default.
- **Chat / Slack clone** — a message-stream UI where the structured consensus workflow
  dissolves into an undifferentiated feed. The structure (questions → contributions →
  answer candidates → consensus) must stay legible, not collapse into chat.

## Design Principles

1. **Structure over stream.** The consensus workflow is the product. Questions,
   contributions, answer candidates, and consensus state must always read as distinct,
   ordered things — never a flat chat log.
2. **Make objecting cheap and safe.** Disagreement is the point of a grill. Lowering
   the cost and social friction of raising (and resolving) an **Objection** is a
   primary UX goal, not an edge case.
3. **The host holds the gavel.** The host advances the session, dismisses objections
   with a reason, and exposes context deliberately. Authority and its limits should be
   visible, never ambiguous.
4. **Show the record.** Outcomes, abstentions, dismissals, and reopened questions all
   persist in the **Session Record**. The UI should make the group trust that what
   happened is faithfully captured.
5. **Heat in the content, not the chrome.** Personality comes from copy, motion, and
   moments of tension/resolution — not from loud color or decoration competing with the
   decision being made.

## Accessibility & Inclusion

Baseline for v1 is light — ship the UI mock fast — but do not design choices that are
expensive to undo later:

- Keep color contrast and focus states sane enough to not require a rewrite.
- Build motion so a `prefers-reduced-motion` alternative can be added cleanly.

Revisit for full **WCAG 2.2 AA** (contrast, keyboard nav, semantic markup, reduced
motion) before real launch. Treat this section as a known debt, not a decision to skip
accessibility.
