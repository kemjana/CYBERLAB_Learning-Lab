import { GoogleGenAI, type ThinkingLevel } from "@google/genai";

export const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

let client: GoogleGenAI | null = null;

export function hasGemini(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function getClient(): GoogleGenAI {
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export type Turn = { role: "user" | "model"; text: string };

/** Ask Gemini for plain text. `history` is the earlier conversation, oldest first. */
export async function askGemini(opts: {
  system: string;
  history?: Turn[];
  prompt: string;
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  thinkingLevel?: ThinkingLevel;
}): Promise<string> {
  const contents = [
    ...(opts.history || []).map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    { role: "user", parts: [{ text: opts.prompt }] },
  ];
  const res = await getClient().models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: opts.system,
      temperature: opts.temperature ?? 0.9,
      ...(opts.maxOutputTokens !== undefined ? { maxOutputTokens: opts.maxOutputTokens } : {}),
      ...(opts.thinkingLevel !== undefined ? { thinkingConfig: { thinkingLevel: opts.thinkingLevel } } : {}),
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  });
  return res.text ?? "";
}
