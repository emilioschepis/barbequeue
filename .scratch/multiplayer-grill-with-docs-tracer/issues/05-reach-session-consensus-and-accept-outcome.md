# Reach Session Consensus And Accept Outcome

Status: ready-for-agent

## Parent

.scratch/multiplayer-grill-with-docs-tracer/PRD.md

## What to build

Add the Session Consensus path for a published Answer Candidate. Participants can set their Consensus State, the Participant Room displays the Consensus Board, Objections block Session Consensus, and the Codex Plugin prototype driver can publish an accepted outcome only after consensus or an explicit dismissed-objection path.

This slice proves that accepted outcomes are deliberate Session Events and that blocking concerns are visible in the room and session record.

## Acceptance criteria

- [ ] The shared protocol validates `consensus_state.changed` and `outcome.accepted` Session Events.
- [ ] Participants can mark their Consensus State as pending, accepted, abstained, or objected with a reason for the current Answer Candidate.
- [ ] The Participant Room displays the Consensus Board from the current room projection.
- [ ] An unresolved Objection prevents ordinary Session Consensus.
- [ ] The Host can dismiss an Objection only with a recorded reason, and the dismissal remains visible in the Session Record.
- [ ] The Codex Plugin prototype driver can publish an accepted outcome after Session Consensus or after explicit exception handling.
- [ ] Accepted outcomes are displayed in the Participant Room.
- [ ] Tests cover consensus state changes, Objection blocking, dismissed Objections, accepted outcome publication, and room projection updates.

## Blocked by

- .scratch/multiplayer-grill-with-docs-tracer/issues/04-publish-host-gated-fake-answer-candidate.md
