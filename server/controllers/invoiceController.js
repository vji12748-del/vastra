// Invoice controller — owner/admin PDF download (streams a printable tax invoice)
import { Order } from "../models/index.js";
import { ensureInvoiceForOrder } from "../lib/invoices.js";
import { buildInvoicePdf } from "../lib/invoicePdf.js";
import { asyncHandler, httpError } from "../middleware/errorHandler.js";

export const downloadInvoice = asyncHandler(async (req, res) => {
  const q = String(req.params.orderId);
  const isObjId = /^[a-f\d]{24}$/i.test(q);
  const order = await Order.findOne(isObjId ? { _id: q } : { orderId: q }).lean();
  if (!order) throw httpError(404, "Order not found");

  const isOwner = String(order.userId) === String(req.user.id);
  if (!isOwner && req.user.role !== "ADMIN") {
    throw httpError(403, "You can only download your own invoices");
  }

  const inv = await ensureInvoiceForOrder(order);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${inv.invoiceNo}.pdf"`);
  res.setHeader("Cache-Control", "no-store");

  // Absolute site origin for the in-PDF "Continue Shopping" link
  // (honours reverse-proxy headers so the preview domain works)
  const xfProto = req.get("X-Forwarded-Proto") || req.protocol || "http";
  const xfHost = req.get("X-Forwarded-Host") || req.get("host") || "localhost:3000";

  const doc = buildInvoicePdf(inv, order, { origin: `${xfProto}://${xfHost}` });
  doc.on("error", (e) => {
    console.error("invoice pdf error:", e.message);
    try { res.end(); } catch { /* noop */ }
  });
  doc.pipe(res);
  doc.end();
});
