import { projectSession, type StoredSessionEvent } from "@barbequeue/protocol";
import { describe, expect, it } from "vitest";
import { synthesizeFakeAnswerCandidate } from "../src/fake-synthesis";

function event(cursor: number, payload: StoredSessionEvent["payload"]): StoredSessionEvent {
  return {
    id: `event-${cursor}`,
    cursor,
    occurredAt: "2026-06-13T12:00:00.000Z",
    source: payload.type.startsWith("contribution") ? "room" : "plugin",
    actor: payload.type.startsWith("contribution")
      ? { kind: "participant", participantId: "participant-1" }
      : { kind: "host", hostDriverId: "host-1" },
    payload
  };
}

describe("fake synthesis", () => {
  it("synthesizes from the current response phase contributions", () => {
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
        text: "What should the tracer prove?"
      }),
      event(3, {
        type: "contribution.submitted",
        contributionId: "contribution-1",
        participantId: "participant-1",
        kind: "idea",
        text: "Prove live room updates."
      })
    ]);

    expect(synthesizeFakeAnswerCandidate(projection)).toContain("Prove live room updates.");
  });
});
