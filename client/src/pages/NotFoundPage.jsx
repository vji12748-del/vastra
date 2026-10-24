import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="nf container">
      <h1>404</h1>
      <p style={{ maxWidth: 420, margin: "0 auto 26px" }}>
        This page slipped off the rack. Let&apos;s get you back to the good stuff.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link to="/" className="btn btn-dark btn-shine">Back to Home</Link>
        <Link to="/videos" className="btn btn-outline">Watch Fashion Films</Link>
      </div>
    </div>
  );
}
