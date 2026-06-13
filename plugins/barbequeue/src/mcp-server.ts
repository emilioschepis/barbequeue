import { BarbequeueDriver } from "./driver";
import { defaultHandlePath } from "./session-handle-store";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type JsonRpcRequest = {
  jsonrpc?: "2.0";
  id?: string | number | null;
  method?: string;
  params?: unknown;
};

type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
};

const DEFAULT_BASE_URL = "http://localhost:8787";
const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const tools: ToolDefinition[] = [
  {
    name: "create_session",
    description: "Create a hosted Barbequeue Grilling Session, store a local Session Handle, and return the participant invite link.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "Hosted Service base URL.",
          default: DEFAULT_BASE_URL
        }
      }
    }
  },
  {
    name: "start_discussion",
    description: "Create a real hosted discussion, publish the question, return the participant invite link, then stop and wait for participants.",
    inputSchema: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "Question to publish for participants."
        },
        recommendedAnswer: {
          type: "string",
          description: "Host's recommended answer to use as the starting point for discussion."
        },
        baseUrl: {
          type: "string",
          description: "Hosted Service base URL.",
          default: DEFAULT_BASE_URL
        }
      }
    }
  },
  {
    name: "resume_session",
    description: "Resume the current Grilling Session from the stored Session Handle.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "session_status",
    description: "Read the live session status, participant count, contribution count, invite link, and next host action.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "wait_for_contributions",
    description: "Poll the live session until at least one participant contribution exists or the timeout elapses.",
    inputSchema: {
      type: "object",
      properties: {
        timeoutMs: {
          type: "number",
          description: "Maximum time to wait in milliseconds. Use 0 for a single status check.",
          default: 0
        },
        intervalMs: {
          type: "number",
          description: "Polling interval in milliseconds.",
          default: 2000
        }
      }
    }
  },
  {
    name: "advance_session",
    description: "Advance the host-driven grill loop: synthesize when ready, accept when consensus is ready, surface objections for host judgment, and optionally publish the next question.",
    inputSchema: {
      type: "object",
      properties: {
        nextQuestion: {
          type: "string",
          description: "Next grill question to publish after the current answer is accepted."
        },
        recommendedAnswer: {
          type: "string",
          description: "Recommended answer for the next grill question."
        }
      }
    }
  },
  {
    name: "publish_question",
    description: "Publish a host-owned Grilling Question with an optional recommended answer. Fails if the current question is unresolved.",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Question text. Uses the deterministic prototype question when omitted."
        },
        recommendedAnswer: {
          type: "string",
          description: "Host's recommended answer to use as the starting point for discussion."
        }
      }
    }
  },
  {
    name: "publish_next_question",
    description: "After the current question is accepted, publish the next one-question grill step with a recommended answer.",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Next question to ask participants."
        },
        recommendedAnswer: {
          type: "string",
          description: "Recommended answer to present with the next question."
        }
      },
      required: ["text"]
    }
  },
  {
    name: "synthesize",
    description: "Run host-gated synthesis from participant Contributions only. Fails when no participant contributions exist.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "dismiss_objection",
    description: "Dismiss a participant Objection with a recorded reason.",
    inputSchema: {
      type: "object",
      properties: {
        participantId: { type: "string" },
        reason: { type: "string" }
      },
      required: ["participantId", "reason"]
    }
  },
  {
    name: "accept_outcome",
    description: "Publish an accepted outcome after Session Consensus or a dismissed-objection exception.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "show_session",
    description: "Show the current session projection.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "run_demo",
    description: "Synthetic smoke test only: creates a session, adds a fake participant contribution, and accepts an outcome without real discussion.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "Hosted Service base URL.",
          default: DEFAULT_BASE_URL
        }
      }
    }
  }
];

let buffer = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  while (true) {
    const newlineIndex = buffer.indexOf("\n");
    if (newlineIndex === -1) {
      break;
    }
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    if (line.length > 0) {
      void handleLine(line);
    }
  }
});

async function handleLine(line: string): Promise<void> {
  let request: JsonRpcRequest;
  try {
    request = JSON.parse(line) as JsonRpcRequest;
  } catch (error) {
    writeError(null, -32700, "Parse error", error);
    return;
  }

  if (!request.method) {
    writeError(request.id ?? null, -32600, "Invalid request");
    return;
  }

  try {
    switch (request.method) {
      case "initialize":
        writeResult(request.id, {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "barbequeue", version: "0.1.0" }
        });
        return;
      case "notifications/initialized":
        return;
      case "tools/list":
        writeResult(request.id, { tools });
        return;
      case "tools/call":
        writeResult(request.id, await callTool(request.params));
        return;
      default:
        writeError(request.id, -32601, `Method not found: ${request.method}`);
    }
  } catch (error) {
    writeError(request.id, -32000, error instanceof Error ? error.message : String(error));
  }
}

async function callTool(params: unknown) {
  const payload = params as { name?: string; arguments?: Record<string, unknown> };
  if (!payload.name) {
    throw new Error("Missing tool name");
  }

  const result = await runTool(payload.name, payload.arguments ?? {});
  return {
    content: [
      {
        type: "text",
        text: typeof result === "string" ? result : JSON.stringify(result, null, 2)
      }
    ]
  };
}

