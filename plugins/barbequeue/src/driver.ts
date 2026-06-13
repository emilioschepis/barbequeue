import type { PluginEventPayload, SessionProjection } from "@barbequeue/protocol";
import { DEFAULT_GRILLING_QUESTION, synthesizeFakeAnswerCandidate } from "./fake-synthesis";
import { HttpHostedClient } from "./hosted-client";
import { readSessionHandle, writeSessionHandle } from "./session-handle-store";
import type { HostedClient, SessionHandle } from "./types";

export interface SessionStatus {
  handle: SessionHandle;
  projection: SessionProjection;
  participantCount: number;
  contributionCount: number;
  unresolvedObjections: Array<{
    memberKind: "host" | "participant";
    memberId: string;
    participantId?: string;
    hostDriverId?: string;
    displayName?: string;
    reason?: string;
  }>;
  pendingParticipants: Array<{ participantId: string; displayName: string }>;
  pendingConsensusMembers: Array<{ memberKind: "host" | "participant"; memberId: string; displayName: string }>;
  hostConsensus?: { state: "pending" | "accepted" | "abstained" | "objected"; reason?: string };
  hasQuestion: boolean;
  hasAnswerCandidate: boolean;
  hasAcceptedOutcome: boolean;
  hasSessionEnded: boolean;
  inviteLink: string;
  hostLink: string;
  nextAction: string;
}

export interface AdvanceSessionResult {
  action:
    | "waiting_for_question"
    | "waiting_for_contributions"
    | "synthesized"
    | "waiting_for_consensus"
    | "revision_required"
    | "accepted_outcome"
    | "published_next_question"
    | "waiting_for_next_question"
    | "session_ended";
  status: SessionStatus;
  message: string;
}

export class BarbequeueDriver {
  constructor(
    private readonly client: HostedClient,
    private handle?: SessionHandle
  ) {}

  static async fromHandle(path?: string): Promise<BarbequeueDriver> {
    const handle = await readSessionHandle(path);
    return new BarbequeueDriver(new HttpHostedClient(handle.baseUrl), handle);
  }

  static forBaseUrl(baseUrl: string): BarbequeueDriver {
    return new BarbequeueDriver(new HttpHostedClient(baseUrl));
  }

  get sessionHandle(): SessionHandle | undefined {
    return this.handle;
  }

  async create(path?: string): Promise<SessionHandle> {
    const handle = await this.client.createSession();
    this.handle = handle;
    await writeSessionHandle(handle, path);
    return handle;
  }

  async startDiscussion(
    questionText = DEFAULT_GRILLING_QUESTION,
    recommendedAnswer?: string,
    path?: string
  ): Promise<SessionStatus> {
    await this.create(path);
    await this.publishQuestion(questionText, recommendedAnswer, path);
    return this.status(path);
  }

  async resume(path?: string): Promise<{ handle: SessionHandle; eventsRead: number; projection: SessionProjection }> {
    const handle = this.requireHandle();
    const events = await this.client.getEvents(handle.sessionId, handle.cursor);
    const projection = await this.client.getProjection(handle.sessionId);
    const nextHandle = { ...handle, cursor: projection.lastCursor };
    this.handle = nextHandle;
    await writeSessionHandle(nextHandle, path);
    return { handle: nextHandle, eventsRead: events.length, projection };
  }

  async publishQuestion(
    text = DEFAULT_GRILLING_QUESTION,
    recommendedAnswer?: string,
    path?: string
  ) {
    const handle = this.requireHandle();
    const projection = await this.client.getProjection(handle.sessionId);
    if (projection.sessionEnded) {
      throw new Error("The grilling session has ended.");
    }
    if (projection.currentQuestion && !projection.acceptedOutcome) {
      throw new Error("Resolve the current question before publishing the next grill question.");
    }

    const event = await this.appendPluginEvent({
      type: "question.published",
      questionId: crypto.randomUUID(),
      text,
      ...(recommendedAnswer?.trim() ? { recommendedAnswer } : {})
    });
    let cursor = event.cursor;
    if (recommendedAnswer?.trim()) {
      const candidateEvent = await this.appendPluginEvent({
        type: "answer_candidate.published",
        answerCandidateId: crypto.randomUUID(),
        text: recommendedAnswer
      });
      cursor = candidateEvent.cursor;
    }
    await this.updateCursor(cursor, path);
    return event;
  }

