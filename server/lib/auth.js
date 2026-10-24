// Auth utilities — scrypt password hashing + MongoDB-backed session lifecycle.
// (Route guards live in middleware/auth.js; this module only manages secrets.)
import { scryptSync, randomBytes, timingSafeEqual, randomUUID } from "crypto";
import { Session } from "../models/index.js";
import { COOKIE_NAME, SESSION_DAYS } from "../config/index.js";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    const [salt, hash] = String(stored).split(":");
    const candidate = scryptSync(password, salt, 64);
    const original = Buffer.from(hash, "hex");
    return candidate.length === original.length && timingSafeEqual(candidate, original);
  } catch {
    return false;
  }
}

export async function createSession(res, userId) {
  const token = randomUUID().replace(/-/g, "") + randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await Session.create({ token, userId, expiresAt });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
  return token;
}

export async function destroySession(req, res) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) await Session.deleteOne({ token });
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function publicUser(u) {
  return { id: u.id ?? u._id, name: u.name, email: u.email, role: u.role };
}
