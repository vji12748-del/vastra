// Tiny in-memory rate limiter (per IP, fixed window) — guards auth endpoints
// against brute-force. Zero dependencies; resets on process restart.

const buckets = new Map(); // key → { count, resetAt }

// Periodic sweep so the Map never grows unbounded
const SWEEP_MS = 5 * 60 * 1000;
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}, SWEEP_MS);
sweeper.unref?.();

/**
 * @param {number} max      requests allowed per window
 * @param {number} windowMs window length in ms
 */
export function rateLimit(max = 40, windowMs = 60 * 1000) {
  return (req, res, next) => {
    const ip =
      req.ip ||
      req.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    const key = `${ip}`;
    const now = Date.now();

    let b = buckets.get(key);
    if (!b || b.resetAt <= now) {
      b = { count: 0, resetAt: now + windowMs };
      buckets.set(key, b);
    }

    b.count += 1;
    if (b.count > max) {
      const retry = Math.ceil((b.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retry));
      return res
        .status(429)
        .json({ error: `Too many requests — please try again in ${retry}s` });
    }
    next();
  };
}
