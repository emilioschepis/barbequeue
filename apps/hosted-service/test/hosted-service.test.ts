import {
  StoredSessionEventSchema,
  type PluginEventPayload,
  type RoomEventPayload,
  type SessionProjection,
  type StoredSessionEvent,
  projectSession
} from "@barbequeue/protocol";
import { describe, expect, it } from "vitest";
import worker from "../src/index";

type CreateSessionResponse = {
  sessionId: string;
  hostDriverId: string;
  hostDriverToken: string;
  inviteCode: string;
  inviteLink: string;
  cursor: number;
};

async function json<T>(response: Response): Promise<T> {
  expect(response.ok).toBe(true);
  return response.json<T>();
}

class FakeSession {
  private events: StoredSessionEvent[] = [];
  private hostDriverToken = "";
  private inviteCode = "";
  private participants = new Map<string, string>();

  async initSession(init: {
    sessionId: string;
    hostDriverId: string;
    hostDriverToken: string;
    inviteCode: string;
  }): Promise<SessionProjection> {
    this.hostDriverToken = init.hostDriverToken;
    this.inviteCode = init.inviteCode;
    this.append("plugin", { kind: "host", hostDriverId: init.hostDriverId }, {
      type: "session.created",
      sessionId: init.sessionId,
      hostDriverId: init.hostDriverId,
      inviteCode: init.inviteCode
    });
    return projectSession(this.events);
  }

  async getProjection(): Promise<SessionProjection> {
    return projectSession(this.events);
  }

  async getEvents(after = 0): Promise<StoredSessionEvent[]> {
    return this.events.filter((event) => event.cursor > after);
  }

  async appendPluginEvent(token: string, payload: PluginEventPayload): Promise<StoredSessionEvent> {
    if (token !== this.hostDriverToken) {
      throw new Error("Invalid host driver credential");
    }
    return this.append("plugin", { kind: "host", hostDriverId: "host-driver" }, payload);
  }

  async joinParticipant(displayName: string, inviteCode: string) {
    if (inviteCode !== this.inviteCode) {
      throw new Error("Invalid invite");
    }
    const participantId = crypto.randomUUID();
    const participantCredential = crypto.randomUUID();
    this.participants.set(participantId, participantCredential);
    this.append("room", { kind: "participant", participantId }, {
      type: "participant.joined",
      participantId,
      displayName
    });
    return { participantId, participantCredential };
  }

  async appendRoomEvent(participantCredential: string, payload: RoomEventPayload): Promise<StoredSessionEvent> {
    const participantId = "participantId" in payload ? payload.participantId : "";
    if (this.participants.get(participantId) !== participantCredential) {
      throw new Error("Invalid participant credential");
    }
    return this.append("room", { kind: "participant", participantId }, payload);
  }

  fetch(): Response {
    return new Response("fake websocket not used in contract tests", { status: 501 });
  }

  private append(
    source: "plugin" | "room",
    actor: StoredSessionEvent["actor"],
    payload: StoredSessionEvent["payload"]
  ): StoredSessionEvent {
    const event = StoredSessionEventSchema.parse({
      id: crypto.randomUUID(),
      cursor: this.events.length + 1,
      occurredAt: new Date().toISOString(),
      source,
      actor,
      payload
    }) as StoredSessionEvent;
    this.events.push(event);
    return event;
  }
}

class FakeSessionNamespace {
  private sessions = new Map<string, FakeSession>();

  getByName(name: string): FakeSession {
    const existing = this.sessions.get(name);
    if (existing) return existing;
    const session = new FakeSession();
    this.sessions.set(name, session);
    return session;
  }
}

function fakeEnv() {
  return { SESSIONS: new FakeSessionNamespace() } as never;
}

