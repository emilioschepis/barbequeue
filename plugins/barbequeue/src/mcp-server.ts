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
    description: "Create a hosted Barbequeue Grilling Session, store a local Session Handle, and return the participant invite link plus private host dashboard link.",
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
    description: "Create a real hosted discussion, publish the question, return the private host dashboard link and participant invite link, then stop and wait for participants.",
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
    description: "Advance the host-driven grill loop: synthesize when ready, revise when objections exist, accept when consensus is ready, and optionally publish the next question.",
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
    name: "publish_answer_candidate",
    description: "Publish a host-approved or Codex-revised Answer Candidate. This resets Consensus States in every browser.",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Full answer candidate text to publish."
        }
      },
      required: ["text"]
    }
  },
  {
    name: "host_consensus",
    description: "Set the host's Consensus State for the current Answer Candidate: accepted, abstained, objected, or pending.",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          enum: ["accepted", "abstained", "objected", "pending"]
        },
        reason: {
          type: "string",
          description: "Required when the host objects."
        }
      },
      required: ["state"]
    }
  },
  {
    name: "accept_outcome",
    description: "Publish an accepted outcome after Session Consensus. Objected candidates must be revised, not accepted.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "end_session",
    description: "End the Grilling Session when the skill has enough accepted information and no more questions are needed.",
    inputSchema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Optional short reason or final status to show in the host and participant pages."
        }
      }
    }
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
      hostLink: handle.hostLink,
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
      "Host surface: hostLink is private for facilitation controls; Codex remains the synthesis driver. Participant surface: inviteLink. Share only inviteLink with participants, then stop. Wait for participant responses before accepting, revising, or moving to the next question."
    );
  }

  if (name === "run_demo") {
    const driver = BarbequeueDriver.forBaseUrl(readString(args.baseUrl) ?? DEFAULT_BASE_URL);
    const result = await driver.runDemo(handlePath);
    return {
      sessionId: result.handle.sessionId,
      inviteLink: result.handle.inviteLink,
      hostLink: result.handle.hostLink,
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
  if (name === "publish_answer_candidate") {
    return driver.publishAnswerCandidate(requireString(args.text, "text"), handlePath);
  }
  if (name === "host_consensus") {
    const state = requireConsensusState(args.state);
    const reason = readString(args.reason);
    if (state === "objected" && !reason) {
      throw new Error("Host objection requires a reason.");
    }
    return driver.setHostConsensus(state, reason, handlePath);
  }
  if (name === "accept_outcome") {
    return driver.acceptOutcome(handlePath);
  }
  if (name === "end_session") {
    return driver.endSession(readString(args.reason), handlePath);
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

function requireConsensusState(value: unknown): "accepted" | "abstained" | "objected" | "pending" {
  const state = readString(value);
  if (state === "accepted" || state === "abstained" || state === "objected" || state === "pending") {
    return state;
  }
  throw new Error("state must be accepted, abstained, objected, or pending");
}

function formatStatus(
  result: Awaited<ReturnType<BarbequeueDriver["status"]>>,
  instruction?: string
) {
  return {
    sessionId: result.handle.sessionId,
    inviteLink: result.inviteLink,
    hostLink: result.hostLink,
    cursor: result.handle.cursor,
    participantCount: result.participantCount,
    contributionCount: result.contributionCount,
    unresolvedObjections: result.unresolvedObjections,
    pendingParticipants: result.pendingParticipants,
    pendingConsensusMembers: result.pendingConsensusMembers,
    hostConsensus: result.hostConsensus ?? null,
    hasQuestion: result.hasQuestion,
    hasAnswerCandidate: result.hasAnswerCandidate,
    hasAcceptedOutcome: result.hasAcceptedOutcome,
    hasSessionEnded: result.hasSessionEnded,
    sessionEnded: result.projection.sessionEnded ?? null,
    currentQuestion: result.projection.currentQuestion?.text ?? null,
    recommendedAnswer: result.projection.currentQuestion?.recommendedAnswer ?? null,
    hostSurface: result.hostLink,
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
    hostGuidance: result.action === "revision_required"
      ? "Use the objections as revision input, then call publish_answer_candidate with the revised answer. Do not dismiss objections."
      : result.action === "waiting_for_next_question"
        ? "Publish the next question, or call end_session if the skill has enough accepted information."
        : "Use the private host dashboard for facilitation controls. Participants continue in the same room URL."
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
