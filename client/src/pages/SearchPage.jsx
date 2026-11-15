import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useReveal } from "../hooks/useReveal.js";
import ProductCard, { ProductSkeleton } from "../components/ProductCard.jsx";
import { IconSearch } from "../components/Icons.jsx";

const POPULAR = ["hoodie", "dress", "jeans", "kurta", "saree", "jacket", "shirt", "co-ord"];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [input, setInput] = useState(q);
  const [results, setResults] = useState(null);
  const inputRef = useRef(null);
  const revealRef = useReveal([results]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!q) { setResults(null); return; }
    let alive = true;
    setResults(null);
    const t = setTimeout(() => {
      api(`/api/products?search=${encodeURIComponent(q)}`)
        .then((d) => alive && setResults(d.products))
        .catch(() => alive && setResults([]));
    }, 300);
    return () => { alive = false; clearTimeout(t); };
  }, [q]);

  const submit = (e) => {
    e.preventDefault();
    setParams(input.trim() ? { q: input.trim() } : {});
  };

  return (
    <div ref={revealRef} className="container" style={{ paddingBottom: 70 }}>
      <div className="search-hero">
        <span className="section-eyebrow">Find your fit</span>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", marginTop: 8 }}>Search the Store</h1>
        <form className="search-box" onSubmit={submit} role="search">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
           
            aria-label="Search products"
          />
          <button type="submit" className="search-submit" aria-label="Search"><IconSearch /></button>
        </form>
        <div className="toolbar-chips" style={{ justifyContent: "center", marginTop: 18 }}>
          {POPULAR.map((p) => (
            <button key={p} className="chip" onClick={() => { setInput(p); setParams({ q: p }); }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <section style={{ marginTop: 40 }}>
        {q && (
          <p className="results-count" style={{ marginBottom: 20 }}>
            {results ? `${results.length} result${results.length === 1 ? "" : "s"} for “${q}”` : "Searching…"}
          </p>
        )}
        {!q ? (
          <div className="empty-state">
            <p className="big">What are you looking for?</p>
            <p>Search across all men&apos;s and women&apos;s styles — names, categories and descriptions.</p>
          </div>
        ) : !results ? (
          <div className="grid grid-4">
            {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <p className="big">No matches for “{q}”</p>
            <p style={{ marginBottom: 20 }}>Check the spelling or try a broader term.</p>
            <Link to="/" className="btn btn-outline">Browse Everything</Link>
          </div>
        ) : (
          <div className="grid grid-4">
            {results.map((p, i) => (
              <div className="reveal" key={p._id} style={{ transitionDelay: `${(i % 4) * 0.06}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
