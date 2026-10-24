// Auth middleware — session resolution + route guards
import { User, Session } from "../models/index.js";
import { COOKIE_NAME } from "../config/index.js";

/** Attaches req.user when a valid session cookie exists (never blocks the request) */
export async function attachUser(req, _res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (token) {
      const session = await Session.findOne({ token, expiresAt: { $gt: new Date() } });
      if (session) {
        const user = await User.findById(session.userId).lean();
        if (user) {
          req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }
      }
    }
  } catch (e) {
    console.error("attachUser error:", e.message);
  }
  next();
}

/** 401 gate — any signed-in user */
export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Please sign in to continue" });
  next();
}

/** 401/403 gate — admin only */
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Please sign in to continue" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin access only" });
  next();
}
