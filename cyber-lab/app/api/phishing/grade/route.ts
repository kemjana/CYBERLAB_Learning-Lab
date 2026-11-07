import { NextResponse } from "next/server";
import { decryptJSON } from "@/lib/crypto";
import { FLAG_OPTIONS, type PhishingKey } from "@/lib/phishing";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const key = body?.token ? decryptJSON<PhishingKey>(String(body.token)) : null;
  if (!key) return NextResponse.json({ error: "Invalid or expired challenge." }, { status: 400 });

  const verdictIsPhishing = body.verdict === "phishing";
  const picked: string[] = Array.isArray(body.flags) ? body.flags.map(String) : [];
  const valid = new Set<string>(FLAG_OPTIONS.map((f) => f.id));
  const chosen = picked.filter((f) => valid.has(f));

  const correctVerdict = verdictIsPhishing === key.isPhishing;
  const hits = chosen.filter((f) => key.flags.includes(f as never)).length;
  const wrong = chosen.length - hits;

  let flagPoints = Math.max(0, hits * 10 - wrong * 5);
  if (key.flags.length === 0 && wrong === 0) flagPoints = 30; // correctly saw no red flags
  const points = Math.min(100, (correctVerdict ? 50 : 0) + flagPoints);

  return NextResponse.json({
    correctVerdict,
    isPhishing: key.isPhishing,
    correctFlags: key.flags,
    explanation: key.explanation,
    points,
  });
}
