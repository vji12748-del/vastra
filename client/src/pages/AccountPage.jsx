import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth, useToast } from "../context/Store.jsx";
import AdminDashboard from "../components/AdminDashboard.jsx";
import ProfilePanels from "../components/ProfilePanels.jsx";
import { IconUser, IconLock, IconShield, IconChart, IconArrowRight } from "../components/Icons.jsx";

const TABS = [
  { id: "signup", label: "Sign Up", icon: <IconUser size={16} /> },
  { id: "signin", label: "Sign In", icon: <IconLock size={16} /> },
  { id: "admin", label: "Admin Portal", icon: <IconShield size={16} /> },
];

export default function AccountPage({ initialTab = "signup" }) {
  const { user, loading, login, signup, logout } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(
    params.get("tab") === "admin" || initialTab === "admin" ? "admin" : params.get("tab") || "signup"
  );

  // signup form
  const [su, setSu] = useState({ name: "", email: "", password: "", confirm: "" });
  const [suErr, setSuErr] = useState("");
  const [showPw, setShowPw] = useState(false);
  // signin form
  const [si, setSi] = useState({ email: "", password: "" });
  const [siErr, setSiErr] = useState("");
  // admin form
  const [ad, setAd] = useState({ email: "", password: "" });
  const [adErr, setAdErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.get("tab")) setTab(params.get("tab"));
  }, [params]);

  /* -------- handlers -------- */
  const doSignup = async (e) => {
    e.preventDefault();
    setSuErr("");
    if (!su.name.trim()) return setSuErr("Please enter your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(su.email)) return setSuErr("Enter a valid email address");
    if (su.password.length < 6) return setSuErr("Password must be at least 6 characters");
    if (su.password !== su.confirm) return setSuErr("Passwords do not match");
    setBusy(true);
    try {
      await signup(su.name, su.email, su.password);
      toast(`Welcome to VASTRA, ${su.name.split(" ")[0]}!`, "success");
    } catch (err) {
      setSuErr(err.message);
    } finally {
      setBusy(false);
    }
  };

  const doSignIn = async (e) => {
    e.preventDefault();
    setSiErr("");
    if (!si.email || !si.password) return setSiErr("Email and password are required");
    setBusy(true);
    try {
      const u = await login(si.email, si.password);
      toast(`Welcome back, ${u.name.split(" ")[0]}!`, "success");
      if (u.role === "ADMIN") setTab("admin");
    } catch (err) {
      setSiErr(err.message);
    } finally {
      setBusy(false);
    }
  };

  const doAdminLogin = async (e) => {
    e.preventDefault();
    setAdErr("");
    setBusy(true);
    try {
      const u = await login(ad.email, ad.password);
      if (u.role !== "ADMIN") {
        await logout();
        setAdErr("This account is not an admin. Use the Sign In tab instead.");
      } else {
        toast("Admin verified — dashboard unlocked", "success");
      }
    } catch (err) {
      setAdErr(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isAdmin = user?.role === "ADMIN";

  /* -------- signed-in view -------- */
  if (!loading && user) {
    return (
      <div>
        <section className="account-hero">
          <div className="container">
            <h1>{isAdmin ? "Admin Console" : "My Account"}</h1>
            <p>You&apos;re signed in — {isAdmin ? "full store controls unlocked." : "happy shopping."}</p>
          </div>
        </section>

        <div className="container" style={{ padding: "0 0 70px" }}>
          {isAdmin ? (
            <AdminDashboard />
          ) : (
            <div className="account-body">
              <div className="account-card welcome-box">
                <div className="welcome-avatar">{user.name[0]?.toUpperCase()}</div>
                <h2>Hello, {user.name.split(" ")[0]}</h2>
                <span className="badge badge-gold role-chip">{user.role === "ADMIN" ? "Administrator" : "Member"}</span>
                <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginBottom: 18 }}>{user.email}</p>
                <div className="welcome-actions">
                  <Link to="/orders" className="btn btn-dark btn-shine">My Orders <IconArrowRight /></Link>
                  <Link to="/wishlist" className="btn btn-outline">My Wishlist</Link>
                  <button className="btn btn-outline" onClick={async () => { await logout(); toast("Signed out. See you soon!"); }}>
                    Sign Out
                  </button>
                </div>
              </div>

              <ProfilePanels />
            </div>
          )}
        </div>
      </div>
    );
  }

  /* -------- signed-out: combined signup + signin + admin -------- */
  return (
    <div>
      <section className="account-hero">
        <div className="container">
          <h1>Join VASTRA</h1>
          <p>One page for everything — create an account, sign in, or open the admin console.</p>
          <div className="account-tabs" role="tablist" aria-label="Account tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`account-tab ${tab === t.id ? "active" : ""}`}
                onClick={() => { setTab(t.id); setSuErr(""); setSiErr(""); setAdErr(""); }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: "0 0 80px" }}>
        <div className="account-body">
          {/* -------- SIGN UP -------- */}
          {tab === "signup" && (
            <form className="account-card" onSubmit={doSignup} noValidate>
              <h2>Create Account</h2>
              <p className="sub">Join the circle — faster checkout, order tracking &amp; member prices.</p>
              <div className="field">
                <label htmlFor="suName">Full Name</label>
                <input id="suName" className="input" placeholder="Enter your full name" value={su.name} onChange={(e) => setSu({ ...su, name: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="suEmail">Email</label>
                <input id="suEmail" className="input" type="email" placeholder="Enter your email" value={su.email} onChange={(e) => setSu({ ...su, email: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="suPw">Password</label>
                <div className="password-wrap">
                  <input id="suPw" className="input" type={showPw ? "text" : "password"} placeholder="Enter password (min. 6 characters)" value={su.password} onChange={(e) => setSu({ ...su, password: e.target.value })} />
                  <button type="button" className="password-toggle" onClick={() => setShowPw(!showPw)} aria-label="Toggle password visibility">
                    <IconLock size={16} />
                  </button>
                </div>
              </div>
              <div className="field">
                <label htmlFor="suPw2">Confirm Password</label>
                <input id="suPw2" className="input" type="password" placeholder="Enter password again" value={su.confirm} onChange={(e) => setSu({ ...su, confirm: e.target.value })} />
              </div>
              {suErr && <p className="form-error" style={{ marginBottom: 12 }}>{suErr}</p>}
              <button type="submit" className="btn btn-dark btn-block btn-lg btn-shine" disabled={busy}>
                {busy ? "Creating…" : "Create My Account"}
              </button>
              <p className="form-success" style={{ textAlign: "center", marginTop: 14 }}>
                Already a member?{" "}
                <button type="button" className="link-slide" style={{ color: "var(--gold-2)", fontWeight: 600 }} onClick={() => setTab("signin")}>
                  Sign in instead
                </button>
              </p>
            </form>
          )}

          {/* -------- SIGN IN -------- */}
          {tab === "signin" && (
            <form className="account-card" onSubmit={doSignIn} noValidate>
              <h2>Welcome Back</h2>
              <p className="sub">Sign in to track orders, manage your bag and check out faster.</p>
              <div className="field">
                <label htmlFor="siEmail">Email</label>
                <input id="siEmail" className="input" type="email" placeholder="Enter your email" value={si.email} onChange={(e) => setSi({ ...si, email: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="siPw">Password</label>
                <input id="siPw" className="input" type="password" placeholder="Enter your password" value={si.password} onChange={(e) => setSi({ ...si, password: e.target.value })} />
              </div>
              {siErr && <p className="form-error" style={{ marginBottom: 12 }}>{siErr}</p>}
              <button type="submit" className="btn btn-dark btn-block btn-lg btn-shine" disabled={busy}>
                {busy ? "Signing in…" : "Sign In"}
              </button>
              <div className="admin-hint">
                <IconShield size={17} />
                <span>
                  Admin? <b>admin@vastra.com</b> / <b>admin123</b> works here too —
                  or use the dedicated Admin Portal tab for the full console.
                </span>
              </div>
              <p className="form-success" style={{ textAlign: "center", marginTop: 14 }}>
                New to VASTRA?{" "}
                <button type="button" className="link-slide" style={{ color: "var(--gold-2)", fontWeight: 600 }} onClick={() => setTab("signup")}>
                  Create an account
                </button>
              </p>
            </form>
          )}

          {/* -------- ADMIN PORTAL -------- */}
          {tab === "admin" && (
            <form className="account-card" onSubmit={doAdminLogin} noValidate>
              <h2>Admin Portal</h2>
              <p className="sub">Restricted area — store dashboard, products and order controls.</p>
              <div className="field">
                <label htmlFor="adEmail">Admin Email</label>
                <input id="adEmail" className="input" type="email" placeholder="Enter admin email" value={ad.email} onChange={(e) => setAd({ ...ad, email: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="adPw">Admin Password</label>
                <input id="adPw" className="input" type="password" placeholder="Enter admin password" value={ad.password} onChange={(e) => setAd({ ...ad, password: e.target.value })} />
              </div>
              {adErr && <p className="form-error" style={{ marginBottom: 12 }}>{adErr}</p>}
              <button type="submit" className="btn btn-dark btn-block btn-lg btn-shine" disabled={busy}>
                {busy ? "Verifying…" : "Unlock Admin Console"}
              </button>
              <div className="admin-hint">
                <IconChart size={17} />
                <span>
                  <b>Demo credentials:</b> admin@vastra.com / admin123 — you&apos;ll get live revenue,
                  order and product controls after sign-in.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
