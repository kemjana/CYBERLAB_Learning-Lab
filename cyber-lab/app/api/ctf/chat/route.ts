import { NextResponse } from "next/server";
import { askGemini, hasGemini, type Turn } from "@/lib/gemini";
import { rateLimit } from "@/lib/rateLimit";
import { getLevel, leaksFlag, systemFor } from "@/lib/ctf";

export async function POST(req: Request) {
  if (!hasGemini()) {
    return NextResponse.json({ error: "The CTF bot needs GEMINI_API_KEY to be set." }, { status: 503 });
  }
  if (!rateLimit(req, "ctf", 20)) {
    return NextResponse.json({ error: "Slow down. Wait a minute and try again." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const level = Number(body?.level);
  if (!getLevel(level)) return NextResponse.json({ error: "Unknown level." }, { status: 400 });

  const message = String(body?.message || "").slice(0, 400).trim();
  if (!message) return NextResponse.json({ error: "Type a message first." }, { status: 400 });

  const history: Turn[] = (Array.isArray(body?.history) ? body.history : [])
    .slice(-6)
    .map((t: any) => ({ role: t.role === "model" ? "model" : "user", text: String(t.text || "").slice(0, 600) }));

  try {
    let reply = await askGemini({ system: systemFor(level), history, prompt: message, temperature: 0.8 });
    if (level === 3 && leaksFlag(level, reply)) {
      reply = "[Blocked by output filter: the reply contained the secret.]";
    }
    return NextResponse.json({ reply: reply || "..." });
  } catch (err) {
    console.error("CTF error:", err);
    return NextResponse.json({ error: "The AI service is busy. Try again soon." }, { status: 502 });
  }
}
