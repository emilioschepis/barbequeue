# Submit Structured Contributions

Status: ready-for-agent

## Parent

.scratch/multiplayer-grill-with-docs-tracer/PRD.md

## What to build

Let Participants join a Grilling Session with a visible display name and submit structured Contributions during the active Response Phase. Supported Contributions are Idea, Clarifying Contribution, Objection, and abstention. Contributions should be visible immediately to all connected room clients and available to the Codex Plugin through event catch-up.

This slice intentionally does not add a free-form chat stream. It keeps all participant input tied to the active Grilling Question and recorded as ordered Session Events.

## Acceptance criteria

- [ ] The shared protocol validates `participant.joined` and `contribution.submitted` Session Events for all supported Contribution kinds.
- [ ] A Participant can join from an Invite Link with a visible display name and receive a session-scoped participant identity.
- [ ] The Participant Room can submit an Idea, Clarifying Contribution, Objection, and abstention against the active Grilling Question.
- [ ] Submitted Contributions are persisted as ordered Session Events and update the current room projection.
- [ ] Connected room clients see new Contributions immediately without refresh.
- [ ] The Codex Plugin prototype driver can fetch participant Contributions through events-since-cursor after being offline.
- [ ] There is no separate free-form chat input or event path.
- [ ] Tests cover participant join, each Contribution kind, immediate room visibility, and plugin catch-up.

## Blocked by

- .scratch/multiplayer-grill-with-docs-tracer/issues/02-publish-live-grilling-question.md
