// User controller — profile, password change, saved address book
import { User } from "../models/index.js";
import { hashPassword, verifyPassword } from "../lib/auth.js";
import { asyncHandler, httpError } from "../middleware/errorHandler.js";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fullProfile(u) {
  return {
    id: u._id?.toString?.() ?? u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone || "",
    addresses: u.addresses || [],
    createdAt: u.createdAt,
  };
}

async function currentUser(id) {
  const u = await User.findById(id);
  if (!u) throw httpError(401, "Account not found — please sign in again");
  return u;
}

/* ---------------- Profile ---------------- */

export const getMe = asyncHandler(async (req, res) => {
  const u = await currentUser(req.user.id);
  res.json({ user: fullProfile(u) });
});

export const updateMe = asyncHandler(async (req, res) => {
  const u = await currentUser(req.user.id);
  const { name, email, phone } = req.body || {};

  if (name !== undefined) {
    if (!String(name).trim()) throw httpError(400, "Name cannot be empty");
    u.name = String(name).trim();
  }
  if (email !== undefined) {
    const em = String(email).toLowerCase().trim();
    if (!EMAIL_RX.test(em)) throw httpError(400, "Enter a valid email address");
    const taken = await User.findOne({ email: em, _id: { $ne: u._id } });
    if (taken) throw httpError(409, "This email is already linked to another account");
    u.email = em;
  }
  if (phone !== undefined) u.phone = String(phone).trim().slice(0, 15);

  await u.save();
  res.json({ user: fullProfile(u) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const u = await currentUser(req.user.id);
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) throw httpError(400, "Current and new password are required");
  if (!verifyPassword(currentPassword, u.passwordHash)) throw httpError(401, "Current password is incorrect");
  if (String(newPassword).length < 6) throw httpError(400, "New password must be at least 6 characters");
  if (currentPassword === newPassword) throw httpError(400, "New password must be different from the current one");

  u.passwordHash = hashPassword(newPassword);
  await u.save();
  res.json({ ok: true, message: "Password updated successfully" });
});

/* ---------------- Address book ---------------- */

function validateAddress(b) {
  if (!b.fullName?.trim()) return "Full name is required";
  if (!b.phone?.trim()) return "Phone number is required";
  if (!b.line1?.trim()) return "Address line 1 is required";
  if (!b.city?.trim()) return "City is required";
  if (!b.pincode?.trim()) return "Pincode is required";
  return null;
}

export const listAddresses = asyncHandler(async (req, res) => {
  const u = await currentUser(req.user.id);
  res.json({ addresses: u.addresses || [] });
});

export const addAddress = asyncHandler(async (req, res) => {
  const u = await currentUser(req.user.id);
  const b = req.body || {};

  const err = validateAddress(b);
  if (err) throw httpError(400, err);

  const makeDefault = !!b.isDefault || u.addresses.length === 0;
  if (makeDefault) u.addresses.forEach((a) => (a.isDefault = false));

  u.addresses.push({
    label: (b.label || "Home").trim(),
    fullName: b.fullName.trim(),
    phone: b.phone.trim(),
    line1: b.line1.trim(),
    line2: (b.line2 || "").trim(),
    city: b.city.trim(),
    state: (b.state || "").trim(),
    pincode: b.pincode.trim(),
    isDefault: makeDefault,
  });
  await u.save();

  const address = u.addresses[u.addresses.length - 1];
  res.status(201).json({ address, addresses: u.addresses });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const u = await currentUser(req.user.id);
  const addr = u.addresses.id(req.params.addrId);
  if (!addr) throw httpError(404, "Address not found");

  const b = req.body || {};
  const merged = { ...addr.toObject(), ...Object.fromEntries(Object.entries(b).filter(([, v]) => v !== undefined)) };
  const err = validateAddress(merged);
  if (err) throw httpError(400, err);

  for (const k of ["label", "fullName", "phone", "line1", "line2", "city", "state", "pincode"]) {
    if (b[k] !== undefined) addr[k] = String(b[k]).trim();
  }
  if (b.isDefault === true) {
    u.addresses.forEach((a) => (a.isDefault = false));
    addr.isDefault = true;
  } else if (b.isDefault === false && addr.isDefault && u.addresses.length > 1) {
    // keep at least one default — promote the first other address
    const other = u.addresses.find((a) => String(a._id) !== String(addr._id));
    if (other) other.isDefault = true;
    addr.isDefault = false;
  }
  await u.save();
  res.json({ address: addr, addresses: u.addresses });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const u = await currentUser(req.user.id);
  const addr = u.addresses.id(req.params.addrId);
  if (!addr) throw httpError(404, "Address not found");

  const wasDefault = addr.isDefault;
  addr.deleteOne();
  if (wasDefault && u.addresses.length > 0) u.addresses[0].isDefault = true;
  await u.save();
  res.json({ ok: true, addresses: u.addresses });
});
