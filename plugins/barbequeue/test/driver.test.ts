import {
  applySessionEvent,
  emptyProjection,
  type PluginEventPayload,
  type RoomEventPayload,
  type SessionProjection,
  type StoredSessionEvent
} from "@barbequeue/protocol";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BarbequeueDriver } from "../src/driver";
import type { CreateSessionResponse, HostedClient, ParticipantHandle } from "../src/types";

class FakeHostedClient implements HostedClient {
  readonly handle: CreateSessionResponse = {
    baseUrl: "http://localhost:8787",
    sessionId: "session-1",
    hostDriverId: "host-1",
    hostDriverToken: "token-1",
    inviteCode: "invite-1",
    inviteLink: "http://localhost:8787/s/session-1?invite=invite-1",
    hostLink: "http://localhost:8787/host/session-1?token=token-1",
    cursor: 1
  };

  projection: SessionProjection = emptyProjection();

  appendedPluginEvents: PluginEventPayload[] = [];

  constructor() {
    this.projection = applySessionEvent(this.projection, this.event({
      type: "session.created",
      sessionId: this.handle.sessionId,
      hostDriverId: this.handle.hostDriverId,
      inviteCode: this.handle.inviteCode
    }));
  }

  async createSession(): Promise<CreateSessionResponse> {
    return this.handle;
  }

  async getProjection(): Promise<SessionProjection> {
    return this.projection;
  }

  async getEvents(): Promise<StoredSessionEvent[]> {
    return [];
  }

  async appendPluginEvent(
    _sessionId: string,
    _hostDriverToken: string,
    payload: PluginEventPayload
  ): Promise<StoredSessionEvent> {
    this.appendedPluginEvents.push(payload);
    const event = this.event(payload);
    this.projection = applySessionEvent(this.projection, event);
    return event;
  }

  async joinParticipant(): Promise<ParticipantHandle> {
    return {
      participantId: "participant-1",
      participantCredential: "credential-1"
    };
  }

  async appendRoomEvent(
    _sessionId: string,
    _participantCredential: string,
    payload: RoomEventPayload
  ): Promise<StoredSessionEvent> {
    const event = this.event(payload);
    this.projection = applySessionEvent(this.projection, event);
    return event;
  }

  private event(payload: StoredSessionEvent["payload"]): StoredSessionEvent {
    const cursor = this.projection.lastCursor + 1;
    const participantId = "participantId" in payload && payload.participantId
      ? payload.participantId
      : "participant-1";
    return {
      id: `event-${cursor}`,
      cursor,
      occurredAt: "2026-06-13T12:00:00.000Z",
      source: payload.type === "participant.joined" ||
        payload.type === "contribution.submitted" ||
        (payload.type === "consensus_state.changed" && "participantId" in payload)
        ? "room"
        : "plugin",
      actor: payload.type === "participant.joined" ||
        payload.type === "contribution.submitted" ||
        (payload.type === "consensus_state.changed" && "participantId" in payload)
        ? { kind: "participant", participantId }
        : { kind: "host", hostDriverId: this.handle.hostDriverId },
      payload
    };
  }
}

async function handlePath(): Promise<string> {
  return join(await mkdtemp(join(tmpdir(), "barbequeue-driver-test-")), "session-handle.json");
}

