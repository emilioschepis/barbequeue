import { z } from "zod";

const NonEmptyString = z.string().min(1);

export const ContributionKindSchema = z.enum([
  "idea",
  "clarifying",
  "objection",
  "abstention"
]);

export const ConsensusStateSchema = z.enum([
  "pending",
  "accepted",
  "abstained",
  "objected"
]);

const ActorSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("host"), hostDriverId: NonEmptyString }),
  z.object({ kind: z.literal("participant"), participantId: NonEmptyString })
]);

const SessionCreatedSchema = z.object({
  type: z.literal("session.created"),
  sessionId: NonEmptyString,
  hostDriverId: NonEmptyString,
  inviteCode: NonEmptyString
});

const ParticipantJoinedSchema = z.object({
  type: z.literal("participant.joined"),
  participantId: NonEmptyString,
  displayName: NonEmptyString
});

const QuestionPublishedSchema = z.object({
  type: z.literal("question.published"),
  questionId: NonEmptyString,
  text: NonEmptyString,
  recommendedAnswer: NonEmptyString.optional()
});

const ContributionSubmittedSchema = z.object({
  type: z.literal("contribution.submitted"),
  contributionId: NonEmptyString,
  participantId: NonEmptyString,
  kind: ContributionKindSchema,
  text: z.string().optional()
});

const AnswerCandidatePublishedSchema = z.object({
  type: z.literal("answer_candidate.published"),
  answerCandidateId: NonEmptyString,
  text: NonEmptyString
});

const ConsensusStateChangedSchema = z.object({
  type: z.literal("consensus_state.changed"),
  participantId: NonEmptyString,
  state: ConsensusStateSchema,
  reason: z.string().optional()
});

const ObjectionDismissedSchema = z.object({
  type: z.literal("objection.dismissed"),
  participantId: NonEmptyString,
  reason: NonEmptyString
});

const OutcomeAcceptedSchema = z.object({
  type: z.literal("outcome.accepted"),
  outcomeId: NonEmptyString,
  answerCandidateId: NonEmptyString,
  text: NonEmptyString,
  resolvedBy: z.enum(["consensus", "dismissed-objection"]),
  dismissedParticipantIds: z.array(NonEmptyString).default([])
});

const SharedContextPublishedSchema = z.object({
  type: z.literal("shared_context.published"),
  contextId: NonEmptyString,
  label: NonEmptyString,
  body: NonEmptyString,
  contextKind: z.enum(["host-approved-context", "documentation-preview"])
});

const BaseSessionEventPayloadSchema = z.discriminatedUnion("type", [
  SessionCreatedSchema,
  ParticipantJoinedSchema,
  QuestionPublishedSchema,
  ContributionSubmittedSchema,
  AnswerCandidatePublishedSchema,
  ConsensusStateChangedSchema,
  ObjectionDismissedSchema,
  OutcomeAcceptedSchema,
  SharedContextPublishedSchema
]);

function validatePayloadRules(
  value: z.infer<typeof BaseSessionEventPayloadSchema>,
  ctx: z.RefinementCtx
): void {
  if (value.type === "contribution.submitted" && value.kind !== "abstention" && !value.text?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Non-abstention contributions require text",
      path: ["text"]
    });
  }
  if (value.type === "consensus_state.changed" && value.state === "objected" && !value.reason?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Objected consensus state requires a reason",
      path: ["reason"]
    });
  }
}

export const SessionEventPayloadSchema = BaseSessionEventPayloadSchema.superRefine(validatePayloadRules);

export const SessionEventSourceSchema = z.enum(["plugin", "room"]);

export const StoredSessionEventSchema = z.object({
  id: NonEmptyString,
  cursor: z.number().int().positive(),
  occurredAt: NonEmptyString,
  source: SessionEventSourceSchema,
  actor: ActorSchema,
  payload: SessionEventPayloadSchema
});

