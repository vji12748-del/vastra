import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth, useToast } from "../context/Store.jsx";
import { formatINR } from "../data/media.js";
import { IconBag } from "../components/Icons.jsx";

const FLOW = [
  { id: "PLACED", label: "Placed" },
  { id: "PACKED", label: "Packed" },
  { id: "SHIPPED", label: "Shipped" },
  { id: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { id: "DELIVERED", label: "Delivered" },
];

const PAY_LABEL = { CARD: "Card", UPI: "UPI", NETBANKING: "NetBanking", WALLET: "Wallet", COD: "Cash on Delivery" };

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!user) return;
    api("/api/orders")
      .then((d) => setOrders(d.orders))
      .catch((e) => { toast(e.message, "error"); setOrders([]); });
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="container">
        <div className="empty-state" style={{ padding: "110px 20px" }}>
          <p className="big">Sign in to see your orders</p>
          <p style={{ marginBottom: 24 }}>Your order history and live tracking live here.</p>
          <Link to="/account" className="btn btn-dark btn-shine">Sign In / Sign Up</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section" style={{ paddingTop: 40 }}>
      <div className="section-head" style={{ textAlign: "left", marginBottom: 30 }}>
        <span className="section-eyebrow" style={{ display: "inline-flex" }}>Order History</span>
        <h2 className="section-title" style={{ fontSize: "2rem" }}>My Orders</h2>
      </div>

      {!orders ? (
        <div className="center-loading"><span className="spinner" /> Loading your orders…</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span className="icon-float"><IconBag size={48} /></span>
          <p className="big">No orders yet</p>
          <p style={{ marginBottom: 24 }}>When you place an order it will appear here with live tracking.</p>
          <Link to="/" className="btn btn-dark btn-shine">Start Shopping</Link>
        </div>
      ) : (
        orders.map((o) => {
          const statusIdx = FLOW.findIndex((f) => f.id === o.status);
          const cancelled = o.status === "CANCELLED";
          return (
            <article className="order-card" key={o._id}>
              <div className="order-head">
                <div>
                  <span className="oid">{o.orderId}</span>
                  <div className="odate">
                    {new Date(o.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className={`status-badge st-${o.status}`}>{o.status.replace(/_/g, " ")}</span>
                  <span className="badge badge-gold">{PAY_LABEL[o.payment.method]}{o.payment.paid ? " · Paid" : ""}</span>
                  {o.invoice && (
                    <a
                      className={`inv-btn ${o.invoice.status === "PAID" ? "" : "due"}`}
                      href={`/api/invoices/${o.orderId}/download`}
                      target="_blank"
                      rel="noreferrer"
                      title="Download invoice PDF"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                        <path d="M8 13h8M8 17h5" />
                      </svg>
                      {o.invoice.invoiceNo}
                    </a>
                  )}
                </div>
              </div>

              {/* tracker */}
              {!cancelled ? (
                <div className="tracker">
                  {FLOW.map((f, i) => {
                    const doneStep = i <= statusIdx;
                    const current = i === statusIdx;
                    return (
                      <div className={`tracker-step ${doneStep ? "done" : ""} ${current ? "current" : ""}`} key={f.id}>
                        <span className="tracker-dot">
                          {doneStep && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                          )}
                        </span>
                        <small>{f.label}</small>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#b3261e", fontWeight: 600, margin: "14px 0" }}>This order was cancelled. Any paid amount will be refunded in 3–5 business days.</p>
              )}

              {/* items */}
              <div className="order-items-mini">
                {o.items.map((it, i) => (
                  <Link to={`/product/${it.productId}`} className="order-item-mini" key={i}>
                    <img src={it.image} alt="" />
                    <div>
                      <b>{it.name}</b>
                      <span>{it.size} · {it.color} · ×{it.qty}</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="sum-row total" style={{ marginTop: 16 }}>
                <span>
                  Total ({o.items.reduce((s, i) => s + i.qty, 0)} items)
                  {o.discount > 0 && <span style={{ color: "#1d7a3e", fontWeight: 500, fontSize: "0.84rem" }}> · saved {formatINR(o.discount)}</span>}
                </span>
                <span>{formatINR(o.total)}</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 8 }}>
                Deliver to: {o.address.fullName}, {o.address.line1}, {o.address.city} — {o.address.pincode}
              </p>
            </article>
          );
        })
      )}
    </div>
  );
}
