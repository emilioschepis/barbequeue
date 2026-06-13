# Keep Documentation Changes Plugin-Owned

Status: ready-for-agent

## Parent

.scratch/multiplayer-grill-with-docs-tracer/PRD.md

## What to build

Add explicit prototype safeguards around the boundary between Accepted Outcomes and Documentation Changes. Accepted outcomes should remain session resolutions. Documentation Changes should remain plugin-owned, host-reviewed consequences of the underlying skill rules, not automatic Hosted Service behavior.

This slice keeps the tracer bullet from accidentally treating every accepted outcome as a repository write and verifies that the Hosted Service has no documentation write or synthesis authority.

## Acceptance criteria

- [ ] Accepted outcomes do not automatically create or apply Documentation Changes.
- [ ] The Hosted Service exposes no endpoint or room action that applies repository documentation changes.
- [ ] Any previewable documentation material shown in the Participant Room is represented as published shared session material, not as a hosted write action.
- [ ] The Codex Plugin prototype driver owns any documentation-change placeholder or preview behavior.
- [ ] Tests verify that accepting an outcome changes the Session Record but does not write repository documentation.
- [ ] Tests verify that hosted APIs reject or do not expose documentation write behavior.
- [ ] The tracer documentation makes clear that real Documentation Change generation belongs to later `grill-with-docs` integration.

## Blocked by

- .scratch/multiplayer-grill-with-docs-tracer/issues/07-complete-one-question-end-to-end-tracer.md
