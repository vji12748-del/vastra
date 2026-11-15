import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useToast } from "../context/Store.jsx";
import { useReveal } from "../hooks/useReveal.js";
import useIsMobile from "../hooks/useIsMobile.js";
import ProductCard, { ProductSkeleton } from "../components/ProductCard.jsx";
import { VideoTile, Lightbox } from "../components/VideoTile.jsx";
import {
  HERO_VIDEO, HERO_POSTER, HOME_FILM_STRIP, MEN_WOMEN_CATEGORY_IMAGES, SALE_BANNER_IMAGE,
  formatINR,
} from "../data/media.js";
import { Stars, IconTruck, IconScissors, IconReturn, IconShield, IconArrowRight, IconChevron, IconCheck } from "../components/Icons.jsx";

const MARQUEE_ITEMS = [
  "Free shipping over ₹1999", "New drop every friday", "Flat 20% on first order — code VASTRA10",
  "Easy 15-day returns", "Premium fabrics, honest prices",
];

const TESTIMONIALS = [
  { name: "Ananya Iyer", city: "Mumbai", text: "The silk slip dress is pure luxury — the drape, the finish, everything. VASTRA has become my weekend uniform.", rating: 5 },
  { name: "Rohan Mehta", city: "Bengaluru", text: "Ordered the oxford shirt and indigo jeans. Fit is spot on and the fabric feels premium. Delivery in 2 days!", rating: 5 },
  { name: "Kavya Nair", city: "Kochi", text: "The anarkali I wore for Onam got me so many compliments. Beautiful embroidery and the dupatta is gorgeous.", rating: 4.5 },
];

const USPS = [
  { icon: <IconTruck />, title: "Free Express Shipping", text: "On all orders above ₹1,999" },
  { icon: <IconScissors />, title: "Crafted In-House", text: "Design to stitch, one atelier" },
  { icon: <IconReturn />, title: "15-Day Easy Returns", text: "No questions asked pickup" },
  { icon: <IconShield />, title: "Secure Payments", text: "UPI, cards, netbanking & COD" },
];

