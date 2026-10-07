const buckets = new Map<string, number[]>();

/**
 * Fixed-window counter per key.
 *
 * ponytail: in-process Map, not Redis — correct for M0's single local
 * `next start` process but resets on every deploy/restart and does not share
 * state across instances. M15 replaces every call site with the Redis-backed
 * limiter TR-SRCH-01/SEC-31 describe once this runs on more than one process.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number, now: number): boolean {
  const cutoff = now - windowMs;
  const recent = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);
  return true;
}
