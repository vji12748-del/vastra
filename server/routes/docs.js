// /api/docs — machine-readable API catalog (handy for Postman / Thunder Client)
import { Router } from "express";
import { COUPONS, ORDER_STATUSES, FREE_SHIP_THRESHOLD, SHIPPING_FEE } from "../config/index.js";

const router = Router();

const endpoint = (method, path, auth, description) => ({ method, path, auth, description });

router.get("/", (_req, res) => {
  res.json({
    service: "VASTRA API",
    stack: "MERN (MongoDB / Express / React / Node.js)",
    version: "2.0.0",
    paymentMethods: ["CARD", "UPI", "NETBANKING", "WALLET", "COD"],
    coupons: Object.entries(COUPONS).map(([code, c]) => ({ code, ...c })),
    shipping: { freeAbove: FREE_SHIP_THRESHOLD, fee: SHIPPING_FEE },
    orderStatuses: ORDER_STATUSES,
    endpoints: {
      public: [
        endpoint("GET", "/api/health", "none", "Service heartbeat (db state, uptime)"),
        endpoint("GET", "/api/docs", "none", "This API catalog"),
        endpoint("GET", "/api/products?category=MEN|WOMEN&sub=&search=&sort=&flag=new|best&page=&limit=", "none", "Catalog with filters, search, sort and optional pagination"),
        endpoint("GET", "/api/products/:id", "none", "Product detail + 4 related products"),
        endpoint("GET", "/api/products/:id/reviews", "none", "Reviews of a product"),
        endpoint("GET", "/api/coupons", "none", "Available coupon codes"),
      ],
      customer: [
        endpoint("POST", "/api/auth/signup", "none", "Create account (auto sign-in)"),
        endpoint("POST", "/api/auth/login", "none", "Sign in (httpOnly session cookie)"),
        endpoint("GET", "/api/auth/me", "cookie", "Current session user"),
        endpoint("POST", "/api/auth/logout", "cookie", "Destroy session"),
        endpoint("GET", "/api/users/me", "user", "Full profile + address book"),
        endpoint("PUT", "/api/users/me", "user", "Update name / email / phone"),
        endpoint("PUT", "/api/users/me/password", "user", "Change password (verifies current)"),
        endpoint("GET|POST", "/api/users/me/addresses", "user", "List / add saved addresses"),
        endpoint("PUT|DELETE", "/api/users/me/addresses/:addrId", "user", "Update / delete a saved address"),
        endpoint("GET|POST", "/api/wishlist", "user", "List / add saved products"),
        endpoint("DELETE", "/api/wishlist/:productId", "user", "Remove a product from wishlist"),
        endpoint("POST", "/api/products/:id/reviews", "user", "Create/update your review (1-5 stars)"),
        endpoint("POST", "/api/orders", "user", "Place order (server re-prices, stock-checked, invoice generated)"),
        endpoint("GET", "/api/orders", "user", "My orders + invoice summaries"),
        endpoint("GET", "/api/orders/:id", "user", "Single order detail (id or VS-… ref)"),
        endpoint("PUT", "/api/orders/:id/cancel", "user", "Cancel while PLACED/PACKED (auto restock)"),
        endpoint("POST", "/api/coupons/validate", "none", "Validate a coupon code against a subtotal"),
        endpoint("GET", "/api/invoices/:orderId/download", "user", "Tax invoice PDF (owner or admin)"),
      ],
      admin: [
        endpoint("GET", "/api/admin/stats", "admin", "Revenue, counts, top products, low stock"),
        endpoint("GET|POST", "/api/admin/products", "admin", "List / create catalog products"),
        endpoint("PUT|DELETE", "/api/admin/products/:id", "admin", "Update / delete a product"),
        endpoint("GET", "/api/admin/orders", "admin", "All orders + invoice summaries"),
        endpoint("GET", "/api/admin/orders/:id", "admin", "Single order detail"),
        endpoint("PUT", "/api/admin/orders/:id", "admin", "Update status (DELIVERED finalizes COD → invoice PAID)"),
        endpoint("GET", "/api/admin/users", "admin", "Customers with order counts + lifetime spend"),
      ],
    },
    errors: {
      format: '{ "error": "human-readable message" }',
      codes: { 400: "validation / bad request", 401: "not signed in", 403: "forbidden (admin-only or not owner)", 404: "not found", 409: "duplicate (email already exists)", 429: "rate limited" },
    },
  });
});

export default router;
