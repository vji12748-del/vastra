// Product model — catalog for men & women clothing
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0, index: true },
    originalPrice: { type: Number, default: 0 },
    category: { type: String, enum: ["MEN", "WOMEN"], required: true, index: true },
    subCategory: { type: String, required: true, index: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    stock: { type: Number, default: 25, min: 0 },
    newArrival: { type: Boolean, default: false, index: true },
    isBestseller: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, subCategory: 1 });

export const Product = model("Product", productSchema);
