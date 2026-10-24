// Invoice service — creates / finalizes invoices when payment is confirmed
import { Invoice, Counter } from "../models/index.js";

async function nextInvoiceNo() {
  const year = new Date().getFullYear();
  const c = await Counter.findOneAndUpdate(
    { _id: `invoice-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `VST-INV-${year}-${String(c.seq).padStart(4, "0")}`;
}

/**
 * Ensure an invoice exists for an order.
 * - Online payments (UPI/CARD/NETBANKING/WALLET): order.payment.paid = true → invoice PAID
 * - COD: invoice created as PAYMENT_DUE; when payment is collected (admin marks DELIVERED),
 *   call with markPaid = true → invoice finalized to PAID.
 */
export async function ensureInvoiceForOrder(order, { markPaid = false } = {}) {
  let inv = await Invoice.findOne({ orderId: order._id });

  if (!inv) {
    const a = order.address || {};
    const invoiceNo = await nextInvoiceNo();
    try {
      inv = await Invoice.create({
        invoiceNo,
        orderId: order._id,
        orderRef: order.orderId,
        userId: order.userId,
        billedTo: {
          name: a.fullName || "Customer",
          phone: a.phone || "",
          addressLine: [a.line1, a.line2].filter(Boolean).join(", "),
          cityLine: [a.city, a.state].filter(Boolean).join(", ") + (a.pincode ? ` — ${a.pincode}` : ""),
        },
        items: order.items,
        couponCode: order.couponCode || "",
        subtotal: order.subtotal,
        discount: order.discount || 0,
        shipping: order.shipping || 0,
        total: order.total,
        paymentMethod: order.payment?.method,
        paymentReference: order.payment?.reference || "",
        status: order.payment?.paid ? "PAID" : "PAYMENT_DUE",
        paidAt: order.payment?.paid ? new Date() : null,
      });
      return inv;
    } catch (e) {
      // race-safe: unique index on orderId → re-fetch on duplicate
      if (e?.code === 11000) {
        inv = await Invoice.findOne({ orderId: order._id });
        if (inv) return syncStatus(inv, order, markPaid);
      }
      throw e;
    }
  }

  return syncStatus(inv, order, markPaid);
}

async function syncStatus(inv, order, markPaid) {
  const shouldMarkPaid = markPaid || (order.payment?.paid && inv.status !== "PAID");
  if (shouldMarkPaid && inv.status !== "PAID") {
    inv.status = "PAID";
    inv.paidAt = inv.paidAt || new Date();
    if (!inv.paymentReference) {
      inv.paymentReference = order.payment?.reference || `COD-COLLECTED-${order.orderId}`;
    }
    await inv.save();
  }
  return inv;
}
