// Order controller — place (server-repriced + stock-checked), my orders,
// single order detail, customer cancellation with automatic restock
import { Order, Product, Invoice } from "../models/index.js";
import { COUPONS, computeTotals, USER_CANCELLABLE, MAX_QTY_PER_ITEM } from "../config/index.js";
import { ensureInvoiceForOrder } from "../lib/invoices.js";
import { asyncHandler, httpError } from "../middleware/errorHandler.js";

function genOrderId() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VS-${t}-${r}`;
}

const isObjectId = (s) => /^[a-f\d]{24}$/i.test(String(s));

/** Accepts a Mongo _id or the human-facing VS-… orderId */
async function findOrder(idOrRef) {
  return Order.findOne(isObjectId(idOrRef) ? { _id: idOrRef } : { orderId: idOrRef });
}

function assertOwnerOrAdmin(order, user) {
  if (!order) throw httpError(404, "Order not found");
  const isOwner = String(order.userId) === String(user.id);
  if (!isOwner && user.role !== "ADMIN") throw httpError(403, "You can only view your own orders");
}

/* ---------------- POST /api/orders — place order ---------------- */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, address, payment, couponCode } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) throw httpError(400, "Your bag is empty");
  if (!address || !address.fullName || !address.phone || !address.line1 || !address.city || !address.pincode) {
    throw httpError(400, "Please fill the complete delivery address");
  }
  if (!payment || !payment.method) throw httpError(400, "Select a payment method");

  // Re-price server-side from DB (never trust client prices)
  const ids = items.map((i) => i.productId).filter(Boolean);
  const dbProducts = await Product.find({ _id: { $in: ids } }).lean();
  const byId = new Map(dbProducts.map((p) => [String(p._id), p]));

  const priced = [];
  for (const it of items) {
    const p = byId.get(String(it.productId));
    if (!p) throw httpError(400, "A product in your bag no longer exists");

    const qty = Math.max(1, Math.min(MAX_QTY_PER_ITEM, parseInt(it.qty, 10) || 1));

    // Stock safety — never oversell
    if (typeof p.stock === "number" && p.stock < qty) {
      throw httpError(400, `Only ${Math.max(0, p.stock)} left in stock for "${p.name}"`);
    }

    priced.push({
      productId: p._id,
      name: p.name,
      image: p.image,
      price: p.price,
      qty,
      size: it.size || (p.sizes?.[0] ?? "M"),
      color: it.color || (p.colors?.[0] ?? "Black"),
    });
  }

  const subtotal = priced.reduce((s, i) => s + i.price * i.qty, 0);
  const code = couponCode ? String(couponCode).toUpperCase() : "";
  const c = code ? COUPONS[code] : null;
  if (code && (!c || subtotal < c.min)) {
    throw httpError(400, "Coupon is invalid or minimum order not met");
  }
  const { discount, shipping, total } = computeTotals(subtotal, code);

  // Simulated payment gateway: non-COD is instantly paid
  const paid = payment.method !== "COD";
  const reference = paid
    ? `${payment.method}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    : "";

  const order = await Order.create({
    orderId: genOrderId(),
    userId: req.user.id,
    items: priced,
    address,
    payment: { method: payment.method, reference, paid },
    couponCode: c ? code : "",
    subtotal,
    discount,
    shipping,
    total,
    status: "PLACED",
  });

  // Decrement stock
  await Promise.all(
    priced.map((i) => Product.updateOne({ _id: i.productId }, { $inc: { stock: -i.qty } }))
  );

  // Payment confirmed (online) → tax invoice instantly.
  // COD → provisional PAYMENT_DUE invoice, finalized on delivery.
  const invoice = await ensureInvoiceForOrder(order);

  res.status(201).json({ order, invoice });
});

/* ---------------- GET /api/orders — my orders ---------------- */
export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50).lean();
  const invoices = await Invoice.find({ orderId: { $in: orders.map((o) => o._id) } })
    .select("orderId invoiceNo status total")
    .lean();
  const invMap = new Map(invoices.map((i) => [String(i.orderId), i]));
  res.json({ orders: orders.map((o) => ({ ...o, invoice: invMap.get(String(o._id)) || null })) });
});

/* ---------------- GET /api/orders/:id — single order (owner/admin) ---------------- */
export const getOrder = asyncHandler(async (req, res) => {
  const doc = await findOrder(req.params.id);
  assertOwnerOrAdmin(doc, req.user);

  const order = doc.toObject(); // plain object before spread (docs don't spread fields)
  const invoice = await Invoice.findOne({ orderId: order._id })
    .select("invoiceNo status total paidAt")
    .lean();
  res.json({ order: { ...order, invoice: invoice || null } });
});

/* ---------------- PUT /api/orders/:id/cancel — customer cancel ---------------- */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(req.params.id);
  assertOwnerOrAdmin(order, req.user);

  if (order.status === "CANCELLED") throw httpError(400, "This order is already cancelled");
  if (!USER_CANCELLABLE.includes(order.status)) {
    throw httpError(400, `Order can no longer be cancelled — it is ${order.status.replace(/_/g, " ").toLowerCase()}`);
  }

  order.status = "CANCELLED";
  order.cancelledAt = new Date();
  order.cancelReason = String(req.body?.reason || "Cancelled by customer").slice(0, 200);
  await order.save();

  // Restock everything that was reserved
  await Promise.all(
    order.items.map((i) =>
      Product.updateOne({ _id: i.productId }, { $inc: { stock: i.qty } }).catch(() => {})
    )
  );

  res.json({ order });
});