const BasePluginEventPayloadSchema = z.union([
  SessionCreatedSchema,
  QuestionPublishedSchema,
  AnswerCandidatePublishedSchema,
  ObjectionDismissedSchema,
  OutcomeAcceptedSchema,
  SharedContextPublishedSchema
]);

export const PluginEventPayloadSchema = BasePluginEventPayloadSchema.superRefine((value, ctx) => {
  validatePayloadRules(value, ctx);
});

const BaseRoomEventPayloadSchema = z.union([
  ParticipantJoinedSchema,
  ContributionSubmittedSchema,
  ConsensusStateChangedSchema
]);

export const RoomEventPayloadSchema = BaseRoomEventPayloadSchema.superRefine((value, ctx) => {
  validatePayloadRules(value, ctx);
});

export type ContributionKind = z.infer<typeof ContributionKindSchema>;
export type ConsensusState = z.infer<typeof ConsensusStateSchema>;
export type SessionCreatedPayload = z.infer<typeof SessionCreatedSchema>;
export type ParticipantJoinedPayload = z.infer<typeof ParticipantJoinedSchema>;
export type QuestionPublishedPayload = z.infer<typeof QuestionPublishedSchema>;
export type ContributionSubmittedPayload = z.infer<typeof ContributionSubmittedSchema>;
export type AnswerCandidatePublishedPayload = z.infer<typeof AnswerCandidatePublishedSchema>;
export type ConsensusStateChangedPayload = z.infer<typeof ConsensusStateChangedSchema>;
export type ObjectionDismissedPayload = z.infer<typeof ObjectionDismissedSchema>;
export type OutcomeAcceptedPayload = z.infer<typeof OutcomeAcceptedSchema>;
export type SharedContextPublishedPayload = z.infer<typeof SharedContextPublishedSchema>;
export type SessionEventPayload =
  | SessionCreatedPayload
  | ParticipantJoinedPayload
  | QuestionPublishedPayload
  | ContributionSubmittedPayload
  | AnswerCandidatePublishedPayload
  | ConsensusStateChangedPayload
  | ObjectionDismissedPayload
  | OutcomeAcceptedPayload
  | SharedContextPublishedPayload;
export type PluginEventPayload =
  | SessionCreatedPayload
  | QuestionPublishedPayload
  | AnswerCandidatePublishedPayload
  | ObjectionDismissedPayload
  | OutcomeAcceptedPayload
  | SharedContextPublishedPayload;
export type RoomEventPayload =
  | ParticipantJoinedPayload
  | ContributionSubmittedPayload
  | ConsensusStateChangedPayload;
export type SessionEventSource = z.infer<typeof SessionEventSourceSchema>;

export interface StoredSessionEvent {
  id: string;
  cursor: number;
  occurredAt: string;
  source: SessionEventSource;
  actor: z.infer<typeof ActorSchema>;
  payload: SessionEventPayload;
}

export interface ParticipantProjection {
  participantId: string;
  displayName: string;
}

export interface ContributionProjection {
  contributionId: string;
  participantId: string;
  kind: ContributionKind;
  text?: string;
  cursor: number;
}

export interface AnswerCandidateProjection {
  answerCandidateId: string;
  text: string;
  cursor: number;
}

export interface ConsensusProjection {
  participantId: string;
  state: ConsensusState;
  reason?: string;
  cursor: number;
}

export interface AcceptedOutcomeProjection {
  outcomeId: string;
  answerCandidateId: string;
  text: string;
  resolvedBy: "consensus" | "dismissed-objection";
  dismissedParticipantIds: string[];
  cursor: number;
}

export interface SharedContextProjection {
  contextId: string;
  label: string;
  body: string;
  contextKind: "host-approved-context" | "documentation-preview";
  cursor: number;
}

export interface SessionLogEntryProjection {
  cursor: number;
  occurredAt: string;
  source: SessionEventSource;
  title: string;
  body?: string;
}

