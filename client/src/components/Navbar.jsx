import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth, useCart, useWishlist } from "../context/Store.jsx";
import { SUBCATEGORIES } from "../data/media.js";
import { IconBag, IconUser, IconSearch, IconMenu, IconX, IconHeart } from "./Icons.jsx";

/* theme icons — Icons.jsx wale style me hi (stroke + currentColor) */
function SunIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

/* index.html ka early script data-theme pehle se laga chuka hoga (flash-free boot) —
   wahi initial value uthao taaki button aur site hamesha sync rahein */
const initialTheme = () => {
  try {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export default function Navbar() {
  const { count } = useCart();
  const { user } = useAuth();
  const { count: wishCount } = useWishlist();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(initialTheme);

  /* toggle par <html> par data-theme lagta hai — theme.css isi se dark styles
     apply karta hai; choice localStorage me save hoti hai (reload par yaad rehti hai) */
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("vastra-theme", theme);
    } catch {
      /* private browsing — ignore */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  /* dropdown link click par turant top par le jao — naye products upar se dikhein */
  const jumpTop = () => window.scrollTo({ top: 0, behavior: "instant" });

  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <Link to="/" className="nav-logo" aria-label="VASTRA home">
            <span className="logo-mark">V</span>
            VASTRA
          </Link>

          <nav className="nav-links" aria-label="Primary">
            <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Home</NavLink>

            <div className="nav-drop">
              <NavLink to="/men" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Men</NavLink>
              <div className="nav-drop-menu" role="menu">
                <h4>Shop Men</h4>
                {SUBCATEGORIES.MEN.map((s) => (
                  <Link key={s.value} to={`/men?sub=${s.value}`} onClick={jumpTop}>{s.label}</Link>
                ))}
              </div>
            </div>

            <div className="nav-drop">
              <NavLink to="/women" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Women</NavLink>
              <div className="nav-drop-menu" role="menu">
                <h4>Shop Women</h4>
                {SUBCATEGORIES.WOMEN.map((s) => (
                  <Link key={s.value} to={`/women?sub=${s.value}`} onClick={jumpTop}>{s.label}</Link>
                ))}
              </div>
            </div>

            <NavLink to="/videos" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Fashion Films</NavLink>
          </nav>

          <div className="nav-actions">
            <button
              className="icon-btn theme-btn"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className="icon-btn" aria-label="Search" onClick={() => navigate("/search")}>
              <IconSearch />
            </button>
            <Link
              to="/account"
              className={user ? "icon-btn nav-user" : "icon-btn"}
              aria-label={user ? `Account: ${user.name}` : "Sign in / Sign up"}
              title={user ? user.name : undefined}
            >
              <IconUser />
              {user && <span className="nav-user-name">{user.name?.split(" ")[0] || "Account"}</span>}
            </Link>
            <Link to="/wishlist" className="icon-btn" aria-label={`Wishlist, ${wishCount} items`}>
              <IconHeart />
              {wishCount > 0 && <span className="cart-count wish-count" key={wishCount}>{wishCount}</span>}
            </Link>
            <Link to="/cart" className="icon-btn" aria-label={`Bag, ${count} items`}>
              <IconBag />
              {count > 0 && <span className="cart-count" key={count}>{count}</span>}
            </Link>
            <button className="icon-btn nav-burger" aria-label="Open menu" onClick={() => setOpen(true)}>
              <IconMenu />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <>
          <div className="drawer-mask" onClick={() => setOpen(false)} />
          <aside className="drawer" aria-label="Mobile menu">
            <div className="drawer-head">
              <span className="nav-logo"><span className="logo-mark">V</span>VASTRA</span>
              <button className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}><IconX /></button>
            </div>
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/men" onClick={() => setOpen(false)}>Men</Link>
            <Link to="/women" onClick={() => setOpen(false)}>Women</Link>
            <Link to="/videos" onClick={() => setOpen(false)}>Fashion Films</Link>
            <Link to="/orders" onClick={() => setOpen(false)}>My Orders</Link>
            <Link to="/wishlist" onClick={() => setOpen(false)}>My Wishlist{wishCount > 0 ? ` (${wishCount})` : ""}</Link>
            <Link to="/account" onClick={() => setOpen(false)}>{user ? `Hi, ${user.name.split(" ")[0]}` : "Sign in / Sign up"}</Link>
            <Link to="/cart" onClick={() => setOpen(false)}>Bag ({count})</Link>
            <button className="drawer-theme" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </aside>
        </>
      )}
    </>
  );
}
