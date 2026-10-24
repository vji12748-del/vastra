import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth, useCart, useWishlist } from "../context/Store.jsx";
import { SUBCATEGORIES } from "../data/media.js";
import { IconBag, IconUser, IconSearch, IconMenu, IconX, IconHeart } from "./Icons.jsx";

export default function Navbar() {
  const { count } = useCart();
  const { user } = useAuth();
  const { count: wishCount } = useWishlist();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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
                <div>
                  <h4>Shop Men</h4>
                  {SUBCATEGORIES.MEN.slice(0, 6).map((s) => (
                    <Link key={s.value} to={`/men?sub=${s.value}`}>{s.label}</Link>
                  ))}
                </div>
                <div>
                  <h4>Shop Women</h4>
                  {SUBCATEGORIES.WOMEN.slice(0, 6).map((s) => (
                    <Link key={s.value} to={`/women?sub=${s.value}`}>{s.label}</Link>
                  ))}
                </div>
              </div>
            </div>

            <NavLink to="/women" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Women</NavLink>
            <NavLink to="/videos" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Fashion Films</NavLink>
          </nav>

          <div className="nav-actions">
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
          </aside>
        </>
      )}
    </>
  );
}