export interface SessionProjection {
  sessionId?: string;
  inviteCode?: string;
  hostDriverId?: string;
  lastCursor: number;
  participants: ParticipantProjection[];
  currentQuestion?: { questionId: string; text: string; recommendedAnswer?: string; cursor: number };
  contributions: ContributionProjection[];
  answerCandidates: AnswerCandidateProjection[];
  currentAnswerCandidateId?: string;
  consensusStates: ConsensusProjection[];
  dismissedObjections: Array<{ participantId: string; reason: string; cursor: number }>;
  acceptedOutcome?: AcceptedOutcomeProjection;
  sharedContext: SharedContextProjection[];
  sessionLog: SessionLogEntryProjection[];
  canAcceptOutcome: boolean;
}

export function emptyProjection(): SessionProjection {
  return {
    lastCursor: 0,
    participants: [],
    contributions: [],
    answerCandidates: [],
    consensusStates: [],
    dismissedObjections: [],
    sharedContext: [],
    sessionLog: [],
    canAcceptOutcome: false
  };
}

export function validateStoredEvent(value: unknown): StoredSessionEvent {
  return StoredSessionEventSchema.parse(value) as StoredSessionEvent;
}

export function validatePluginPayload(value: unknown): PluginEventPayload {
  return PluginEventPayloadSchema.parse(value);
}

export function validateRoomPayload(value: unknown): RoomEventPayload {
  return RoomEventPayloadSchema.parse(value);
}

export function applySessionEvent(
  projection: SessionProjection,
  event: StoredSessionEvent
): SessionProjection {
  const next: SessionProjection = {
    ...projection,
    lastCursor: Math.max(projection.lastCursor, event.cursor),
    participants: [...projection.participants],
    contributions: [...projection.contributions],
    answerCandidates: [...projection.answerCandidates],
    consensusStates: [...projection.consensusStates],
    dismissedObjections: [...projection.dismissedObjections],
    sharedContext: [...projection.sharedContext],
    sessionLog: [...projection.sessionLog]
  };

  switch (event.payload.type) {
    case "session.created":
      next.sessionId = event.payload.sessionId;
      next.hostDriverId = event.payload.hostDriverId;
      next.inviteCode = event.payload.inviteCode;
      next.sessionLog.push(logEntry(event, "Host created the session."));
      break;
    case "participant.joined": {
      const payload = event.payload;
      if (!next.participants.some((p) => p.participantId === payload.participantId)) {
        next.participants.push({
          participantId: payload.participantId,
          displayName: payload.displayName
        });
      }
      next.sessionLog.push(logEntry(event, `${payload.displayName} joined the room.`));
      break;
    }
    case "question.published":
      next.currentQuestion = {
        questionId: event.payload.questionId,
        text: event.payload.text,
        ...(event.payload.recommendedAnswer ? { recommendedAnswer: event.payload.recommendedAnswer } : {}),
        cursor: event.cursor
      };
      next.contributions = [];
      next.answerCandidates = [];
      delete next.currentAnswerCandidateId;
      next.consensusStates = [];
      next.dismissedObjections = [];
      delete next.acceptedOutcome;
      next.sessionLog.push(logEntry(
        event,
        "Host published a grilling question.",
        event.payload.recommendedAnswer
          ? `${event.payload.text}\n\nRecommended answer:\n${event.payload.recommendedAnswer}`
          : event.payload.text
      ));
      break;
    case "contribution.submitted":
      next.contributions.push({
        contributionId: event.payload.contributionId,
        participantId: event.payload.participantId,
        kind: event.payload.kind,
        ...(event.payload.text ? { text: event.payload.text } : {}),
        cursor: event.cursor
      });
      next.sessionLog.push(logEntry(
        event,
        `${participantLabel(next, event.payload.participantId)} submitted ${event.payload.kind}.`,
        event.payload.text
      ));
      break;
    case "answer_candidate.published":
      next.answerCandidates.push({
        answerCandidateId: event.payload.answerCandidateId,
        text: event.payload.text,
        cursor: event.cursor
      });
      next.currentAnswerCandidateId = event.payload.answerCandidateId;
      next.consensusStates = [];
      next.dismissedObjections = [];
      delete next.acceptedOutcome;
      next.sessionLog.push(logEntry(event, "Host synthesized an answer candidate.", event.payload.text));
      break;
    case "consensus_state.changed": {
      const payload = event.payload;
      next.consensusStates = next.consensusStates.filter(
        (state) => state.participantId !== payload.participantId
      );
      next.consensusStates.push({
        participantId: payload.participantId,
        state: payload.state,
        ...(payload.reason ? { reason: payload.reason } : {}),
        cursor: event.cursor
      });
      next.sessionLog.push(logEntry(
        event,
        `${participantLabel(next, payload.participantId)} marked consensus as ${payload.state}.`,
        payload.reason
      ));
      break;
    }
    case "objection.dismissed":
      next.dismissedObjections.push({
        participantId: event.payload.participantId,
        reason: event.payload.reason,
        cursor: event.cursor
      });
      next.sessionLog.push(logEntry(
        event,
        `Host dismissed ${participantLabel(next, event.payload.participantId)}'s objection.`,
        event.payload.reason
      ));
      break;
    case "outcome.accepted":
      next.acceptedOutcome = {
        outcomeId: event.payload.outcomeId,
        answerCandidateId: event.payload.answerCandidateId,
        text: event.payload.text,
        resolvedBy: event.payload.resolvedBy,
        dismissedParticipantIds: event.payload.dismissedParticipantIds,
        cursor: event.cursor
      };
      next.sessionLog.push(logEntry(event, "Host accepted the current answer.", event.payload.text));
      break;
    case "shared_context.published":
      next.sharedContext.push({
        contextId: event.payload.contextId,
        label: event.payload.label,
        body: event.payload.body,
        contextKind: event.payload.contextKind,
        cursor: event.cursor
      });
      next.sessionLog.push(logEntry(event, `Host shared context: ${event.payload.label}.`, event.payload.body));
      break;
  }

  next.canAcceptOutcome = calculateCanAcceptOutcome(next);
  return next;
}

