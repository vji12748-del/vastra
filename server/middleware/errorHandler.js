// Centralized error handling — asyncHandler + httpError + terminal middleware.
// Every async controller is wrapped in asyncHandler; thrown errors land here
// so routes stay free of repetitive try/catch blocks.

/** Create an Error carrying an HTTP status (thrown by controllers) */
export function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

/** Wrap an async route handler so rejections flow to errorHandler */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/** 404 for unknown /api/* routes (JSON, never the SPA shell) */
export function apiNotFound(req, res) {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
}

/** Terminal error middleware — consistent JSON errors for the client */
export function errorHandler(err, _req, res, _next) {
  const status =
    err.status ||
    (err.name === "ValidationError" || err.name === "SyntaxError"
      ? 400
      : err.name === "CastError"
        ? 404
        : err.code === 11000
          ? 409
          : 500);

  if (status >= 500) console.error("[error]", err.stack || err.message);

  if (res.headersSent) {
    try { res.end(); } catch { /* socket already gone */ }
    return;
  }

  res.status(status).json({
    error:
      status >= 500
        ? "Something went wrong on our side. Please try again."
        : err.message,
  });
}
