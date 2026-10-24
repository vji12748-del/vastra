// Admin controller — dashboard stats, product CRUD, order management, customers
// (Every route behind requireAdmin — wired in routes/admin.js)
import { User, Product, Order, Invoice } from "../models/index.js";
import { ORDER_STATUSES, LOW_STOCK_THRESHOLD } from "../config/index.js";
import { ensureInvoiceForOrder } from "../lib/invoices.js";
import { asyncHandler, httpError } from "../middleware/errorHandler.js";

const isObjectId = (s) => /^[a-f\d]{24}$/i.test(String(s));
const escapeRx = (s) => String(s).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ---------------- Dashboard stats ---------------- */
export const stats = asyncHandler(async (_req, res) => {
  const [revenueAgg, orderCount, productCount, userCount, pendingAgg, topCats] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: "CANCELLED" } } },
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]),
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: "USER" }),
    Order.countDocuments({ status: { $in: ["PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"] } }),
    Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", qty: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
  ]);
  const lowStock = await Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } })
    .select("name stock category")
    .limit(6)
    .lean();

  res.json({
    stats: {
      revenue: revenueAgg[0]?.revenue || 0,
      orders: orderCount,
      products: productCount,
      customers: userCount,
      pending: pendingAgg,
    },
    topProducts: topCats,
    lowStock,
    statuses: ORDER_STATUSES,
  });
});

/* ---------------- Products CRUD ---------------- */
export const listAdminProducts = asyncHandler(async (req, res) => {
  const { category, sub, search } = req.query;
  const q = {};
  if (category === "MEN" || category === "WOMEN") q.category = category;
  if (sub) q.subCategory = String(sub);
  if (search) {
    const rx = new RegExp(escapeRx(search), "i");
    q.$or = [{ name: rx }, { description: rx }];
  }
  const products = await Product.find(q).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ products });
});

function validProduct(body) {
  const { name, price, category, subCategory, image } = body;
  if (!name || !String(name).trim()) return "Product name is required";
  if (!(Number(price) > 0)) return "Price must be greater than 0";
  if (!["MEN", "WOMEN"].includes(category)) return "Category must be MEN or WOMEN";
  if (!subCategory) return "Sub-category is required";
  if (!image || !/^https?:\/\//.test(image)) return "Image must be a valid http(s) URL";
  return null;
}

export const createProduct = asyncHandler(async (req, res) => {
  const err = validProduct(req.body);
  if (err) throw httpError(400, err);
  const b = req.body;
  const product = await Product.create({
    name: String(b.name).trim(),
    description: b.description || "",
    price: Number(b.price),
    originalPrice: Number(b.originalPrice) || 0,
    category: b.category,
    subCategory: String(b.subCategory),
    image: b.image,
    images: [b.image, ...(b.images || [])].slice(0, 4),
    sizes: b.sizes || ["S", "M", "L", "XL", "XXL"],
    colors: b.colors || ["Black", "White"],
    rating: Number(b.rating) || 4.5,
    reviewsCount: Number(b.reviewsCount) || 0,
    stock: Number(b.stock) || 25,
    newArrival: !!b.newArrival || !!b.isNew,
    isBestseller: !!b.isBestseller,
  });
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw httpError(404, "Product not found");
  const b = req.body;
  const update = {};
  if (b.name !== undefined) update.name = String(b.name).trim();
  if (b.description !== undefined) update.description = b.description;
  if (b.price !== undefined) update.price = Number(b.price);
  if (b.originalPrice !== undefined) update.originalPrice = Number(b.originalPrice);
  if (b.category !== undefined) {
    if (!["MEN", "WOMEN"].includes(b.category)) throw httpError(400, "Invalid category");
    update.category = b.category;
  }
  if (b.subCategory !== undefined) update.subCategory = b.subCategory;
  if (b.image !== undefined) {
    if (!/^https?:\/\//.test(b.image)) throw httpError(400, "Image must be a valid http(s) URL");
    update.image = b.image;
  }
  if (b.sizes !== undefined) update.sizes = b.sizes;
  if (b.colors !== undefined) update.colors = b.colors;
  if (b.stock !== undefined) update.stock = Number(b.stock);
  if (b.newArrival !== undefined || b.isNew !== undefined) update.newArrival = !!(b.newArrival ?? b.isNew);
  if (b.isBestseller !== undefined) update.isBestseller = !!b.isBestseller;

  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
  if (!product) throw httpError(404, "Product not found");
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw httpError(404, "Product not found");
  const product = await Product.findByIdAndDelete(req.params.id).lean();
  if (!product) throw httpError(404, "Product not found");
  res.json({ ok: true });
});

/* ---------------- Orders ---------------- */
async function attachInvoices(orders) {
  const invoices = await Invoice.find({ orderId: { $in: orders.map((o) => o._id) } })
    .select("orderId invoiceNo status total")
    .lean();
  const invMap = new Map(invoices.map((i) => [String(i.orderId), i]));
  return orders.map((o) => ({ ...o, invoice: invMap.get(String(o._id)) || null }));
}

export const listAdminOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ orders: await attachInvoices(orders) });
});

export const getAdminOrder = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw httpError(404, "Order not found");
  const order = await Order.findById(req.params.id).lean();
  if (!order) throw httpError(404, "Order not found");
  res.json({ order: (await attachInvoices([order]))[0] });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) throw httpError(400, "Invalid status");
  if (!isObjectId(req.params.id)) throw httpError(404, "Order not found");

  const existing = await Order.findById(req.params.id).lean();
  if (!existing) throw httpError(404, "Order not found");

  // COD payment is confirmed when the order reaches the customer
  if (status === "DELIVERED" && !existing.payment.paid) {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        "payment.paid": true,
        "payment.reference": `COD-COLLECTED-${existing.orderId}`,
      },
      { new: true }
    ).lean();
    const invoice = await ensureInvoiceForOrder(order, { markPaid: true });
    return res.json({ order, invoice, codCollected: true });
  }

  if (status === "DELIVERED" && existing.payment.paid) {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    const invoice = await ensureInvoiceForOrder(order);
    return res.json({ order, invoice });
  }

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
  res.json({ order });
});

/* ---------------- Customers ---------------- */
export const listUsers = asyncHandler(async (_req, res) => {
  const [users, spendAgg] = await Promise.all([
    User.find({ role: "USER" }).sort({ createdAt: -1 }).limit(200).lean(),
    Order.aggregate([
      { $match: { status: { $ne: "CANCELLED" } } },
      { $group: { _id: "$userId", orders: { $sum: 1 }, spend: { $sum: "$total" } } },
    ]),
  ]);
  const spendMap = new Map(spendAgg.map((s) => [String(s._id), s]));

  res.json({
    users: users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      orders: spendMap.get(String(u._id))?.orders || 0,
      totalSpend: spendMap.get(String(u._id))?.spend || 0,
    })),
  });
});