async function runTool(name: string, args: Record<string, unknown>) {
  const handlePath = defaultHandlePath(PLUGIN_ROOT);

  if (name === "create_session") {
    const driver = BarbequeueDriver.forBaseUrl(readString(args.baseUrl) ?? DEFAULT_BASE_URL);
    const handle = await driver.create(handlePath);
    return {
      sessionId: handle.sessionId,
      inviteLink: handle.inviteLink,
      cursor: handle.cursor,
      handlePath
    };
  }

  if (name === "start_discussion") {
    const driver = BarbequeueDriver.forBaseUrl(readString(args.baseUrl) ?? DEFAULT_BASE_URL);
    return formatStatus(
      await driver.startDiscussion(
        readString(args.question),
        readString(args.recommendedAnswer),
        handlePath
      ),
      "Host surface: this Codex thread. Participant surface: inviteLink. Share inviteLink with participants, then stop. Do not synthesize until wait_for_contributions reports contributionCount > 0."
    );
  }

  if (name === "run_demo") {
    const driver = BarbequeueDriver.forBaseUrl(readString(args.baseUrl) ?? DEFAULT_BASE_URL);
    const result = await driver.runDemo(handlePath);
    return {
      sessionId: result.handle.sessionId,
      inviteLink: result.handle.inviteLink,
      outcome: result.outcome.payload,
      cursor: result.projection.lastCursor,
      handlePath
    };
  }

  const driver = await BarbequeueDriver.fromHandle(handlePath);

  if (name === "resume_session") {
    return driver.resume(handlePath);
  }
  if (name === "session_status") {
    return formatStatus(await driver.status(handlePath));
  }
  if (name === "wait_for_contributions") {
    return formatStatus(
      await driver.waitForContributions(
        {
          timeoutMs: readNonnegativeInteger(args.timeoutMs) ?? 0,
          intervalMs: readNonnegativeInteger(args.intervalMs) ?? 2000
        },
        handlePath
      )
    );
  }
  if (name === "advance_session") {
    return formatAdvanceResult(
      await driver.advanceSession(
        optionalNextQuestion(readString(args.nextQuestion), readString(args.recommendedAnswer)),
        handlePath
      )
    );
  }
  if (name === "publish_question") {
    return driver.publishQuestion(
      readString(args.text),
      readString(args.recommendedAnswer),
      handlePath
    );
  }
  if (name === "publish_next_question") {
    return formatStatus(
      await driver.publishNextQuestion(
        requireString(args.text, "text"),
        readString(args.recommendedAnswer),
        handlePath
      ),
      "Next question published. Share that participants should respond in the same room URL; then stop until they contribute."
    );
  }
  if (name === "synthesize") {
    return driver.synthesize(handlePath);
  }
  if (name === "dismiss_objection") {
    const participantId = requireString(args.participantId, "participantId");
    const reason = requireString(args.reason, "reason");
    return driver.dismissObjection(participantId, reason, handlePath);
  }
  if (name === "accept_outcome") {
    return driver.acceptOutcome(handlePath);
  }
  if (name === "show_session") {
    return driver.show();
  }

  throw new Error(`Unknown tool: ${name}`);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function requireString(value: unknown, name: string): string {
  const result = readString(value);
  if (!result) {
    throw new Error(`Missing required argument: ${name}`);
  }
  return result;
}

function readNonnegativeInteger(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return undefined;
  }
  return value;
}

function formatStatus(
  result: Awaited<ReturnType<BarbequeueDriver["status"]>>,
  instruction?: string
) {
  return {
    sessionId: result.handle.sessionId,
    inviteLink: result.inviteLink,
    cursor: result.handle.cursor,
    participantCount: result.participantCount,
    contributionCount: result.contributionCount,
    unresolvedObjections: result.unresolvedObjections,
    pendingParticipants: result.pendingParticipants,
    hasQuestion: result.hasQuestion,
    hasAnswerCandidate: result.hasAnswerCandidate,
    hasAcceptedOutcome: result.hasAcceptedOutcome,
    currentQuestion: result.projection.currentQuestion?.text ?? null,
    recommendedAnswer: result.projection.currentQuestion?.recommendedAnswer ?? null,
    hostSurface: "Codex thread",
    participantSurface: result.inviteLink,
    nextAction: result.nextAction,
    ...(instruction ? { instruction } : {})
  };
}

function formatAdvanceResult(result: Awaited<ReturnType<BarbequeueDriver["advanceSession"]>>) {
  return {
    action: result.action,
    message: result.message,
    ...formatStatus(result.status),
    hostGuidance: result.action === "host_decision_required"
      ? "The host stays in Codex. Use dismiss_objection with a reason, or publish a revised answer/question instead of asking participants to resolve host-only decisions."
      : "The host stays in Codex. Participants continue in the same room URL."
  };
}

function optionalNextQuestion(nextQuestion?: string, recommendedAnswer?: string) {
  return {
    ...(nextQuestion ? { nextQuestion } : {}),
    ...(recommendedAnswer ? { recommendedAnswer } : {})
  };
}

function writeResult(id: JsonRpcRequest["id"], result: unknown): void {
  if (id === undefined || id === null) {
    return;
  }
  write({ jsonrpc: "2.0", id, result });
}

function writeError(
  id: JsonRpcRequest["id"] | null,
  code: number,
  message: string,
  data?: unknown
): void {
  write({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      ...(data ? { data: String(data) } : {})
    }
  });
}

function write(payload: unknown): void {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}
