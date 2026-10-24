import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart, useAuth, useToast } from "../context/Store.jsx";
import { api } from "../api.js";
import { formatINR } from "../data/media.js";
import { IconMapPin, IconShieldPay, IconLock, IconCheck, IconWallet, IconBank, IconPhone, IconUser } from "../components/Icons.jsx";
import AuthGateModal from "../components/AuthGateModal.jsx";

const METHODS = [
  { id: "UPI", label: "UPI", sub: "GPay, PhonePe, Paytm & more", icon: <IconPhone /> },
  { id: "CARD", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay, Amex", icon: <IconShieldPay /> },
  { id: "NETBANKING", label: "Net Banking", sub: "All major Indian banks", icon: <IconBank /> },
  { id: "WALLET", label: "Wallets", sub: "Paytm, Mobikwik, Amazon Pay", icon: <IconWallet /> },
  { id: "COD", label: "Cash on Delivery", sub: "Pay when it arrives (₹0 extra)", icon: <IconBag2 /> },
];

function IconBag2() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7h12l1.2 13.2a1.6 1.6 0 0 1-1.6 1.8H6.4a1.6 1.6 0 0 1-1.6-1.8L6 7Z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

const PAY_LABEL = { CARD: "Card", UPI: "UPI", NETBANKING: "NetBanking", WALLET: "Wallet", COD: "Cash on Delivery" };

export default function CheckoutPage() {
  const { items, subtotal, discount, shipping, total, coupon, clear } = useCart();
  const { user, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [method, setMethod] = useState("UPI");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(null);
  const [invoice, setInvoice] = useState(null);
  // saved address book (Task 16 — picker over /api/users/me/addresses)
  const [savedAddrs, setSavedAddrs] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState("new"); // address _id or "new"
  const [saveNew, setSaveNew] = useState(false);
  const [addr, setAddr] = useState({
    fullName: user?.name || "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  // payment sub-forms
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [upi, setUpi] = useState("");
  const [bank, setBank] = useState("");
  const [wallet, setWallet] = useState("");
  // account gate — guests must create an account / sign in before checking out
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && !done) setGateOpen(true);
  }, [loading, user, done]);

  // pre-fill the address name once the user signs in through the gate
  useEffect(() => {
    if (user?.name) setAddr((a) => (a.fullName ? a : { ...a, fullName: user.name }));
  }, [user]);

  // load saved addresses for signed-in users; prefill from the default one
  useEffect(() => {
    let alive = true;
    if (!user) { setSavedAddrs([]); setSelectedAddr("new"); return; }
    (async () => {
      try {
        const d = await api("/api/users/me/addresses");
        if (!alive) return;
        const list = d.addresses || [];
        setSavedAddrs(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) {
          setSelectedAddr(String(def._id));
          setAddr((a) => ({
            ...a,
            fullName: def.fullName,
            phone: def.phone,
            line1: def.line1,
            line2: def.line2 || "",
            city: def.city,
            state: def.state || "",
            pincode: def.pincode,
          }));
        }
      } catch {
        /* address book is optional — the manual form still works */
      }
    })();
    return () => { alive = false; };
  }, [user]);

  const pickSaved = (a) => {
    setSelectedAddr(String(a._id));
    setAddr({
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 || "",
      city: a.city,
      state: a.state || "",
      pincode: a.pincode,
    });
  };

  const pickNew = () => {
    setSelectedAddr("new");
    setAddr((a) => ({ ...a, phone: "", line1: "", line2: "", city: "", state: "", pincode: "" }));
    setSaveNew(savedAddrs.length === 0);
  };

  if (loading && !done) {
    return (
      <div className="container">
        <div className="center-loading" style={{ padding: "120px 20px" }}><span className="spinner" /> Loading checkout…</div>
      </div>
    );
  }

  if (items.length === 0 && !done) {
    return (
      <div className="container">
        <div className="empty-state" style={{ padding: "110px 20px" }}>
          <p className="big">Nothing to check out</p>
          <p style={{ marginBottom: 24 }}>Your bag is empty — add something you love first.</p>
          <Link to="/" className="btn btn-dark btn-shine">Start Shopping</Link>
        </div>
      </div>
    );
  }

  /* guests: account gate — popup asks to create an account / sign in first */
  if (!user && !done) {
    return (
      <div className="container">
        <div className="empty-state" style={{ padding: "110px 20px" }}>
          <span className="gate-avatar"><IconUser size={26} /></span>
          <p className="big">Sign in to continue checkout</p>
          <p style={{ maxWidth: 420, margin: "0 auto 24px" }}>
            Create a free VASTRA account to place your order — your bag is saved and
            you&apos;ll get order tracking, invoices and member offers.
          </p>
          <button className="btn btn-dark btn-lg btn-shine" onClick={() => setGateOpen(true)}>
            Sign In / Create Account
          </button>
        </div>
        <AuthGateModal open={gateOpen} onClose={() => setGateOpen(false)} onAuthed={() => setGateOpen(false)} />
      </div>
    );
  }

  const set = (k) => (e) => setAddr((a) => ({ ...a, [k]: e.target.value }));

  const validate = () => {
    if (!addr.fullName.trim()) return "Please enter your full name";
    if (!/^[6-9]\d{9}$/.test(addr.phone.trim())) return "Enter a valid 10-digit Indian mobile number";
    if (!addr.line1.trim()) return "Please enter your address (line 1)";
    if (!addr.city.trim()) return "Please enter your city";
    if (!addr.state.trim()) return "Please enter your state";
    if (!/^\d{6}$/.test(addr.pincode.trim())) return "Enter a valid 6-digit pincode";
    if (method === "CARD") {
      if (card.number.replace(/\s/g, "").length !== 16) return "Card number must be 16 digits";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return "Expiry must be in MM/YY format";
      if (!/^\d{3,4}$/.test(card.cvv)) return "CVV must be 3 or 4 digits";
      if (!card.name.trim()) return "Enter the name on your card";
    }
    if (method === "UPI" && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upi.trim())) return "Enter a valid UPI ID (e.g. name@okhdfc)";
    if (method === "NETBANKING" && !bank) return "Please select your bank";
    if (method === "WALLET" && !wallet) return "Please select a wallet";
    return null;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast(err, "error"); return; }
    setPlacing(true);
    try {
      // optionally remember this new address in the user's address book
      if (saveNew && selectedAddr === "new") {
        try {
          const d = await api("/api/users/me/addresses", {
            method: "POST",
            body: { ...addr, label: "Home" },
          });
          if (d?.address) setSavedAddrs((list) => [...list, d.address]);
        } catch {
          /* saving the address must never block the order */
        }
      }
      const payload = {
        items: items.map((i) => ({ productId: i.productId, qty: i.qty, size: i.size, color: i.color })),
        address: addr,
        payment: { method },
        couponCode: coupon?.code || "",
      };
      const d = await api("/api/orders", { method: "POST", body: payload });
      setDone(d.order);
      setInvoice(d.invoice || null);
      clear();
      toast(d.order.payment.paid ? "Payment received — invoice generated!" : "Order placed!", "success");
    } catch (err) {
      if (err.status === 401) {
        toast("Please sign in first — redirecting…", "error");
        setTimeout(() => navigate("/account?next=checkout"), 900);
      } else {
        toast(err.message, "error");
      }
    } finally {
      setPlacing(false);
    }
  };

  /* ---------- SUCCESS SCREEN ---------- */
  if (done) {
    return (
      <div className="container">
        <div className="success-wrap">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="confetti"
              style={{
                left: `${(i * 7.3) % 100}%`,
                background: ["#c9a227", "#16130f", "#e0be4e", "#3ec46d"][i % 4],
                animationDelay: `${(i % 5) * 0.35}s`,
                animationDuration: `${2.4 + (i % 3) * 0.5}s`,
              }}
            />
          ))}
          <div className="success-check">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#1d7a3e" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2>{done.payment.paid ? "Payment Successful · Invoice Generated!" : "Order Placed. Thank you!"}</h2>
          <div className="order-id">{done.orderId}</div>
          <p>
            {done.payment.paid
              ? `Payment of ${formatINR(done.total)} received via ${PAY_LABEL[done.payment.method]}`
              : `You'll pay ${formatINR(done.total)} in cash on delivery`}
            {" "}· Confirmation sent to {user?.email}
          </p>

          {invoice && (
            <div className={`invoice-card ${invoice.status === "PAID" ? "inv-paid" : "inv-due"}`}>
              <div className="inv-head">
                <span className="inv-doc-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8M8 17h5" />
                  </svg>
                </span>
                <div className="inv-meta">
                  <b>{invoice.invoiceNo}</b>
                  <small>
                    {invoice.status === "PAID"
                      ? "Tax invoice generated — payment received in full."
                      : "Provisional invoice generated — payable on delivery, finalized after payment."}
                  </small>
                </div>
                <span className={`inv-stamp ${invoice.status === "PAID" ? "paid" : "due"}`}>
                  {invoice.status === "PAID" ? "PAID" : "DUE"}
                </span>
              </div>
              <div className="inv-actions">
                <a
                  className="btn btn-dark btn-shine inv-dl"
                  href={`/api/invoices/${done.orderId}/download`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M7 10l5 5 5-5" />
                    <path d="M12 15V3" />
                  </svg>
                  Download Invoice (PDF)
                </a>
                <Link to="/" className="btn btn-outline inv-home">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <path d="M9 22V12h6v10" />
                  </svg>
                  Home
                </Link>
              </div>
            </div>
          )}
          <div className="success-ctas">
            <Link to="/orders" className="btn btn-dark btn-shine">Track My Order</Link>
            <Link to="/" className="btn btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section" style={{ paddingTop: 40 }}>
      <div className="section-head" style={{ textAlign: "left", marginBottom: 24 }}>
        <span className="section-eyebrow" style={{ display: "inline-flex" }}>Secure Checkout</span>
        <h2 className="section-title" style={{ fontSize: "2rem" }}>Delivery &amp; Payment</h2>
      </div>

      {/* steps */}
      <div className="steps" aria-hidden="true">
        <div className="step done">
          <span className="step-circle"><IconCheck size={16} /></span>
          <span className="step-label">Bag</span>
        </div>
        <div className="step done"><span className="step-line" /></div>
        <div className="step active">
          <span className="step-circle">2</span>
          <span className="step-label">Address &amp; Payment</span>
        </div>
        <div className="step"><span className="step-line" /></div>
        <div className="step">
          <span className="step-circle">3</span>
          <span className="step-label">Done</span>
        </div>
      </div>

      <form className="checkout-layout" onSubmit={placeOrder}>
        <div>
          {/* address */}
          <div className="panel">
            <h3><IconMapPin /> Delivery Address</h3>

            {savedAddrs.length > 0 && (
              <div className="addr-cards" role="radiogroup" aria-label="Saved addresses">
                {savedAddrs.map((a) => (
                  <button
                    type="button"
                    key={a._id}
                    role="radio"
                    aria-checked={selectedAddr === String(a._id)}
                    className={`addr-card ${selectedAddr === String(a._id) ? "selected" : ""}`}
                    onClick={() => pickSaved(a)}
                  >
                    <span className="addr-card-head">
                      <b>{a.label || "Address"}</b>
                      {a.isDefault && <span className="badge badge-gold">Default</span>}
                    </span>
                    <span className="addr-card-body">
                      {a.fullName} · {a.phone}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}{a.state ? `, ${a.state}` : ""} — {a.pincode}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  className={`addr-card addr-new ${selectedAddr === "new" ? "selected" : ""}`}
                  onClick={pickNew}
                  aria-checked={selectedAddr === "new"}
                  role="radio"
                >
                  <span className="addr-plus">+</span>
                  <span className="addr-card-body"><b>Use a new address</b></span>
                </button>
              </div>
            )}

            {(selectedAddr === "new" || savedAddrs.length === 0) ? (
              <>
                <div className="form-row">
              <div className="field">
                <label htmlFor="fullName">Full Name</label>
                <input id="fullName" className="input" value={addr.fullName} onChange={set("fullName")} placeholder="Enter your full name" />
              </div>
              <div className="field">
                <label htmlFor="phone">Mobile Number</label>
                <input id="phone" className="input" value={addr.phone} onChange={set("phone")} placeholder="Enter 10-digit mobile number" maxLength={10} inputMode="numeric" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="line1">Address Line 1</label>
              <input id="line1" className="input" value={addr.line1} onChange={set("line1")} placeholder="Enter house no, building, street" />
            </div>
            <div className="field">
              <label htmlFor="line2">Address Line 2 (optional)</label>
              <input id="line2" className="input" value={addr.line2} onChange={set("line2")} placeholder="Enter area, landmark (optional)" />
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="city">City</label>
                <input id="city" className="input" value={addr.city} onChange={set("city")} placeholder="Enter city" />
              </div>
              <div className="field">
                <label htmlFor="state">State</label>
                <input id="state" className="input" value={addr.state} onChange={set("state")} placeholder="Enter state" />
              </div>
            </div>
            <div className="field" style={{ maxWidth: 220 }}>
              <label htmlFor="pincode">Pincode</label>
              <input id="pincode" className="input" value={addr.pincode} onChange={set("pincode")} placeholder="Enter 6-digit pincode" maxLength={6} inputMode="numeric" />
            </div>
                {savedAddrs.length > 0 && (
                  <label className="save-addr-check">
                    <input type="checkbox" checked={saveNew} onChange={(e) => setSaveNew(e.target.checked)} />
                    Save this address to my account for faster checkout
                  </label>
                )}
              </>
            ) : (
              <p className="mini-note" style={{ marginTop: 10 }}>
                Delivering to your saved address — pick another above or use a new one.
              </p>
            )}
          </div>

          {/* payment methods */}
          <div className="panel">
            <h3><IconLock /> Payment Method</h3>
            <div className="pay-methods">
              {METHODS.map((m) => (
                <div key={m.id}>
                  <label
                    className={`pay-method ${method === m.id ? "selected" : ""}`}
                    onClick={() => setMethod(m.id)}
                  >
                    <input type="radio" name="pay" checked={method === m.id} onChange={() => setMethod(m.id)} style={{ display: "none" }} />
                    <span className="pay-radio" />
                    <span className="pay-icon">{m.icon}</span>
                    <span style={{ flex: 1 }}>
                      <b>{m.label}</b>
                      <small>{m.sub}</small>
                    </span>
                  </label>

                  {/* sub-forms */}
                  {method === "CARD" && m.id === "CARD" && (
                    <div className="pay-subform">
                      <div className="field">
                        <label htmlFor="cardNo">Card Number</label>
                        <input
                          id="cardNo" className="input" inputMode="numeric" placeholder="Enter 16-digit card number" maxLength={19}
                          value={card.number}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                            setCard((c) => ({ ...c, number: digits.replace(/(.{4})/g, "$1 ").trim() }));
                          }}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="cardName">Name on Card</label>
                        <input id="cardName" className="input" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} placeholder="Enter name on card" />
                      </div>
                      <div className="form-row">
                        <div className="field">
                          <label htmlFor="cardExp">Expiry (MM/YY)</label>
                          <input
                            id="cardExp" className="input" placeholder="Enter MM/YY" maxLength={5} inputMode="numeric"
                            value={card.expiry}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                              if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                              setCard((c) => ({ ...c, expiry: v }));
                            }}
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="cardCvv">CVV</label>
                          <input id="cardCvv" className="input" type="password" placeholder="Enter CVV" maxLength={4} inputMode="numeric" value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "") }))} />
                        </div>
                      </div>
                    </div>
                  )}

                  {method === "UPI" && m.id === "UPI" && (
                    <div className="pay-subform">
                      <div className="field">
                        <label htmlFor="upiId">Your UPI ID</label>
                        <input id="upiId" className="input" placeholder="Enter UPI ID (name@bank)" value={upi} onChange={(e) => setUpi(e.target.value)} />
                      </div>
                      <p className="mini-note">You&apos;ll receive a collect request on your UPI app.</p>
                    </div>
                  )}

                  {method === "NETBANKING" && m.id === "NETBANKING" && (
                    <div className="pay-subform">
                      <div className="field">
                        <label htmlFor="bankSel">Select Bank</label>
                        <select id="bankSel" className="input" value={bank} onChange={(e) => setBank(e.target.value)}>
                          <option value="">— Choose your bank —</option>
                          {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra", "Punjab National Bank", "Bank of Baroda"].map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {method === "WALLET" && m.id === "WALLET" && (
                    <div className="pay-subform">
                      <div className="field">
                        <label htmlFor="walletSel">Select Wallet</label>
                        <select id="walletSel" className="input" value={wallet} onChange={(e) => setWallet(e.target.value)}>
                          <option value="">— Choose a wallet —</option>
                          {["Paytm Wallet", "Amazon Pay", "Mobikwik", "PhonePe Wallet", "JioMoney"].map((w) => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {method === "COD" && m.id === "COD" && (
                    <div className="pay-subform">
                      <p className="mini-note">Pay in cash or UPI when your order arrives at your doorstep. No extra charges.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* summary */}
        <aside className="summary">
          <h3>Your Order</h3>
          <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 14 }}>
            {items.map((it) => (
              <div key={it.key} style={{ display: "flex", gap: 12, alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
                <img src={it.image} alt="" style={{ width: 46, height: 58, objectFit: "cover", borderRadius: 8 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: "0.88rem", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</b>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{it.size} · {it.color} · ×{it.qty}</span>
                </div>
                <b style={{ fontSize: "0.9rem" }}>{formatINR(it.price * it.qty)}</b>
              </div>
            ))}
          </div>
          <div className="sum-row"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
          {discount > 0 && (
            <div className="sum-row"><span>Coupon ({coupon?.code})</span><span className="green">− {formatINR(discount)}</span></div>
          )}
          <div className="sum-row">
            <span>Shipping</span>
            <span className={shipping === 0 ? "green" : ""}>{shipping === 0 ? "FREE" : formatINR(shipping)}</span>
          </div>
          <div className="sum-row total"><span>To Pay</span><span>{formatINR(total)}</span></div>

          <button type="submit" className="btn btn-gold btn-block btn-lg btn-shine" style={{ marginTop: 20 }} disabled={placing}>
            {placing ? "Processing…" : method === "COD" ? `Place Order · ${formatINR(total)}` : `Pay ${formatINR(total)} Securely`}
          </button>
          <p className="mini-note">
            <IconLock size={14} /> 256-bit encrypted · This is a demo checkout — no real money moves.
          </p>
        </aside>
      </form>
    </div>
  );
}
