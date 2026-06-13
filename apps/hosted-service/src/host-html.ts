export function renderHostHtml(sessionId: string): string {
  const escapedSessionId = escapeHtml(sessionId);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Barbequeue Host Dashboard</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #192024;
        --muted: #5b6670;
        --line: #d7dde2;
        --panel: #f6f8f9;
        --accent: #0f766e;
        --warning: #8a4b0f;
        --danger: #b42318;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font: 15px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--ink);
        background: #ffffff;
      }
      main {
        max-width: 1120px;
        margin: 0 auto;
        padding: 24px;
        display: grid;
        gap: 20px;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        border-bottom: 1px solid var(--line);
        padding-bottom: 16px;
      }
      h1, h2, h3 { margin: 0; letter-spacing: 0; }
      h1 { font-size: 24px; }
      h2 { font-size: 17px; margin-bottom: 10px; }
      h3 { font-size: 15px; margin-bottom: 8px; }
      a { color: var(--accent); font-weight: 700; }
      .muted { color: var(--muted); }
      .status { font-size: 13px; color: var(--muted); text-align: right; }
      section {
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 16px;
        background: #fff;
      }
      .band { background: var(--panel); }
      .warning {
        border-color: #e7c88e;
        background: #fff8eb;
        color: var(--warning);
      }
      .closed {
        border-color: #99d6cf;
        background: #ecfdf9;
      }
      label { display: grid; gap: 6px; font-weight: 600; }
      input, textarea, select, button {
        font: inherit;
        border: 1px solid var(--line);
        border-radius: 6px;
        padding: 10px 12px;
      }
      textarea { min-height: 110px; resize: vertical; }
      button, .button {
        cursor: pointer;
        background: var(--ink);
        color: #fff;
        border-color: var(--ink);
        font-weight: 650;
        text-align: center;
        text-decoration: none;
        border-radius: 6px;
        padding: 10px 12px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
      }
      button.secondary, .button.secondary {
        background: #fff;
        color: var(--ink);
      }
      button.danger {
        background: var(--danger);
        border-color: var(--danger);
      }
      button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }
      form { display: grid; gap: 12px; }
      .hidden { display: none !important; }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
      }
      .decision-card, .handoff-card {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 14px;
        background: var(--panel);
      }
      .decision-card p, .handoff-card p {
        margin: 4px 0 0;
      }
      .handoff-card {
        border-color: #99d6cf;
        background: #ecfdf9;
      }
      ul { margin: 0; padding-left: 18px; }
      li + li { margin-top: 8px; }
      pre {
        white-space: pre-wrap;
        margin: 0;
        padding: 12px;
        background: var(--panel);
        border-radius: 6px;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 12px;
        color: var(--muted);
        margin-right: 6px;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .history-view {
        display: grid;
        gap: 12px;
      }
      .objection {
        display: grid;
        gap: 10px;
        border-top: 1px solid var(--line);
        padding-top: 12px;
        margin-top: 12px;
      }
      .objection:first-child {
        border-top: 0;
        margin-top: 0;
        padding-top: 0;
      }
      .log-list {
        display: grid;
        gap: 10px;
        padding: 0;
        margin: 0;
        list-style: none;
      }
      .log-item {
        border-left: 3px solid var(--line);
        padding: 4px 0 4px 12px;
      }
      .log-item.host {
        border-left-color: var(--accent);
      }
      .log-meta {
        color: var(--muted);
        font-size: 12px;
        margin-bottom: 2px;
      }
      .log-title {
        font-weight: 700;
      }
      .log-body {
        white-space: pre-wrap;
        margin-top: 4px;
        color: var(--ink);
      }
      details > summary {
        cursor: pointer;
        font-weight: 700;
        list-style-position: inside;
      }
      details[open] > summary {
        margin-bottom: 12px;
      }
      @media (max-width: 640px) {
        main { padding: 16px; }
        header { display: grid; }
        .status { text-align: left; }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div>
          <h1>Barbequeue Host</h1>
          <div class="muted">Host dashboard for session <strong>${escapedSessionId}</strong></div>
        </div>
        <div id="connection" class="status">Connecting...</div>
      </header>

      <section id="token-warning" class="warning">
        This URL contains the host credential. Keep it private; share only the participant invite link.
      </section>

      <section>
        <h2>Current Question</h2>
        <pre id="question">Waiting for a question.</pre>
      </section>

      <section>
        <h2>Current Answer Candidate</h2>
        <pre id="answer">No answer candidate yet.</pre>
        <p id="answer-status" class="muted">Codex publishes the answer candidate. The browser only records responses and facilitation actions.</p>
      </section>

      <section id="session-status" class="closed hidden">
        <h2 id="session-status-title">Voting Closed</h2>
        <p id="session-status-body" class="muted">This round is no longer accepting responses.</p>
      </section>

      <section>
        <h2>Your Response</h2>
        <div id="host-response-summary" class="decision-card hidden">
          <div>
            <strong id="host-response-summary-title">Response submitted</strong>
            <p id="host-response-summary-reason" class="muted"></p>
          </div>
          <button id="edit-host-response" class="secondary" type="button">Edit response</button>
        </div>
        <form id="host-consensus-form">
          <label>Position
            <select id="host-consensus-state">
              <option value="accepted">Accept as-is</option>
              <option value="objected">Object</option>
              <option value="abstained">Abstain</option>
            </select>
          </label>
          <label>Objection reason
            <textarea id="host-consensus-reason" placeholder="Required only when objecting."></textarea>
          </label>
          <p id="host-response-status" class="muted">Review the current answer, then accept, object, or abstain.</p>
          <button type="submit">Submit host response</button>
        </form>
      </section>

      <section>
        <h2>Consensus Board</h2>
        <ul id="consensus"></ul>
      </section>

      <section id="codex-handoff" class="handoff-card hidden">
        <div>
          <strong id="codex-handoff-title">Participant responses are complete.</strong>
          <p id="codex-handoff-body" class="muted">Continue in Codex to advance the session.</p>
        </div>
      </section>

      <section>
        <h2>Questions</h2>
        <div class="history-view">
          <label>Question
            <select id="round-select"></select>
          </label>
          <div>
            <h3>Question</h3>
            <pre id="round-question">No questions yet.</pre>
          </div>
          <div>
            <h3>Answer Candidate</h3>
            <pre id="round-answer">No answer candidate yet.</pre>
          </div>
          <div>
            <h3>Result</h3>
            <pre id="round-result">No accepted result yet.</pre>
          </div>
        </div>
      </section>

      <section>
        <details>
          <summary>Session Log</summary>
          <ul id="session-log" class="log-list"></ul>
        </details>
      </section>
    </main>

    <script>
      const sessionId = ${JSON.stringify(sessionId)};
      const hostToken = new URL(location.href).searchParams.get("token") || "";
      const cursorKey = "barbequeue:" + sessionId + ":host-cursor";
      let lastCursor = Number(localStorage.getItem(cursorKey) || "0");
      let latestProjection = null;
      let connectionState = "Connecting";
      let selectedRoundIndex = -1;
      let isEditingHostResponse = false;

      const connection = document.getElementById("connection");
      const hostConsensusState = document.getElementById("host-consensus-state");
      const hostConsensusReason = document.getElementById("host-consensus-reason");

      function setConnection(text) {
        connectionState = text;
        connection.textContent = connectionState + " · cursor " + lastCursor;
      }

      async function request(path, options = {}) {
        const res = await fetch(path, {
          ...options,
          headers: {
            "content-type": "application/json",
            ...(options.headers || {})
          }
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }
        return res.json();
      }

      async function hostEvent(payload) {
        if (!hostToken) {
          throw new Error("Missing host token in URL.");
        }
        const data = await request("/api/sessions/" + sessionId + "/plugin-events", {
          method: "POST",
          headers: { authorization: "Bearer " + hostToken },
          body: JSON.stringify({ payload })
        });
        await loadProjection();
        return data;
      }

      async function loadProjection() {
        const data = await request("/api/sessions/" + sessionId);
        render(data.projection);
      }

      function render(projection) {
        latestProjection = projection;
        lastCursor = projection.lastCursor || lastCursor;
        localStorage.setItem(cursorKey, String(lastCursor));
        connection.textContent = connectionState + " · cursor " + lastCursor;

        const candidate = currentCandidate(projection);
        const unresolvedObjections = getUnresolvedObjections(projection);
        const votingClosed = isVotingClosed(projection);
        const hostState = projection.hostDriverId
          ? memberConsensusState(projection, "host", projection.hostDriverId)
          : undefined;

        document.getElementById("question").textContent = projection.currentQuestion?.text || "Waiting for a question.";
        document.getElementById("answer").textContent = candidate?.text || "No answer candidate yet.";
        hostConsensusState.disabled = !candidate || votingClosed;
        if (!isEditingHostResponse) {
          hostConsensusState.value = hostState && hostState.state !== "pending" ? hostState.state : "accepted";
          hostConsensusReason.value = hostState?.reason || "";
        }
        updateHostReasonState();
        document.getElementById("answer-status").textContent = candidate
          ? "Participants are responding to this answer candidate."
          : "Return to Codex to synthesize or publish the first answer candidate.";
        document.getElementById("host-response-status").textContent = candidate
          ? "Host consensus is required before the outcome can be accepted."
          : "Waiting for an answer candidate before the host can respond.";
        renderSessionStatus(projection);
        renderHostResponse(candidate, hostState, votingClosed);
        renderCodexHandoff(projection, candidate, hostState, unresolvedObjections);
        renderHistory(projection);

        document.getElementById("consensus").innerHTML = consensusMembers(projection).map((person) => {
          const state = projection.consensusStates.find(
            (item) => item.memberKind === person.memberKind && item.memberId === person.memberId
          );
          const reason = state?.reason ? " — " + escapeHtml(state.reason) : "";
          return "<li><strong>" + escapeHtml(person.displayName) + "</strong>: " + (state?.state || "pending") + reason + "</li>";
        }).join("");

        document.getElementById("session-log").innerHTML = [...projection.sessionLog].reverse().map((item) => {
          const body = item.body ? "<div class='log-body'>" + escapeHtml(item.body) + "</div>" : "";
          return "<li class='log-item " + (item.source === "plugin" ? "host" : "participant") + "'>"
            + "<div class='log-meta'>#" + item.cursor + " · " + (item.source === "plugin" ? "Host" : "Participant") + "</div>"
            + "<div class='log-title'>" + escapeHtml(item.title) + "</div>"
            + body
            + "</li>";
        }).join("");
      }

      function currentCandidate(projection) {
        return projection.answerCandidates.find((candidate) => candidate.answerCandidateId === projection.currentAnswerCandidateId);
      }

      function memberConsensusState(projection, memberKind, memberId) {
        return projection.consensusStates.find(
          (item) => item.memberKind === memberKind && item.memberId === memberId
        );
      }

      function isVotingClosed(projection) {
        return Boolean(projection.acceptedOutcome || projection.sessionEnded);
      }

      function renderSessionStatus(projection) {
        const status = document.getElementById("session-status");
        const closed = isVotingClosed(projection);
        status.classList.toggle("hidden", !closed);
        if (!closed) return;
        document.getElementById("session-status-title").textContent = projection.sessionEnded
          ? "Session Ended"
          : "Voting Closed";
        document.getElementById("session-status-body").textContent = projection.sessionEnded
          ? (projection.sessionEnded.reason || "The skill ended this grilling session.")
          : "This answer was accepted. Continue in Codex for the next question or to end the session.";
      }

      function renderHostResponse(candidate, hostState, votingClosed) {
        const form = document.getElementById("host-consensus-form");
        const summary = document.getElementById("host-response-summary");
        const editButton = document.getElementById("edit-host-response");
        const hasSubmitted = Boolean(candidate && hostState && hostState.state !== "pending");
        summary.classList.toggle("hidden", !hasSubmitted || isEditingHostResponse);
        form.classList.toggle("hidden", votingClosed || (hasSubmitted && !isEditingHostResponse));
        editButton.classList.toggle("hidden", votingClosed);
        if (!hasSubmitted) return;
        document.getElementById("host-response-summary-title").textContent = "You " + stateLabel(hostState.state) + ".";
        document.getElementById("host-response-summary-reason").textContent = hostState.reason || "";
      }

      function renderCodexHandoff(projection, candidate, hostState, unresolvedObjections) {
        const handoff = document.getElementById("codex-handoff");
        if (projection.sessionEnded) {
          handoff.classList.add("hidden");
          return;
        }
        if (projection.acceptedOutcome) {
          handoff.classList.remove("hidden");
          document.getElementById("codex-handoff-title").textContent = "Voting is closed.";
          document.getElementById("codex-handoff-body").textContent = "Continue in Codex to publish the next question or end the session.";
          return;
        }
        const participantStates = projection.participants.map((participant) =>
          memberConsensusState(projection, "participant", participant.participantId)
        );
        const participantsComplete = Boolean(candidate)
          && projection.participants.length > 0
          && participantStates.every((state) => state && state.state !== "pending");
        handoff.classList.toggle("hidden", !participantsComplete);
        if (!participantsComplete) return;
        const hostSubmitted = Boolean(hostState && hostState.state !== "pending");
        const hasObjections = unresolvedObjections.length > 0;
        document.getElementById("codex-handoff-title").textContent = hostSubmitted
          ? "All responses are in."
          : "Participant responses are complete.";
        document.getElementById("codex-handoff-body").textContent = hostSubmitted
          ? (hasObjections
            ? "Continue in Codex so the skill can revise the answer using the objections."
            : "Continue in Codex to accept this result or publish the next question.")
          : "Submit your host response, then continue in Codex to advance the session.";
      }

      function stateLabel(state) {
        if (state === "accepted") return "accepted as-is";
        if (state === "objected") return "objected";
        if (state === "abstained") return "abstained";
        return "are pending";
      }

      function renderHistory(projection) {
        const select = document.getElementById("round-select");
        const rounds = projection.rounds || [];
        if (selectedRoundIndex === -1 && rounds.length > 0) selectedRoundIndex = rounds.length - 1;
        if (selectedRoundIndex >= rounds.length) selectedRoundIndex = Math.max(0, rounds.length - 1);
        select.innerHTML = rounds.map((round, index) => {
          const label = "Question " + (index + 1) + (index === rounds.length - 1 ? " · current" : "");
          return "<option value='" + index + "'" + (index === selectedRoundIndex ? " selected" : "") + ">" + escapeHtml(label) + "</option>";
        }).join("");
        select.disabled = rounds.length === 0;

        const round = rounds[selectedRoundIndex];
        const candidate = round?.answerCandidates.find((item) => item.answerCandidateId === round.currentAnswerCandidateId)
          || round?.answerCandidates.at(-1);
        document.getElementById("round-question").textContent = round?.question.text || "No questions yet.";
        document.getElementById("round-answer").textContent = candidate?.text || "No answer candidate yet.";
        document.getElementById("round-result").textContent = round?.acceptedOutcome?.text || "No accepted result yet.";
      }

      function getUnresolvedObjections(projection) {
        return projection.consensusStates
          .filter((item) => item.state === "objected")
          .map((item) => ({
            ...item,
            displayName: item.memberKind === "host" ? "Host" : displayName(projection, item.participantId)
          }));
      }

      function displayName(projection, participantId) {
        return projection.participants.find((item) => item.participantId === participantId)?.displayName || participantId;
      }

      function consensusMembers(projection) {
        return [
          ...(projection.hostDriverId ? [{
            memberKind: "host",
            memberId: projection.hostDriverId,
            displayName: "Host"
          }] : []),
          ...projection.participants.map((participant) => ({
            memberKind: "participant",
            memberId: participant.participantId,
            displayName: participant.displayName
          }))
        ];
      }

      function updateHostReasonState() {
        hostConsensusReason.disabled = hostConsensusState.value !== "objected" || hostConsensusState.disabled;
        if (hostConsensusReason.disabled) hostConsensusReason.value = "";
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (char) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        })[char]);
      }

      function connectSocket() {
        const protocol = location.protocol === "https:" ? "wss:" : "ws:";
        const ws = new WebSocket(protocol + "//" + location.host + "/api/sessions/" + sessionId + "/ws?after=" + lastCursor);
        ws.addEventListener("open", () => setConnection("Live"));
        ws.addEventListener("close", () => {
          setConnection("Disconnected; retrying");
          setTimeout(connectSocket, 1000);
        });
        ws.addEventListener("message", async (message) => {
          const data = JSON.parse(message.data);
          if (data.type === "snapshot") {
            render(data.projection);
          }
          if (data.type === "event") {
            lastCursor = Math.max(lastCursor, data.event.cursor);
            localStorage.setItem(cursorKey, String(lastCursor));
            await loadProjection();
          }
        });
      }

      document.getElementById("host-consensus-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!latestProjection?.hostDriverId) return alert("Host identity is not available.");
        if (hostConsensusState.disabled) return alert("Wait for an answer candidate before responding.");
        const state = hostConsensusState.value;
        const reason = hostConsensusReason.value.trim();
        if (state === "objected" && !reason) {
          return alert("Objecting requires a reason.");
        }
        try {
          isEditingHostResponse = false;
          await hostEvent({
            type: "consensus_state.changed",
            hostDriverId: latestProjection.hostDriverId,
            state,
            reason: reason || undefined
          });
        } catch (error) {
          alert(error instanceof Error ? error.message : String(error));
        }
      });

      hostConsensusState.addEventListener("change", updateHostReasonState);
      document.getElementById("edit-host-response").addEventListener("click", () => {
        isEditingHostResponse = true;
        if (latestProjection) render(latestProjection);
      });
      document.getElementById("round-select").addEventListener("change", (event) => {
        selectedRoundIndex = Number(event.target.value);
        if (latestProjection) renderHistory(latestProjection);
      });

      if (!hostToken) {
        document.getElementById("token-warning").textContent = "Missing host token in URL. Host controls will not work.";
      }
      loadProjection().catch(console.error);
      connectSocket();
    </script>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return replacements[char] ?? char;
  });
}
