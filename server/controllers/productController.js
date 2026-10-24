// Product controller — public catalog (filters, search, sort, pagination) + detail
import { Product, Review } from "../models/index.js";
import { asyncHandler, httpError } from "../middleware/errorHandler.js";

const escapeRx = (s) => String(s).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isObjectId = (s) => /^[a-f\d]{24}$/i.test(String(s));

function buildFilter({ category, sub, search, flag }) {
  const q = {};
  if (category === "MEN" || category === "WOMEN") q.category = category;
  if (sub) q.subCategory = String(sub);
  if (flag === "new") q.newArrival = true;
  if (flag === "best") q.isBestseller = true;
  if (search) {
    const rx = new RegExp(escapeRx(search), "i");
    q.$or = [{ name: rx }, { description: rx }, { subCategory: rx }, { category: rx }];
  }
  return q;
}

function sortOption(sort) {
  switch (sort) {
    case "price-asc": return { price: 1 };
    case "price-desc": return { price: -1 };
    case "rating": return { rating: -1 };
    case "newest": return { createdAt: -1 };
    default: return { isBestseller: -1, rating: -1 };
  }
}

export const listProducts = asyncHandler(async (req, res) => {
  const { category, sub, search, sort, flag, page, limit } = req.query;
  const q = buildFilter({ category, sub, search, flag });
  const sortOpt = sortOption(sort);

  const hasPagination = page !== undefined || limit !== undefined;
  if (hasPagination) {
    const pg = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
    const [products, total] = await Promise.all([
      Product.find(q).sort(sortOpt).skip((pg - 1) * lim).limit(lim).lean(),
      Product.countDocuments(q),
    ]);
    return res.json({ products, count: products.length, total, page: pg, pages: Math.ceil(total / lim) });
  }

  // Legacy shape — unchanged for the existing client
  const products = await Product.find(q).sort(sortOpt).limit(120).lean();
  res.json({ products, count: products.length });
});

export const getProduct = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw httpError(404, "Product not found");
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw httpError(404, "Product not found");

  const related = await Product.find({
    _id: { $ne: product._id },
    $or: [{ category: product.category }, { subCategory: product.subCategory }],
  })
    .sort({ isBestseller: -1, rating: -1 })
    .limit(4)
    .lean();

  res.json({ product, related });
});

/** GET /api/products/:id/reviews — public review list, newest first */
export const listReviews = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw httpError(404, "Product not found");
  const product = await Product.findById(req.params.id).select("_id").lean();
  if (!product) throw httpError(404, "Product not found");

  const reviews = await Review.find({ productId: product._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ reviews, count: reviews.length });
});

/** POST /api/products/:id/reviews — auth; upsert (one review per user per product) */
export const createReview = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw httpError(404, "Product not found");
  const product = await Product.findById(req.params.id);
  if (!product) throw httpError(404, "Product not found");

  const { rating, title, comment } = req.body || {};
  const stars = Math.round(Number(rating));
  if (!stars || stars < 1 || stars > 5) throw httpError(400, "Rating must be between 1 and 5");

  const review = await Review.findOneAndUpdate(
    { productId: product._id, userId: req.user.id },
    {
      userName: req.user.name,
      rating: stars,
      title: String(title || "").slice(0, 120),
      comment: String(comment || "").slice(0, 1200),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  // Recompute the product's aggregate rating from live reviews
  const [agg] = await Review.aggregate([
    { $match: { productId: product._id } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  product.rating = agg ? Math.round(agg.avg * 10) / 10 : product.rating;
  product.reviewsCount = agg ? agg.count : product.reviewsCount;
  await product.save();

  res.status(201).json({ review, productRating: product.rating, reviewsCount: product.reviewsCount });
});
