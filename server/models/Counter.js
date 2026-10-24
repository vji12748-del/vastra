// Counter model — atomic auto-increment sequences (invoice numbers, etc.)
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const counterSchema = new Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});

export const Counter = model("Counter", counterSchema);
