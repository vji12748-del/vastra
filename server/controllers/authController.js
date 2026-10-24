// Auth controller — signup / login / me / logout
import { User } from "../models/index.js";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  publicUser,
} from "../lib/auth.js";
import { asyncHandler, httpError } from "../middleware/errorHandler.js";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !String(name).trim()) throw httpError(400, "Name is required");
  if (!email || !EMAIL_RX.test(email)) throw httpError(400, "Enter a valid email address");
  if (!password || password.length < 6) throw httpError(400, "Password must be at least 6 characters");

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw httpError(409, "An account with this email already exists — please sign in");

  try {
    const user = await User.create({
      name: String(name).trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      role: "USER",
    });
    await createSession(res, user._id);
    res.status(201).json({ user: publicUser(user.toObject()) });
  } catch (e) {
    if (e?.code === 11000) throw httpError(409, "An account with this email already exists — please sign in");
    throw e;
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw httpError(400, "Email and password are required");

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw httpError(401, "Invalid email or password");
  }
  await createSession(res, user._id);
  res.json({ user: publicUser(user.toObject()) });
});

export const me = (req, res) => {
  res.json({ user: req.user || null });
};

export const logout = asyncHandler(async (req, res) => {
  await destroySession(req, res);
  res.json({ ok: true });
});
