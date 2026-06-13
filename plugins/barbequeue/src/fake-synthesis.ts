import type { SessionProjection } from "@barbequeue/protocol";

export const DEFAULT_GRILLING_QUESTION =
  "What should the Barbequeue tracer prove before real grill-with-docs synthesis is integrated?";

export function synthesizeFakeAnswerCandidate(projection: SessionProjection): string {
  const question = projection.currentQuestion?.text ?? DEFAULT_GRILLING_QUESTION;
  const recommendedAnswer = projection.currentQuestion?.recommendedAnswer;
  const ideas = projection.contributions.filter((item) => item.kind === "idea" && item.text);
  const clarifications = projection.contributions.filter(
    (item) => item.kind === "clarifying" && item.text
  );
  const objections = projection.contributions.filter((item) => item.kind === "objection" && item.text);
  const abstentions = projection.contributions.filter((item) => item.kind === "abstention");

  const lines = [
    `Resolved question: ${question}`,
    "",
    "Answer candidate:",
    recommendedAnswer
      ? recommendedAnswer
      : ideas.length > 0
      ? `Use the host-side Codex Plugin as the session driver and keep the Hosted Service focused on ordered Session Events, live Participant Room updates, and the Session Record.`
      : "Use the agreed Barbequeue tracer boundaries from the session record.",
    "",
    `Ideas considered: ${ideas.map((item) => item.text).join(" | ") || "none"}`,
    `Clarifying contributions: ${clarifications.map((item) => item.text).join(" | ") || "none"}`,
    `Objections to address: ${objections.map((item) => item.text).join(" | ") || "none"}`,
    `Abstentions: ${abstentions.length}`
  ];

  return lines.join("\n");
}
