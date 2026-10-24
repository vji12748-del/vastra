// /api/products — public catalog + product detail + reviews
import { Router } from "express";
import {
  listProducts,
  getProduct,
  listReviews,
  createReview,
} from "../controllers/productController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.get("/:id/reviews", listReviews);
router.post("/:id/reviews", requireAuth, createReview);

export default router;
