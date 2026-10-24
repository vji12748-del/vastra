// /api/admin — stats, product CRUD, order management, customers (admin-only)
import { Router } from "express";
import {
  stats,
  listAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listAdminOrders,
  getAdminOrder,
  updateOrderStatus,
  listUsers,
} from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAdmin);

// Dashboard
router.get("/stats", stats);

// Products
router.get("/products", listAdminProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", listAdminOrders);
router.get("/orders/:id", getAdminOrder);
router.put("/orders/:id", updateOrderStatus);

// Customers
router.get("/users", listUsers);

export default router;
