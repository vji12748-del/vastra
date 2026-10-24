import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart, useToast, useAuth, useWishlist } from "../context/Store.jsx";
import { formatINR } from "../data/media.js";
import { Stars, IconHeart, IconBag } from "./Icons.jsx";

export default function ProductCard({ product, style }) {
  const { addItem } = useCart();
  const toast = useToast();
  const { user } = useAuth();
  const { ids, toggle } = useWishlist();
  const wished = ids.has(String(product._id));
  const [busy, setBusy] = useState(false);

  const off = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const quickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.sizes?.[1] || product.sizes?.[0] || "M", product.colors?.[0] || "Black", 1);
    toast(`${product.name} added to bag`, "success");
  };

  const wish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    if (!user) {
      toast("Sign in to save items to your wishlist", "error");
      return;
    }
    setBusy(true);
    try {
      const nowActive = await toggle(product);
      toast(nowActive ? "Saved to your wishlist ❤" : "Removed from wishlist", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="product-card" style={style}>
      <Link to={`/product/${product._id}`} className="product-media" aria-label={product.name}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className="product-badges">
          {product.newArrival && <span className="badge badge-new"><span className="badge-dot" />New</span>}
          {off > 0 && <span className="badge badge-sale">{off}% OFF</span>}
        </div>
        <button
          className={`product-wish ${wished ? "active" : ""}`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={wish}
        >
          <IconHeart />
        </button>
        <div className="product-quick">
          <button className="btn btn-dark btn-shine" onClick={quickAdd}>
            <IconBag size={16} /> Add to Bag
          </button>
        </div>
      </Link>
      <div className="product-info">
        <span className="product-cat">{product.category === "MEN" ? "Men" : "Women"} · {product.subCategory}</span>
        <h3 className="product-name"><Link to={`/product/${product._id}`}>{product.name}</Link></h3>
        <span className="product-rating">
          <Stars rating={product.rating} /> {product.rating} ({product.reviewsCount})
        </span>
        <div className="product-price">
          <span className="price-now">{formatINR(product.price)}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="price-old">{formatINR(product.originalPrice)}</span>
              <span className="price-off">{off}% off</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductSkeleton() {
  return (
    <div className="skel">
      <div className="skel-media" />
      <div className="skel-line" />
      <div className="skel-line w60" />
    </div>
  );
}
