
const scoreboard = document.querySelector("#scoreboard");
const notice = document.querySelector("#notice");
const refreshButton = document.querySelector("#refresh");
const layoutButtons = [
  ...document.querySelectorAll("[data-layout]")
];

let selectedLayout = "full";
let latestData = null;

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));

function teamMarkup(match, number) {
  const team = match[`team${number}`] || {};

  return `
    <div class="bb-team">
      <div class="bb-code">
        ${escapeHtml(team.short || "—")}
      </div>

      <div class="bb-name">
        ${escapeHtml(team.name)}
      </div>

      <div class="bb-score">
        ${escapeHtml(match[`team${number}_score`])}
      </div>

      <div class="bb-overs">
        ${escapeHtml(match[`team${number}_overs`])}
      </div>
    </div>
  `;
}

function render() {
  scoreboard.className = `bb bb--${selectedLayout}`;

  const data = latestData || {};
  const match = data.featured;

  const updated = data.fetched_at
    ? new Date(data.fetched_at).toLocaleTimeString(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit"
        }
      ) + " IST"
    : "Not yet loaded";

  const main = match ? `
    <div class="bb-heading">
      ${escapeHtml(match.name)}
    </div>

    <div class="bb-versus">
      ${teamMarkup(match, 1)}

      <div class="bb-vs-centre">
        <span class="bb-vs-line"></span>
        <strong>VS</strong>
        <small>${escapeHtml(match.state)}</small>
        <span class="bb-vs-line"></span>
      </div>

      ${teamMarkup(match, 2)}
    </div>

    <div class="bb-status">
      ${escapeHtml(match.status)}
    </div>

    <div class="bb-venue">
      ${escapeHtml(match.venue)}
    </div>

    ${(data.other_matches || []).length ? `
      <div class="bb-other-section">
        <div class="bb-other-title">
          OTHER MATCHES
        </div>

        <div class="bb-others">
          ${data.other_matches.map(other => `
            <div class="bb-other-card">
              <div class="bb-other-label">
                ${escapeHtml(other.format)}
                ·
                ${escapeHtml(other.state)}
              </div>

              <div class="bb-other-score">
                <span>
                  ${escapeHtml(other.team1?.short)}
                  ${escapeHtml(other.team1_score)}
                </span>

                <span>
                  ${escapeHtml(other.team2?.short)}
                  ${escapeHtml(other.team2_score)}
                </span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    ` : ""}
  ` : `
    <div class="bb-empty">
      <strong>
        ${data.board_state === "ERROR"
          ? "Scores unavailable"
          : "No matches right now"}
      </strong>

      <span>
        ${escapeHtml(
          data.board_message || "Waiting for cricket data"
        )}
      </span>
    </div>
  `;

  scoreboard.innerHTML = `
    <div class="bb-header">
      <div class="bb-brand">
        <img
          src="/logo/boundaryboard-logo.svg"
          alt=""
        >
        <span>BOUNDARYBOARD</span>
      </div>

      <div class="bb-meta">
        <span>
          ${escapeHtml(
            match?.format || "CRICKET SCOREBOARD"
          )}
        </span>

        ${match ? `
          <b class="bb-badge">
            ${escapeHtml(match.state)}
          </b>
        ` : ""}
      </div>
    </div>

    <div class="bb-main">
      ${main}
    </div>

    <div class="bb-footer">
      <span>
        ${Number(data.total_count || 0)} MATCHES
        ·
        ${Number(data.live_count || 0)} LIVE
      </span>

      <span>
        LAST FETCH: ${escapeHtml(updated)}
        · CricketData.org
      </span>
    </div>

    <div class="bb-title-bar">
      <strong>BoundaryBoard</strong>
      <span>Cricket Scores</span>
    </div>
  `;
}

async function loadScores() {
  refreshButton.disabled = true;
  notice.textContent = "Checking scores…";

  try {
    const response = await fetch("/api/matches", {
      cache: "no-store"
    });

    const data = await response.json();

    if (
      !response.ok ||
      data.board_state === "ERROR"
    ) {
      throw new Error(
        data.board_message || "Could not retrieve scores"
      );
    }

    latestData = data;
    render();

    notice.textContent = data.live_count > 0
      ? `${data.live_count} live match(es) in the latest feed. Scores refresh about every 15 minutes.`
      : "No active play in the latest feed. Showing available matches.";

  } catch (error) {
    if (!latestData) {
      latestData = {
        board_state: "ERROR",
        board_message: error.message
      };

      render();
    }

    notice.textContent =
      `Refresh failed: ${error.message}` +
      (latestData.fetched_at
        ? " (showing previously fetched scores)"
        : "");

  } finally {
    refreshButton.disabled = false;
  }
}

// Layout switching.
layoutButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedLayout = button.dataset.layout;

    layoutButtons.forEach(item => {
      const active = item === button;

      item.classList.toggle("active", active);
      item.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

    render();
  });
});

// Manual refresh.
refreshButton.addEventListener("click", loadScores);

// Initial loading.
render();
loadScores();

// Refresh while the webpage remains open.
setInterval(loadScores, 15 * 60 * 1000);
