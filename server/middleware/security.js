// Security headers + concise API request logger (no external deps)

export function secureHeaders(_req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}

/** Logs method, path, status and duration for /api requests only */
export function apiLogger(req, res, next) {
  if (!req.path.startsWith("/api") || req.path === "/api/health") return next();
  const started = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    if (res.statusCode >= 500) {
      console.error(`[api] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms.toFixed(1)}ms)`);
    } else {
      console.log(`[api] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms.toFixed(1)}ms)`);
    }
  });
  next();
}
