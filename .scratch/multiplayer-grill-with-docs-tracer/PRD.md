# PRD: Multiplayer grill-with-docs Tracer Bullet

Status: ready-for-agent

## Problem Statement

Barbequeue needs a working prototype that proves a multi-participant, repo-grounded grilling session can run across a host-side Codex Plugin and a Hosted Service without exposing raw repository files. The Host needs to start or resume a Grilling Session from Codex, invite Participants into a browser-based Participant Room, collect structured Contributions, synthesize Answer Candidates through the host-side session driver, reach Session Consensus, and advance the underlying skill.

The current repository has domain language and ADRs that define the intended boundaries, but it does not yet have an implementation. The immediate problem is to turn those decisions into a thin end-to-end tracer bullet that proves the platform/plugin contract before investing in polish, full auth, moderation, or the complete `grill-with-docs` agent loop.

## Solution

Build a minimal monorepo prototype with three product parts: a Hosted Service, a shared protocol package, and a Codex Plugin prototype driver. The Hosted Service runs on Cloudflare Workers with one Durable Object per Grilling Session. The Durable Object owns ordered Session Events, the current Participant Room projection, WebSocket broadcasts, and Durable Object-local persistence. The Codex Plugin remains the host-side session driver: it creates or resumes a session, publishes Grilling Questions, performs host-gated synthesis, publishes Answer Candidates, accepts outcomes after Session Consensus, and later integrates the real `grill-with-docs` workflow.

The first tracer bullet should use deterministic fake question and synthesis behavior. That keeps the earliest implementation focused on the hardest distributed boundary: event ordering, live Participant Room updates, structured Contributions, consensus state changes, Session Handle persistence, and Session Resume from an event cursor. Once that loop works end to end, fake synthesis can be replaced by the real underlying skill behavior.

## User Stories

1. As a Host, I want to start a Barbequeue Invocation from Codex, so that I can run a collaborative Grilling Session around a project decision.
2. As a Host, I want the Codex Plugin to create a hosted session for me, so that Participants can join without installing Codex.
3. As a Host, I want to receive an Invite Link after session creation, so that I can share the Participant Room with my team.
4. As a Host, I want the Codex Plugin to store a Session Handle locally, so that I can resume my host-side session driver role later.
5. As a Host, I want to resume an existing Grilling Session, so that a browser refresh, Codex restart, or network interruption does not discard the room state.
6. As a Host, I want the Codex Plugin to fetch Session Events since its last cursor, so that it can catch up after being offline.
7. As a Host, I want the Codex Plugin to publish a Grilling Question, so that Participants have one concrete challenge to resolve.
8. As a Host, I want the prototype to support a deterministic fake Grilling Question, so that the platform/plugin loop can be proven before real agent synthesis is integrated.
9. As a Host, I want to trigger a Synthesis Request explicitly, so that Answer Candidates are generated only when the Response Phase is ready.
10. As a Host, I want to publish an Answer Candidate from the Codex Plugin, so that Participants can evaluate the proposed resolution.
11. As a Host, I want to revise an Answer Candidate from the Codex Plugin, so that Contributions and Objections can be addressed before acceptance.
12. As a Host, I want to accept an outcome only after Session Consensus or an explicit exception, so that resolved answers are deliberate and auditable.
13. As a Host, I want accepted outcomes to remain distinct from Documentation Changes, so that not every session resolution writes to repository documentation.
14. As a Host, I want Documentation Changes to remain plugin-owned, so that repository edits stay local and host-reviewed.
15. As a Host, I want the Hosted Service to avoid raw repository files, so that Barbequeue can support collaboration without becoming a repository mirror.
16. As a Host, I want Host-Approved Context to be the only repo-derived material visible in the room, so that I control what crosses the hosted boundary.
17. As a Host, I want Participants to contribute asynchronously while the plugin is offline, so that useful room work can continue during interruptions.
18. As a Host, I want plugin-owned lifecycle actions to wait for the plugin, so that the Hosted Service cannot advance repo-grounded work on its own.
19. As a Participant, I want to join with an Invite Link and visible display name, so that I can participate without account setup.
20. As a Participant, I want to see the current Grilling Question immediately after joining, so that I know what the group is resolving.
21. As a Participant, I want the Participant Room to update live without refreshes, so that I can follow the session as it changes.
22. As a Participant, I want to reconnect and catch up from the latest Session Events, so that a temporary network issue does not lose my place.
23. As a Participant, I want to submit an Idea, so that my input can shape the Answer Candidate.
24. As a Participant, I want to submit a Clarifying Contribution, so that ambiguity can be surfaced without starting a side conversation.
25. As a Participant, I want to submit an Objection, so that a blocking concern prevents premature Session Consensus.
26. As a Participant, I want to abstain for the active Grilling Question, so that I can stop blocking progress when I have no useful input.
27. As a Participant, I want my Contributions to be visible immediately, so that the group can react to current information.
28. As a Participant, I want to see the current Answer Candidate, so that I can decide whether to accept, abstain, or object.
29. As a Participant, I want to see the Consensus Board, so that I understand whether the group has unresolved objections.
30. As a Participant, I want to change my Consensus State, so that my stance can reflect revisions to the Answer Candidate.
31. As a Participant, I want Objections to remain visible until resolved, withdrawn, or dismissed, so that blocking concerns are not silently lost.
32. As a Participant, I want dismissed Objections to remain in the Session Record with a reason, so that exception-based outcomes are transparent.
33. As a Participant, I want to see accepted outcomes, so that I know what the group resolved before the Host advances.
34. As a Participant, I want no separate free-form chat stream in v1, so that all input stays tied to the active Response Phase.
35. As a Participant, I want only published session artifacts and Host-Approved Context, so that I am not shown raw agent scratch context or private repo material.
36. As a prototype implementer, I want a strict shared Session Event protocol, so that the Hosted Service and Codex Plugin cannot silently disagree.
37. As a prototype implementer, I want runtime validation for inbound events, so that malformed plugin or room events fail early.
38. As a prototype implementer, I want one Durable Object per Grilling Session, so that event ordering, WebSocket broadcasts, and room projection have one coordinator.
39. As a prototype implementer, I want Durable Object-local persistence first, so that the tracer bullet avoids unnecessary global database setup.
40. As a prototype implementer, I want an event cursor on every persisted Session Event, so that plugin and browser clients can resume deterministically.
41. As a prototype implementer, I want the Participant Room to use WebSockets for live updates, so that users do not have to refresh.
42. As a prototype implementer, I want HTTP endpoints for creation, event append, and event catch-up, so that the Codex Plugin can stay simple during the tracer bullet.
43. As a prototype implementer, I want a small Vite participant room, so that UI work stays focused on the active Grilling Session.
44. As a prototype implementer, I want TypeScript across the Hosted Service, protocol package, and Codex Plugin, so that event types stay aligned.
45. As a prototype implementer, I want `pnpm` workspaces, so that the prototype can share protocol code without package drift.
46. As a future implementer, I want fake question and synthesis behavior isolated behind the same boundaries as real synthesis, so that replacing it with `grill-with-docs` does not rewrite the Hosted Service.
47. As a future implementer, I want host authentication deferred but not contradicted, so that the prototype can ship quickly while leaving room for v1 recovery and deletion controls.
48. As a future implementer, I want global session indexing deferred, so that D1 or another global database is added only when host identity and cross-session workflows require it.

