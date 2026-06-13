import {
  StoredSessionEventSchema,
  projectSession,
  validatePluginPayload,
  validateRoomPayload
} from "../src/index";
import { describe, expect, it } from "vitest";

function event(cursor: number, payload: unknown) {
  const eventPayload = payload as { type?: string; participantId?: string; hostDriverId?: string };
  const source = eventPayload.type === "participant.joined" ||
    eventPayload.type === "contribution.submitted" ||
    (eventPayload.type === "consensus_state.changed" && eventPayload.participantId)
    ? "room"
    : "plugin";
  return StoredSessionEventSchema.parse({
    id: `event-${cursor}`,
    cursor,
    occurredAt: "2026-06-13T12:00:00.000Z",
    source,
    actor:
      source === "plugin"
        ? { kind: "host", hostDriverId: "host-1" }
        : { kind: "participant", participantId: eventPayload.participantId ?? "participant-1" },
    payload
  });
}

describe("session event protocol", () => {
  it("accepts known plugin and room payloads", () => {
    expect(validatePluginPayload({
      type: "question.published",
      questionId: "question-1",
      text: "What should own answer generation?",
      recommendedAnswer: "The host-side Codex Plugin should own answer generation."
    }).type).toBe("question.published");

    expect(validateRoomPayload({
      type: "contribution.submitted",
      contributionId: "contribution-1",
      participantId: "participant-1",
      kind: "idea",
      text: "Keep generation host-side."
    }).type).toBe("contribution.submitted");

    expect(validatePluginPayload({
      type: "consensus_state.changed",
      hostDriverId: "host-1",
      state: "accepted"
    }).type).toBe("consensus_state.changed");
  });

  it("rejects unknown event types and malformed objections", () => {
    expect(() => validatePluginPayload({ type: "message.sent", body: "no chat" })).toThrow();
    expect(() => validateRoomPayload({
      type: "consensus_state.changed",
      participantId: "participant-1",
      state: "objected"
    })).toThrow();
  });

  it("keeps objected candidates from being accepted", () => {
    const projection = projectSession([
      event(1, {
        type: "session.created",
        sessionId: "session-1",
        hostDriverId: "host-1",
        inviteCode: "invite-1"
      }),
      event(2, {
        type: "question.published",
        questionId: "question-1",
        text: "Question",
        recommendedAnswer: "Answer"
      }),
      event(3, {
        type: "participant.joined",
        participantId: "participant-1",
        displayName: "Marta"
      }),
      event(4, {
        type: "answer_candidate.published",
        answerCandidateId: "candidate-1",
        text: "Answer"
      }),
      event(5, {
        type: "consensus_state.changed",
        hostDriverId: "host-1",
        state: "accepted"
      }),
      event(6, {
        type: "consensus_state.changed",
        participantId: "participant-1",
        state: "objected",
        reason: "Needs explicit boundary."
      }),
      event(7, {
        type: "objection.dismissed",
        participantId: "participant-1",
        reason: "Boundary is documented."
      })
    ]);

    expect(projection.canAcceptOutcome).toBe(false);
    expect(projection.sessionLog.at(-1)).toMatchObject({
      source: "plugin",
      title: "Host dismissed Marta's objection.",
      body: "Boundary is documented."
    });

    const accepted = projectSession([
      ...[
        event(1, {
          type: "session.created",
          sessionId: "session-1",
          hostDriverId: "host-1",
          inviteCode: "invite-1"
        }),
        event(2, {
          type: "question.published",
          questionId: "question-1",
          text: "Question"
        }),
        event(3, {
          type: "participant.joined",
          participantId: "participant-1",
          displayName: "Marta"
        }),
        event(4, {
          type: "answer_candidate.published",
          answerCandidateId: "candidate-1",
          text: "Answer"
        })
      ],
        event(5, {
          type: "consensus_state.changed",
          hostDriverId: "host-1",
          state: "accepted"
        }),
        event(6, {
          type: "consensus_state.changed",
          participantId: "participant-1",
          state: "accepted"
      })
    ]);

    expect(accepted.canAcceptOutcome).toBe(true);
    expect(accepted.sessionLog.at(-1)).toMatchObject({
      source: "room",
      title: "Marta marked consensus as accepted."
    });
  });

  it("projects ended sessions as closed for voting", () => {
    const projection = projectSession([
      event(1, {
        type: "session.created",
        sessionId: "session-1",
        hostDriverId: "host-1",
        inviteCode: "invite-1"
      }),
      event(2, {
        type: "question.published",
        questionId: "question-1",
        text: "Question"
      }),
      event(3, {
        type: "participant.joined",
        participantId: "participant-1",
        displayName: "Marta"
      }),
      event(4, {
        type: "answer_candidate.published",
        answerCandidateId: "candidate-1",
        text: "Answer"
      }),
      event(5, {
        type: "consensus_state.changed",
        hostDriverId: "host-1",
        state: "accepted"
      }),
      event(6, {
        type: "consensus_state.changed",
        participantId: "participant-1",
        state: "accepted"
      }),
      event(7, {
        type: "session.ended",
        reason: "Enough context was accepted."
      })
    ]);

    expect(projection.sessionEnded).toMatchObject({
      reason: "Enough context was accepted.",
      cursor: 7
    });
    expect(projection.canAcceptOutcome).toBe(false);
    expect(projection.sessionLog.at(-1)).toMatchObject({
      source: "plugin",
      title: "Host ended the session.",
      body: "Enough context was accepted."
    });
  });

  it("does not allow host-only consensus to accept an outcome", () => {
    const projection = projectSession([
      event(1, {
        type: "session.created",
        sessionId: "session-1",
        hostDriverId: "host-1",
        inviteCode: "invite-1"
      }),
      event(2, {
        type: "question.published",
        questionId: "question-1",
        text: "Question",
        recommendedAnswer: "Answer"
      }),
      event(3, {
        type: "answer_candidate.published",
        answerCandidateId: "candidate-1",
        text: "Answer"
      }),
      event(4, {
        type: "consensus_state.changed",
        hostDriverId: "host-1",
        state: "accepted"
      })
    ]);

    expect(projection.canAcceptOutcome).toBe(false);
  });

  it("projects recommended answers and resets the current round when the next question is published", () => {
    const projection = projectSession([
      event(1, {
        type: "session.created",
        sessionId: "session-1",
        hostDriverId: "host-1",
        inviteCode: "invite-1"
      }),
      event(2, {
        type: "question.published",
        questionId: "question-1",
        text: "First question",
        recommendedAnswer: "First recommended answer"
      }),
      event(3, {
        type: "participant.joined",
        participantId: "participant-1",
        displayName: "Marta"
      }),
      event(4, {
        type: "contribution.submitted",
        contributionId: "contribution-1",
        participantId: "participant-1",
        kind: "idea",
        text: "First contribution"
      }),
      event(5, {
        type: "answer_candidate.published",
        answerCandidateId: "candidate-1",
        text: "First answer"
      }),
      event(6, {
        type: "consensus_state.changed",
        hostDriverId: "host-1",
        state: "accepted"
      }),
      event(7, {
        type: "consensus_state.changed",
        participantId: "participant-1",
        state: "abstained"
      }),
      event(8, {
        type: "outcome.accepted",
        outcomeId: "outcome-1",
        answerCandidateId: "candidate-1",
        text: "First answer",
        resolvedBy: "consensus",
        dismissedParticipantIds: []
      }),
      event(9, {
        type: "question.published",
        questionId: "question-2",
        text: "Second question",
        recommendedAnswer: "Second recommended answer"
      })
    ]);

    expect(projection.currentQuestion?.text).toBe("Second question");
    expect(projection.currentQuestion?.recommendedAnswer).toBe("Second recommended answer");
    expect(projection.rounds).toHaveLength(2);
    expect(projection.rounds[0]?.question.text).toBe("First question");
    expect(projection.rounds[0]?.answerCandidates.at(-1)?.text).toBe("First answer");
    expect(projection.rounds[0]?.acceptedOutcome?.text).toBe("First answer");
    expect(projection.rounds[1]?.question.text).toBe("Second question");
    expect(projection.rounds[1]?.acceptedOutcome).toBeUndefined();
    expect(projection.contributions).toHaveLength(0);
    expect(projection.answerCandidates).toHaveLength(0);
    expect(projection.acceptedOutcome).toBeUndefined();
    expect(projection.sessionLog.map((entry) => entry.title)).toContain("Host accepted the current answer.");
    expect(projection.sessionLog.at(-1)).toMatchObject({
      source: "plugin",
      title: "Host published a grilling question.",
      body: "Second question\n\nRecommended answer:\nSecond recommended answer"
    });
  });
});
