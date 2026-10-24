// /api/auth — signup, login, me, logout (rate-limited on credential routes)
import { Router } from "express";
import { signup, login, me, logout } from "../controllers/authController.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();
const authLimiter = rateLimit(40, 60 * 1000); // 40 attempts / min / IP

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.get("/me", me);
router.post("/logout", logout);

export default router;
