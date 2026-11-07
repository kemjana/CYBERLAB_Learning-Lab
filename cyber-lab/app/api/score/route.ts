import { NextResponse } from "next/server";
import { addScore, replaceScore, MAX_POINTS, MAX_SYNC_POINTS, topPlayers, usingDatabase } from "@/lib/scores";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// While developing (npm run dev) we include the technical reason in the response to help debugging.
function failure(message: string, err: unknown) {
  console.error(message, err);
  const detail = process.env.NODE_ENV !== "production" && err instanceof Error ? err.message : undefined;
  return NextResponse.json({ error: message, detail }, { status: 500 });
}

export async function GET() {
  try {
    return NextResponse.json({ players: await topPlayers(), shared: usingDatabase() });
  } catch (err) {
    return failure("Could not load the leaderboard.", err);
  }
}

export async function POST(req: Request) {
  if (!rateLimit(req, "score", 40)) {
    return NextResponse.json({ error: "Too many submissions." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const player = String(body?.player || "").replace(/[<>]/g, "").trim().slice(0, 20);
  const challenge = String(body?.challenge || "");
  const points = Math.round(Number(body?.points));
  const sync = body?.sync === true;
  const max = (sync ? MAX_SYNC_POINTS : MAX_POINTS)[challenge];

  if (!player || !max || !Number.isFinite(points) || points < 0) {
    return NextResponse.json({ error: "Invalid score." }, { status: 400 });
  }
  try {
    const row = { player, challenge, points: Math.min(points, max) };
    if (sync) await replaceScore(row);
    else await addScore(row);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return failure("Could not save the score.", err);
  }
}