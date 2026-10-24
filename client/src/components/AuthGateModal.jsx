import { useState } from "react";
import { useAuth, useToast } from "../context/Store.jsx";
import { IconX, IconLock } from "./Icons.jsx";

/**
 * AuthGateModal — shown when a guest lands on checkout.
 * Offers quick account creation / sign-in; on success calls onAuthed()
 * so the checkout can continue. Bag contents are preserved throughout.
 */
export default function AuthGateModal({ open, onClose, onAuthed }) {
  const { login, signup } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("signup");
  const [busy, setBusy] = useState(false);
  const [su, setSu] = useState({ name: "", email: "", password: "", confirm: "" });
  const [si, setSi] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  if (!open) return null;

  const doSignup = async (e) => {
    e.preventDefault();
    setErr("");
    if (!su.name.trim()) return setErr("Please enter your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(su.email)) return setErr("Enter a valid email address");
    if (su.password.length < 6) return setErr("Password must be at least 6 characters");
    if (su.password !== su.confirm) return setErr("Passwords do not match");
    setBusy(true);
    try {
      await signup(su.name.trim(), su.email, su.password);
      toast(`Welcome to VASTRA, ${su.name.split(" ")[0]}!`, "success");
      onAuthed();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const doSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    if (!si.email || !si.password) return setErr("Enter your email and password");
    setBusy(true);
    try {
      await login(si.email, si.password);
      toast("Signed in — continuing to checkout", "success");
      onAuthed();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-mask" onClick={onClose}>
      <div
        className="modal auth-gate"
        style={{ width: "min(440px, 94vw)", padding: 26 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Create an account to continue"
      >
        <div className="modal-head" style={{ marginBottom: 6 }}>
          <div>
            <h3 style={{ fontSize: "1.35rem" }}>Almost there!</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: 4 }}>
              Create a free account (or sign in) to place your order. Your bag is saved.
            </p>
          </div>
          <button className="mini-btn" onClick={onClose} aria-label="Close"><IconX /></button>
        </div>

        <div className="account-tabs" style={{ margin: "14px 0 18px" }}>
          <button
            type="button"
            className={`account-tab ${tab === "signup" ? "active" : ""}`}
            onClick={() => { setTab("signup"); setErr(""); }}
          >Create Account</button>
          <button
            type="button"
            className={`account-tab ${tab === "signin" ? "active" : ""}`}
            onClick={() => { setTab("signin"); setErr(""); }}
          >Sign In</button>
        </div>

        {tab === "signup" && (
          <form onSubmit={doSignup} noValidate>
            <div className="field">
              <label htmlFor="gSuName">Full Name</label>
              <input id="gSuName" className="input" placeholder="Enter your full name" value={su.name} onChange={(e) => setSu({ ...su, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="gSuEmail">Email</label>
              <input id="gSuEmail" className="input" type="email" placeholder="Enter your email" value={su.email} onChange={(e) => setSu({ ...su, email: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="gSuPw">Password</label>
                <input id="gSuPw" className="input" type="password" placeholder="Enter password (min. 6 characters)" value={su.password} onChange={(e) => setSu({ ...su, password: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="gSuPw2">Confirm</label>
                <input id="gSuPw2" className="input" type="password" placeholder="Enter password again" value={su.confirm} onChange={(e) => setSu({ ...su, confirm: e.target.value })} />
              </div>
            </div>
            {err && <p className="form-error" style={{ marginBottom: 12 }}>{err}</p>}
            <button type="submit" className="btn btn-dark btn-block btn-lg btn-shine" disabled={busy}>
              {busy ? "Creating…" : "Create Account & Continue"}
            </button>
          </form>
        )}

        {tab === "signin" && (
          <form onSubmit={doSignIn} noValidate>
            <div className="field">
              <label htmlFor="gSiEmail">Email</label>
              <input id="gSiEmail" className="input" type="email" placeholder="Enter your email" value={si.email} onChange={(e) => setSi({ ...si, email: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="gSiPw">Password</label>
              <div className="password-wrap">
                <input id="gSiPw" className="input" type="password" placeholder="Enter your password" value={si.password} onChange={(e) => setSi({ ...si, password: e.target.value })} />
                <button type="button" className="password-toggle" aria-label="Password field"><IconLock size={16} /></button>
              </div>
            </div>
            {err && <p className="form-error" style={{ marginBottom: 12 }}>{err}</p>}
            <button type="submit" className="btn btn-dark btn-block btn-lg btn-shine" disabled={busy}>
              {busy ? "Signing in…" : "Sign In & Continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
