import type {
  PluginEventPayload,
  RoomEventPayload,
  SessionProjection,
  StoredSessionEvent
} from "@barbequeue/protocol";

export interface SessionHandle {
  baseUrl: string;
  sessionId: string;
  hostDriverId: string;
  hostDriverToken: string;
  inviteCode: string;
  inviteLink: string;
  cursor: number;
}

export interface CreateSessionResponse extends SessionHandle {}

export interface ParticipantHandle {
  participantId: string;
  participantCredential: string;
}

export interface HostedClient {
  createSession(): Promise<CreateSessionResponse>;
  getProjection(sessionId: string): Promise<SessionProjection>;
  getEvents(sessionId: string, after: number): Promise<StoredSessionEvent[]>;
  appendPluginEvent(
    sessionId: string,
    hostDriverToken: string,
    payload: PluginEventPayload
  ): Promise<StoredSessionEvent>;
  joinParticipant(sessionId: string, displayName: string, inviteCode: string): Promise<ParticipantHandle>;
  appendRoomEvent(
    sessionId: string,
    participantCredential: string,
    payload: RoomEventPayload
  ): Promise<StoredSessionEvent>;
}
