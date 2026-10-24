// Seed MongoDB — 24 products (12 men + 12 women) + admin + demo customer
import mongoose from "mongoose";
import { User, Product } from "./models/index.js";
import { hashPassword } from "./lib/auth.js";
import { MONGO_URI } from "./lib/config.js";

const img = (id) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;
const thumb = (id) => `https://images.unsplash.com/${id}?w=400&q=70&auto=format&fit=crop`;

const menProducts = [
  { name: "Classic White Crew Tee", sub: "tshirts", price: 799, originalPrice: 1299, image: "photo-1521572163474-6864f9cf17ab", rating: 4.7, reviews: 234, bestseller: true, isNew: false, desc: "Premium 100% combed cotton tee with a classic crew neck. Breathable, durable and a wardrobe staple that goes with everything." },
  { name: "Essential Cotton Tee", sub: "tshirts", price: 899, originalPrice: 1499, image: "photo-1618354691373-d851c5c3a990", rating: 4.5, reviews: 189, bestseller: false, isNew: true, desc: "Soft-touch everyday t-shirt in solid tones. Pre-shrunk fabric with reinforced stitching for long-lasting comfort." },
  { name: "Slim Fit Indigo Jeans", sub: "jeans", price: 1899, originalPrice: 2999, image: "photo-1542272604-787c3835535d", rating: 4.6, reviews: 312, bestseller: true, isNew: false, desc: "Stretchable slim-fit denim with a deep indigo wash. Designed to move with you while keeping a sharp silhouette." },
  { name: "Casual Linen Shirt", sub: "shirts", price: 1499, originalPrice: 2299, image: "photo-1598554747436-c9293d6a588f", rating: 4.4, reviews: 156, bestseller: false, isNew: true, desc: "Lightweight linen-blend shirt for breezy comfort. Perfect for brunches, vacations and effortless layering." },
  { name: "Formal Oxford Shirt", sub: "shirts", price: 1699, originalPrice: 2499, image: "photo-1594938298603-c8148c4dae35", rating: 4.8, reviews: 201, bestseller: true, isNew: false, desc: "Crisp oxford weave shirt with a tailored fit. Wrinkle-resistant finish keeps you sharp from desk to dinner." },
  { name: "Vintage Leather Jacket", sub: "jackets", price: 4999, originalPrice: 7999, image: "photo-1551028719-00167b16eac5", rating: 4.9, reviews: 98, bestseller: true, isNew: false, desc: "Full-grain vegan leather biker jacket with matte hardware. A bold statement piece that ages beautifully." },
  { name: "Denim Trucker Jacket", sub: "jackets", price: 2999, originalPrice: 4499, image: "photo-1591047139829-d91aecb6caea", rating: 4.5, reviews: 143, bestseller: false, isNew: true, desc: "Timeless trucker silhouette in washed denim. Layer over tees and hoodies for an instant style upgrade." },
  { name: "Tailored Charcoal Blazer", sub: "blazers", price: 5499, originalPrice: 8999, image: "photo-1507679799987-c73779587ccf", rating: 4.7, reviews: 87, bestseller: false, isNew: false, desc: "Half-canvassed blazer in premium charcoal wool blend. Structured shoulders with a modern slim profile." },
  { name: "Three-Piece Navy Suit", sub: "suits", price: 8999, originalPrice: 12999, image: "photo-1516826957135-700dedea698c", rating: 4.8, reviews: 64, bestseller: true, isNew: false, desc: "Complete three-piece suit with jacket, waistcoat and trousers. Occasion-ready tailoring in deep navy." },
  { name: "Everyday Fleece Hoodie", sub: "hoodies", price: 1999, originalPrice: 2999, image: "photo-1539008835657-9e8e9680c956", rating: 4.6, reviews: 275, bestseller: true, isNew: false, desc: "Brushed fleece hoodie with a kangaroo pocket and ribbed cuffs. Cozy warmth for everyday wear." },
  { name: "Festive Linen Kurta", sub: "ethnic", price: 1799, originalPrice: 2699, image: "photo-1610030469983-98e550d6193c", rating: 4.5, reviews: 112, bestseller: false, isNew: true, desc: "Handloom-feel kurta in breathable linen. Subtle texture and a mandarin collar for festive elegance." },
  { name: "Midnight Oversized Hoodie", sub: "hoodies", price: 2299, originalPrice: 3499, image: "photo-1578681994506-b8f463449011", rating: 4.4, reviews: 167, bestseller: false, isNew: true, desc: "Drop-shoulder oversized hoodie in midnight black. Heavyweight fleece with a premium matte finish." },
];

