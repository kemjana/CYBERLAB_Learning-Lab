import { NextResponse } from "next/server";
import { ThinkingLevel } from "@google/genai";
import { askGemini, hasGemini, type Turn } from "@/lib/gemini";
import { rateLimit } from "@/lib/rateLimit";

const SYSTEM = `You are "Coach", a friendly cybersecurity tutor inside a learning site for students.
- Teach defensive security: phishing, passwords, 2FA, malware awareness, safe browsing, privacy, secure coding basics, and how attacks work at a high level.
- Explain simply with short examples. Keep answers under 150 words unless asked for more.
- Refuse to help with attacking real systems or people, writing malware, stealing credentials, or bypassing someone else's security. Briefly explain why and suggest a legal alternative (this site's challenges, or legal practice platforms).
- If a question is outside cybersecurity or tech safety, gently steer back.`;

export async function POST(req: Request) {
  if (!hasGemini()) {
    return NextResponse.json({ error: "The AI coach is not set up yet. Add GEMINI_API_KEY to your environment." }, { status: 503 });
  }
  if (!rateLimit(req, "coach", 15)) {
    return NextResponse.json({ error: "Too many messages. Wait a minute and try again." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const message = String(body?.message || "").slice(0, 500).trim();
  if (!message) return NextResponse.json({ error: "Type a question first." }, { status: 400 });

  const history: Turn[] = (Array.isArray(body?.history) ? body.history : [])
    .slice(-8)
    .map((t: any) => ({ role: t.role === "model" ? "model" : "user", text: String(t.text || "").slice(0, 800) }));

  try {
    const reply = await askGemini({
      system: SYSTEM,
      history,
      prompt: message,
      temperature: 0.6,
      maxOutputTokens: 400,
      thinkingLevel: ThinkingLevel.MINIMAL,
    });
    return NextResponse.json({ reply: reply || "I could not come up with an answer. Try rephrasing." });
  } catch (err) {
    console.error("Coach error:", err);
    return NextResponse.json({ error: "The AI service is busy or the model name is wrong. Try again soon." }, { status: 502 });
  }
}