## Implementation Decisions

- The prototype is a monorepo with separate Hosted Service, shared protocol, and Codex Plugin areas. This follows ADR-0016.
- The Hosted Service targets Cloudflare Workers and Durable Objects. This follows ADR-0014.
- Each Grilling Session is coordinated by a single per-session state owner. This follows ADR-0013.
- Prototype persistence is Durable Object-local first. Session Events and the current room projection live with the per-session state owner until v1 host auth requires global session indexing. This follows ADR-0015.
- The Codex Plugin is the host-side session driver. It owns repo access, local Session Handles, question lifecycle, synthesis, accepted outcomes, and Documentation Changes.
- The Hosted Service owns shared room state: Invite Links, Participant Room access, Participants, Contributions, Consensus States, Answer Candidates as published artifacts, accepted outcomes, and Session Records.
- Answer Candidate generation happens in the Codex Plugin, not the Hosted Service. This follows ADR-0007.
- The Codex Plugin is authoritative for the Grilling Question lifecycle. The Hosted Service records published lifecycle events and room-owned events. This follows ADR-0008.
- Participants use structured Contributions only: Idea, Clarifying Contribution, Objection, or abstention. There is no separate free-form chat stream in v1. This follows ADR-0009.
- Participant Contributions become visible immediately to other Consensus Members.
- Synthesis Context remains private to the Codex Plugin and agent unless specific material is published as Host-Approved Context.
- Synthesis and advancement are host-gated. The Hosted Service does not automatically synthesize Answer Candidates or advance questions. This follows ADR-0010.
- The platform/plugin synchronization boundary is ordered Session Events. This follows ADR-0011.
- The Participant Room receives live updates over WebSockets and uses cursor-based event catch-up after reconnect.
- The Codex Plugin may use HTTP endpoints for prototype simplicity, but its state must still be cursor-based and resumable.
- Session Resume is required before multi-host takeover. This follows ADR-0012.
- A Session Handle is the local host-side reference used by the Codex Plugin to resume its driver role.
- For the prototype, host authority comes from the Session Handle and host driver credential. Provider-specific host auth remains deferred under ADR-0004.
- Participant identity is session-scoped and display-name based. Participant accounts are out of scope for the prototype.
- Objections block Session Consensus until the Answer Candidate is revised, the participant changes stance, or the Host dismisses the Objection with a recorded reason.
- Accepted Outcomes do not automatically become Documentation Changes. Documentation behavior remains governed by the underlying skill's rules.
- Documentation Changes are plugin-owned. If previewed in the Participant Room, they are published shared artifacts, not hosted write actions.
- The first tracer bullet uses deterministic fake question and synthesis behavior before integrating real `grill-with-docs`.
- The minimum prototype event types are `session.created`, `participant.joined`, `question.published`, `contribution.submitted`, `answer_candidate.published`, `consensus_state.changed`, and `outcome.accepted`.
- The shared protocol uses strict runtime-validated discriminated Session Events from the first prototype.
- Unknown event types and malformed event payloads are protocol errors.
- The minimum Hosted Service API surface includes session creation, plugin event append, room event append, events-since-cursor, current room projection read, and participant join.
- The Hosted Service must not expose synthesis or documentation endpoints.
- The first vertical slice should prove that a Participant can open an Invite Link and see a Grilling Question arrive live from the Codex Plugin.

