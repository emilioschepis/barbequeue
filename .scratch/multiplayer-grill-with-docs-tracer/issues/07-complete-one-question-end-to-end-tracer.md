# Complete One-Question End-To-End Tracer

Status: ready-for-agent

## Parent

.scratch/multiplayer-grill-with-docs-tracer/PRD.md

## What to build

Add the integrated demo and verification path for one complete Grilling Question lifecycle. A Host creates a session, shares an Invite Link, a Participant joins, the plugin publishes a Grilling Question, the Participant submits a Contribution, the Host triggers fake synthesis, the plugin publishes an Answer Candidate, Participants set Consensus States, the Host accepts the outcome, and both plugin and room clients can disconnect and resume from Session Events.

This slice turns the earlier pieces into a demoable tracer bullet that proves the product loop across Hosted Service, Participant Room, shared protocol, and Codex Plugin.

## Acceptance criteria

- [ ] A single documented command or script can run the prototype Hosted Service and Participant Room locally for the tracer flow.
- [ ] A single documented Codex Plugin prototype flow can create or resume a Grilling Session and drive the host-owned lifecycle actions.
- [ ] The tracer flow completes create, invite, join, publish question, contribute, synthesize, publish Answer Candidate, set consensus, accept outcome, disconnect, and resume.
- [ ] Participant Room updates during the tracer flow happen live without manual refresh.
- [ ] The final Session Record contains ordered Session Events for the whole one-question lifecycle.
- [ ] End-to-end tests or an equivalent automated verification exercise the full one-question tracer through public boundaries.
- [ ] The fake synthesis path remains isolated so it can later be replaced by real `grill-with-docs` integration without rewriting the Hosted Service.

## Blocked by

- .scratch/multiplayer-grill-with-docs-tracer/issues/06-resume-plugin-and-participant-room-from-event-cursor.md
