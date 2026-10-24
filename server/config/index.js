// Central configuration — loads .env (zero-dependency), exports all tunables.
// Priority: real environment variables > .env file > defaults.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ---------------- .env loader (no dotenv dependency needed) ---------------- */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, "..", "..", ".env");

try {
  if (fs.existsSync(ENV_PATH)) {
    const lines = fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val; // real env wins
    }
  }
} catch {
  /* .env is optional — defaults below are safe */
}

/* ---------------- Core ---------------- */
export const PORT = Number(process.env.PORT) || 3000;
export const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vastra";
export const NODE_ENV = process.env.NODE_ENV || "development";

/* ---------------- Auth / sessions ---------------- */
export const COOKIE_NAME = "vastra_session";
export const SESSION_DAYS = Number(process.env.SESSION_DAYS) || 7;

/* ---------------- Commerce rules ---------------- */
export const COUPONS = {
  VASTRA10: { off: 0.1, min: 1000, label: "10% off above ₹1000" },
  FIRST50: { off: 0.15, min: 2000, label: "15% off above ₹2000" },
  BIGSAVE: { off: 0.2, min: 5000, label: "20% off above ₹5000" },
};

export const FREE_SHIP_THRESHOLD = 1999;
export const SHIPPING_FEE = 99;

export const ORDER_STATUSES = [
  "PLACED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

// Statuses a customer may cancel from their own account page
export const USER_CANCELLABLE = ["PLACED", "PACKED"];

export const MAX_QTY_PER_ITEM = 10;
export const LOW_STOCK_THRESHOLD = 5;

/* ---------------- Pricing engine (single source of truth) ---------------- */
export function computeTotals(subtotal, couponCode) {
  let discount = 0;
  let shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;
  const c = couponCode ? COUPONS[couponCode.toUpperCase()] : null;
  if (c && subtotal >= c.min) discount = Math.round(subtotal * c.off);
  const total = Math.max(0, subtotal - discount) + (subtotal > 0 ? shipping : 0);
  return { discount, shipping, total };
}
