import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useToast, useAuth } from "../context/Store.jsx";
import { formatINR, SUBCATEGORIES } from "../data/media.js";

/* Icons — single import from the shared icon set */
import {
  IconChart as Chart, IconGrid as Grid, IconBag as BagIcon, IconUser as UserIcon,
  IconPlus as Plus, IconEdit as Edit, IconTrash as Trash, IconX as X, IconLogout,
} from "../components/Icons.jsx";

const STATUS_FLOW = ["PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
const SUBS = [...SUBCATEGORIES.MEN, ...SUBCATEGORIES.WOMEN.filter((w) => !SUBCATEGORIES.MEN.some((m) => m.value === w.value))];

export default function AdminDashboard() {
  const toast = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState(null);
  const [orders, setOrders] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadStats = () => api("/api/admin/stats").then((d) => setStats(d)).catch((e) => toast(e.message, "error"));
  const loadProducts = () => api("/api/admin/products").then((d) => setProducts(d.products)).catch((e) => toast(e.message, "error"));
  const loadOrders = () => api("/api/admin/orders").then((d) => setOrders(d.orders)).catch((e) => toast(e.message, "error"));

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (tab === "products") loadProducts();
    if (tab === "orders") loadOrders();
  }, [tab]);

  const deleteProduct = async (p) => {
    if (!window.confirm(`Delete "${p.name}" permanently?`)) return;
    try {
      await api(`/api/admin/products/${p._id}`, { method: "DELETE" });
      toast("Product deleted", "success");
      loadProducts();
      loadStats();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  /* sign the admin out and land on the home page */
  const handleLogout = async () => {
    try {
      await logout();
      toast("Admin signed out", "success");
    } catch {
      toast("Could not sign out — try again", "error");
      return;
    }
    navigate("/");
  };

  return (
    <div className="admin-wrap" style={{ padding: "36px 0 70px" }}>
      {/* sub tabs + logout */}
      <div className="admin-subtabs">
        <button className={`admin-subtab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}><Chart size={16} /> Overview</button>
        <button className={`admin-subtab ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")}><Grid size={16} /> Products</button>
        <button className={`admin-subtab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}><BagIcon size={16} /> Orders</button>
        <button className="admin-logout" onClick={handleLogout} title="Sign out and go to home page"><IconLogout size={16} /> Logout</button>
      </div>

      {/* ---------- OVERVIEW ---------- */}
      {tab === "overview" && (
        <div>
          {!stats ? (
            <div className="center-loading"><span className="spinner" /> Loading dashboard…</div>
          ) : (
            <>
              <div className="stat-cards">
                <div className="stat-card" style={{ animationDelay: "0s" }}>
                  <span className="stat-icon"><Chart size={20} /></span>
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value">{formatINR(stats.stats.revenue)}</div>
                  <div className="stat-extra">{stats.stats.orders} order{stats.stats.orders === 1 ? "" : "s"}</div>
                </div>
                <div className="stat-card" style={{ animationDelay: "0.08s" }}>
                  <span className="stat-icon"><BagIcon size={20} /></span>
                  <div className="stat-label">Orders</div>
                  <div className="stat-value">{stats.stats.orders}</div>
                  <div className="stat-extra">{stats.stats.pending} in fulfilment</div>
                </div>
                <div className="stat-card" style={{ animationDelay: "0.16s" }}>
                  <span className="stat-icon"><Grid size={20} /></span>
                  <div className="stat-label">Products</div>
                  <div className="stat-value">{stats.stats.products}</div>
                  <div className="stat-extra">{stats.lowStock.length} low on stock</div>
                </div>
                <div className="stat-card" style={{ animationDelay: "0.24s" }}>
                  <span className="stat-icon"><UserIcon size={20} /></span>
                  <div className="stat-label">Customers</div>
                  <div className="stat-value">{stats.stats.customers}</div>
                  <div className="stat-extra">registered members</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }} className="admin-two-col">
                {/* top products */}
                <div className="panel" style={{ marginBottom: 0 }}>
                  <h3><Chart size={18} /> Top Products by Revenue</h3>
                  {stats.topProducts.length === 0 ? (
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No orders yet — revenue will appear here after the first sale.</p>
                  ) : (
                    <div className="top-products">
                      {stats.topProducts.map((t, i) => (
                        <div className="top-product-row" key={i}>
                          <div>
                            <b>{t._id}</b>
                            <span>{t.qty} sold</span>
                          </div>
                          <span className="rev">{formatINR(t.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* low stock */}
                <div className="panel" style={{ marginBottom: 0 }}>
                  <h3><Grid size={18} /> Stock Alerts</h3>
                  {stats.lowStock.length === 0 ? (
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>All products healthy — nothing below 5 units.</p>
                  ) : (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {stats.lowStock.map((p) => (
                        <span className="alert-chip" key={p._id}>
                          {p.name} · <b>{p.stock} left</b>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---------- PRODUCTS ---------- */}
      {tab === "products" && (
        <div>
          <div className="toolbar">
            <p className="results-count">{products ? `${products.length} products` : "Loading…"}</p>
            <button className="btn btn-dark btn-shine" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Product</button>
          </div>
          {!products ? (
            <div className="center-loading"><span className="spinner" /> Loading products…</div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Tags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="prod-cell">
                          <img src={p.image} alt="" />
                          <div><b>{p.name}</b><span>{formatINR(p.originalPrice)} → {formatINR(p.price)}</span></div>
                        </div>
                      </td>
                      <td>{p.category}<br /><span style={{ fontSize: "0.76rem", color: "var(--muted)" }}>{p.subCategory}</span></td>
                      <td><b>{formatINR(p.price)}</b></td>
                      <td>
                        <span style={{ color: p.stock <= 5 ? "#b3261e" : "inherit", fontWeight: 600 }}>{p.stock}</span>
                      </td>
                      <td>
                        {p.newArrival && <span className="badge badge-gold" style={{ marginRight: 6 }}>NEW</span>}
                        {p.isBestseller && <span className="badge badge-new">BEST</span>}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="mini-btn" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}><Edit /></button>
                          <button className="mini-btn danger" aria-label={`Delete ${p.name}`} onClick={() => deleteProduct(p)}><Trash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------- ORDERS ---------- */}
      {tab === "orders" && (
        <div>
          <div className="toolbar">
            <p className="results-count">{orders ? `${orders.length} orders` : "Loading…"}</p>
          </div>
          {!orders ? (
            <div className="center-loading"><span className="spinner" /> Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="empty-state"><p className="big">No orders yet</p><p>Orders placed by customers will appear here.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Invoice</th>
                    <th>Total</th>
                    <th>Placed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td><b style={{ letterSpacing: "0.04em" }}>{o.orderId}</b></td>
                      <td>
                        {o.items.reduce((s, i) => s + i.qty, 0)} pcs
                        <br /><span style={{ fontSize: "0.76rem", color: "var(--muted)" }}>{o.items[0]?.name}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ""}</span>
                      </td>
                      <td>
                        {o.payment.method}
                        <br /><span style={{ fontSize: "0.76rem", color: o.payment.paid ? "#1d7a3e" : "#92600a" }}>
                          {o.payment.paid ? "PAID" : "ON DELIVERY"}
                        </span>
                      </td>
                      <td>
                        {o.invoice ? (
                          <a
                            className="inv-link"
                            href={`/api/invoices/${o.orderId}/download`}
                            target="_blank"
                            rel="noreferrer"
                            title="Open invoice PDF"
                          >
                            {o.invoice.invoiceNo}
                            <br />
                            <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.1em", color: o.invoice.status === "PAID" ? "#1d7a3e" : "#92600a" }}>
                              {o.invoice.status === "PAID" ? "PAID" : "DUE"}
                            </span>
                          </a>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>—</span>
                        )}
                      </td>
                      <td><b>{formatINR(o.total)}</b></td>
                      <td style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                        {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td>
                        <select
                          className={`select status-badge st-${o.status}`}
                          style={{ border: "none", cursor: "pointer", fontWeight: 700, padding: "7px 12px" }}
                          value={o.status}
                          onChange={async (e) => {
                            try {
                              const resp = await api(`/api/admin/orders/${o._id}`, { method: "PUT", body: { status: e.target.value } });
                              toast(
                                resp.codCollected
                                  ? `${o.orderId} delivered · payment collected — invoice ${resp.invoice?.invoiceNo} finalized`
                                  : `${o.orderId} → ${e.target.value}`,
                                "success"
                              );
                              loadOrders();
                            } catch (err) {
                              toast(err.message, "error");
                            }
                          }}
                          aria-label={`Update status for ${o.orderId}`}
                        >
                          {[...STATUS_FLOW, "CANCELLED"].map((s) => (
                            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------- ADD / EDIT MODAL ---------- */}
      {(showAdd || editing) && (
        <ProductModal
          product={editing}
          onClose={() => { setShowAdd(false); setEditing(null); }}
          onSaved={() => { setShowAdd(false); setEditing(null); loadProducts(); loadStats(); }}
        />
      )}
    </div>
  );
}

/* ================= Add/Edit product modal ================= */
function ProductModal({ product, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!product;
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    originalPrice: product?.originalPrice || "",
    category: product?.category || "MEN",
    subCategory: product?.subCategory || "tshirts",
    image: product?.image || "",
    stock: product?.stock ?? 25,
    newArrival: product?.newArrival ?? false,
    isBestseller: product?.isBestseller ?? false,
  });
  const [err, setErr] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.name.trim()) return setErr("Product name is required");
    if (!(Number(f.price) > 0)) return setErr("Price must be greater than 0");
    if (!/^https?:\/\//.test(f.image)) return setErr("Image URL must start with http(s)://");
    setBusy(true);
    try {
      const body = { ...f, price: Number(f.price), originalPrice: Number(f.originalPrice) || 0, stock: Number(f.stock) };
      if (isEdit) {
        await api(`/api/admin/products/${product._id}`, { method: "PUT", body });
        toast("Product updated", "success");
      } else {
        await api("/api/admin/products", { method: "POST", body });
        toast("Product added to the store", "success");
      }
      onSaved();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h3>{isEdit ? "Edit Product" : "Add New Product"}</h3>
          <button className="mini-btn" onClick={onClose} aria-label="Close"><X /></button>
        </div>
        <form onSubmit={save} noValidate>
          <div className="field">
            <label htmlFor="pName">Name</label>
            <input id="pName" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="pDesc">Description</label>
            <textarea id="pDesc" className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="pPrice">Price (₹)</label>
              <input id="pPrice" className="input" inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, "") })} />
            </div>
            <div className="field">
              <label htmlFor="pMrp">Original MRP (₹)</label>
              <input id="pMrp" className="input" inputMode="numeric" value={f.originalPrice} onChange={(e) => setF({ ...f, originalPrice: e.target.value.replace(/\D/g, "") })} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="pCat">Category</label>
              <select id="pCat" className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                <option value="MEN">Men</option>
                <option value="WOMEN">Women</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="pSub">Sub-category</label>
              <select id="pSub" className="input" value={f.subCategory} onChange={(e) => setF({ ...f, subCategory: e.target.value })}>
                {SUBS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="pImg">Image URL</label>
            <input id="pImg" className="input" value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="pStock">Stock</label>
              <input id="pStock" className="input" inputMode="numeric" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value.replace(/\D/g, "") })} />
            </div>
            <div className="field" style={{ justifyContent: "flex-end" }}>
              <div className="check-row" style={{ marginBottom: 0 }}>
                <label><input type="checkbox" checked={f.newArrival} onChange={(e) => setF({ ...f, newArrival: e.target.checked })} /> New</label>
                <label><input type="checkbox" checked={f.isBestseller} onChange={(e) => setF({ ...f, isBestseller: e.target.checked })} /> Bestseller</label>
              </div>
            </div>
          </div>
          {err && <p className="form-error" style={{ marginBottom: 12 }}>{err}</p>}
          <button type="submit" className="btn btn-dark btn-block btn-lg btn-shine" disabled={busy}>
            {busy ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
