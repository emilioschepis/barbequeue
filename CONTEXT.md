# Barbequeue

Barbequeue helps software teams run multi-participant, repo-grounded grilling sessions where an agent challenges a plan and the group contributes decisions together.

## Language

**Grilling Session**:
A structured, repo-grounded discussion where an agent challenges a plan with questions and participants contribute answers, abstentions, and objections.
_Avoid_: Brainstorm, meeting, interview

**Session Request**:
A host's request to start a grilling session for a concrete project decision or plan using the underlying skill.
_Avoid_: Command, prompt, meeting agenda

**Barbequeue Invocation**:
A session request addressed to Barbequeue as the primary experience, with the underlying skill applied inside the grilling session.
_Avoid_: Dual invocation, skill composition, slash command

**Host**:
The person who starts a grilling session, provides the repo-backed Codex environment, participates in consensus, and advances the session after consensus is reached.
_Avoid_: Owner, facilitator, moderator

**Participant**:
A person invited into a grilling session who can contribute answers, abstentions, and objections.
_Avoid_: Viewer, guest, attendee

**Removed Participant**:
A former participant whose earlier contributions remain in the session record but who can no longer contribute to the grilling session.
_Avoid_: Deleted user, banned user, kicked guest

**Participant Room**:
A browser-based space where participants join a grilling session without installing Codex or accessing the host's repository.
_Avoid_: Plugin client, viewer page, guest portal

**Invite Link**:
A host-created link that lets a person enter the participant room after providing a visible display name.
_Avoid_: Access token, login, meeting link

**Grilling Question**:
A single agent-authored challenge that the group resolves through contributions and answer candidates before the host advances the session.
_Avoid_: Prompt, topic, thread

**Sharpened Question**:
A grilling question whose wording has been clarified during the response phase while remaining the same question in the session record.
_Avoid_: New question, follow-up question, side question

**Response Phase**:
The period for a single grilling question during which the host and participants contribute ideas, abstain, or object to answer candidates.
_Avoid_: Round, voting window, discussion time

**Contribution**:
A host or participant's submitted idea, abstention, or objection during a response phase.
_Avoid_: Comment, message, reply

**Idea**:
A contribution that provides raw input for the agent to consider when proposing or revising an answer candidate.
_Avoid_: Answer, vote, decision

**Consensus State**:
A consensus member's current stance on an answer candidate: pending, accepted, abstained, or objected with a reason.
_Avoid_: Vote, answer, reaction

**Consensus Board**:
The participant room view of each consensus member's current consensus state for the active answer candidate.
_Avoid_: Poll, vote board, attendance list

**Clarifying Contribution**:
A contribution that surfaces ambiguity in the current grilling question or answer candidate without starting a separate agent conversation.
_Avoid_: Clarifying question, side thread, agent chat

**Objection**:
A contribution that blocks session consensus until its stated reason is addressed by a revised answer candidate or withdrawn.
_Avoid_: Downvote, rejection, veto

**Dismissed Objection**:
An objection that no longer blocks session consensus because the host explicitly dismissed it with a recorded reason.
_Avoid_: Ignored objection, override, deletion

**Shared Context**:
The session material visible to participants, limited to the transcript, grilling questions, contributions, accepted summaries, and any excerpts the host intentionally exposes.
_Avoid_: Repository context, workspace access, source view

**Host-Approved Context**:
Repo-derived material that the host intentionally adds to shared context for participants.
_Avoid_: Automatic repo sharing, source exposure, private setup context

**Session Record**:
The durable record of shared context, contributions, answer candidates, objections, abstentions, and outcomes from a grilling session.
_Avoid_: Repository snapshot, recording, chat history

**Synthesis Context**:
The structured session material given to the agent when it proposes or revises an answer candidate.
_Avoid_: Full transcript, prompt dump, raw room state

**Underlying Skill**:
The single-agent workflow that a grilling session extends with participant discussion and consensus.
_Avoid_: Backend skill, base prompt, agent mode

**Multiplayer grill-with-docs**:
The product shape where Barbequeue preserves the underlying skill's question generation and documentation behavior while adding participant discussion and session consensus.
_Avoid_: New grilling method, generic multiplayer Codex, meeting assistant

**Answer Candidate**:
An agent-authored proposed resolution to a grilling question that incorporates the group's contributions.
_Avoid_: Draft answer, proposal, response

**Accepted Outcome**:
An answer candidate that reached session consensus or was resolved through the session's explicit exception rules.
_Avoid_: Documentation change, final answer, decision record

**Documentation Change**:
A host-reviewed change to repository documentation proposed by the underlying skill after an accepted outcome.
_Avoid_: Accepted outcome, session note, transcript entry

**Session Consensus**:
The state where consensus members have no unresolved objections to the current answer candidate; abstentions are allowed.
_Avoid_: Global acceptance, unanimous agreement, vote

**Consensus Workflow**:
The core Barbequeue workflow where the group resolves each grilling question by converging on an answer candidate with no unresolved objections.
_Avoid_: Meeting, documentation workflow, voting process

**Target Team**:
A small, tight-knit software team that works remotely or asynchronously and uses agent-assisted planning around a shared repository.
_Avoid_: Enterprise buyer, workshop audience, generic meeting team

**Consensus Member**:
The host or an active participant for the current grilling question.
_Avoid_: Voter, approver, decision maker

**Active Participant**:
A participant currently present in the participant room who has not abstained for the current grilling question.
_Avoid_: Invitee, online user, respondent

**Unresolved by Abstention**:
The outcome of a grilling question when every consensus member abstains and no answer candidate is accepted.
_Avoid_: Skipped, passed, no decision

**Reopened Question**:
A previously resolved grilling question that the host explicitly returns to for a new response phase while preserving the earlier outcome in the session record.
_Avoid_: Edited answer, revision, rollback
