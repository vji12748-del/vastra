// MongoDB connection manager
// - Cloud mode (Render/Railway/Atlas): MONGO_URI env var set → direct connect,
//   local mongod startup is SKIPPED (no mongod binary on cloud hosts).
// - Local mode: ensures a mongod process is running, then connects.
import mongoose from "mongoose";
import { MONGO_URI } from "./config.js";

export async function connectDB() {
  mongoose.set("strictQuery", true);

  // Timeout tuning — auto-heal against stale/dead sockets:
  // - socketTimeoutMS: a query on a dead socket fails after 20s (default is
  //   INFINITE — the cause of "products loading forever" hangs), then the
  //   driver discards that connection and the next request gets a fresh one.
  // - maxIdleTimeMS: idle sockets recycled after 2 min, avoiding half-dead ones.
  // - connectTimeoutMS/serverSelectionTimeoutMS: fail fast when DB unreachable.
  const OPTS = {
    socketTimeoutMS: 20000,
    connectTimeoutMS: 20000,
    serverSelectionTimeoutMS: 15000,
    maxIdleTimeMS: 120000,
    heartbeatFrequencyMS: 10000,
  };

  /* ---------- Cloud / Atlas mode ---------- */
  if (process.env.MONGO_URI) {
    await mongoose.connect(MONGO_URI, OPTS);
    console.log("[mongo] Connected (cloud):", mongoose.connection.name);
    return mongoose.connection;
  }

  /* ---------- Local sandbox mode ---------- */
  const { ensureMongo, waitMongo } = await import("../../scripts/db-push.js");
  try {
    await ensureMongo();
    await waitMongo(30000);
  } catch (e) {
    console.error("[mongo] Could not start local mongod:", e.message);
    throw e;
  }
  await mongoose.connect(MONGO_URI, OPTS);
  console.log("[mongo] Connected:", mongoose.connection.name);
  return mongoose.connection;
}
