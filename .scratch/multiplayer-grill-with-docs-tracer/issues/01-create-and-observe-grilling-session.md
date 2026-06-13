# Create And Observe A Grilling Session

Status: ready-for-agent

## Parent

.scratch/multiplayer-grill-with-docs-tracer/PRD.md

## What to build

Create the first end-to-end slice of the Barbequeue prototype: a Host can create a Grilling Session through the Codex Plugin prototype driver, receive an Invite Link, and open a Participant Room that observes the created session. This slice establishes the monorepo baseline, strict shared Session Event protocol, Hosted Service session creation, Durable Object-local persistence, Session Handle creation, and a minimal browser room view.

The goal is not a polished room or real synthesis. The goal is to prove that the Codex Plugin, Hosted Service, shared protocol, Durable Object session owner, and Participant Room can agree on one created session without exposing raw repository files.

## Acceptance criteria

- [ ] The project has a TypeScript workspace baseline for the Hosted Service, shared protocol, and Codex Plugin prototype driver.
- [ ] The shared protocol validates the initial `session.created` Session Event at runtime and rejects malformed payloads.
- [ ] The Hosted Service can create a Grilling Session through a public prototype API and persist the created Session Event in the per-session state owner.
- [ ] Session creation returns the session identifier, Invite Link information, host driver credential, and initial event cursor needed by the plugin prototype.
- [ ] The Codex Plugin prototype driver can create a session and store a local Session Handle containing enough information to resume later.
- [ ] A Participant Room opened from the Invite Link can load the current session projection and display that the session exists.
- [ ] Tests cover protocol validation, hosted session creation, Session Handle creation, and the room's ability to observe the created session through public behavior.

## Blocked by

None - can start immediately