describe("BarbequeueDriver", () => {
  it("returns an invite link and waiting next action when starting a real discussion", async () => {
    const client = new FakeHostedClient();
    const driver = new BarbequeueDriver(client);

    const status = await driver.startDiscussion(
      "What should we discuss?",
      "We should discuss the highest-risk domain boundary first.",
      await handlePath()
    );

    expect(status.inviteLink).toBe(client.handle.inviteLink);
    expect(status.hostLink).toBe(client.handle.hostLink);
    expect(status.projection.currentQuestion?.recommendedAnswer).toBe(
      "We should discuss the highest-risk domain boundary first."
    );
    expect(status.hasAnswerCandidate).toBe(true);
    expect(status.contributionCount).toBe(0);
    expect(status.nextAction).toMatch(/wait for participant responses/i);
  });

  it("refuses to synthesize before participant contributions exist", async () => {
    const client = new FakeHostedClient();
    const driver = new BarbequeueDriver(client, client.handle);

    await expect(driver.synthesize(await handlePath())).rejects.toThrow(/No participant contributions/);
    expect(client.appendedPluginEvents).toHaveLength(0);
  });

  it("blocks the next question until the current question has an accepted outcome", async () => {
    const client = new FakeHostedClient();
    const driver = new BarbequeueDriver(client, client.handle);
    const path = await handlePath();

    await driver.publishQuestion("First?", "Recommended first answer.", path);
    await expect(
      driver.publishNextQuestion("Second?", "Recommended second answer.", path)
    ).rejects.toThrow(/Resolve the current question/);

    await client.appendRoomEvent(client.handle.sessionId, "credential-1", {
      type: "participant.joined",
      participantId: "participant-1",
      displayName: "Marta"
    });
    await client.appendRoomEvent(client.handle.sessionId, "credential-1", {
      type: "consensus_state.changed",
      participantId: "participant-1",
      state: "accepted"
    });
    await driver.setHostConsensus("accepted", undefined, path);
    await driver.acceptOutcome(path);

    const status = await driver.publishNextQuestion("Second?", "Recommended second answer.", path);

    expect(status.projection.currentQuestion?.text).toBe("Second?");
    expect(status.projection.currentQuestion?.recommendedAnswer).toBe("Recommended second answer.");
    expect(status.hasAnswerCandidate).toBe(true);
    expect(status.contributionCount).toBe(0);
    expect(status.nextAction).toMatch(/accept, object, or abstain/i);
  });

  it("advances by synthesizing once contributions exist", async () => {
    const client = new FakeHostedClient();
    const driver = new BarbequeueDriver(client, client.handle);
    const path = await handlePath();

    await driver.publishQuestion("First?", undefined, path);
    await client.appendRoomEvent(client.handle.sessionId, "credential-1", {
      type: "participant.joined",
      participantId: "participant-1",
      displayName: "Marta"
    });
    await client.appendRoomEvent(client.handle.sessionId, "credential-1", {
      type: "contribution.submitted",
      contributionId: "contribution-1",
      participantId: "participant-1",
      kind: "idea",
      text: "First contribution"
    });

    const result = await driver.advanceSession({}, path);

    expect(result.action).toBe("synthesized");
    expect(result.status.hasAnswerCandidate).toBe(true);
    expect(result.message).toMatch(/Wait for participant consensus/);
  });

  it("routes participant objections into Codex revision after everyone responds", async () => {
    const client = new FakeHostedClient();
    const driver = new BarbequeueDriver(client, client.handle);
    const path = await handlePath();

    await driver.publishQuestion("First?", "Recommended first answer.", path);
    await client.appendRoomEvent(client.handle.sessionId, "credential-1", {
      type: "participant.joined",
      participantId: "participant-1",
      displayName: "Marta"
    });
    await client.appendRoomEvent(client.handle.sessionId, "credential-1", {
      type: "consensus_state.changed",
      participantId: "participant-1",
      state: "objected",
      reason: "This misses the domain boundary."
    });
    await driver.setHostConsensus("accepted", undefined, path);

    const result = await driver.advanceSession({}, path);

    expect(result.action).toBe("revision_required");
    expect(result.message).toMatch(/Revise the answer candidate in Codex/i);
    expect(result.status.unresolvedObjections).toEqual([
      {
        memberKind: "participant",
        memberId: "participant-1",
        participantId: "participant-1",
        displayName: "Marta",
        reason: "This misses the domain boundary."
      }
    ]);
  });

  it("routes host objections into Codex revision after everyone responds", async () => {
    const client = new FakeHostedClient();
    const driver = new BarbequeueDriver(client, client.handle);
    const path = await handlePath();

    await driver.publishQuestion("First?", "Recommended first answer.", path);
    await client.appendRoomEvent(client.handle.sessionId, "credential-1", {
      type: "participant.joined",
      participantId: "participant-1",
      displayName: "Marta"
    });
    await client.appendRoomEvent(client.handle.sessionId, "credential-1", {
      type: "consensus_state.changed",
      participantId: "participant-1",
      state: "accepted"
    });
    await driver.setHostConsensus("objected", "This still weakens the entry model.", path);

    const result = await driver.advanceSession({}, path);

    expect(result.action).toBe("revision_required");
    expect(result.message).toMatch(/revise the answer candidate in Codex/i);
    expect(result.status.unresolvedObjections).toEqual([
      {
        memberKind: "host",
        memberId: "host-1",
        hostDriverId: "host-1",
        displayName: "Host",
        reason: "This still weakens the entry model."
      }
    ]);
  });

  it("publishes revised answer candidates and resets consensus states", async () => {
    const client = new FakeHostedClient();
    const driver = new BarbequeueDriver(client, client.handle);
    const path = await handlePath();

    await driver.publishQuestion("First?", "Recommended first answer.", path);
    await client.appendRoomEvent(client.handle.sessionId, "credential-1", {
      type: "participant.joined",
      participantId: "participant-1",
      displayName: "Marta"
    });
    await client.appendRoomEvent(client.handle.sessionId, "credential-1", {
      type: "consensus_state.changed",
      participantId: "participant-1",
      state: "accepted"
    });
    await driver.setHostConsensus("accepted", undefined, path);

    await driver.publishAnswerCandidate("Revised answer.", path);
    const status = await driver.status(path);

    const currentCandidate = status.projection.answerCandidates.find(
      (candidate) => candidate.answerCandidateId === status.projection.currentAnswerCandidateId
    );
    expect(currentCandidate?.text).toBe("Revised answer.");
    expect(status.projection.consensusStates).toEqual([]);
    expect(status.projection.canAcceptOutcome).toBe(false);
    expect(status.nextAction).toMatch(/accept, object, or abstain/i);
  });

  it("accepts consensus and publishes the supplied next question", async () => {
    const client = new FakeHostedClient();
    const driver = new BarbequeueDriver(client, client.handle);
    const path = await handlePath();

    await driver.publishQuestion("First?", "Recommended first answer.", path);
    await client.appendRoomEvent(client.handle.sessionId, "credential-1", {
      type: "participant.joined",
      participantId: "participant-1",
      displayName: "Marta"
    });
    await client.appendRoomEvent(client.handle.sessionId, "credential-1", {
      type: "consensus_state.changed",
      participantId: "participant-1",
      state: "accepted"
    });
    await driver.setHostConsensus("accepted", undefined, path);

    const result = await driver.advanceSession(
      {
        nextQuestion: "Second?",
        recommendedAnswer: "Recommended second answer."
      },
      path
    );

    expect(result.action).toBe("published_next_question");
    expect(result.status.projection.currentQuestion?.text).toBe("Second?");
    expect(result.status.projection.currentQuestion?.recommendedAnswer).toBe("Recommended second answer.");
    expect(result.status.hasAcceptedOutcome).toBe(false);
  });

  it("ends a session when the skill is done", async () => {
    const client = new FakeHostedClient();
    const driver = new BarbequeueDriver(client, client.handle);
    const path = await handlePath();

    await driver.publishQuestion("First?", "Recommended first answer.", path);
    const event = await driver.endSession("Enough accepted context.", path);
    const result = await driver.advanceSession({}, path);

    expect(event.payload).toMatchObject({
      type: "session.ended",
      reason: "Enough accepted context."
    });
    expect(result.action).toBe("session_ended");
    expect(result.status.hasSessionEnded).toBe(true);
    expect(result.status.projection.sessionEnded?.reason).toBe("Enough accepted context.");
  });
});
