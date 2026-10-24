// /api/coupons — list available coupons + validate against a subtotal
import { Router } from "express";
import { validateCoupon, listCoupons } from "../controllers/couponController.js";

const router = Router();
router.get("/", listCoupons);
router.post("/validate", validateCoupon);

export default router;
