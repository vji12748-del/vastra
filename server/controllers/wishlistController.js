// Wishlist controller — saved products per user
import { Wishlist, Product } from "../models/index.js";
import { asyncHandler, httpError } from "../middleware/errorHandler.js";

const isObjectId = (s) => /^[a-f\d]{24}$/i.test(String(s));

/** GET /api/wishlist — populated product docs, newest saved first */
export const listWishlist = asyncHandler(async (req, res) => {
  const rows = await Wishlist.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .populate("productId")
    .lean();

  const products = rows.map((r) => r.productId).filter(Boolean);
  res.json({ products, count: products.length });
});

/** POST /api/wishlist { productId } — idempotent add */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body || {};
  if (!isObjectId(productId)) throw httpError(400, "A valid productId is required");

  const product = await Product.findById(productId).select("_id").lean();
  if (!product) throw httpError(404, "Product not found");

  await Wishlist.updateOne(
    { userId: req.user.id, productId },
    { $setOnInsert: { userId: req.user.id, productId } },
    { upsert: true }
  );

  const count = await Wishlist.countDocuments({ userId: req.user.id });
  res.status(201).json({ ok: true, count });
});

/** DELETE /api/wishlist/:productId — idempotent remove */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.productId)) throw httpError(400, "A valid productId is required");
  await Wishlist.deleteOne({ userId: req.user.id, productId: req.params.productId });
  const count = await Wishlist.countDocuments({ userId: req.user.id });
  res.json({ ok: true, count });
});
