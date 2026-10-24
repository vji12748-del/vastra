// Invoice model — tax invoice record generated when payment is confirmed
import mongoose from "mongoose";
import { orderItemSchema } from "./Order.js";

const { Schema, model } = mongoose;

const invoiceSchema = new Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },
    orderRef: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    billedTo: {
      name: String,
      phone: String,
      addressLine: String,
      cityLine: String,
    },
    items: { type: [orderItemSchema], default: [] },
    couponCode: { type: String, default: "" },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: String,
    paymentReference: { type: String, default: "" },
    status: { type: String, enum: ["PAID", "PAYMENT_DUE"], default: "PAID" },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Invoice = model("Invoice", invoiceSchema);
