import { Link } from "react-router-dom";
import { SUBCATEGORIES } from "../data/media.js";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-logo"><span className="logo-mark">V</span>VASTRA</Link>
            <p>
              Premium men &amp; women clothing crafted with intention. From everyday essentials
              to festive couture — designed in-house, made to move with you.
            </p>
            <div className="socials" style={{ marginTop: 18 }}>
              <a className="social-btn" href="#instagram" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" /></svg>
              </a>
              <a className="social-btn" href="#x" aria-label="X (Twitter)" onClick={(e) => e.preventDefault()}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.7 3H21l-7.3 8.3L22.2 21h-6.7l-5.2-6.2L4.4 21H1l7.8-8.9L2 3h6.9l4.7 5.7L17.7 3Zm-1.2 16h1.9L7.1 4.9H5L16.5 19Z" /></svg>
              </a>
              <a className="social-btn" href="#youtube" aria-label="YouTube" onClick={(e) => e.preventDefault()}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="2.5" y="6" width="19" height="12" rx="3.5" /><path d="m10.5 9.7 4.5 2.3-4.5 2.3v-4.6Z" fill="currentColor" stroke="none" /></svg>
              </a>
              <a className="social-btn" href="#facebook" aria-label="Facebook" onClick={(e) => e.preventDefault()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M14 8.5V7a2 2 0 0 1 2-2h1.5V2H15a5 5 0 0 0-5 5v1.5H7.5V12H10v9.5h4V12h2.6l.9-3.5H14Z" /></svg>
              </a>
            </div>
          </div>

          <div>
            <h4>Shop</h4>
            <div className="footer-links">
              <Link to="/men">Men's Collection</Link>
              <Link to="/women">Women's Collection</Link>
              <Link to="/videos">Fashion Films</Link>
              <Link to="/search">Search</Link>
            </div>
          </div>

          <div>
            <h4>Categories</h4>
            <div className="footer-links">
              {SUBCATEGORIES.MEN.slice(0, 4).map((s) => (
                <Link key={"m" + s.value} to={`/men?sub=${s.value}`}>{s.label}</Link>
              ))}
              <Link to="/women?sub=dresses">Dresses</Link>
            </div>
          </div>

          <div>
            <h4>Account</h4>
            <div className="footer-links">
              <Link to="/account">Sign in / Sign up</Link>
              <Link to="/account?tab=admin">Admin Portal</Link>
              <Link to="/orders">My Orders</Link>
              <Link to="/cart">My Bag</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} VASTRA. All rights reserved. — Built with MongoDB · Express · React · Node.js</span>
          <div className="pay-icons">
            <span className="pay-chip">VISA</span>
            <span className="pay-chip">UPI</span>
            <span className="pay-chip">RuPay</span>
            <span className="pay-chip">NetBanking</span>
            <span className="pay-chip">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
