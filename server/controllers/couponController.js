// Coupon controller — validate a code against the current bag subtotal
import { Router } from "express";
import { COUPONS } from "../config/index.js";

export const validateCoupon = (req, res) => {
  const { code, subtotal } = req.body || {};
  const c = COUPONS[String(code || "").toUpperCase()];
  if (!c) return res.status(404).json({ error: "Invalid coupon code" });
  if ((Number(subtotal) || 0) < c.min) {
    return res
      .status(400)
      .json({ error: `Add items worth ₹${c.min - Math.floor(subtotal || 0)} more to use ${c.label}` });
  }
  res.json({ code: String(code).toUpperCase(), off: c.off, label: c.label });
};

export const listCoupons = (_req, res) => {
  res.json({ coupons: Object.entries(COUPONS).map(([code, c]) => ({ code, ...c })) });
};
