export function renderRoomHtml(sessionId: string): string {
  const escapedSessionId = escapeHtml(sessionId);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Barbequeue Participant Room</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #192024;
        --muted: #5b6670;
        --line: #d7dde2;
        --panel: #f6f8f9;
        --accent: #0f766e;
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
        max-width: 1040px;
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
      h1, h2 { margin: 0; letter-spacing: 0; }
      h1 { font-size: 24px; }
      h2 { font-size: 17px; margin-bottom: 10px; }
      .muted { color: var(--muted); }
      .status { font-size: 13px; color: var(--muted); text-align: right; }
      section {
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 16px;
        background: #fff;
      }
      .band { background: var(--panel); }
      label { display: grid; gap: 6px; font-weight: 600; }
      input, textarea, select, button {
        font: inherit;
        border: 1px solid var(--line);
        border-radius: 6px;
        padding: 10px 12px;
      }
      textarea { min-height: 90px; resize: vertical; }
      button {
        cursor: pointer;
        background: var(--ink);
        color: #fff;
        border-color: var(--ink);
        font-weight: 650;
      }
      button.secondary {
        background: #fff;
        color: var(--ink);
      }
      button.danger {
        background: var(--danger);
        border-color: var(--danger);
      }
      form { display: grid; gap: 12px; }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px;
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
      .hidden { display: none; }
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
          <h1>Barbequeue</h1>
          <div class="muted">Participant Room for session <strong>${escapedSessionId}</strong></div>
        </div>
        <div id="connection" class="status">Connecting...</div>
      </header>

      <section id="join-section" class="band">
        <h2>Join</h2>
        <form id="join-form">
          <label>Display name
            <input id="display-name" name="displayName" autocomplete="name" required />
          </label>
          <button type="submit">Join room</button>
        </form>
      </section>

      <section>
        <h2>Grilling Question</h2>
        <pre id="question">Waiting for the host to publish a question.</pre>
      </section>

      <section>
        <h2>Recommended Answer</h2>
        <pre id="recommended-answer">Waiting for the host to provide a recommended answer.</pre>
      </section>

      <div class="grid">
        <section>
          <h2>Contribution</h2>
          <form id="contribution-form">
            <label>Kind
              <select id="contribution-kind">
                <option value="idea">Idea</option>
                <option value="clarifying">Clarifying Contribution</option>
                <option value="objection">Objection</option>
                <option value="abstention">Abstention</option>
              </select>
            </label>
            <label>Text
              <textarea id="contribution-text"></textarea>
            </label>
            <button type="submit">Submit contribution</button>
          </form>
        </section>

        <section>
          <h2>Consensus State</h2>
          <form id="consensus-form">
            <label>State
              <select id="consensus-state">
                <option value="accepted">Accepted</option>
                <option value="abstained">Abstained</option>
                <option value="objected">Objected</option>
                <option value="pending">Pending</option>
              </select>
            </label>
            <label>Reason
              <textarea id="consensus-reason"></textarea>
            </label>
            <button type="submit">Update consensus</button>
          </form>
        </section>
      </div>

      <section>
        <h2>Answer Candidate</h2>
        <pre id="answer">Waiting for the host to synthesize an answer candidate.</pre>
      </section>

      <div class="grid">
        <section>
          <h2>Contributions</h2>
          <ul id="contributions"></ul>
        </section>
        <section>
          <h2>Consensus Board</h2>
          <ul id="consensus"></ul>
        </section>
      </div>

      <section>
        <h2>Accepted Outcome</h2>
        <pre id="outcome">No accepted outcome yet.</pre>
      </section>

      <section>
        <h2>Session Log</h2>
        <ul id="session-log" class="log-list"></ul>
      </section>
    </main>

    <script>
      const sessionId = ${JSON.stringify(sessionId)};
      const inviteCode = new URL(location.href).searchParams.get("invite") || "";
      const participantKey = "barbequeue:" + sessionId + ":participant";
      const cursorKey = "barbequeue:" + sessionId + ":cursor";
      let participant = JSON.parse(localStorage.getItem(participantKey) || "null");
      let lastCursor = Number(localStorage.getItem(cursorKey) || "0");
      let connectionState = "Connecting";

      const connection = document.getElementById("connection");
      const joinSection = document.getElementById("join-section");

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

      async function loadProjection() {
        const data = await request("/api/sessions/" + sessionId);
        render(data.projection);
      }

      function render(projection) {
        lastCursor = projection.lastCursor || lastCursor;
        localStorage.setItem(cursorKey, String(lastCursor));
        connection.textContent = connectionState + " · cursor " + lastCursor;
        document.getElementById("question").textContent = projection.currentQuestion?.text || "Waiting for the host to publish a question.";
        document.getElementById("recommended-answer").textContent = projection.currentQuestion?.recommendedAnswer || "Waiting for the host to provide a recommended answer.";
        const currentCandidate = projection.answerCandidates.find((candidate) => candidate.answerCandidateId === projection.currentAnswerCandidateId);
        document.getElementById("answer").textContent = currentCandidate?.text || "Waiting for the host to synthesize an answer candidate.";
        document.getElementById("outcome").textContent = projection.acceptedOutcome?.text || "No accepted outcome yet.";
        document.getElementById("contributions").innerHTML = projection.contributions.map((item) => {
          const text = item.text ? " — " + escapeHtml(item.text) : "";
          return "<li><span class='pill'>" + item.kind + "</span>" + escapeHtml(item.participantId) + text + "</li>";
        }).join("");
        document.getElementById("consensus").innerHTML = projection.participants.map((person) => {
          const state = projection.consensusStates.find((item) => item.participantId === person.participantId);
          const reason = state?.reason ? " — " + escapeHtml(state.reason) : "";
          const dismissed = projection.dismissedObjections.find((item) => item.participantId === person.participantId);
          const dismissal = dismissed ? " <span class='pill'>dismissed by host</span> " + escapeHtml(dismissed.reason) : "";
          return "<li><strong>" + escapeHtml(person.displayName) + "</strong>: " + (state?.state || "pending") + reason + dismissal + "</li>";
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

      document.getElementById("join-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const displayName = document.getElementById("display-name").value.trim();
        participant = await request("/api/sessions/" + sessionId + "/join", {
          method: "POST",
          body: JSON.stringify({ displayName, inviteCode })
        });
        localStorage.setItem(participantKey, JSON.stringify(participant));
        joinSection.classList.add("hidden");
        await loadProjection();
      });

      document.getElementById("contribution-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!participant) return alert("Join before contributing.");
        const kind = document.getElementById("contribution-kind").value;
        const text = document.getElementById("contribution-text").value.trim();
        await request("/api/sessions/" + sessionId + "/room-events", {
          method: "POST",
          body: JSON.stringify({
            participantCredential: participant.participantCredential,
            payload: {
              type: "contribution.submitted",
              contributionId: crypto.randomUUID(),
              participantId: participant.participantId,
              kind,
              text: text || undefined
            }
          })
        });
        document.getElementById("contribution-text").value = "";
      });

      document.getElementById("consensus-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!participant) return alert("Join before updating consensus.");
        const state = document.getElementById("consensus-state").value;
        const reason = document.getElementById("consensus-reason").value.trim();
        await request("/api/sessions/" + sessionId + "/room-events", {
          method: "POST",
          body: JSON.stringify({
            participantCredential: participant.participantCredential,
            payload: {
              type: "consensus_state.changed",
              participantId: participant.participantId,
              state,
              reason: reason || undefined
            }
          })
        });
      });

      if (participant) {
        joinSection.classList.add("hidden");
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
