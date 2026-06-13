import { DurableObject } from "cloudflare:workers";
import {
  type PluginEventPayload,
  type RoomEventPayload,
  type SessionEventPayload,
  type StoredSessionEvent,
  StoredSessionEventSchema,
  assertPluginOwnedPayload,
  assertRoomOwnedPayload,
  projectSession,
  validatePluginPayload,
  validateRoomPayload
} from "@barbequeue/protocol";
import { z } from "zod";
import { renderRoomHtml } from "./room-html";

interface Env {
  SESSIONS: DurableObjectNamespace<SessionDurableObject>;
}

const CreateSessionSchema = z.object({
  title: z.string().min(1).optional()
});

const JoinParticipantSchema = z.object({
  displayName: z.string().min(1),
  inviteCode: z.string().min(1)
});

const AppendPluginEventSchema = z.object({
  payload: z.unknown()
});

const AppendRoomEventSchema = z.object({
  participantCredential: z.string().min(1),
  payload: z.unknown()
});

export { SessionDurableObject };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);

    try {
      if (request.method === "POST" && url.pathname === "/api/sessions") {
        return withCors(await createSession(request, env, url));
      }

      const sessionMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)(?:\/([^/]+))?$/);
      if (sessionMatch) {
        const sessionId = decodeURIComponent(sessionMatch[1] ?? "");
        const action = sessionMatch[2];
        const stub = env.SESSIONS.getByName(sessionId);

        if (request.method === "GET" && !action) {
          return withCors(Response.json({ projection: await stub.getProjection() }));
        }

        if (request.method === "GET" && action === "events") {
          const after = Number(url.searchParams.get("after") ?? "0");
          return withCors(Response.json({ events: await stub.getEvents(Number.isFinite(after) ? after : 0) }));
        }

        if (request.method === "POST" && action === "plugin-events") {
          const token = bearerToken(request);
          const body = AppendPluginEventSchema.parse(await readJson(request));
          const payload = validatePluginPayload(body.payload);
          return withCors(Response.json({ event: await stub.appendPluginEvent(token, payload) }));
        }

        if (request.method === "POST" && action === "join") {
          const body = JoinParticipantSchema.parse(await readJson(request));
          return withCors(Response.json(await stub.joinParticipant(body.displayName, body.inviteCode)));
        }

        if (request.method === "POST" && action === "room-events") {
          const body = AppendRoomEventSchema.parse(await readJson(request));
          const payload = validateRoomPayload(body.payload);
          return withCors(Response.json({ event: await stub.appendRoomEvent(body.participantCredential, payload) }));
        }

        if (request.method === "GET" && action === "ws") {
          return stub.fetch(request);
        }
      }

      const roomMatch = url.pathname.match(/^\/room\/([^/]+)$/);
      if (request.method === "GET" && roomMatch) {
        return html(renderRoomHtml(decodeURIComponent(roomMatch[1] ?? "")));
      }

      return withCors(Response.json({ error: "Not found" }, { status: 404 }));
    } catch (error) {
      return withCors(errorResponse(error));
    }
  }
} satisfies ExportedHandler<Env>;

async function createSession(request: Request, env: Env, url: URL): Promise<Response> {
  CreateSessionSchema.parse(await readJson(request).catch(() => ({})));
  const sessionId = crypto.randomUUID();
  const hostDriverId = crypto.randomUUID();
  const hostDriverToken = crypto.randomUUID();
  const inviteCode = crypto.randomUUID();
  const stub = env.SESSIONS.getByName(sessionId);
  const projection = await stub.initSession({ sessionId, hostDriverId, hostDriverToken, inviteCode });
  const inviteLink = `${url.origin}/room/${encodeURIComponent(sessionId)}?invite=${encodeURIComponent(inviteCode)}`;
  return Response.json({
    sessionId,
    hostDriverId,
    hostDriverToken,
    inviteCode,
    inviteLink,
    cursor: projection.lastCursor
  });
}