export default function HomePage() {
  const [best, setBest] = useState(null);
  const [fresh, setFresh] = useState(null);
  const [email, setEmail] = useState("");
  const toast = useToast();
  const revealRef = useReveal([best, fresh]);
  const heroVideoRef = useRef(null);
  const isMobile = useIsMobile(); // phone par autoplay 4K/HD video heavy — poster image instead

  useEffect(() => {
    let alive = true;
    api("/api/products?flag=best&sort=rating").then((d) => alive && setBest(d.products.slice(0, 8))).catch(() => alive && setBest([]));
    api("/api/products?flag=new").then((d) => alive && setFresh(d.products.slice(0, 4))).catch(() => alive && setFresh([]));
    return () => { alive = false; };
  }, []);

  const subscribe = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast("Please enter a valid email address", "error");
      return;
    }
    toast("You're on the list! Welcome to VASTRA.", "success");
    setEmail("");
  };

  return (
    <div ref={revealRef}>
      {/* ---------- HERO ---------- */}
      <section className="hero" aria-label="VASTRA hero">
        {isMobile ? (
          <img className="hero-video" src={HERO_POSTER} alt="VASTRA — New Season collection" />
        ) : (
          <video ref={heroVideoRef} className="hero-video" src={HERO_VIDEO} poster={HERO_POSTER} autoPlay muted loop playsInline />
        )}
        <div className="hero-content">
          <p className="hero-eyebrow">New Season · Edit 2026</p>
          <h1 className="hero-title">
            Wear the <em>Story</em>,<br />Not Just the Outfit
          </h1>
          <p className="hero-sub">
            Men&apos;s &amp; women&apos;s essentials and occasion-wear, cut from premium fabrics.
            Explore the collection through our fashion films — then make it yours.
          </p>
          <div className="hero-ctas">
            <Link to="/men" className="btn btn-gold btn-lg btn-shine">Shop Men</Link>
            <Link to="/women" className="btn btn-outline-light btn-lg">Shop Women</Link>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true">
          <span>Scroll</span>
          <IconChevron size={20} />
        </div>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <span key={copy} style={{ display: "flex" }}>
              {MARQUEE_ITEMS.map((m) => (
                <span key={copy + m} className="marquee-item">{m} <span className="dot" /></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- USP ---------- */}
      <section className="usp">
        <div className="container">
          <div className="usp-grid">
            {USPS.map((u, i) => (
              <div className="usp-item" key={i}>
                <span className="usp-icon">{u.icon}</span>
                <div><h4>{u.title}</h4><p>{u.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section className="section container">
        <div className="section-head reveal">
          <span className="section-eyebrow">The Edit</span>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-sub">Two worlds, one atelier — sharp tailoring for him, fluid silhouettes for her.</p>
        </div>
        <div className="grid grid-2">
          <Link to="/men" className="cat-card reveal-left">
            <img src={MEN_WOMEN_CATEGORY_IMAGES.MEN} alt="Men's collection" loading="lazy" />
            <div className="cat-info">
              <h3>Men</h3>
              <span>12 styles · Tees to suits <span className="arrow"><IconArrowRight /></span></span>
            </div>
          </Link>
          <Link to="/women" className="cat-card reveal-right" style={{ transitionDelay: "0.12s" }}>
            <img src={MEN_WOMEN_CATEGORY_IMAGES.WOMEN} alt="Women's collection" loading="lazy" />
            <div className="cat-info">
              <h3>Women</h3>
              <span>12 styles · Dresses to ethnic <span className="arrow"><IconArrowRight /></span></span>
            </div>
          </Link>
        </div>
      </section>

      {/* ---------- BESTSELLERS ---------- */}
      <section className="section container" style={{ paddingTop: 20 }}>
        <div className="section-head reveal">
          <span className="section-eyebrow">Loved by thousands</span>
          <h2 className="section-title">Bestsellers</h2>
        </div>
        <div className="grid grid-4">
          {!best
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : best.slice(0, 8).map((p, i) => (
                <div className="reveal" key={p._id} style={{ transitionDelay: `${(i % 4) * 0.07}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
        {best && best.length === 0 && (
          <div className="empty-state"><p className="big">No bestsellers yet</p><p>Check back soon.</p></div>
        )}
      </section>

      {/* ---------- FILM STRIP ---------- */}
      <section className="section" style={{ background: "var(--ivory-2)" }}>
        <div className="container">
          <div className="section-head reveal">
            <span className="section-eyebrow">Watch in motion</span>
            <h2 className="section-title">Fashion Films</h2>
            <p className="section-sub">Hover to preview — click to watch the full film. Clothes look better when they move.</p>
          </div>
          <div className="film-strip">
            {HOME_FILM_STRIP.map((v, i) => (
              <div className="reveal-zoom" key={v.id} style={{ transitionDelay: `${i * 0.1}s` }}>
                <VideoTile video={v} onOpen={() => document.dispatchEvent(new CustomEvent("open-film", { detail: v }))} />
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 30 }} className="reveal">
            <Link to="/videos" className="btn btn-outline btn-shine">View all films <IconArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* ---------- SALE BANNER ---------- */}
      <section className="section container">
        <div className="sale-banner reveal-zoom">
          <div className="bg"><img src={SALE_BANNER_IMAGE} alt="Season sale" loading="lazy" /></div>
          <div className="sale-content">
            <h3>The <em>Grand</em> Edit Sale</h3>
            <p>Flat 20% off on orders above ₹5,000 — use code <b>BIGSAVE</b> at checkout.</p>
            <Link to="/women" className="btn btn-gold btn-lg btn-shine">Grab the Sale</Link>
          </div>
        </div>
      </section>

      {/* ---------- NEW ARRIVALS ---------- */}
      <section className="section container" style={{ paddingTop: 10 }}>
        <div className="section-head reveal">
          <span className="section-eyebrow">Just landed</span>
          <h2 className="section-title">New Arrivals</h2>
        </div>
        <div className="grid grid-4">
          {!fresh
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : fresh.map((p, i) => (
                <div className="reveal" key={p._id} style={{ transitionDelay: `${i * 0.07}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="section container" style={{ paddingTop: 20 }}>
        <div className="section-head reveal">
          <span className="section-eyebrow">Word of mouth</span>
          <h2 className="section-title">What Our People Say</h2>
        </div>
        <div className="grid grid-3">
          {TESTIMONIALS.map((t, i) => (
            <div className="testi-card reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="testi-quote">&ldquo;</div>
              <p className="testi-text">{t.text}</p>
              <div className="testi-who">
                <span className="testi-avatar">{t.name[0]}</span>
                <div>
                  <b>{t.name}</b>
                  <span>{t.city}</span>
                </div>
                <span style={{ marginLeft: "auto" }}><Stars rating={t.rating} /></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- NEWSLETTER ---------- */}
      <section className="section container" style={{ paddingTop: 10 }}>
        <div className="newsletter reveal-zoom">
          <h3>Join the VASTRA Circle</h3>
          <p>Early access to drops, members-only prices and 10% off your first order. No spam — just style.</p>
          <form className="newsletter-form" onSubmit={subscribe}>
            <input
              type="email"
             
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <button type="submit" className="btn btn-gold btn-shine"><IconCheck size={17} /> Subscribe</button>
          </form>
        </div>
      </section>

      {/* lightbox for home film strip */}
      <HomeFilmLightbox />
    </div>
  );
}

/** Listens for film-strip clicks and shows the shared lightbox */
function HomeFilmLightbox() {
  const [video, setVideo] = useState(null);
  useEffect(() => {
    const open = (e) => setVideo(e.detail);
    document.addEventListener("open-film", open);
    return () => document.removeEventListener("open-film", open);
  }, []);
  return <Lightbox video={video} onClose={() => setVideo(null)} />;
}
