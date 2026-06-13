# Publish A Host-Gated Fake Answer Candidate

Status: ready-for-agent

## Parent

.scratch/multiplayer-grill-with-docs-tracer/PRD.md

## What to build

Add the first host-gated Synthesis Request path. The Host triggers synthesis in the Codex Plugin prototype driver, the plugin reads the current Response Phase Contributions, produces deterministic fake synthesis locally, and publishes an Answer Candidate to the Hosted Service. The Participant Room displays the published Answer Candidate live.

This slice proves that Answer Candidate generation stays plugin-owned and that the Hosted Service stores and broadcasts the published artifact without running hosted synthesis.

## Acceptance criteria

- [ ] The shared protocol validates `answer_candidate.published` Session Events and rejects malformed payloads.
- [ ] The Codex Plugin prototype driver exposes an explicit host action that triggers deterministic fake synthesis.
- [ ] Fake synthesis reads the current Contributions through the session event/projection boundary rather than from private room UI state.
- [ ] The Hosted Service accepts Answer Candidate publication only through the plugin-owned lifecycle path.
- [ ] The Participant Room displays the current Answer Candidate live after publication.
- [ ] No Hosted Service endpoint performs synthesis or accepts raw repository files.
- [ ] Tests cover host-gated synthesis, Answer Candidate publication, room display, and the absence of hosted synthesis behavior.

## Blocked by

- .scratch/multiplayer-grill-with-docs-tracer/issues/03-submit-structured-contributions.md