async function readJson(request: Request): Promise<unknown> {
  if (!request.body) return {};
  return request.json();
}

function bearerToken(request: Request): string {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) {
    throw new HttpError(401, "Missing host driver credential");
  }
  return match[1];
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "GET,POST,OPTIONS");
  headers.set("access-control-allow-headers", "content-type,authorization");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function html(body: string): Response {
  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}

function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    return Response.json({ error: "Validation failed", details: error.issues }, { status: 400 });
  }
  console.error(JSON.stringify({ level: "error", message: "Request failed", error: String(error) }));
  return Response.json({ error: "Internal Server Error" }, { status: 500 });
}

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

type SessionInit = {
  sessionId: string;
  hostDriverId: string;
  hostDriverToken: string;
  inviteCode: string;
};

type EventRow = { cursor: number; event_json: string };
type MetaRow = { value: string };
type ParticipantRow = { participant_id: string };

class SessionDurableObject extends DurableObject<Env> {
  private sockets = new Set<WebSocket>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.migrate();
    });
  }

  async initSession(init: SessionInit) {
    const existing = this.getAllEvents();
    if (existing.length > 0) {
      return projectSession(existing);
    }

    this.setMeta("sessionId", init.sessionId);
    this.setMeta("hostDriverId", init.hostDriverId);
    this.setMeta("hostDriverToken", init.hostDriverToken);
    this.setMeta("inviteCode", init.inviteCode);
    this.appendStoredEvent("plugin", { kind: "host", hostDriverId: init.hostDriverId }, {
      type: "session.created",
      sessionId: init.sessionId,
      hostDriverId: init.hostDriverId,
      inviteCode: init.inviteCode
    });
    return projectSession(this.getAllEvents());
  }

  async getProjection() {
    return projectSession(this.getAllEvents());
  }

  async getEvents(after = 0): Promise<StoredSessionEvent[]> {
    return this.ctx.storage.sql
      .exec<EventRow>("SELECT cursor, event_json FROM events WHERE cursor > ? ORDER BY cursor", after)
      .toArray()
      .map((row) => StoredSessionEventSchema.parse(JSON.parse(row.event_json)));
  }

  async appendPluginEvent(token: string, payload: PluginEventPayload): Promise<StoredSessionEvent> {
    this.assertHostDriver(token);
    assertPluginOwnedPayload(payload);
    if (payload.type === "session.created") {
      throw new HttpError(400, "Session creation is only allowed through session initialization");
    }
    if (payload.type === "outcome.accepted") {
      const projection = projectSession(this.getAllEvents());
      const dismissedParticipantIds = new Set(
        projection.dismissedObjections.map((objection) => objection.participantId)
      );
      const dismissedException =
        payload.resolvedBy === "dismissed-objection" &&
        payload.dismissedParticipantIds.length > 0 &&
        payload.dismissedParticipantIds.every((participantId) => dismissedParticipantIds.has(participantId));
      if (!projection.canAcceptOutcome && !dismissedException) {
        throw new HttpError(409, "Cannot accept outcome before session consensus");
      }
    }

    const event = this.appendStoredEvent("plugin", {
      kind: "host",
      hostDriverId: this.getRequiredMeta("hostDriverId")
    }, payload);
    this.broadcastEvent(event);
    return event;
  }

  async joinParticipant(displayName: string, inviteCode: string) {
    if (!timingSafeEqual(inviteCode, this.getRequiredMeta("inviteCode"))) {
      throw new HttpError(403, "Invalid invite link");
    }

    const participantId = crypto.randomUUID();
    const participantCredential = crypto.randomUUID();
    this.ctx.storage.sql.exec(
      "INSERT INTO participants (participant_id, credential) VALUES (?, ?)",
      participantId,
      participantCredential
    );

    const event = this.appendStoredEvent("room", { kind: "participant", participantId }, {
      type: "participant.joined",
      participantId,
      displayName
    });
    this.broadcastEvent(event);
    return { participantId, participantCredential };
  }

  async appendRoomEvent(participantCredential: string, payload: RoomEventPayload): Promise<StoredSessionEvent> {
    assertRoomOwnedPayload(payload);
    if (payload.type === "participant.joined") {
      throw new HttpError(400, "Participants must join through the join endpoint");
    }

    const participantId = "participantId" in payload ? payload.participantId : undefined;
    if (!participantId || !this.verifyParticipant(participantId, participantCredential)) {
      throw new HttpError(403, "Invalid participant credential");
    }

    const event = this.appendStoredEvent("room", { kind: "participant", participantId }, payload);
    this.broadcastEvent(event);
    return event;
  }

  async fetch(request: Request): Promise<Response> {
    const upgrade = request.headers.get("upgrade");
    if (upgrade !== "websocket") {
      return Response.json({ error: "Expected WebSocket upgrade" }, { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();
    this.sockets.add(server);
    server.addEventListener("close", () => this.sockets.delete(server));
    server.addEventListener("error", () => this.sockets.delete(server));

    const url = new URL(request.url);
    const after = Number(url.searchParams.get("after") ?? "0");
    server.send(JSON.stringify({
      type: "snapshot",
      projection: projectSession(this.getAllEvents().filter((event) => event.cursor > after ? true : true))
    }));

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  private migrate(): void {
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS events (
        cursor INTEGER PRIMARY KEY AUTOINCREMENT,
        event_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS participants (
        participant_id TEXT PRIMARY KEY,
        credential TEXT NOT NULL
      );
    `);
  }

  private appendStoredEvent(
    source: "plugin" | "room",
    actor: StoredSessionEvent["actor"],
    payload: SessionEventPayload
  ): StoredSessionEvent {
    const placeholder = "{}";
    const cursor = this.ctx.storage.sql
      .exec<{ cursor: number }>("INSERT INTO events (event_json) VALUES (?) RETURNING cursor", placeholder)
      .one().cursor;

    const event = StoredSessionEventSchema.parse({
      id: crypto.randomUUID(),
      cursor,
      occurredAt: new Date().toISOString(),
      source,
      actor,
      payload
    });

    this.ctx.storage.sql.exec(
      "UPDATE events SET event_json = ? WHERE cursor = ?",
      JSON.stringify(event),
      cursor
    );
    return event;
  }

  private getAllEvents(): StoredSessionEvent[] {
    return this.ctx.storage.sql
      .exec<EventRow>("SELECT cursor, event_json FROM events ORDER BY cursor")
      .toArray()
      .map((row) => StoredSessionEventSchema.parse(JSON.parse(row.event_json)));
  }

  private setMeta(key: string, value: string): void {
    this.ctx.storage.sql.exec(
      "INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)",
      key,
      value
    );
  }

  private getRequiredMeta(key: string): string {
    const row = this.ctx.storage.sql.exec<MetaRow>("SELECT value FROM meta WHERE key = ?", key).one();
    if (!row?.value) {
      throw new HttpError(404, "Session is not initialized");
    }
    return row.value;
  }

  private assertHostDriver(token: string): void {
    if (!timingSafeEqual(token, this.getRequiredMeta("hostDriverToken"))) {
      throw new HttpError(403, "Invalid host driver credential");
    }
  }

  private verifyParticipant(participantId: string, credential: string): boolean {
    const row = this.ctx.storage.sql
      .exec<ParticipantRow>(
        "SELECT participant_id FROM participants WHERE participant_id = ? AND credential = ?",
        participantId,
        credential
      )
      .one();
    return row?.participant_id === participantId;
  }

  private broadcastEvent(event: StoredSessionEvent): void {
    const message = JSON.stringify({ type: "event", event });
    for (const socket of this.sockets) {
      try {
        socket.send(message);
      } catch {
        this.sockets.delete(socket);
      }
    }
  }
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}
