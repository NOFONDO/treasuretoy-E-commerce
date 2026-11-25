/**
 * Minimal in-memory sliding-window limiter.
 * Good enough for a single instance; on serverless, swap for Upstash/Redis
 * because each instance keeps its own counters.
 */
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}
