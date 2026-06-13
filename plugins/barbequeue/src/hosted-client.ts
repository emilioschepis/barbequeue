import {
  type PluginEventPayload,
  type RoomEventPayload,
  type SessionProjection,
  type StoredSessionEvent,
  StoredSessionEventSchema
} from "@barbequeue/protocol";
import { z } from "zod";
import type { CreateSessionResponse, HostedClient, ParticipantHandle } from "./types";

const CreateSessionResponseSchema = z.object({
  sessionId: z.string().min(1),
  hostDriverId: z.string().min(1),
  hostDriverToken: z.string().min(1),
  inviteCode: z.string().min(1),
  inviteLink: z.string().min(1),
  cursor: z.number().int().nonnegative()
});

const ParticipantHandleSchema = z.object({
  participantId: z.string().min(1),
  participantCredential: z.string().min(1)
});

export class HttpHostedClient implements HostedClient {
  constructor(readonly baseUrl: string) {}

  async createSession(): Promise<CreateSessionResponse> {
    const response = await this.request("/api/sessions", {
      method: "POST",
      body: JSON.stringify({})
    });
    const body = CreateSessionResponseSchema.parse(await response.json());
    return { ...body, baseUrl: this.baseUrl };
  }

  async getProjection(sessionId: string): Promise<SessionProjection> {
    const response = await this.request(`/api/sessions/${sessionId}`);
    const body = z.object({ projection: z.unknown() }).parse(await response.json());
    return body.projection as SessionProjection;
  }

  async getEvents(sessionId: string, after: number): Promise<StoredSessionEvent[]> {
    const response = await this.request(`/api/sessions/${sessionId}/events?after=${after}`);
    const body = z.object({ events: z.array(StoredSessionEventSchema) }).parse(await response.json());
    return body.events;
  }

  async appendPluginEvent(
    sessionId: string,
    hostDriverToken: string,
    payload: PluginEventPayload
  ): Promise<StoredSessionEvent> {
    const response = await this.request(`/api/sessions/${sessionId}/plugin-events`, {
      method: "POST",
      headers: { authorization: `Bearer ${hostDriverToken}` },
      body: JSON.stringify({ payload })
    });
    const body = z.object({ event: StoredSessionEventSchema }).parse(await response.json());
    return body.event;
  }

  async joinParticipant(
    sessionId: string,
    displayName: string,
    inviteCode: string
  ): Promise<ParticipantHandle> {
    const response = await this.request(`/api/sessions/${sessionId}/join`, {
      method: "POST",
      body: JSON.stringify({ displayName, inviteCode })
    });
    return ParticipantHandleSchema.parse(await response.json());
  }

  async appendRoomEvent(
    sessionId: string,
    participantCredential: string,
    payload: RoomEventPayload
  ): Promise<StoredSessionEvent> {
    const response = await this.request(`/api/sessions/${sessionId}/room-events`, {
      method: "POST",
      body: JSON.stringify({ participantCredential, payload })
    });
    const body = z.object({ event: StoredSessionEventSchema }).parse(await response.json());
    return body.event;
  }

  private async request(path: string, init: RequestInit = {}): Promise<Response> {
    const response = await fetch(new URL(path, this.baseUrl), {
      ...init,
      headers: {
        "content-type": "application/json",
        ...init.headers
      }
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
    }
    return response;
  }
}
