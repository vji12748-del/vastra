import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/* ---------------- Toast ---------------- */
const ToastCtx = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const show = useCallback((msg, type = "info") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === "error" ? "err" : t.type === "success" ? "ok" : ""}`}>
            <span className="t-icon">
              {t.type === "error" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e05252" strokeWidth="2.4"><circle cx="12" cy="12" r="9.2" /><path d="M12 8v5M12 16.4v.2" /></svg>
              ) : t.type === "success" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3ec46d" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2.4"><circle cx="12" cy="12" r="9.2" /><path d="M12 8v5M12 16.4v.2" /></svg>
              )}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ---------------- Auth ---------------- */
const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { api } = await import("../api.js");
      const data = await api("/api/auth/me");
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const { api } = await import("../api.js");
    const data = await api("/api/auth/login", { method: "POST", body: { email, password } });
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { api } = await import("../api.js");
    const data = await api("/api/auth/signup", { method: "POST", body: { name, email, password } });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const { api } = await import("../api.js");
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  return <AuthCtx.Provider value={{ user, loading, login, signup, logout, refresh }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);

/* ---------------- Cart ---------------- */
const CartCtx = createContext(null);
const LS_KEY = "vastra_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [coupon, setCoupon] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY + "_coupon")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem(LS_KEY + "_coupon", JSON.stringify(coupon));
  }, [coupon]);

  const addItem = useCallback((product, size, color, qty = 1) => {
    setItems((prev) => {
      const key = `${product._id}|${size}|${color}`;
      const found = prev.find((i) => i.key === key);
      if (found) {
        return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(10, i.qty + qty) } : i));
      }
      return [
        ...prev,
        {
          key,
          productId: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.category,
          size,
          color,
          qty,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((key) => setItems((prev) => prev.filter((i) => i.key !== key)), []);

  const setQty = useCallback((key, qty) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i))
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const discount = coupon && subtotal >= coupon.min ? Math.round(subtotal * coupon.off) : 0;
  const shipping = items.length === 0 ? 0 : subtotal - discount >= 1999 ? 0 : 99;
  const total = Math.max(0, subtotal - discount) + shipping;

  return (
    <CartCtx.Provider
      value={{ items, addItem, removeItem, setQty, clear, coupon, setCoupon, subtotal, discount, shipping, total, count }}
    >
      {children}
    </CartCtx.Provider>
  );
}
export const useCart = () => useContext(CartCtx);

/* ---------------- Wishlist (server-backed, per user) ---------------- */
const WishCtx = createContext(null);

export function WishlistProvider({ children }) {
  const { user, loading } = useAuth();
  const [ids, setIds] = useState(() => new Set());
  const [count, setCount] = useState(0);

  // Load the user's wishlist when they sign in; clear it on sign-out
  useEffect(() => {
    let alive = true;
    if (loading) return;
    if (!user) {
      setIds(new Set());
      setCount(0);
      return;
    }
    (async () => {
      try {
        const { api } = await import("../api.js");
        const d = await api("/api/wishlist");
        if (!alive) return;
        setIds(new Set((d.products || []).map((p) => String(p._id))));
        setCount(d.count || 0);
      } catch {
        /* wishlist is a luxury — never block the app on it */
      }
    })();
    return () => { alive = false; };
  }, [user, loading]);

  const toggle = useCallback(
    async (product) => {
      if (!user) throw Object.assign(new Error("Sign in to save items to your wishlist"), { status: 401 });
      const pid = String(product._id);
      const active = ids.has(pid);
      // optimistic update
      setIds((prev) => {
        const n = new Set(prev);
        if (active) n.delete(pid);
        else n.add(pid);
        return n;
      });
      setCount((c) => Math.max(0, c + (active ? -1 : 1)));
      try {
        const { api } = await import("../api.js");
        if (active) await api(`/api/wishlist/${pid}`, { method: "DELETE" });
        else await api("/api/wishlist", { method: "POST", body: { productId: pid } });
        return !active;
      } catch (e) {
        // revert on failure
        setIds((prev) => {
          const n = new Set(prev);
          if (active) n.add(pid);
          else n.delete(pid);
          return n;
        });
        setCount((c) => Math.max(0, c + (active ? 1 : -1)));
        throw e;
      }
    },
    [user, ids]
  );

  const remove = useCallback(async (productId) => {
    const pid = String(productId);
    setIds((prev) => {
      const n = new Set(prev);
      n.delete(pid);
      return n;
    });
    setCount((c) => Math.max(0, c - 1));
    const { api } = await import("../api.js");
    return api(`/api/wishlist/${pid}`, { method: "DELETE" });
  }, []);

  return <WishCtx.Provider value={{ ids, count, toggle, remove }}>{children}</WishCtx.Provider>;
}
export const useWishlist = () => useContext(WishCtx);
