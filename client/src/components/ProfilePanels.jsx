// Signed-in customer panels — profile editor, password change, saved addresses
import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth, useToast } from "../context/Store.jsx";
import { IconEdit, IconTrash, IconMapPin, IconLock, IconCheck } from "./Icons.jsx";

export default function ProfilePanels() {
  const { user, refresh } = useAuth();
  const toast = useToast();

  return (
    <div className="profile-grid">
      <ProfileCard user={user} refresh={refresh} toast={toast} />
      <PasswordCard toast={toast} />
      <AddressCard user={user} toast={toast} />
    </div>
  );
}

/* ---------------- Profile details ---------------- */
function ProfileCard({ user, refresh, toast }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: user.name, email: user.email, phone: "" });
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const d = await api("/api/users/me");
        setF({ name: d.user.name, email: d.user.email, phone: d.user.phone || "" });
      } catch { /* fall back to session user */ }
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.name.trim()) return setErr("Name cannot be empty");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setErr("Enter a valid email address");
    setBusy(true);
    try {
      await api("/api/users/me", { method: "PUT", body: { name: f.name, email: f.email, phone: f.phone } });
      await refresh(); // navbar name updates live
      toast("Profile updated", "success");
      setEditing(false);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="account-card profile-card">
      <div className="profile-card-head">
        <h3><IconEdit size={17} /> Profile Details</h3>
        {!editing && (
          <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Edit</button>
        )}
      </div>

      {!editing ? (
        <dl className="profile-rows">
          <div><dt>Name</dt><dd>{f.name}</dd></div>
          <div><dt>Email</dt><dd>{f.email}</dd></div>
          <div><dt>Phone</dt><dd>{f.phone || <span className="dim">Not added yet</span>}</dd></div>
        </dl>
      ) : (
        <form onSubmit={save} noValidate>
          <div className="field">
            <label htmlFor="pfName">Full Name</label>
            <input id="pfName" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Enter your full name" />
          </div>
          <div className="field">
            <label htmlFor="pfEmail">Email</label>
            <input id="pfEmail" className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Enter your email" />
          </div>
          <div className="field">
            <label htmlFor="pfPhone">Phone</label>
            <input id="pfPhone" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="Enter 10-digit mobile (optional)" inputMode="numeric" />
          </div>
          {err && <p className="form-error" style={{ marginBottom: 10 }}>{err}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-dark btn-shine" disabled={busy}>{busy ? "Saving…" : "Save Changes"}</button>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ---------------- Change password ---------------- */
function PasswordCard({ toast }) {
  const [busy, setBusy] = useState(false);
  const [p, setP] = useState({ current: "", next: "", confirm: "" });
  const [err, setErr] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    if (!p.current || !p.next) return setErr("Fill both password fields");
    if (p.next.length < 6) return setErr("New password must be at least 6 characters");
    if (p.next !== p.confirm) return setErr("New passwords do not match");
    setBusy(true);
    try {
      await api("/api/users/me/password", {
        method: "PUT",
        body: { currentPassword: p.current, newPassword: p.next },
      });
      setP({ current: "", next: "", confirm: "" });
      toast("Password changed successfully", "success");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="account-card profile-card">
      <div className="profile-card-head">
        <h3><IconLock size={17} /> Change Password</h3>
      </div>
      <form onSubmit={save} noValidate>
        <div className="field">
          <label htmlFor="pwCur">Current Password</label>
          <input id="pwCur" className="input" type="password" value={p.current} onChange={(e) => setP({ ...p, current: e.target.value })} placeholder="Enter current password" />
        </div>
        <div className="field">
          <label htmlFor="pwNew">New Password</label>
          <input id="pwNew" className="input" type="password" value={p.next} onChange={(e) => setP({ ...p, next: e.target.value })} placeholder="Enter new password (min. 6)" />
        </div>
        <div className="field">
          <label htmlFor="pwCon">Confirm New Password</label>
          <input id="pwCon" className="input" type="password" value={p.confirm} onChange={(e) => setP({ ...p, confirm: e.target.value })} placeholder="Enter new password again" />
        </div>
        {err && <p className="form-error" style={{ marginBottom: 10 }}>{err}</p>}
        <button type="submit" className="btn btn-dark btn-shine" disabled={busy}>
          {busy ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}

/* ---------------- Saved address book ---------------- */
function AddressCard({ user, toast }) {
  const [list, setList] = useState(null); // null = loading
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ label: "Home", fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" });
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const d = await api("/api/users/me/addresses");
      setList(d.addresses || []);
    } catch {
      setList([]);
    }
  };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.fullName.trim() || !f.phone.trim() || !f.line1.trim() || !f.city.trim() || !f.pincode.trim()) {
      return setErr("Name, phone, line 1, city and pincode are required");
    }
    setBusy(true);
    try {
      const d = await api("/api/users/me/addresses", { method: "POST", body: f });
      setList(d.addresses || []);
      setAdding(false);
      setF({ label: "Home", fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" });
      toast("Address saved", "success");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const del = async (id) => {
    try {
      const d = await api(`/api/users/me/addresses/${id}`, { method: "DELETE" });
      setList(d.addresses || []);
      toast("Address removed", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const makeDefault = async (id) => {
    try {
      const d = await api(`/api/users/me/addresses/${id}`, { method: "PUT", body: { isDefault: true } });
      setList(d.addresses || []);
      toast("Default address updated", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div className="account-card profile-card addr-card-wide">
      <div className="profile-card-head">
        <h3><IconMapPin size={17} /> Saved Addresses</h3>
        {!adding && (
          <button className="btn btn-outline btn-sm" onClick={() => setAdding(true)}>+ Add New</button>
        )}
      </div>

      {list === null ? (
        <p className="mini-note">Loading addresses…</p>
      ) : list.length === 0 && !adding ? (
        <p className="mini-note">
          No saved addresses yet — add one here or tick “save this address” at checkout.
        </p>
      ) : (
        <div className="addr-list">
          {list.map((a) => (
            <div key={a._id} className="addr-item">
              <div className="addr-item-main">
                <div className="addr-item-head">
                  <b>{a.label || "Address"}</b>
                  {a.isDefault ? (
                    <span className="badge badge-gold"><IconCheck size={11} /> Default</span>
                  ) : (
                    <button className="link-slide addr-make-default" onClick={() => makeDefault(a._id)}>
                      Set default
                    </button>
                  )}
                </div>
                <span className="addr-item-body">
                  {a.fullName} · {a.phone} — {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}{a.state ? `, ${a.state}` : ""} — {a.pincode}
                </span>
              </div>
              <button
                className="icon-btn addr-del"
                aria-label="Delete address"
                title="Delete address"
                onClick={() => del(a._id)}
              >
                <IconTrash size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <form onSubmit={add} noValidate className="addr-add-form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="afLabel">Label</label>
              <select id="afLabel" className="input" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })}>
                {["Home", "Office", "Other"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="afName">Full Name</label>
              <input id="afName" className="input" value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} placeholder="Enter full name" />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="afPhone">Phone</label>
              <input id="afPhone" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="Enter 10-digit mobile" inputMode="numeric" />
            </div>
            <div className="field">
              <label htmlFor="afPin">Pincode</label>
              <input id="afPin" className="input" value={f.pincode} onChange={(e) => setF({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="Enter 6-digit pincode" inputMode="numeric" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="afLine1">Address Line 1</label>
            <input id="afLine1" className="input" value={f.line1} onChange={(e) => setF({ ...f, line1: e.target.value })} placeholder="Enter house no, building, street" />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="afCity">City</label>
              <input id="afCity" className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Enter city" />
            </div>
            <div className="field">
              <label htmlFor="afState">State</label>
              <input id="afState" className="input" value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} placeholder="Enter state" />
            </div>
          </div>
          {err && <p className="form-error" style={{ marginBottom: 10 }}>{err}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-dark btn-shine" disabled={busy}>{busy ? "Saving…" : "Save Address"}</button>
            <button type="button" className="btn btn-outline" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
