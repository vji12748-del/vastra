// db-push.js — MERN equivalent: ensures MongoDB is running (binary + data dir)
// In MERN there is no schema push; MongoDB collections are created automatically.
import { spawn, execSync } from "child_process";
import net from "net";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MONGO_BIN = path.join(ROOT, ".mongodb", "bin", "mongod");
const DB_PATH = path.join(ROOT, ".mongodb-data");
const LOG_PATH = path.join(ROOT, ".mongodb", "mongod.log");
const PORT = 27017;

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once("connect", () => { socket.destroy(); resolve(true); });
    socket.once("timeout", () => { socket.destroy(); resolve(false); });
    socket.once("error", () => { socket.destroy(); resolve(false); });
    socket.connect(port, "127.0.0.1");
  });
}

export async function ensureMongo() {
  if (await isPortOpen(PORT)) {
    return { started: false, running: true };
  }
  if (!fs.existsSync(MONGO_BIN)) {
    throw new Error("mongod binary not found at " + MONGO_BIN);
  }
  fs.mkdirSync(DB_PATH, { recursive: true });
  return new Promise((resolve, reject) => {
    const child = spawn(MONGO_BIN, [
      "--dbpath", DB_PATH,
      "--port", String(PORT),
      "--bind_ip", "127.0.0.1",
      "--logpath", LOG_PATH,
      "--fork",
    ], { stdio: "ignore", detached: false });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve({ started: true, running: true });
      else reject(new Error("mongod exited with code " + code));
    });
  });
}

export async function waitMongo(maxMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (await isPortOpen(PORT)) return true;
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

// Run directly
if (process.argv[1] && process.argv[1].endsWith("db-push.js")) {
  (async () => {
    try {
      const res = await ensureMongo();
      const ok = await waitMongo();
      if (!ok) throw new Error("MongoDB did not become ready on port " + PORT);
      console.log(`[db:push] MongoDB ${res.started ? "started" : "already running"} on 127.0.0.1:${PORT}`);
      console.log("[db:push] Mongoose schemas will sync collections automatically (no push needed)");
      process.exit(0);
    } catch (e) {
      console.error("[db:push] FAILED:", e.message);
      process.exit(1);
    }
  })();
}
