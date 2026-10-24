// Change demo customer name: "Priya Sharma" -> "Vastra"
// Also updates saved-address fullName entries that carry the old name (checkout prefill consistency).
// Past ORDERS are historical snapshots — left untouched intentionally.
import mongoose from "mongoose";

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vastra";
const OLD_NAME = "Priya Sharma";
const NEW_NAME = "Vastra";
const EMAIL = "vastra@example.com";

await mongoose.connect(MONGO);
const users = mongoose.connection.collection("users");

const u = await users.findOne({ email: EMAIL });
if (!u) {
  console.log(`ABORT: ${EMAIL} not found`);
  process.exit(1);
}

console.log("Before:", JSON.stringify({ name: u.name, addresses: (u.addressBook || []).map(a => a.fullName) }));

const update = { $set: { name: NEW_NAME } };
const addr = u.addressBook || [];
addr.forEach((a, i) => {
  if (a.fullName === OLD_NAME) update.$set[`addressBook.${i}.fullName`] = NEW_NAME;
});

const r = await users.updateOne({ _id: u._id }, update);
console.log(`matched=${r.matchedCount} modified=${r.modifiedCount}`);

const after = await users.findOne({ _id: u._id });
console.log("After:", JSON.stringify({ name: after.name, addresses: (after.addressBook || []).map(a => a.fullName) }));

await mongoose.disconnect();
