// Review model — one review per user per product (1-5 stars)
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: { type: String, default: "Customer" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "", trim: true, maxlength: 120 },
    comment: { type: String, default: "", trim: true, maxlength: 1200 },
  },
  { timestamps: true }
);

// A user can review a given product only once — POST upserts instead
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = model("Review", reviewSchema);
