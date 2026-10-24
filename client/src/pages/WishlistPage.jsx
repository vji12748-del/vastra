import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth, useWishlist } from "../context/Store.jsx";
import ProductCard, { ProductSkeleton } from "../components/ProductCard.jsx";
import { IconHeart } from "../components/Icons.jsx";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { ids } = useWishlist();
  const [products, setProducts] = useState(null); // null = loading, [] = empty
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    if (authLoading) return;
    if (!user) return;
    (async () => {
      try {
        const d = await api("/api/wishlist");
        if (!alive) return;
        setProducts(d.products || []);
      } catch (e) {
        if (alive) setError(e.message || "Could not load your wishlist");
      }
    })();
    return () => { alive = false; };
  }, [user, authLoading]);

  /* guests — invite to sign in */
  if (!authLoading && !user) {
    return (
      <div className="container">
        <div className="empty-state" style={{ padding: "110px 20px" }}>
          <span className="gate-avatar"><IconHeart size={24} /></span>
          <p className="big">Your wishlist lives in your account</p>
          <p style={{ maxWidth: 430, margin: "0 auto 24px" }}>
            Sign in to save the pieces you love — they&apos;ll be waiting for you
            on every device, and you&apos;ll know when they&apos;re back in stock.
          </p>
          <Link to="/account" className="btn btn-dark btn-lg btn-shine">Sign In / Create Account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section" style={{ paddingTop: 40 }}>
      <div className="section-head" style={{ textAlign: "left", marginBottom: 26 }}>
        <span className="section-eyebrow" style={{ display: "inline-flex" }}>Saved for later</span>
        <h2 className="section-title" style={{ fontSize: "2rem" }}>
          My Wishlist{products ? ` · ${products.length} item${products.length === 1 ? "" : "s"}` : ""}
        </h2>
      </div>

      {error && (
        <div className="empty-state" style={{ padding: "70px 20px" }}>
          <p className="big">Something went wrong</p>
          <p>{error}</p>
          <Link to="/" className="btn btn-dark btn-shine">Back to Home</Link>
        </div>
      )}

      {!error && products === null && (
        <div className="grid grid-4">
          {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      )}

      {!error && products !== null && products.filter((p) => ids.has(String(p._id))).length === 0 && (
        <div className="empty-state" style={{ padding: "80px 20px" }}>
          <p className="big">Your wishlist is empty</p>
          <p style={{ marginBottom: 24 }}>Tap the ♡ on any piece you love — it lands here.</p>
          <Link to="/men" className="btn btn-dark btn-shine">Explore Men</Link>
          <Link to="/women" className="btn btn-outline" style={{ marginLeft: 10 }}>Explore Women</Link>
        </div>
      )}

      {!error && products !== null && products.filter((p) => ids.has(String(p._id))).length > 0 && (
        <div className="grid grid-4">
          {products
            .filter((p) => ids.has(String(p._id)))
            .map((p, i) => (
              <ProductCard key={p._id} product={p} style={{ animationDelay: `${i * 0.05}s` }} />
            ))}
        </div>
      )}
    </div>
  );
}
