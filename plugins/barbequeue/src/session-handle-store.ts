import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { z } from "zod";
import type { SessionHandle } from "./types";

const SessionHandleSchema = z.object({
  baseUrl: z.string().url(),
  sessionId: z.string().min(1),
  hostDriverId: z.string().min(1),
  hostDriverToken: z.string().min(1),
  inviteCode: z.string().min(1),
  inviteLink: z.string().min(1),
  hostLink: z.string().min(1).optional(),
  cursor: z.number().int().nonnegative()
}).transform((handle) => ({
  ...handle,
  hostLink: handle.hostLink ?? new URL(
    `/host/${encodeURIComponent(handle.sessionId)}?token=${encodeURIComponent(handle.hostDriverToken)}`,
    handle.baseUrl
  ).toString()
}));

export function defaultHandlePath(cwd = process.cwd()): string {
  return resolve(cwd, ".barbequeue", "session-handle.json");
}

export async function readSessionHandle(path = defaultHandlePath()): Promise<SessionHandle> {
  const json = await readFile(path, "utf8");
  return SessionHandleSchema.parse(JSON.parse(json));
}

export async function writeSessionHandle(
  handle: SessionHandle,
  path = defaultHandlePath()
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(SessionHandleSchema.parse(handle), null, 2)}\n`);
}
