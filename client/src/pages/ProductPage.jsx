import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useCart, useToast, useAuth, useWishlist } from "../context/Store.jsx";
import { useReveal } from "../hooks/useReveal.js";
import ProductCard, { ProductSkeleton } from "../components/ProductCard.jsx";
import ReviewsSection from "../components/ReviewsSection.jsx";
import { formatINR } from "../data/media.js";
import { Stars, IconBag, IconPlus, IconMinus, IconTruck, IconReturn, IconShield, IconChevron, IconHeart, IconEdit } from "../components/Icons.jsx";

const COLOR_HEX = {
  Black: "#1c1917", White: "#f5f5f2", Beige: "#d9cbb2", Navy: "#253352",
  Olive: "#6b6b3a", Pink: "#e5b3bd", Grey: "#9a958e", Maroon: "#6d2032",
};

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { ids, toggle: wishToggle } = useWishlist();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [acc, setAcc] = useState(0);
  const [wishBusy, setWishBusy] = useState(false);
  const revealRef = useReveal([data]);

  useEffect(() => {
    let alive = true;
    setData(null);
    setImgIdx(0);
    setQty(1);
    setAcc(0);
    api(`/api/products/${id}`)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setSize(d.product.sizes?.[1] ?? d.product.sizes?.[0] ?? "M");
        setColor(d.product.colors?.[0] ?? "Black");
      })
      .catch(() => alive && setNotFound(true));
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => { alive = false; };
  }, [id]);

  if (notFound) {
    return (
      <div className="nf container">
        <h1>404</h1>
        <p>We couldn&apos;t find that piece — it may have sold out.</p>
        <Link to="/" className="btn btn-dark btn-shine">Back to Home</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container" style={{ padding: "60px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }} className="pdp-skel">
          <div className="skel"><div className="skel-media" /></div>
          <div>
            <div className="skel"><div className="skel-line" style={{ height: 34 }} /><div className="skel-line" /><div className="skel-line w60" /></div>
          </div>
        </div>
      </div>
    );
  }

  const { product, related } = data;
  const off = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const lowStock = product.stock <= 5 && product.stock > 0;

  const addToBag = (goToCart = false) => {
    if (!size) { toast("Please select a size", "error"); return; }
    addItem(product, size, color, qty);
    toast(`${product.name} (${size}) added to bag`, "success");
    /* guests included — checkout page par hi signup popup aayega */
    if (goToCart) navigate("/checkout");
  };

  const wished = ids.has(String(product._id));
  const onRated = (rating, reviewsCount) =>
    setData((d) => ({ ...d, product: { ...d.product, rating, reviewsCount } }));
  const toggleWish = async () => {
    if (wishBusy) return;
    if (!user) {
      toast("Sign in to save items to your wishlist", "error");
      return;
    }
    setWishBusy(true);
    try {
      const nowActive = await wishToggle(product);
      toast(nowActive ? "Saved to your wishlist ❤" : "Removed from wishlist", "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setWishBusy(false);
    }
  };

  return (
    <div ref={revealRef} className="container" style={{ paddingBottom: 70 }}>
      {/* breadcrumbs */}
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span className="sep">/</span>
        <Link to={product.category === "MEN" ? "/men" : "/women"}>{product.category === "MEN" ? "Men" : "Women"}</Link> <span className="sep">/</span>
        <span style={{ color: "var(--ink)" }}>{product.name}</span>
      </nav>

      <div className="pdp">
        {/* gallery */}
        <div className="pdp-gallery reveal-left">
          <div className="pdp-main">
            <img src={product.images?.[imgIdx] || product.image} alt={product.name} />
          </div>
          <div className="pdp-thumbs">
            {(product.images?.length ? product.images : [product.image]).map((src, i) => (
              <button
                key={i}
                className={`pdp-thumb ${imgIdx === i ? "active" : ""}`}
                onClick={() => setImgIdx(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* info */}
        <div className="pdp-info reveal-right">
          <span className="badge badge-gold">{product.category === "MEN" ? "Men" : "Women"} · {product.subCategory}</span>
          <h1 style={{ marginTop: 12 }}>{product.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0 4px" }}>
            <Stars rating={product.rating} size={15} />
            <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{product.rating} · {product.reviewsCount} reviews</span>
          </div>

          <div className="pdp-price-row">
            <span className="price-now">{formatINR(product.price)}</span>
            {off > 0 && (
              <>
                <span className="price-old">{formatINR(product.originalPrice)}</span>
                <span className="badge badge-sale">{off}% OFF</span>
              </>
            )}
          </div>
          <p className="pdp-meta">MRP inclusive of all taxes · {product.newArrival ? "New arrival" : "In collection"}</p>

          {lowStock && (
            <p className="stock-note">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3 2.6 19.4h18.8L12 3Z" /><path d="M12 10v4.4M12 17.4v.2" /></svg>
              Only {product.stock} left in stock — order soon
            </p>
          )}

          <p style={{ color: "var(--ink-2)", fontSize: "0.97rem", marginBottom: 6 }}>{product.description}</p>

          <div className="pdp-divider" />

          {/* sizes */}
          <div className="opt-label">Select Size — <b>{size}</b></div>
          <div className="size-row">
            {product.sizes.map((s) => (
              <button key={s} className={`size-chip ${size === s ? "active" : ""}`} onClick={() => setSize(s)}>
                {s}
              </button>
            ))}
          </div>

          {/* colors */}
          <div className="opt-label">Colour — <b>{color}</b></div>
          <div className="color-row">
            {product.colors.map((c) => (
              <button
                key={c}
                className={`color-dot ${color === c ? "active" : ""}`}
                style={{ background: COLOR_HEX[c] || "#999" }}
                onClick={() => setColor(c)}
                aria-label={`Colour ${c}`}
                title={c}
              />
            ))}
          </div>

          {/* qty */}
          <div className="qty-row">
            <div>
              <div className="opt-label" style={{ marginBottom: 8 }}>Quantity</div>
              <div className="qty-stepper">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"><IconMinus /></button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Increase quantity"><IconPlus /></button>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="pdp-ctas">
            <button className="btn btn-dark btn-lg btn-shine" onClick={() => addToBag(false)}>
              <IconBag size={18} /> Add to Bag
            </button>
            <button className="btn btn-gold btn-lg" onClick={() => addToBag(true)}>Buy It Now</button>
            <button
              className={`pdp-wish ${wished ? "active" : ""}`}
              onClick={toggleWish}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              title={wished ? "Saved in your wishlist" : "Save to wishlist"}
            >
              <IconHeart size={19} />
            </button>
          </div>

          {/* assurance */}
          <div className="assure">
            <div><IconTruck size={17} /> Free ship over ₹1,999</div>
            <div><IconReturn size={17} /> 15-day returns</div>
            <div><IconShield size={17} /> Secure checkout</div>
          </div>

          {/* accordions */}
          <div className={`acc ${acc === 1 ? "open" : ""}`}>
            <button className="acc-head" onClick={() => setAcc(acc === 1 ? 0 : 1)}>
              Fabric &amp; Care <IconChevron />
            </button>
            <div className="acc-body"><div className="acc-body-inner">
              Premium-grade fabric with colour-locked dyes. Machine wash cold with like colours, do not bleach,
              warm iron on reverse. Store folded — your piece will keep its shape and finish for years.
            </div></div>
          </div>
          <div className={`acc ${acc === 2 ? "open" : ""}`}>
            <button className="acc-head" onClick={() => setAcc(acc === 2 ? 0 : 2)}>
              Delivery &amp; Returns <IconChevron />
            </button>
            <div className="acc-body"><div className="acc-body-inner">
              Dispatched within 24 hours. Metro delivery in 2–3 days, rest of India in 4–6 days.
              Free shipping on orders above {formatINR(1999)}. Easy 15-day return or exchange —
              doorstep pickup, no questions asked.
            </div></div>
          </div>
        </div>
      </div>

      {/* customer reviews */}
      <ReviewsSection product={product} onProductRated={onRated} />

      {/* related */}
      {related?.length > 0 && (
        <section className="section" style={{ paddingBottom: 10 }}>
          <div className="section-head reveal">
            <span className="section-eyebrow">Complete the look</span>
            <h2 className="section-title">You May Also Like</h2>
          </div>
          <div className="grid grid-4">
            {related.map((p, i) => (
              <div className="reveal" key={p._id} style={{ transitionDelay: `${i * 0.07}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