describe("Hosted Service HTTP contract", () => {
  it("creates a session and exposes the room projection", async () => {
    const env = fakeEnv();
    const created = await json<CreateSessionResponse>(await worker.fetch(
      new Request("http://example.com/api/sessions", {
        method: "POST",
        body: JSON.stringify({ title: "Prototype" }),
        headers: { "content-type": "application/json" }
      }),
      env
    ));

    expect(created.cursor).toBe(1);
    expect(created.inviteLink).toContain(`/room/${created.sessionId}`);

    const projection = await json<{ projection: { sessionId: string; lastCursor: number } }>(
      await worker.fetch(new Request(`http://example.com/api/sessions/${created.sessionId}`), env)
    );
    expect(projection.projection.sessionId).toBe(created.sessionId);
    expect(projection.projection.lastCursor).toBe(1);
  });

  it("runs the one-question event flow through public APIs", async () => {
    const env = fakeEnv();
    const created = await json<CreateSessionResponse>(await worker.fetch(
      new Request("http://example.com/api/sessions", {
        method: "POST",
        body: "{}",
        headers: { "content-type": "application/json" }
      }),
      env
    ));

    const pluginHeaders = {
      "content-type": "application/json",
      authorization: `Bearer ${created.hostDriverToken}`
    };

    await json(await worker.fetch(new Request(`http://example.com/api/sessions/${created.sessionId}/plugin-events`, {
      method: "POST",
      headers: pluginHeaders,
      body: JSON.stringify({
        payload: {
          type: "question.published",
          questionId: "question-1",
          text: "Who should generate answer candidates?"
        }
      })
    }), env));

    const participant = await json<{ participantId: string; participantCredential: string }>(
      await worker.fetch(new Request(`http://example.com/api/sessions/${created.sessionId}/join`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: "Marta", inviteCode: created.inviteCode })
      }), env)
    );

    await json(await worker.fetch(new Request(`http://example.com/api/sessions/${created.sessionId}/room-events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        participantCredential: participant.participantCredential,
        payload: {
          type: "contribution.submitted",
          contributionId: "contribution-1",
          participantId: participant.participantId,
          kind: "idea",
          text: "Keep synthesis in the Codex Plugin."
        }
      })
    }), env));

    await json(await worker.fetch(new Request(`http://example.com/api/sessions/${created.sessionId}/plugin-events`, {
      method: "POST",
      headers: pluginHeaders,
      body: JSON.stringify({
        payload: {
          type: "answer_candidate.published",
          answerCandidateId: "candidate-1",
          text: "The Codex Plugin generates answer candidates."
        }
      })
    }), env));

    await json(await worker.fetch(new Request(`http://example.com/api/sessions/${created.sessionId}/room-events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        participantCredential: participant.participantCredential,
        payload: {
          type: "consensus_state.changed",
          participantId: participant.participantId,
          state: "accepted"
        }
      })
    }), env));

    const accepted = await json<{ event: { payload: { type: string } } }>(
      await worker.fetch(new Request(`http://example.com/api/sessions/${created.sessionId}/plugin-events`, {
        method: "POST",
        headers: pluginHeaders,
        body: JSON.stringify({
          payload: {
            type: "outcome.accepted",
            outcomeId: "outcome-1",
            answerCandidateId: "candidate-1",
            text: "Accepted: the Codex Plugin generates answer candidates.",
            resolvedBy: "consensus",
            dismissedParticipantIds: []
          }
        })
      }), env)
    );

    expect(accepted.event.payload.type).toBe("outcome.accepted");

    const projection = await json<{ projection: { acceptedOutcome: { outcomeId: string }; contributions: unknown[] } }>(
      await worker.fetch(new Request(`http://example.com/api/sessions/${created.sessionId}`), env)
    );
    expect(projection.projection.acceptedOutcome.outcomeId).toBe("outcome-1");
    expect(projection.projection.contributions.length).toBe(1);
  });

  it("rejects hosted documentation writes", async () => {
    const env = fakeEnv();
    const created = await json<CreateSessionResponse>(await worker.fetch(
      new Request("http://example.com/api/sessions", {
        method: "POST",
        body: "{}",
        headers: { "content-type": "application/json" }
      }),
      env
    ));

    const response = await worker.fetch(new Request(
      `http://example.com/api/sessions/${created.sessionId}/documentation-changes`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: "Do not write docs from hosted service." })
      }
    ), env);

    expect(response.status).toBe(404);
  });
});
