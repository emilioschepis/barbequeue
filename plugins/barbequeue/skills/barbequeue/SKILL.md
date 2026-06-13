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
2. Print the returned `inviteLink` and `hostLink` clearly for the user.
3. Explain that `hostLink` is private for host facilitation controls, while Participants use only `inviteLink`.
4. Do not revise, decide, accept, or move to the next question until the user asks you to resume or participant responses exist.
5. On resume, prefer `advance_session`. It is the host control loop.
6. Treat the recommended answer as the first answer candidate. Only synthesize a revision when participant objections or notes require it.
7. Only accept an outcome after the host and all active participants have accepted or abstained. If anyone objects, revise the answer candidate and ask everyone to vote again.
8. After accepting the current answer, either publish the next one-question grill step with `advance_session` or `publish_next_question`, or call `end_session` when the skill has enough accepted information.

If there are no participant responses yet, the correct response is the invite link plus the current waiting status. Do not provide a "starting synthesis" or your own answer.

The core value proposition is the loop: one precise question, one recommended answer, participant pressure-test, accepted answer, then the next precise question. A Barbequeue session is not done after one accepted answer unless the skill decides it has enough information and ends the session.

## Host And Participant Roles

- The host uses the private host dashboard or `host_consensus` to set their own Consensus State. The host does not join the participant room.
- The participant room is for Participants to accept as-is, object with a reason, or abstain.
- Host acceptance of an answer candidate is `host_consensus state=accepted`; publishing the resolved Accepted Outcome is `accept_outcome`, usually reached through `advance_session`.
- Participant and host objections are revision input. Do not dismiss objections. If anyone objects, produce a revised candidate in Codex with `publish_answer_candidate`, and then stop for host and participant responses.
- If `advance_session` returns `revision_required`, use the objection reasons to revise the answer candidate. Publishing the revised candidate resets voting.
- Publishing an Answer Candidate resets Consensus States. The host and participants must vote again on the new candidate.
- Participants see host actions through the same live session projection: answer candidates, accepted outcomes, next questions, and session-ended state all appear in the room without refresh.

When this plugin is installed in Codex, prefer the bundled MCP tools:

- `start_discussion` creates a hosted Grilling Session, publishes the first question plus recommended answer, returns the participant invite link and private host dashboard link, and then the assistant must stop.
- `create_session` creates a hosted Grilling Session and stores the local Session Handle.
- `resume_session` reconnects to the current session from the stored Session Handle.
- `session_status` reads participant count, contribution count, invite link, host dashboard link, and the next host action.
- `wait_for_contributions` waits for participant responses before host action.
- `advance_session` advances the host loop: synthesize when ready, request revision when objections exist, accept when consensus is ready, and optionally publish the next question.
- `publish_question` publishes a host-owned Grilling Question with a recommended answer.
- `publish_next_question` publishes the next question after the current one is accepted. Use the same participant room.
- `synthesize` performs fake local synthesis from participant notes and publishes a revised Answer Candidate. It must not be used before participant input exists.
- `publish_answer_candidate` publishes a Codex-authored or Codex-revised Answer Candidate and resets Consensus States in the browsers.
- `host_consensus` records the host's own Consensus State for the current Answer Candidate.
- `accept_outcome` publishes an accepted outcome when the Hosted Service allows it.
- `end_session` ends the Grilling Session when the skill has enough accepted information.
- `show_session` prints the current session projection.
- `run_demo` is only for synthetic smoke tests. Do not use it for real user-requested discussions.

The MCP tools default to `http://localhost:8787` for the Hosted Service unless a `baseUrl` argument is provided.

Run from the repository root:

```bash
pnpm --filter @barbequeue/codex-plugin barbequeue -- <command>
```

Useful commands:

- `create [baseUrl]` creates a hosted Grilling Session and stores a Session Handle.
- `start-discussion <question> [:: recommended answer]` creates a session, publishes the first question, and prints both host and participant links.
- `status` prints the current host-facing session status, host link, and participant invite link.
- `wait-for-contributions [timeoutMs]` waits for participant Contributions before synthesis.
- `advance [next question] [:: recommended answer]` advances the host loop and optionally publishes the next question.
- `publish-question [text]` publishes a deterministic Grilling Question.
- `next-question <question> [:: recommended answer]` publishes the next question after acceptance.
- `synthesize` performs fake local synthesis from Contributions and publishes an Answer Candidate.
- `publish-answer-candidate <text>` publishes a Codex-revised Answer Candidate and resets votes.
- `host-consensus <state> [reason]` records the host's own Consensus State.
- `accept` publishes an accepted outcome when the Hosted Service allows it.
- `end-session [reason]` ends the Grilling Session when no further questions are needed.
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
