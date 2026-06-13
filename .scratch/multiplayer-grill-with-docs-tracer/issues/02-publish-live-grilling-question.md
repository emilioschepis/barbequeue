# Publish A Live Grilling Question

Status: ready-for-agent

## Parent

.scratch/multiplayer-grill-with-docs-tracer/PRD.md

## What to build

Extend the created Grilling Session so the Codex Plugin prototype driver can publish a deterministic Grilling Question and the Participant Room receives it live without a refresh. The Participant Room should also recover the same Grilling Question through cursor-based catch-up after reconnect.

This slice proves that plugin-published lifecycle events flow through the Hosted Service, are ordered by the per-session state owner, update the room projection, and broadcast to connected browser clients.

## Acceptance criteria

- [ ] The shared protocol validates `question.published` Session Events and rejects malformed or unknown event payloads.
- [ ] The Codex Plugin prototype driver can publish one deterministic Grilling Question to an existing Grilling Session.
- [ ] The Hosted Service persists the Grilling Question event with a monotonic event cursor.
- [ ] Connected Participant Room clients receive the Grilling Question live over WebSocket without manual refresh.
- [ ] A Participant Room client that reconnects with a previous cursor catches up and displays the current Grilling Question.
- [ ] The Hosted Service treats question publishing as a plugin-owned lifecycle event, not a participant-owned room event.
- [ ] Tests cover live delivery and reconnect catch-up through public protocol/API behavior.

## Blocked by

- .scratch/multiplayer-grill-with-docs-tracer/issues/01-create-and-observe-grilling-session.md
