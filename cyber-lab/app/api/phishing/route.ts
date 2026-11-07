import { NextResponse } from "next/server";
import { askGemini, hasGemini } from "@/lib/gemini";
import { encryptJSON } from "@/lib/crypto";
import { rateLimit } from "@/lib/rateLimit";
import { FALLBACK_CHALLENGES, FLAG_OPTIONS, validateChallenge, type PhishingChallenge } from "@/lib/phishing";

export const dynamic = "force-dynamic";

const THEMES = ["bank alert", "delivery notice", "HR or payroll", "school or campus IT", "social media security", "online shopping receipt", "streaming subscription", "job offer"];

const SYSTEM = `You write FICTIONAL training emails for a cybersecurity awareness game for students.
Rules:
- Use only invented company names and reserved/fake domains ending in .example. Never use real brands, real people, or real URLs.
- Never include real instructions for attacks. This is only for teaching people to spot scams.
- Return ONLY valid JSON, no markdown.`;

function prompt(difficulty: string, theme: string, wantPhishing: boolean) {
  const flagList = FLAG_OPTIONS.map((f) => `"${f.id}" = ${f.label}`).join("; ");
  return `Create one ${difficulty} difficulty training email. Theme: ${theme}. It must be ${
    wantPhishing ? "a PHISHING email" : "a LEGITIMATE email (no red flags)"
  }. ${
    difficulty === "hard" && wantPhishing ? "Make the red flags subtle." : ""
  }
Return JSON in exactly this shape:
{"email":{"from":"Name <address@domain.example>","subject":"...","body":"plain text, under 120 words","links":[{"text":"visible link text","url":"fake url on a .example domain"}],"attachment":"optional file name or omit"},
"key":{"isPhishing":${wantPhishing},"flags":[ids that truly apply${wantPhishing ? "" : ", must be empty"}],"explanation":"2-3 sentences explaining the red flags (or why it is safe) for a beginner"}}
Allowed flag ids: ${flagList}.`;
}

export async function GET(req: Request) {
  if (!rateLimit(req, "phishing", 20)) {
    return NextResponse.json({ error: "Too many requests. Wait a minute and try again." }, { status: 429 });
  }
  const url = new URL(req.url);
  const difficulty = ["easy", "medium", "hard"].includes(url.searchParams.get("difficulty") || "")
    ? url.searchParams.get("difficulty")!
    : "medium";

  let challenge: PhishingChallenge | null = null;
  let source: "gemini" | "sample" = "sample";

  if (hasGemini()) {
    try {
      const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
      const wantPhishing = Math.random() < 0.65;
      const text = await askGemini({ system: SYSTEM, prompt: prompt(difficulty, theme, wantPhishing), json: true });
      challenge = validateChallenge(JSON.parse(text.replace(/```json|```/g, "").trim()));
      if (challenge) source = "gemini";
    } catch (err) {
      console.error("Gemini phishing generation failed:", err);
    }
  }

  if (!challenge) {
    challenge = FALLBACK_CHALLENGES[Math.floor(Math.random() * FALLBACK_CHALLENGES.length)];
  }

  return NextResponse.json({
    email: challenge.email,
    token: encryptJSON(challenge.key), // answer key stays hidden inside this token
    source,
  });
}
