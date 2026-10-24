// Change demo customer email: priya@example.com -> vastra@example.com
// Keeps same _id (orders/wishlist/reviews/sessions stay linked), same password.
import mongoose from "mongoose";

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vastra";
const OLD_EMAIL = "priya@example.com";
const NEW_EMAIL = "vastra@example.com";

await mongoose.connect(MONGO);
const users = mongoose.connection.collection("users");

const clash = await users.findOne({ email: NEW_EMAIL });
if (clash) {
  console.log(`ABORT: ${NEW_EMAIL} already exists (id=${clash._id})`);
  process.exit(1);
}

const u = await users.findOne({ email: OLD_EMAIL });
if (!u) {
  console.log(`ABORT: ${OLD_EMAIL} not found`);
  process.exit(1);
}

console.log("Before:", JSON.stringify({
  id: u._id, email: u.email, name: u.name, role: u.role,
  addresses: (u.addressBook || []).length,
}));

const r = await users.updateOne({ _id: u._id }, { $set: { email: NEW_EMAIL } });
console.log(`matched=${r.matchedCount} modified=${r.modifiedCount}`);

const after = await users.findOne({ _id: u._id });
console.log("After:", JSON.stringify({ email: after.email, name: after.name, role: after.role }));

const oldGone = !(await users.findOne({ email: OLD_EMAIL }));
console.log(`old email gone: ${oldGone}`);

await mongoose.disconnect();
