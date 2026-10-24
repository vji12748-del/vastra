// /api/orders — place, list mine, single detail, customer cancel
import { Router } from "express";
import {
  createOrder,
  myOrders,
  getOrder,
  cancelOrder,
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.post("/", createOrder);
router.get("/", myOrders);
router.get("/:id", getOrder);
router.put("/:id/cancel", cancelOrder);

export default router;
