import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart, useToast } from "../context/Store.jsx";
import { api } from "../api.js";
import { formatINR, FREE_SHIP_THRESHOLD } from "../data/media.js";
import { IconPlus, IconMinus, IconTrash, IconBag, IconArrowRight } from "../components/Icons.jsx";

export default function CartPage() {
  const { items, setQty, removeItem, subtotal, discount, shipping, total, coupon, setCoupon } = useCart();
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const remainingForFree = Math.max(0, FREE_SHIP_THRESHOLD - (subtotal - discount));
  const progress = Math.min(100, ((subtotal - discount) / FREE_SHIP_THRESHOLD) * 100);

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setApplying(true);
    try {
      const d = await api("/api/coupons/validate", { method: "POST", body: { code: code.trim(), subtotal } });
      setCoupon({ code: d.code, off: d.off, label: d.label, min: 0 });
      toast(`Coupon ${d.code} applied — ${d.label}`, "success");
      setCode("");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state" style={{ padding: "110px 20px" }}>
          <span className="icon-float">
            <IconBag size={52} />
          </span>
          <p className="big">Your bag is empty</p>
          <p style={{ marginBottom: 24 }}>Fill it with pieces you love — free shipping over ₹1,999.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/men" className="btn btn-dark btn-shine">Shop Men</Link>
            <Link to="/women" className="btn btn-outline">Shop Women</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section" style={{ paddingTop: 40 }}>
      <div className="section-head" style={{ textAlign: "left", marginBottom: 30 }}>
        <span className="section-eyebrow" style={{ display: "inline-flex" }}>Your Bag</span>
        <h2 className="section-title" style={{ fontSize: "2rem" }}>{items.length} item{items.length > 1 ? "s" : ""} in your bag</h2>
      </div>

      <div className="cart-layout">
        {/* items */}
        <div className="cart-items">
          {items.map((it) => (
            <div className="cart-item" key={it.key}>
              <Link to={`/product/${it.productId}`} className="cart-item-img">
                <img src={it.image} alt={it.name} />
              </Link>
              <div>
                <h4>{it.name}</h4>
                <p className="variant">Size {it.size} · {it.color}</p>
                <p className="variant" style={{ marginTop: 4 }}>{formatINR(it.price)} each</p>
                <div className="qty-stepper" style={{ marginTop: 12 }}>
                  <button onClick={() => setQty(it.key, it.qty - 1)} aria-label="Decrease"><IconMinus /></button>
                  <span>{it.qty}</span>
                  <button onClick={() => setQty(it.key, it.qty + 1)} aria-label="Increase"><IconPlus /></button>
                </div>
              </div>
              <div className="cart-item-right">
                <span className="cart-item-price">{formatINR(it.price * it.qty)}</span>
                <button className="link-danger" onClick={() => { removeItem(it.key); toast("Removed from bag"); }}>
                  <IconTrash /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* summary */}
        <aside className="summary">
          <h3>Order Summary</h3>

          <div className="ship-progress">
            <p>
              {remainingForFree > 0 ? (
                <>Add <b>{formatINR(remainingForFree)}</b> more for <b>FREE shipping</b></>
              ) : (
                <>You&apos;ve unlocked <b>FREE express shipping</b></>
              )}
            </p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* coupon */}
          {coupon ? (
            <div className="coupon-applied">
              <span>{coupon.code} — {coupon.label}</span>
              <button onClick={() => { setCoupon(null); toast("Coupon removed"); }}>Remove</button>
            </div>
          ) : (
            <form className="coupon-box" onSubmit={applyCoupon}>
              <input
                className="input"
               
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                aria-label="Coupon code"
              />
              <button className="btn btn-outline btn-sm" disabled={applying}>
                {applying ? "…" : "Apply"}
              </button>
            </form>
          )}
          {!coupon && (
            <p className="coupon-hint">Try <b>VASTRA10</b> · <b>FIRST50</b> · <b>BIGSAVE</b></p>
          )}

          <div style={{ marginTop: 16 }}>
            <div className="sum-row"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            {discount > 0 && (
              <div className="sum-row"><span>Coupon discount</span><span className="green">− {formatINR(discount)}</span></div>
            )}
            <div className="sum-row">
              <span>Shipping</span>
              <span className={shipping === 0 ? "green" : ""}>{shipping === 0 ? "FREE" : formatINR(shipping)}</span>
            </div>
            <div className="sum-row total"><span>Total</span><span>{formatINR(total)}</span></div>
          </div>

          <button
            className="btn btn-gold btn-block btn-lg btn-shine"
            style={{ marginTop: 20 }}
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout <IconArrowRight />
          </button>
          <p className="mini-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="10.5" width="14" height="10" rx="2.2" /><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" /></svg>
            Secure checkout · UPI, Cards, NetBanking, Wallets &amp; COD
          </p>
        </aside>
      </div>
    </div>
  );
}