  async publishNextQuestion(
    text: string,
    recommendedAnswer: string | undefined,
    path?: string
  ): Promise<SessionStatus> {
    await this.publishQuestion(text, recommendedAnswer, path);
    return this.status(path);
  }

  async synthesize(path?: string) {
    const handle = this.requireHandle();
    const projection = await this.client.getProjection(handle.sessionId);
    if (projection.contributions.length === 0) {
      throw new Error(
        `No participant contributions yet. Share the invite link and wait before synthesis: ${handle.inviteLink}`
      );
    }
    const text = synthesizeFakeAnswerCandidate(projection);
    return this.publishAnswerCandidate(text, path);
  }

  async publishAnswerCandidate(text: string, path?: string) {
    if (!text.trim()) {
      throw new Error("Answer candidate text is required.");
    }
    const event = await this.appendPluginEvent({
      type: "answer_candidate.published",
      answerCandidateId: crypto.randomUUID(),
      text
    });
    await this.updateCursor(event.cursor, path);
    return event;
  }

  async setHostConsensus(
    state: "accepted" | "abstained" | "objected" | "pending",
    reason?: string,
    path?: string
  ) {
    const handle = this.requireHandle();
    const event = await this.appendPluginEvent({
      type: "consensus_state.changed",
      hostDriverId: handle.hostDriverId,
      state,
      ...(reason?.trim() ? { reason } : {})
    });
    await this.updateCursor(event.cursor, path);
    return event;
  }

  async acceptOutcome(path?: string) {
    const handle = this.requireHandle();
    const projection = await this.client.getProjection(handle.sessionId);
    const currentCandidate = projection.answerCandidates.find(
      (candidate) => candidate.answerCandidateId === projection.currentAnswerCandidateId
    );
    if (!currentCandidate) {
      throw new Error("No answer candidate has been published.");
    }
    const event = await this.appendPluginEvent({
      type: "outcome.accepted",
      outcomeId: crypto.randomUUID(),
      answerCandidateId: currentCandidate.answerCandidateId,
      text: currentCandidate.text,
      resolvedBy: "consensus",
      dismissedParticipantIds: []
    });
    await this.updateCursor(event.cursor, path);
    return event;
  }

  async endSession(reason?: string, path?: string) {
    const event = await this.appendPluginEvent({
      type: "session.ended",
      ...(reason?.trim() ? { reason } : {})
    });
    await this.updateCursor(event.cursor, path);
    return event;
  }

  async runDemo(path?: string) {
    const handle = this.handle ?? await this.create(path);
    await this.publishQuestion(
      DEFAULT_GRILLING_QUESTION,
      "Use the host-side Codex Plugin as the session driver while the Hosted Service owns ordered Session Events and live room updates.",
      path
    );
    const participant = await this.client.joinParticipant(handle.sessionId, "Prototype Participant", handle.inviteCode);
    await this.client.appendRoomEvent(handle.sessionId, participant.participantCredential, {
      type: "contribution.submitted",
      contributionId: crypto.randomUUID(),
      participantId: participant.participantId,
      kind: "idea",
      text: "Prove the distributed session contract before real agent synthesis."
    });
    await this.synthesize(path);
    await this.client.appendRoomEvent(handle.sessionId, participant.participantCredential, {
      type: "consensus_state.changed",
      participantId: participant.participantId,
      state: "accepted"
    });
    await this.setHostConsensus("accepted", undefined, path);
    const outcome = await this.acceptOutcome(path);
    const projection = await this.client.getProjection(handle.sessionId);
    await this.updateCursor(projection.lastCursor, path);
    return { handle: this.requireHandle(), outcome, projection };
  }

