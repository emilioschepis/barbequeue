# Resume Plugin And Participant Room From Event Cursor

Status: ready-for-agent

## Parent

.scratch/multiplayer-grill-with-docs-tracer/PRD.md

## What to build

Make Session Resume reliable for both the Codex Plugin prototype driver and Participant Room clients. The plugin persists a Session Handle and last seen cursor, resumes the existing Grilling Session after restart, catches up from ordered Session Events, and regains its host-side session driver role. Participant Room clients reconnect with a cursor and catch up without requiring a manual refresh.

While the plugin is absent, room-owned actions can continue, but plugin-owned lifecycle actions remain unavailable until the plugin resumes.

## Acceptance criteria

- [ ] The Codex Plugin prototype driver persists and reloads a Session Handle for an existing Grilling Session.
- [ ] The plugin stores and advances its last seen event cursor after reading Session Events.
- [ ] After restart, the plugin can resume from its Session Handle and reconstruct the current Grilling Question, Contributions, Answer Candidate, Consensus Board, and accepted outcome state.
- [ ] Participant Room clients reconnect with a last seen cursor and receive missed Session Events.
- [ ] Room-owned actions such as Contributions and Consensus State changes can continue while the plugin is offline.
- [ ] Plugin-owned lifecycle actions such as publishing questions, publishing Answer Candidates, and accepting outcomes are not available from the Hosted Service while the plugin is absent.
- [ ] Tests cover plugin restart/resume, browser reconnect catch-up, offline room-owned actions, and blocked plugin-owned lifecycle actions.

## Blocked by

- .scratch/multiplayer-grill-with-docs-tracer/issues/05-reach-session-consensus-and-accept-outcome.md
