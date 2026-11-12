function text(value, fallback = "") {
  const result = value === null || value === undefined ? "" : String(value).trim();
  return result || fallback;
}
function list(value) { return Array.isArray(value) ? value : []; }
function getTeams(match) {
  const names = list(match.teams), info = list(match.teamInfo);
  return [0, 1].map(index => {
    const name = text(names[index], text(info[index]?.name, `Team ${index + 1}`));
    const found = info.find(item => text(item?.name).toLowerCase() === name.toLowerCase()) || info[index] || {};
    const short = text(found.shortname, name.split(/\s+/).map(x => x[0]).join("").slice(0, 5)).toUpperCase();
    return { name, short };
  });
}
function getScore(match, team) {
  const name = team.name.toLowerCase(), short = team.short.toLowerCase();
  const innings = list(match.score).filter(s => {
    const label = text(s?.inning).toLowerCase();
    return label === name || label.startsWith(name + " ") ||
           label === short || label.startsWith(short + " ");
  });
  if (!innings.length) return { score: "Yet to bat", overs: "" };
  const current = innings[innings.length - 1];
  if (current.r === null || current.r === undefined) {
    return { score: "Score unavailable", overs: "" };
  }
  return {
    score: `${text(current.r, "0")}/${text(current.w, "0")}`,
    overs: current.o === null || current.o === undefined ? "" : `${current.o} OV`
  };
}
function getState(match) {
  if (match.matchEnded === true) return "RESULT";
  if (match.matchStarted !== true) return "UPCOMING";
  const status = text(match.status).toLowerCase();
  if (/stumps|end of day|close of play/.test(status)) return "STUMPS";
  if (/rain|delayed|interrupted|bad light/.test(status)) return "DELAYED";
  if (/lunch|tea break|innings break/.test(status)) return "BREAK";
  const hasScore = list(match.score).some(s => s && s.r !== null && s.r !== undefined);
  if (!hasScore && /opt to|elected to|won the toss/.test(status)) return "TOSS";
  return "LIVE";
} 
function normalize(match) {
  const teams = getTeams(match);
  return { name: text(match.name, "Cricket match"), team1: teams[0], team2: teams[1],
           team1_score: getScore(match, teams[0]).score,
           team2_score: getScore(match, teams[1]).score,
           team1_overs: getScore(match, teams[0]).overs,
           team2_overs: getScore(match, teams[1]).overs,
           state: getState(match),
           status: text(match.status, "Latest available match status"),
           format: text(match.matchType, "CRICKET").toUpperCase(),
           venue: text(match.venue),
           start_time: text(match.dateTimeGMT)
          };
} 
const PRIORITY = { LIVE:0, BREAK:1, TOSS:2, STUMPS:3, DELAYED:4, UPCOMING:5, RESULT:6 };
function sortMatches(a, b) {
  const difference = (PRIORITY[a.state] ?? 7) - (PRIORITY[b.state] ?? 7);
  if (difference !== 0) return difference;
  const timeA = Date.parse(a.start_time);
  const timeB = Date.parse(b.start_time);
  if ( Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) {
    if (a.state === "RESULT") {
      return timeB - timeA;
    }
    return timeA - timeB;
  }
  return a.name.localeCompare(b.name);
}
function run(input) {
  const payload = Array.isArray(input?.data?.data) ? input.data : input;
  const data = Array.isArray(payload?.data) ? payload.data :
               Array.isArray(payload) ? payload : null;
  if (payload?.status === "failure" || payload?.status === "error" || !data) {
    return { featured: null, other_matches: [], total_count: 0, live_count: 0,
             board_state: "ERROR", board_message: text(payload?.reason, "Score feed unavailable") };
  }
  if (!data.length) {
    return { featured: null, other_matches: [], total_count: 0, live_count: 0,
             board_state: "EMPTY", board_message: "No matches found in this response" };
  }
  const matches = data.filter(item => item && typeof item === "object")
                      .map(normalize)
                      .sort(sortMatches);
  return { featured: matches[0] || null, other_matches: matches.slice(1, 4), total_count: matches.length,
           live_count: matches.filter(m => m.state === "LIVE").length,
           board_state: "READY", board_message: "" };
}