function logEntry(
  event: StoredSessionEvent,
  title: string,
  body?: string
): SessionLogEntryProjection {
  return {
    cursor: event.cursor,
    occurredAt: event.occurredAt,
    source: event.source,
    title,
    ...(body?.trim() ? { body } : {})
  };
}

function participantLabel(projection: SessionProjection, participantId: string): string {
  return projection.participants.find((participant) => participant.participantId === participantId)
    ?.displayName ?? participantId;
}

export function projectSession(events: StoredSessionEvent[]): SessionProjection {
  return events.reduce(
    (projection, event) => applySessionEvent(projection, validateStoredEvent(event)),
    emptyProjection()
  );
}

export function calculateCanAcceptOutcome(projection: SessionProjection): boolean {
  if (!projection.currentAnswerCandidateId || projection.participants.length === 0) {
    return false;
  }

  const dismissed = new Set(projection.dismissedObjections.map((item) => item.participantId));

  for (const participant of projection.participants) {
    const state = projection.consensusStates.find(
      (candidate) => candidate.participantId === participant.participantId
    );
    if (!state || state.state === "pending") {
      return false;
    }
    if (state.state === "objected" && !dismissed.has(participant.participantId)) {
      return false;
    }
  }

  return true;
}

export function assertPluginOwnedPayload(payload: SessionEventPayload): PluginEventPayload {
  return PluginEventPayloadSchema.parse(payload);
}

export function assertRoomOwnedPayload(payload: SessionEventPayload): RoomEventPayload {
  return RoomEventPayloadSchema.parse(payload);
}