const womenProducts = [
  { name: "Floral Summer Midi Dress", sub: "dresses", price: 2199, originalPrice: 3499, image: "photo-1515886657613-9f3515b0c78f", rating: 4.8, reviews: 328, bestseller: true, isNew: false, desc: "Flowy midi dress with an all-over floral print. Adjustable waist tie and a flattering A-line silhouette." },
  { name: "Elegant Evening Gown", sub: "dresses", price: 4999, originalPrice: 7999, image: "photo-1539109136881-3be0616acf4b", rating: 4.9, reviews: 143, bestseller: true, isNew: false, desc: "Floor-length gown with a sculpted bodice and soft drape. Made for weddings, galas and unforgettable entrances." },
  { name: "Breezy Sundress", sub: "dresses", price: 1799, originalPrice: 2799, image: "photo-1496747611176-843222e1e57c", rating: 4.6, reviews: 219, bestseller: false, isNew: true, desc: "Light cotton sundress with delicate straps. Easy-breezy for beach days and city strolls alike." },
  { name: "Boho Maxi Dress", sub: "dresses", price: 2599, originalPrice: 3999, image: "photo-1469334031218-e382a71b716b", rating: 4.7, reviews: 186, bestseller: true, isNew: false, desc: "Free-spirited maxi with tiered layers and vintage tones. Pairs perfectly with sandals and sun hats." },
  { name: "High-Rise Skinny Jeans", sub: "jeans", price: 2099, originalPrice: 3299, image: "photo-1541099649105-f69ad21f3246", rating: 4.5, reviews: 297, bestseller: true, isNew: false, desc: "Sculpting high-rise skinny jeans in super-stretch denim. Lifts, shapes and stays comfortable all day." },
  { name: "Vintage Mom Jeans", sub: "jeans", price: 1899, originalPrice: 2999, image: "photo-1594633312681-425c7b97ccd1", rating: 4.6, reviews: 241, bestseller: false, isNew: true, desc: "Relaxed mom-fit jeans with a vintage light wash. Rigid denim that breaks in beautifully over time." },
  { name: "Essential Crop Tee", sub: "tshirts", price: 799, originalPrice: 1299, image: "photo-1509631179647-0177331693ae", rating: 4.4, reviews: 173, bestseller: false, isNew: true, desc: "Cropped boxy tee in soft jersey cotton. The easiest way to balance high-waist bottoms." },
  { name: "Street Chic Co-ord Set", sub: "coordsets", price: 2899, originalPrice: 4499, image: "photo-1529139574466-a303027c1d8b", rating: 4.7, reviews: 134, bestseller: true, isNew: true, desc: "Matching shirt and trousers co-ord in a chic neutral tone. One-and-done outfit for any plan." },
  { name: "Minimal Slip Dress", sub: "dresses", price: 1999, originalPrice: 3199, image: "photo-1485968579580-b6d095142e6e", rating: 4.5, reviews: 158, bestseller: false, isNew: false, desc: "Bias-cut satin slip dress with adjustable straps. Minimal by design, maximal by impact." },
  { name: "Cropped Denim Jacket", sub: "jackets", price: 2699, originalPrice: 3999, image: "photo-1556821840-3a63f95609a7", rating: 4.6, reviews: 203, bestseller: true, isNew: false, desc: "Cropped trucker jacket with a boxy fit and faded wash. The ultimate layering piece for every season." },
  { name: "Embroidered Anarkali", sub: "ethnic", price: 3499, originalPrice: 5499, image: "photo-1591369822096-ffd140ec948f", rating: 4.8, reviews: 121, bestseller: true, isNew: true, desc: "Festive anarkali with fine thread embroidery and a flared hem. Comes with a matching dupatta." },
  { name: "Classic Silk Saree", sub: "ethnic", price: 5999, originalPrice: 8999, image: "photo-1583744946564-b52ac1c389c8", rating: 4.9, reviews: 89, bestseller: false, isNew: false, desc: "Handwoven silk saree with a contrast border. Timeless drape, heirloom quality, endless grace." },
];

const galleryIds = [
  "photo-1523381210434-271e8be1f52b",
  "photo-1556905055-8f358a7a47b2",
  "photo-1445205170230-053b83016050",
  "photo-1434389677669-e08b4cac3105",
  "photo-1562157873-818bc0726f68",
  "photo-1441986300917-64674bd600d8",
];

function buildProducts(category, list) {
  return list.map((p, i) => ({
    name: p.name,
    description: p.desc,
    price: p.price,
    originalPrice: p.originalPrice,
    category,
    subCategory: p.sub,
    image: img(p.image),
    images: [img(p.image), thumb(galleryIds[i % galleryIds.length]), thumb(galleryIds[(i + 2) % galleryIds.length])],
    sizes: ["dresses", "saree"].includes(p.sub) ? ["XS", "S", "M", "L", "XL"] : ["S", "M", "L", "XL", "XXL"],
    colors: [["Black", "Olive"], ["White", "Pink"], ["Beige", "Grey"], ["Navy", "Maroon"]][i % 4],
    rating: p.rating,
    reviewsCount: p.reviews,
    stock: 25 + ((i * 7) % 50),
    newArrival: p.isNew,
    isBestseller: p.bestseller,
  }));
}

export async function seedIfEmpty() {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`[seed] Skipping — ${count} products already present`);
    return;
  }
  await seedAll();
}

export async function seedAll() {
  await Order_clear();
  await User.deleteMany({});
  await Product.deleteMany({});

  await User.create({
    name: "Vastra Admin",
    email: "admin@vastra.com",
    passwordHash: hashPassword("admin123"),
    role: "ADMIN",
  });
  await User.create({
    name: "Vastra",
    email: "vastra@example.com",
    passwordHash: hashPassword("user123"),
    role: "USER",
  });

  const products = [...buildProducts("MEN", menProducts), ...buildProducts("WOMEN", womenProducts)];
  const result = await Product.insertMany(products);
  console.log(`[seed] Created ${result.length} products`);
  console.log("[seed] Admin: admin@vastra.com / admin123");
  console.log("[seed] Demo user: vastra@example.com / user123");
}

async function Order_clear() {
  const { Order, Session } = await import("./models/index.js");
  await Order.deleteMany({});
  await Session.deleteMany({});
}

// Run directly: node server/seed.js
if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  (async () => {
    try {
      await mongoose.connect(MONGO_URI);
      await seedAll();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error("[seed] FAILED:", e.message);
      process.exit(1);
    }
  })();
}