## Testing Decisions

- Test the highest useful seams: shared protocol validation, Hosted Service public API behavior, WebSocket Participant Room updates, Codex Plugin session-driver behavior, and end-to-end one-question tracer flow.
- Shared protocol tests should validate accepted Session Event shapes, rejected malformed events, unknown event rejection, cursor monotonicity assumptions, and compatibility between plugin-published and room-published events.
- Hosted Service tests should exercise session creation, participant join, ordered event append, events-since-cursor catch-up, current projection reads, and rejection of unauthorized lifecycle events.
- Durable Object tests should focus on external behavior: ordered Session Events, persisted projection, WebSocket broadcast, reconnect catch-up, and conflict handling when participant and plugin events arrive close together.
- Participant Room tests should verify visible behavior: join by Invite Link, live question display, structured Contribution submission, Answer Candidate display, Consensus Board updates, Objection state, and reconnect recovery.
- Codex Plugin prototype tests should verify create/resume, Session Handle persistence, cursor catch-up, hardcoded question publishing, fake synthesis from Contributions, Answer Candidate publishing, and accepted outcome publishing.
- End-to-end tests should run one complete Grilling Question lifecycle with at least one Participant: create session, join room, publish question, submit Contribution, synthesize, publish Answer Candidate, change Consensus State, accept outcome, reconnect, and verify no refresh is required for live room changes.
- Tests should assert product behavior and contract guarantees, not internal implementation details such as specific storage tables or private helper function names.
- There is no existing implementation test prior art in the repo yet, so new tests should establish conventions around the protocol package, Worker/Durable Object behavior, Participant Room behavior, and plugin driver behavior.
- The deterministic fake synthesis loop should be tested through the same public plugin/Hosted Service boundaries that real `grill-with-docs` will later use.

## Out of Scope

- Full provider-specific host authentication.
- Participant accounts or cross-session participant identity.
- Multi-host takeover.
- Hosted synthesis or hosted agent execution.
- Hosted repository access, raw repository file upload, or automatic repo sharing.
- Automatic Documentation Changes from every Accepted Outcome.
- Applying repository file changes from the Hosted Service.
- Free-form chat.
- Moderation beyond the existing Removed Participant concept.
- Multiple simultaneous active Grilling Questions.
- Rich documentation diff previews.
- D1 or another global database for cross-session indexing.
- Session dashboards, analytics, billing, or account administration.
- Self-hosting packaging beyond keeping the project open source.
- Replacing fake synthesis with full `grill-with-docs` integration in the first distributed-systems tracer pass.

## Further Notes

The testing seams for this PRD are the shared event protocol, the Hosted Service HTTP/WebSocket boundary, the Participant Room as a browser client, the Codex Plugin as host-side session driver, and the end-to-end one-question tracer bullet. These are new seams because the repository currently has documentation and ADRs but no implementation code.

The main delivery risk is schedule pressure. Convex would likely speed up generic realtime application development, but the accepted architecture favors Cloudflare Durable Objects because Barbequeue needs a per-session coordinator more than a reactive application database.

The implementation should keep fake synthesis behind the same boundaries intended for real synthesis. The purpose of the first tracer bullet is to prove Barbequeue's distributed collaboration contract, not to complete the final agent workflow.
