// Stores scores in Supabase if configured, otherwise in server memory (demo mode).
export type ScoreRow = { player: string; challenge: string; points: number };

const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY?.trim();

// Largest score accepted for one normal submission.
export const MAX_POINTS: Record<string, number> = {
  password: 100,
  phishing: 100,
  ctf1: 50,
  ctf2: 100,
  ctf3: 150,
};

// Largest running total accepted when syncing a player's saved points.
// Phishing is higher because points add up over many emails.
export const MAX_SYNC_POINTS: Record<string, number> = {
  password: 100,
  phishing: 3000,
  ctf1: 50,
  ctf2: 100,
  ctf3: 150,
};

const g = globalThis as unknown as { __demoScores?: ScoreRow[] };
g.__demoScores ??= [];

export function usingDatabase() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

// New Supabase keys (sb_secret_...) are not JWTs and must go in the "apikey" header only.
// Older service_role keys are JWTs (they start with "eyJ") and also work as a Bearer token.
function headers(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { apikey: SUPABASE_KEY!, ...extra };
  if (SUPABASE_KEY!.startsWith("eyJ")) h.Authorization = `Bearer ${SUPABASE_KEY}`;
  return h;
}

async function fail(action: string, res: Response): Promise<never> {
  const text = (await res.text().catch(() => "")).slice(0, 300);
  throw new Error(`Supabase ${action} failed (${res.status}): ${text}`);
}

export async function addScore(row: ScoreRow): Promise<void> {
  if (!usingDatabase()) {
    g.__demoScores!.push(row);
    return;
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify(row),
  });
  if (!res.ok) await fail("insert", res);
}

/** Sets a player's total for one challenge to exactly `points` (safe to run many times). */
export async function replaceScore(row: ScoreRow): Promise<void> {
  if (!usingDatabase()) {
    g.__demoScores = g.__demoScores!.filter((r) => !(r.player === row.player && r.challenge === row.challenge));
    g.__demoScores.push(row);
    return;
  }
  const del = await fetch(
    `${SUPABASE_URL}/rest/v1/scores?player=eq.${encodeURIComponent(row.player)}&challenge=eq.${encodeURIComponent(row.challenge)}`,
    { method: "DELETE", headers: headers({ Prefer: "return=minimal" }) },
  );
  if (!del.ok) await fail("delete", del);
  await addScore(row);
}

export async function topPlayers(limit = 20) {
  let rows: ScoreRow[] = [];
  if (!usingDatabase()) {
    rows = g.__demoScores!;
  } else {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/scores?select=player,challenge,points&order=created_at.desc&limit=2000`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) await fail("read", res);
    rows = (await res.json()) as ScoreRow[];
  }
  const totals = new Map<string, number>();
  for (const r of rows) totals.set(r.player, (totals.get(r.player) || 0) + r.points);
  return [...totals.entries()]
    .map(([player, points]) => ({ player, points }))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}