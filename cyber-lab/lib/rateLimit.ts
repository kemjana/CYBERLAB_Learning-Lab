// Very small in-memory rate limiter (per server instance).
// Good enough for a portfolio demo. For production, use a shared store (e.g. Upstash Redis).
const hits = new Map<string, number[]>();

export function rateLimit(req: Request, bucket: string, limit = 15, windowMs = 60_000): boolean {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
