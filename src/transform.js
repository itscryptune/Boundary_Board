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
function normalize(match) {
  const teams = getTeams(match);
  return { name: text(match.name, "Cricket match"), team1: teams[0], team2: teams[1],
           team1_score: "15/1", team2_score: "Yet to bat",
           team1_overs: "5.1 OV", team2_overs: "",
           state: "UPCOMING", status: "Score integration in progress", format: "CRICKET", venue: "" };
}
function run(input) {
  const data = Array.isArray(input?.data) ? input.data :
               Array.isArray(input?.data?.data) ? input.data.data : [];
  const featured = data.length ? normalize(data[0]) : normalize({});
  return { featured, other_matches: [], total_count: data.length, live_count: 0,
           board_state: "READY", board_message: "" };
}