  async show(): Promise<SessionProjection> {
    const handle = this.requireHandle();
    return this.client.getProjection(handle.sessionId);
  }

  async status(path?: string): Promise<SessionStatus> {
    const { handle, projection } = await this.resume(path);
    return this.describeStatus(handle, projection);
  }

  async waitForContributions(
    options: { timeoutMs?: number; intervalMs?: number } = {},
    path?: string
  ): Promise<SessionStatus> {
    const timeoutMs = options.timeoutMs ?? 0;
    const intervalMs = options.intervalMs ?? 2000;
    const startedAt = Date.now();

    while (true) {
      const status = await this.status(path);
      if (status.contributionCount > 0 || status.projection.consensusStates.length > 0 || status.hasAcceptedOutcome) {
        return status;
      }

      if (timeoutMs <= 0 || Date.now() - startedAt >= timeoutMs) {
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  async advanceSession(
    options: { nextQuestion?: string; recommendedAnswer?: string } = {},
    path?: string
  ): Promise<AdvanceSessionResult> {
    const status = await this.status(path);

    if (status.hasSessionEnded) {
      return {
        action: "session_ended",
        status,
        message: "The grilling session is ended."
      };
    }

    if (!status.hasQuestion) {
      return {
        action: "waiting_for_question",
        status,
        message: "No grill question is active. Publish a question with a recommended answer."
      };
    }

    if (status.hasAcceptedOutcome) {
      if (options.nextQuestion?.trim()) {
        const nextStatus = await this.publishNextQuestion(
          options.nextQuestion,
          options.recommendedAnswer,
          path
        );
        return {
          action: "published_next_question",
          status: nextStatus,
          message: "Published the next grill question. Participants should continue in the same room URL."
        };
      }

      return {
        action: "waiting_for_next_question",
        status,
        message: "The current answer is accepted. Provide the next grill question and recommended answer, or stop the session."
      };
    }

    if (!status.hasAnswerCandidate && status.contributionCount === 0) {
      return {
        action: "waiting_for_contributions",
        status,
        message: "Waiting for participant responses."
      };
    }

    if (!status.hasAnswerCandidate) {
      await this.synthesize(path);
      return {
        action: "synthesized",
        status: await this.status(path),
        message: "Published an answer candidate from participant contributions. Wait for participant consensus."
      };
    }

    if (status.unresolvedObjections.length > 0 && status.pendingConsensusMembers.length === 0) {
      return {
        action: "revision_required",
        status,
        message: "Everyone has responded and at least one member objected. Revise the answer candidate in Codex and publish it for another vote."
      };
    }

    if (!status.projection.canAcceptOutcome) {
      return {
        action: "waiting_for_consensus",
        status,
        message: "Waiting for the host and every participant to accept, object, or abstain."
      };
    }

    await this.acceptOutcome(path);
    const acceptedStatus = await this.status(path);

    if (options.nextQuestion?.trim()) {
      const nextStatus = await this.publishNextQuestion(
        options.nextQuestion,
        options.recommendedAnswer,
        path
      );
      return {
        action: "published_next_question",
        status: nextStatus,
        message: "Accepted the current outcome and published the next grill question."
      };
    }

    return {
      action: "accepted_outcome",
      status: acceptedStatus,
      message: "Accepted the current outcome. Provide the next grill question and recommended answer, or stop the session."
    };
  }

  private async appendPluginEvent(payload: PluginEventPayload) {
    const handle = this.requireHandle();
    return this.client.appendPluginEvent(handle.sessionId, handle.hostDriverToken, payload);
  }

  private async updateCursor(cursor: number, path?: string): Promise<void> {
    const handle = this.requireHandle();
    const nextHandle = { ...handle, cursor };
    this.handle = nextHandle;
    await writeSessionHandle(nextHandle, path);
  }

  private requireHandle(): SessionHandle {
    if (!this.handle) {
      throw new Error("No Session Handle is loaded. Run create first or resume from a saved handle.");
    }
    return this.handle;
  }

  private describeStatus(handle: SessionHandle, projection: SessionProjection): SessionStatus {
    const contributionCount = projection.contributions.length;
    const hasQuestion = Boolean(projection.currentQuestion);
    const hasAnswerCandidate = Boolean(projection.currentAnswerCandidateId);
    const hasAcceptedOutcome = Boolean(projection.acceptedOutcome);
    const hasSessionEnded = Boolean(projection.sessionEnded);
    const hostConsensus = projection.consensusStates.find(
      (state) => state.memberKind === "host" && state.memberId === projection.hostDriverId
    );
    const unresolvedObjections = projection.consensusStates
      .filter((state) => state.state === "objected")
      .map((state) => {
        const displayName = projection.participants.find(
          (person) => person.participantId === state.participantId
        )?.displayName ?? (state.memberKind === "host" ? "Host" : undefined);
        return {
          memberKind: state.memberKind,
          memberId: state.memberId,
          ...(state.participantId ? { participantId: state.participantId } : {}),
          ...(state.hostDriverId ? { hostDriverId: state.hostDriverId } : {}),
          ...(displayName ? { displayName } : {}),
          ...(state.reason ? { reason: state.reason } : {})
        };
      });
    const pendingParticipants = projection.participants
      .filter((person) => {
        const state = projection.consensusStates.find(
          (item) => item.memberKind === "participant" && item.participantId === person.participantId
        );
        return !state || state.state === "pending";
      })
      .map((person) => ({ participantId: person.participantId, displayName: person.displayName }));
    const consensusMembers = [
      ...(projection.hostDriverId ? [{
        memberKind: "host" as const,
        memberId: projection.hostDriverId,
        displayName: "Host"
      }] : []),
      ...projection.participants.map((participant) => ({
        memberKind: "participant" as const,
        memberId: participant.participantId,
        displayName: participant.displayName
      }))
    ];
    const pendingConsensusMembers = consensusMembers.filter((member) => {
      const state = projection.consensusStates.find(
        (item) => item.memberKind === member.memberKind && item.memberId === member.memberId
      );
      return !state || state.state === "pending";
    });
    let nextAction = "Publish a question.";

    if (hasSessionEnded) {
      nextAction = "The grilling session is ended.";
    } else if (!hasQuestion) {
      nextAction = "Publish a question, then share the invite link.";
    } else if (!hasAnswerCandidate && contributionCount === 0) {
      nextAction = "Share the invite link and wait for participant objections or notes before synthesis.";
    } else if (!hasAnswerCandidate) {
      nextAction = "Synthesize an answer candidate from participant contributions.";
    } else if (projection.participants.length === 0) {
      nextAction = "Share the invite link and wait for participant responses.";
    } else if (unresolvedObjections.length > 0 && pendingConsensusMembers.length === 0) {
      nextAction = "All responses are in and at least one member objected. Revise the answer candidate in Codex and publish it for another vote.";
    } else if (unresolvedObjections.length > 0) {
      nextAction = "Wait for every member to respond, then revise the answer candidate in Codex.";
    } else if (!projection.canAcceptOutcome) {
      nextAction = "Wait for the host and participants to accept, object, or abstain.";
    } else if (!hasAcceptedOutcome) {
      nextAction = "Accept the outcome.";
    } else {
      nextAction = "Ask the next grilling question with a recommended answer, or stop the session if the design tree is complete.";
    }

    return {
      handle,
      projection,
      participantCount: projection.participants.length,
      contributionCount,
      unresolvedObjections,
      pendingParticipants,
      pendingConsensusMembers,
      ...(hostConsensus ? {
        hostConsensus: {
          state: hostConsensus.state,
          ...(hostConsensus.reason ? { reason: hostConsensus.reason } : {})
        }
      } : {}),
      hasQuestion,
      hasAnswerCandidate,
      hasAcceptedOutcome,
      hasSessionEnded,
      inviteLink: handle.inviteLink,
      hostLink: handle.hostLink,
      nextAction
    };
  }
}
