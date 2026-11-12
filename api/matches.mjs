
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { run } = require("../src/transform.js");
const CACHE_SECONDS = 900;
export async function GET() {
  const key = process.env.CRICKET_API_KEY;
  if (!key) {return Response.json({
        board_state: "ERROR", board_message: "Server API key is not configured."},
      { status: 503, headers: { "Cache-Control": "no-store" }}
    );}
  const url = new URL("https://api.cricapi.com/v1/currentMatches");
  url.searchParams.set("apikey", key);
  url.searchParams.set("offset", "0");
  try {const response = await fetch(url, {headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000)});
    if (!response.ok) {throw new Error(`Cricket provider returned HTTP ${response.status}`);}
    const payload = await response.json();
    const board = run(payload);
    if (board.board_state === "ERROR") {return Response.json(board, {status: 502,headers: { "Cache-Control": "no-store" }});}
    return Response.json(
      {...board, fetched_at: new Date().toISOString()},
      {headers: {"Cache-Control": `public, max-age=0, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=60`} });
  } catch (error) {console.error( "BoundaryBoard API request failed:", error.message);
    return Response.json({board_state: "ERROR", board_message: "Could not load cricket data. Please try again later."},
      {status: 502, headers: { "Cache-Control": "no-store" }});
  }
}
