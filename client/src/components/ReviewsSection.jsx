// Product reviews — list + aggregate + write/update form (server-backed)
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth, useToast } from "../context/Store.jsx";
import { IconEdit, Stars } from "./Icons.jsx";

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="star-picker" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-btn ${n <= shown ? "on" : ""}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          aria-checked={value === n}
          role="radio"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={n <= shown ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
            <path d="M12 2.6l2.9 5.9 6.5 1-4.7 4.5 1.1 6.4L12 17.4l-5.8 3-1.1-6.4L.4 9.5l6.5-1L12 2.6z" />
          </svg>
        </button>
      ))}
      <span className="star-word">{["", "Poor", "Fair", "Good", "Great", "Love it!"][shown] || "Tap to rate"}</span>
    </div>
  );
}

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function ReviewsSection({ product, onProductRated }) {
  const { user } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState(null); // null = loading
  const [expanded, setExpanded] = useState(false);
  const [writing, setWriting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: "", comment: "" });
  const [formErr, setFormErr] = useState("");

  useEffect(() => {
    let alive = true;
    setReviews(null);
    setWriting(false);
    setForm({ rating: 0, title: "", comment: "" });
    api(`/api/products/${product._id}/reviews`)
      .then((d) => alive && setReviews(d.reviews || []))
      .catch(() => alive && setReviews([]));
    return () => { alive = false; };
  }, [product._id]);

  const mine = user ? reviews?.find((r) => String(r.userId) === String(user.id)) : null;

  const startWriting = () => {
    setWriting(true);
    if (mine) setForm({ rating: mine.rating, title: mine.title || "", comment: mine.comment || "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormErr("");
    if (!form.rating) return setFormErr("Please select a star rating");
    if (form.comment.trim().length < 4) return setFormErr("Please write a few words about the product");
    setBusy(true);
    try {
      const d = await api(`/api/products/${product._id}/reviews`, {
        method: "POST",
        body: { rating: form.rating, title: form.title, comment: form.comment },
      });
      setReviews((prev) => {
        const others = (prev || []).filter((r) => String(r.userId) !== String(user.id));
        return [d.review, ...others];
      });
      if (onProductRated) onProductRated(d.productRating, d.reviewsCount);
      toast(mine ? "Your review was updated" : "Thanks! Your review is live", "success");
      setWriting(false);
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setBusy(false);
    }
  };

  const visible = expanded ? reviews || [] : (reviews || []).slice(0, 3);

  return (
    <section className="section reviews-section" id="reviews" style={{ paddingBottom: 8 }}>
      <div className="section-head" style={{ textAlign: "left", marginBottom: 18 }}>
        <span className="section-eyebrow" style={{ display: "inline-flex" }}>Word of mouth</span>
        <h2 className="section-title" style={{ fontSize: "1.7rem" }}>
          Customer Reviews{" "}
          <span className="reviews-avg">
            {product.rating} / 5 · {product.reviewsCount} review{product.reviewsCount === 1 ? "" : "s"}
          </span>
        </h2>
      </div>

      {/* my review CTA */}
      <div className="review-cta">
        {!user ? (
          <p>
            <Link to="/account" className="link-slide" style={{ color: "var(--gold-2)", fontWeight: 700 }}>
              Sign in
            </Link>{" "}
            to write a review for this piece.
          </p>
        ) : writing ? (
          <form className="review-form" onSubmit={submit} noValidate>
            <h4>{mine ? "Update your review" : "Write a review"}</h4>
            <StarPicker value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
            <input
              className="input"
             
              maxLength={120}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <textarea
              className="input"
              rows={3}
             
              maxLength={1200}
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            />
            {formErr && <p className="form-error">{formErr}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-dark btn-shine" disabled={busy}>
                {busy ? "Posting…" : mine ? "Update Review" : "Post Review"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setWriting(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="btn btn-outline" onClick={startWriting}>
            <IconEdit size={15} /> {mine ? "Edit Your Review" : "Write a Review"}
          </button>
        )}
      </div>

      {/* list */}
      {reviews === null ? (
        <div style={{ padding: "26px 0" }}><span className="spinner" /> Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <p className="mini-note" style={{ padding: "8px 0 16px" }}>
          No reviews yet — be the first to tell everyone how this piece feels.
        </p>
      ) : (
        <div className="review-list">
          {visible.map((r) => (
            <article key={r._id} className="review-card">
              <span className="review-avatar">{(r.userName || "C")[0]?.toUpperCase()}</span>
              <div className="review-main">
                <div className="review-head">
                  <b>{r.userName || "Customer"}</b>
                  {user && String(r.userId) === String(user.id) && <span className="badge badge-gold">You</span>}
                  <span className="review-date">{fmtDate(r.createdAt)}</span>
                </div>
                <div className="review-stars"><Stars rating={r.rating} size={13} /></div>
                {r.title && <div className="review-title">“{r.title}”</div>}
                {r.comment && <p className="review-comment">{r.comment}</p>}
              </div>
            </article>
          ))}
          {reviews.length > 3 && (
            <button className="btn btn-outline review-more" onClick={() => setExpanded((x) => !x)}>
              {expanded ? "Show fewer" : `Show all ${reviews.length} reviews`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
