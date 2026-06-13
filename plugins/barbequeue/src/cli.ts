import { BarbequeueDriver } from "./driver";
import { defaultHandlePath } from "./session-handle-store";

const DEFAULT_BASE_URL = "http://localhost:8787";

async function main() {
  const rawArgs = process.argv.slice(2);
  if (rawArgs[0] === "--") {
    rawArgs.shift();
  }
  const [command = "help", ...args] = rawArgs;
  const handlePath = defaultHandlePath();

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "create") {
    const driver = BarbequeueDriver.forBaseUrl(args[0] ?? DEFAULT_BASE_URL);
    const handle = await driver.create(handlePath);
    console.log(JSON.stringify({
      sessionId: handle.sessionId,
      inviteLink: handle.inviteLink,
      cursor: handle.cursor,
      handlePath
    }, null, 2));
    return;
  }

  if (command === "demo") {
    const driver = BarbequeueDriver.forBaseUrl(args[0] ?? DEFAULT_BASE_URL);
    const result = await driver.runDemo(handlePath);
    console.log(JSON.stringify({
      sessionId: result.handle.sessionId,
      inviteLink: result.handle.inviteLink,
      outcome: result.outcome.payload,
      cursor: result.projection.lastCursor,
      handlePath
    }, null, 2));
    return;
  }

  if (command === "start-discussion") {
    const [text, recommendedAnswer] = args.join(" ").split(" :: ");
    const driverForBaseUrl = BarbequeueDriver.forBaseUrl(DEFAULT_BASE_URL);
    const result = await driverForBaseUrl.startDiscussion(
      text || undefined,
      recommendedAnswer,
      handlePath
    );
    console.log(JSON.stringify(formatStatus(result), null, 2));
    return;
  }

  const driver = await BarbequeueDriver.fromHandle(handlePath);

  if (command === "resume") {
    const result = await driver.resume(handlePath);
    console.log(JSON.stringify({
      sessionId: result.handle.sessionId,
      eventsRead: result.eventsRead,
      cursor: result.handle.cursor,
      currentQuestion: result.projection.currentQuestion?.text ?? null
    }, null, 2));
    return;
  }

  if (command === "status") {
    const result = await driver.status(handlePath);
    console.log(JSON.stringify(formatStatus(result), null, 2));
    return;
  }

  if (command === "wait-for-contributions") {
    const timeoutMs = args[0] ? Number.parseInt(args[0], 10) : 0;
    if (Number.isNaN(timeoutMs) || timeoutMs < 0) {
      throw new Error("Usage: wait-for-contributions [timeoutMs]");
    }
    const result = await driver.waitForContributions({ timeoutMs }, handlePath);
    console.log(JSON.stringify(formatStatus(result), null, 2));
    return;
  }

  if (command === "publish-question") {
    const event = await driver.publishQuestion(args.join(" ") || undefined, undefined, handlePath);
    console.log(JSON.stringify(event, null, 2));
    return;
  }

  if (command === "next-question") {
    const [text, recommendedAnswer] = args.join(" ").split(" :: ");
    if (!text?.trim()) {
      throw new Error("Usage: next-question <question> [:: recommended answer]");
    }
    const result = await driver.publishNextQuestion(text, recommendedAnswer, handlePath);
    console.log(JSON.stringify(formatStatus(result), null, 2));
    return;
  }

  if (command === "advance") {
    const [nextQuestion, recommendedAnswer] = args.join(" ").split(" :: ");
    const result = await driver.advanceSession(optionalNextQuestion(nextQuestion, recommendedAnswer), handlePath);
    console.log(JSON.stringify(formatAdvanceResult(result), null, 2));
    return;
  }

  if (command === "synthesize") {
    const event = await driver.synthesize(handlePath);
    console.log(JSON.stringify(event, null, 2));
    return;
  }

  if (command === "dismiss-objection") {
    const [participantId, ...reasonParts] = args;
    if (!participantId || reasonParts.length === 0) {
      throw new Error("Usage: dismiss-objection <participantId> <reason>");
    }
    const event = await driver.dismissObjection(participantId, reasonParts.join(" "), handlePath);
    console.log(JSON.stringify(event, null, 2));
    return;
  }

  if (command === "accept") {
    const event = await driver.acceptOutcome(handlePath);
    console.log(JSON.stringify(event, null, 2));
    return;
  }

  if (command === "show") {
    console.log(JSON.stringify(await driver.show(), null, 2));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

function printHelp() {
  console.log(`Barbequeue prototype driver

Commands:
  create [baseUrl]                 Create a hosted Grilling Session
  start-discussion <q> [:: rec]    Create, publish first question, and print invite link
  demo [baseUrl]                   Run the one-question tracer demo
  resume                           Catch up from the stored Session Handle
  publish-question [text]          Publish a deterministic Grilling Question
  next-question <q> [:: rec]       Publish the next question after the current one is resolved
  advance [next q] [:: rec]        Advance the host loop or publish the next question when ready
  synthesize                       Publish a fake host-gated Answer Candidate
  dismiss-objection <id> <reason>  Record a dismissed Objection
  accept                           Publish an accepted outcome
  show                             Print the current projection
  status                           Print host-facing session status and next action
  wait-for-contributions [ms]      Poll until contributions arrive or the timeout elapses

Default Hosted Service URL: ${DEFAULT_BASE_URL}`);
}

function formatStatus(result: Awaited<ReturnType<BarbequeueDriver["status"]>>) {
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
    nextAction: result.nextAction
  };
}

function formatAdvanceResult(result: Awaited<ReturnType<BarbequeueDriver["advanceSession"]>>) {
  return {
    action: result.action,
    message: result.message,
    ...formatStatus(result.status)
  };
}

function optionalNextQuestion(nextQuestion?: string, recommendedAnswer?: string) {
  return {
    ...(nextQuestion?.trim() ? { nextQuestion } : {}),
    ...(recommendedAnswer?.trim() ? { recommendedAnswer } : {})
  };
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
