// VASTRA — Express server entry (MERN).
// Slim composition root: connects DB, mounts middleware + routers, serves the
// React build. All business logic lives in controllers/, rules in config/.
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import { connectDB } from "./lib/mongo.js";
import { PORT, NODE_ENV } from "./config/index.js";
import { attachUser } from "./middleware/auth.js";
import { apiNotFound, errorHandler } from "./middleware/errorHandler.js";
import { secureHeaders, apiLogger } from "./middleware/security.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import userRoutes from "./routes/users.js";
import wishlistRoutes from "./routes/wishlist.js";
import orderRoutes from "./routes/orders.js";
import couponRoutes from "./routes/coupons.js";
import adminRoutes from "./routes/admin.js";
import invoiceRoutes from "./routes/invoices.js";
import docsRoutes from "./routes/docs.js";
import { seedIfEmpty } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(__dirname, "..", "client", "dist");
const BOOTED_AT = Date.now();

async function main() {
  await connectDB();
  await seedIfEmpty();

  const app = express();
  app.disable("x-powered-by");

  /* ---------------- middleware chain ---------------- */
  app.use(secureHeaders);
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(apiLogger);
  app.use(attachUser);

  /* ---------------- API ---------------- */
  app.get("/api/health", (_req, res) =>
    res.json({
      ok: true,
      stack: "MERN",
      db: "MongoDB",
      dbState: mongoose.Connection.STATES[mongoose.connection.readyState] || "unknown",
      env: NODE_ENV,
      uptimeSec: Math.round((Date.now() - BOOTED_AT) / 1000),
      time: new Date().toISOString(),
    })
  );

  app.use("/api/docs", docsRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/wishlist", wishlistRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/coupons", couponRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/invoices", invoiceRoutes);

  app.use("/api", apiNotFound);

  /* ---------------- Static React build + SPA fallback ---------------- */
  if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST, { maxAge: "1h", index: false }));
    // HTML must never be cached stale — hashed assets can, but index.html must
    // always revalidate so users get the latest bundle after a rebuild.
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-store");
      res.sendFile(path.join(CLIENT_DIST, "index.html"));
    });
  } else {
    app.get("*", (_req, res) =>
      res
        .status(503)
        .send("<h1>VASTRA</h1><p>Client build missing. Run: <code>bun run build</code></p>")
    );
  }

  /* ---------------- terminal error handler ---------------- */
  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    console.log(`[express] VASTRA (MERN) running on http://localhost:${PORT} [${NODE_ENV}]`);
  });

  /* ---------------- graceful shutdown ---------------- */
  const shutdown = async (signal) => {
    console.log(`[lifecycle] ${signal} received — shutting down cleanly…`);
    server.close(async () => {
      try { await mongoose.disconnect(); } catch { /* already closed */ }
      process.exit(0);
    });
    // Hard exit if connections refuse to drain
    setTimeout(() => process.exit(0), 8000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", (r) => console.error("[unhandledRejection]", r));
  process.on("uncaughtException", (e) => console.error("[uncaughtException]", e));
}

main().catch((e) => {
  console.error("[fatal]", e);
  process.exit(1);
});
