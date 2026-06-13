---
name: barbequeue
description: Start, resume, and drive Barbequeue multiplayer grill-with-docs tracer sessions from Codex while keeping repo access local to the host-side Codex Plugin.
---

# Barbequeue

Use this skill when the user wants to run or prototype a Barbequeue Grilling Session from Codex.

## Current Prototype

The prototype driver is a local host-side session driver. It talks to the Hosted Service over HTTP, stores a local Session Handle, publishes deterministic Grilling Questions, performs fake host-gated synthesis, publishes Answer Candidates, and accepts outcomes after Session Consensus.

## Real Session Flow

For real participant discussions, do not complete the task from normal assistant reasoning.

1. Use `start_discussion` with the user's first question and a recommended answer.
2. Print the returned `inviteLink` clearly for the user.
3. Explain that the host stays in this Codex thread. Participants use the invite link.
4. Do not synthesize, summarize, decide, or accept an outcome until the user asks you to resume or `wait_for_contributions` reports `contributionCount > 0`.
5. On resume, prefer `advance_session`. It is the host control loop.
6. Only synthesize after participant Contributions exist.
7. Only accept an outcome after all participants have accepted or abstained, or objections have been dismissed with explicit host reasons.
8. After accepting the current answer, do not write a final answer unless the user says the grill is complete. Ask or publish the next one-question grill step with `advance_session` or `publish_next_question`, including a recommended answer.

If there are no participant contributions yet, the correct response is the invite link plus the current waiting status. Do not provide a "starting synthesis" or your own answer.

The core value proposition is the loop: one precise question, one recommended answer, participant pressure-test, accepted answer, then the next precise question. A Barbequeue session is not done after one accepted answer unless the host explicitly stops it.

## Host And Participant Roles

- The host stays in Codex. The host does not normally join the participant room or vote there.
- The participant room is for Participants to contribute, accept, abstain, or object.
- Host acceptance is `accept_outcome`, usually reached through `advance_session`.
- Participant objections are not discarded in the room. If the host decides an objection should not block the answer, call `dismiss_objection` with the participant id and an explicit reason. That reason becomes part of the Session Record.
- If `advance_session` returns `host_decision_required`, stop and ask the host whether to revise the answer or dismiss each objection with reasons.

When this plugin is installed in Codex, prefer the bundled MCP tools:

- `start_discussion` creates a hosted Grilling Session, publishes the first question plus recommended answer, returns the invite link, and then the assistant must stop.
- `create_session` creates a hosted Grilling Session and stores the local Session Handle.
- `resume_session` reconnects to the current session from the stored Session Handle.
- `session_status` reads participant count, contribution count, invite link, and the next host action.
- `wait_for_contributions` waits for participant Contributions before synthesis.
- `advance_session` advances the host loop: synthesize when ready, accept when consensus is ready, surface objections for host judgment, and optionally publish the next question.
- `publish_question` publishes a host-owned Grilling Question with a recommended answer.
- `publish_next_question` publishes the next question after the current one is accepted. Use the same participant room.
- `synthesize` performs fake local synthesis from participant Contributions and publishes an Answer Candidate. It must not be used before Contributions exist.
- `dismiss_objection` records a host dismissal reason for a participant Objection.
- `accept_outcome` publishes an accepted outcome when the Hosted Service allows it.
- `show_session` prints the current session projection.
- `run_demo` is only for synthetic smoke tests. Do not use it for real user-requested discussions.

The MCP tools default to `http://localhost:8787` for the Hosted Service unless a `baseUrl` argument is provided.

Run from the repository root:

```bash
pnpm --filter @barbequeue/codex-plugin barbequeue -- <command>
```

Useful commands:

- `create [baseUrl]` creates a hosted Grilling Session and stores a Session Handle.
- `start-discussion <question> [:: recommended answer]` creates a session and publishes the first question.
- `status` prints the current host-facing session status and invite link.
- `wait-for-contributions [timeoutMs]` waits for participant Contributions before synthesis.
- `advance [next question] [:: recommended answer]` advances the host loop and optionally publishes the next question.
- `publish-question [text]` publishes a deterministic Grilling Question.
- `next-question <question> [:: recommended answer]` publishes the next question after acceptance.
- `synthesize` performs fake local synthesis from Contributions and publishes an Answer Candidate.
- `accept` publishes an accepted outcome when the Hosted Service allows it.
- `resume` fetches events since the stored cursor and updates the Session Handle.
- `show` prints the current session projection.
- `demo [baseUrl]` runs the one-question tracer path using a synthetic Participant.

The Hosted Service must be running first, usually with:

```bash
pnpm dev:hosted-service
```

## Boundary Rules

- The Codex Plugin is the host-side session driver.
- Do not send raw repository files to the Hosted Service.
- Do not ask the Hosted Service to synthesize Answer Candidates.
- Do not apply Documentation Changes from the Hosted Service.
- Treat accepted outcomes as session resolutions, not repository writes.
