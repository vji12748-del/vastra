// /api/invoices — invoice PDF download (owner or admin only)
import { Router } from "express";
import { downloadInvoice } from "../controllers/invoiceController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/invoices/:orderId/download → application/pdf (opens inline / printable)
router.get("/:orderId/download", requireAuth, downloadInvoice);

export default router;
