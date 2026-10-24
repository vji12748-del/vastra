// Order model — items snapshot (server-repriced), address, payment, status
import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    name: String,
    image: String,
    price: Number,
    qty: Number,
    size: String,
    color: String,
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    items: { type: [orderItemSchema], default: [] },
    address: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    payment: {
      method: {
        type: String,
        enum: ["CARD", "UPI", "NETBANKING", "WALLET", "COD"],
        required: true,
      },
      reference: { type: String, default: "" },
      paid: { type: Boolean, default: false },
    },
    couponCode: { type: String, default: "" },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "PLACED",
        "PACKED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
      index: true,
    },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Order = model("Order", orderSchema);
