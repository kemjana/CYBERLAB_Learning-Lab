import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

// Encrypts the phishing "answer key" so it can travel through the browser
// without the player being able to read it. Only the server can decrypt it.
function getKey(): Buffer {
  const secret =
    process.env.TOKEN_SECRET || process.env.GEMINI_API_KEY || "dev-only-secret-change-me";
  return createHash("sha256").update(secret).digest();
}

export function encryptJSON(data: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decryptJSON<T>(token: string): T | null {
  try {
    const raw = Buffer.from(token, "base64url");
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const enc = raw.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return JSON.parse(dec.toString("utf8")) as T;
  } catch {
    return null;
  }
}
