import { NextResponse } from "next/server";
import { getLevel } from "@/lib/ctf";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const l = getLevel(Number(body?.level));
  if (!l) return NextResponse.json({ error: "Unknown level." }, { status: 400 });
  const correct = String(body?.flag || "").trim() === l.flag;
  return NextResponse.json({ correct, points: correct ? l.points : 0 });
}
