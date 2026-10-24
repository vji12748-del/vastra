// Session model — DB-backed sessions (httpOnly cookie holds the token)
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const sessionSchema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB TTL index — expired sessions are garbage-collected automatically
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = model("Session", sessionSchema);
