import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useReveal } from "../hooks/useReveal.js";
import useIsMobile from "../hooks/useIsMobile.js";
import ProductCard, { ProductSkeleton } from "../components/ProductCard.jsx";
import { SUBCATEGORIES, MEN_BANNER_VIDEO, WOMEN_BANNER_VIDEO, formatINR } from "../data/media.js";
import { IconArrowRight } from "../components/Icons.jsx";

const BANNERS = {
  MEN: {
    video: MEN_BANNER_VIDEO,
    fallback: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=1600&q=80&auto=format&fit=crop",
    title: "The Men's Edit",
    sub: "Sharp staples — tees, shirts, denim, blazers & festive kurta sets.",
  },
  WOMEN: {
    video: WOMEN_BANNER_VIDEO,
    fallback: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80&auto=format&fit=crop",
    title: "The Women's Edit",
    sub: "Fluid silhouettes — dresses, co-ords, denim & handcrafted ethnic.",
  },
};

const SORTS = [
  { value: "", label: "Sort: Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest First" },
];

export default function CollectionPage({ category }) {
  const [params, setParams] = useSearchParams();
  const sub = params.get("sub") || "";
  const [sort, setSort] = useState("");
  const [products, setProducts] = useState(null);
  const banner = BANNERS[category];
  const isMobile = useIsMobile(); // phone par banner video skip — ken-burns fallback image hi kaafi
  const revealRef = useReveal([products, sub]);

  useEffect(() => {
    let alive = true;
    setProducts(null);
    const q = new URLSearchParams({ category });
    if (sub) q.set("sub", sub);
    if (sort) q.set("sort", sort);
    api(`/api/products?${q}`)
      .then((d) => alive && setProducts(d.products))
      .catch(() => alive && setProducts([]));
    /* NOTE: no scroll here — sub-filter/sort change par user jahan hai wahin rahe */
    return () => { alive = false; };
  }, [category, sub, sort]);

  /* sirf category switch (Men ↔ Women) ya sub-category pick par top par scroll karo —
     sub pick par banner hide hota hai, isliye fresh products upar se dikhna chahiye */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [category, sub]);

  const pickSub = (value) => {
    if (value) setParams({ sub: value });
    else setParams({});
  };

  return (
    <div ref={revealRef}>
      {/* banner — sirf "All" view par dikhe; koi sub-category (T-Shirts, Jeans…) selected ho to
          seedha products dikhein, hero/banner beech me na aaye */}
      {!sub && (
        <section className="collection-banner">
          <div className="banner-fallback" style={{ backgroundImage: `url(${banner.fallback})` }} />
          {!isMobile && (
            <video
              src={banner.video}
              poster={banner.fallback}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onCanPlay={(e) => {
                e.currentTarget.classList.add("is-ready");
                e.currentTarget.closest(".collection-banner")?.classList.add("video-on");
              }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div className="collection-banner-content container">
            <h1>{banner.title}</h1>
            <p>{banner.sub}</p>
          </div>
        </section>
      )}

      <section className="section container" style={{ paddingTop: sub ? 44 : 34 }}>
        {/* toolbar */}
        <div className="toolbar">
          <div className="toolbar-chips" role="tablist" aria-label="Sub-categories">
            <button className={`chip ${sub === "" ? "active" : ""}`} onClick={() => pickSub("")}>All</button>
            {SUBCATEGORIES[category].map((s) => (
              <button
                key={s.value}
                className={`chip ${sub === s.value ? "active" : ""}`}
                onClick={() => pickSub(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <p className="results-count" style={{ marginBottom: 20 }}>
          {products ? `${products.length} style${products.length === 1 ? "" : "s"}` : "Loading…"}
          {sub ? ` · ${SUBCATEGORIES[category].find((s) => s.value === sub)?.label || sub}` : ""}
        </p>

        {/* grid */}
        <div className="grid grid-4">
          {!products
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : products.map((p, i) => (
                <div className="reveal" key={p._id} style={{ transitionDelay: `${(i % 4) * 0.06}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
        </div>

        {products && products.length === 0 && (
          <div className="empty-state">
            <span className="icon-float">
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></svg>
            </span>
            <p className="big">Nothing here yet</p>
            <p>Try another category — or explore the <Link to="/women" className="link-slide" style={{ color: "var(--gold-2)" }}>full collection</Link>.</p>
          </div>
        )}
      </section>

      {/* cross-link */}
      <section className="container" style={{ paddingBottom: 70 }}>
        <div className="panel reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h3 style={{ marginBottom: 4 }}>
              {category === "MEN" ? "Shopping for her too?" : "Shopping for him too?"}
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "0.93rem" }}>
              {category === "MEN"
                ? "Explore dresses, co-ord sets and ethnic wear in the women's edit."
                : "Explore tees, shirts, blazers and suits in the men's edit."}
            </p>
          </div>
          <Link to={category === "MEN" ? "/women" : "/men"} className="btn btn-dark btn-shine">
            {category === "MEN" ? "Shop Women" : "Shop Men"} <IconArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
