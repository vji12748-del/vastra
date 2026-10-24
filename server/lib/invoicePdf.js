// VASTRA — Tax Invoice PDF generator (pdfkit, DejaVu fonts for ₹ glyph support)
import PDFDocument from "pdfkit";
import fs from "fs";

const FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
const FONT_SERIF_B = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf";

const INK = "#16130f";
const MUTED = "#7a7267";
const GOLD = "#c9a227";
const GOLD_SOFT = "#faf5e4";
const LINE = "#e5dfd2";
const GREEN = "#1d7a3e";
const GREEN_BG = "#e7f5ec";
const AMBER = "#92600a";
const AMBER_BG = "#fdf3e0";

const PAGE_W = 595.28; // A4 pt
const M = 46;
const CONTENT_W = PAGE_W - M * 2;

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ---------- Indian-format amount in words ---------- */
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n) {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10), o = n % 10;
  return TENS[t] + (o ? " " + ONES[o] : "");
}
function threeDigits(n) {
  const h = Math.floor(n / 100), rest = n % 100;
  let s = "";
  if (h) s += ONES[h] + " Hundred";
  if (rest) s += (s ? " " : "") + twoDigits(rest);
  return s;
}
function amountInWords(num) {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return "Zero Rupees Only";
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  const parts = [];
  if (crore) parts.push(threeDigits(crore) + " Crore");
  if (lakh) parts.push(twoDigits(lakh) + " Lakh");
  if (thousand) parts.push(twoDigits(thousand) + " Thousand");
  if (rest) parts.push(threeDigits(rest));
  return parts.join(" ") + " Rupees Only";
}

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/* ---------- Build the PDF (caller pipes + ends it) ---------- */
export function buildInvoicePdf(inv, order, opts = {}) {
  const origin = String(opts.origin || "").replace(/\/+$/, ""); // e.g. https://preview-xxx.space-z.ai
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: M, bottom: 24, left: M, right: M },
    info: { Title: `Invoice ${inv.invoiceNo}`, Author: "VASTRA" },
  });
  const paid = inv.status === "PAID";

  const safe = (s) => String(s ?? "").replace(/[\u0000-\u001f]/g, "").trim() || "—";

  /* ===== Header ===== */
  doc.font(FONT_SERIF_B).fontSize(27).fillColor(INK).text("VASTRA", M, 42);
  doc.font(FONT_REG).fontSize(8).fillColor(MUTED)
    .text("M E N   &   W O M E N   F A S H I O N", M, 74)
    .text("221 Fashion Street, Bandra West, Mumbai 400050 · GSTIN (demo): 27VASTRA1234K1Z5", M, 85);

  doc.font(FONT_BOLD).fontSize(19).fillColor(INK).text("TAX INVOICE", PAGE_W - M - 150, 44, { width: 150, align: "right" });
  doc.font(FONT_REG).fontSize(9).fillColor(MUTED)
    .text(`Invoice No: ${inv.invoiceNo}`, PAGE_W - M - 190, 68, { width: 190, align: "right" })
    .text(`Date: ${fmtDate(inv.issuedAt || inv.createdAt || Date.now())}`, PAGE_W - M - 190, 81, { width: 190, align: "right" })
    .text(`Order ID: ${order.orderId}`, PAGE_W - M - 190, 94, { width: 190, align: "right" });

  doc.moveTo(M, 108).lineTo(PAGE_W - M, 108).lineWidth(2).strokeColor(GOLD).stroke();
  doc.moveTo(M, 112).lineTo(PAGE_W - M, 112).lineWidth(0.7).strokeColor(LINE).stroke();

  /* ===== Bill To + Payment ===== */
  let y = 132;
  doc.font(FONT_BOLD).fontSize(9).fillColor(GOLD).text("BILLED TO", M, y);
  doc.font(FONT_BOLD).fontSize(11.5).fillColor(INK).text(safe(order.address?.fullName), M, y + 14);
  doc.font(FONT_REG).fontSize(9.5).fillColor(MUTED);
  const addrLines = [
    safe(order.address?.line1),
    order.address?.line2 ? safe(order.address.line2) : null,
    `${safe(order.address?.city)}${order.address?.state ? ", " + safe(order.address.state) : ""} — ${safe(order.address?.pincode)}`,
    `Phone: ${safe(order.address?.phone)}`,
  ].filter(Boolean);
  let ay = y + 31;
  for (const ln of addrLines) { doc.text(ln, M, ay, { width: 260 }); ay += 13; }

  // payment block (right)
  const pw = 200; // wider block so long references fit on one line
  const px = PAGE_W - M - pw;
  doc.font(FONT_BOLD).fontSize(9).fillColor(GOLD).text("PAYMENT DETAILS", px, y, { width: pw, align: "right" });
  const payLabel = { CARD: "Credit / Debit Card", UPI: "UPI", NETBANKING: "Net Banking", WALLET: "Wallet", COD: "Cash on Delivery" };
  const pRows = [
    ["Method", payLabel[inv.paymentMethod] || inv.paymentMethod],
    ["Reference", inv.paymentReference || (paid ? "—" : "Payable on delivery")],
    ["Paid On", paid ? fmtDate(inv.paidAt || Date.now()) : "Pending"],
  ];
  let py = y + 18;
  for (const [k, v] of pRows) {
    doc.font(FONT_REG).fontSize(9).fillColor(MUTED).text(k, px, py, { width: 58 });
    // measure value height with the SAME font, then push next row below it —
    // prevents overlap when a long reference wraps to 2 lines
    doc.font(FONT_BOLD).fontSize(9);
    const vh = doc.heightOfString(v, { width: pw - 64 });
    doc.fillColor(INK).text(v, px + 64, py, { width: pw - 64, align: "right" });
    py += Math.max(14, vh + 4);
  }

  /* ===== Status stamp ===== */
  const stampW = 118, stampH = 30;
  const sx = PAGE_W - M - stampW;
  const sy = py + 8;
  doc.roundedRect(sx, sy, stampW, stampH, 6)
    .fillAndStroke(paid ? GREEN_BG : AMBER_BG, paid ? GREEN : AMBER);
  doc.font(FONT_BOLD).fontSize(10.5).fillColor(paid ? GREEN : AMBER)
    .text(paid ? "PAID IN FULL" : "PAYMENT DUE", sx, sy + 9.5, { width: stampW, align: "center" });

  /* ===== Items table ===== */
  const colX = { no: M, item: M + 26, qty: M + 330, rate: M + 390, amt: M + CONTENT_W };
  const colW = { qty: 40, rate: 70, amt: 100 };
  let ty = sy + stampH + 22;

  const drawTableHead = (topY) => {
    doc.rect(M, topY, CONTENT_W, 24).fill(INK);
    doc.font(FONT_BOLD).fontSize(9).fillColor("#f5efe2");
    doc.text("#", colX.no + 8, topY + 8);
    doc.text("ITEM DESCRIPTION", colX.item, topY + 8);
    doc.text("QTY", colX.qty, topY + 8, { width: colW.qty, align: "center" });
    doc.text("RATE", colX.rate, topY + 8, { width: colW.rate, align: "right" });
    doc.text("AMOUNT", colX.amt, topY + 8, { width: colW.amt, align: "right" });
    return topY + 24;
  };

  ty = drawTableHead(ty);

  const items = inv.items?.length ? inv.items : order.items || [];
  items.forEach((it, i) => {
    const nameLines = doc.font(FONT_BOLD).fontSize(9.5).heightOfString(safe(it.name), { width: colX.qty - colX.item - 14 });
    const subLine = `${safe(it.size)} · ${safe(it.color)}`;
    const rowH = Math.max(34, 20 + nameLines + 13);
    if (ty + rowH > 740) { doc.addPage(); ty = drawTableHead(M); }

    if (i % 2 === 1) doc.rect(M, ty, CONTENT_W, rowH).fill("#faf7f0");
    const baseY = ty + 8;
    doc.fillColor(INK);
    doc.font(FONT_REG).fontSize(9.5).fillColor(MUTED).text(String(i + 1).padStart(2, "0"), colX.no + 8, baseY);
    doc.font(FONT_BOLD).fontSize(9.5).fillColor(INK).text(safe(it.name), colX.item, baseY, { width: colX.qty - colX.item - 14 });
    doc.font(FONT_REG).fontSize(8.5).fillColor(MUTED).text(subLine, colX.item, baseY + nameLines + 3, { width: colX.qty - colX.item - 14 });
    doc.font(FONT_REG).fontSize(9.5).fillColor(INK)
      .text(String(it.qty), colX.qty, baseY, { width: colW.qty, align: "center" })
      .text(money(it.price), colX.rate, baseY, { width: colW.rate, align: "right" })
      .font(FONT_BOLD)
      .text(money(it.price * it.qty), colX.amt, baseY, { width: colW.amt, align: "right" });
    ty += rowH;
    doc.moveTo(M, ty).lineTo(PAGE_W - M, ty).lineWidth(0.6).strokeColor(LINE).stroke();
  });

  /* ===== Totals ===== */
  if (ty + 150 > 780) { doc.addPage(); ty = M; }
  ty += 16;
  const totalsX = M + CONTENT_W - 250;
  const tRow = (label, val, opts = {}) => {
    doc.font(opts.bold ? FONT_BOLD : FONT_REG).fontSize(opts.big ? 11.5 : 9.8)
      .fillColor(opts.color || (opts.bold ? INK : MUTED))
      .text(label, totalsX, ty, { width: 140 });
    doc.font(opts.bold ? FONT_BOLD : FONT_REG).fontSize(opts.big ? 11.5 : 9.8)
      .fillColor(opts.color || INK)
      .text(val, totalsX + 140, ty, { width: 110, align: "right" });
    ty += opts.big ? 24 : 19;
  };

  tRow("Subtotal", money(inv.subtotal));
  if (inv.discount > 0) tRow(`Discount${inv.couponCode ? ` (${inv.couponCode})` : ""}`, `− ${money(inv.discount)}`, { color: GREEN });
  tRow("Shipping", inv.shipping === 0 ? "FREE" : money(inv.shipping), { color: inv.shipping === 0 ? GREEN : INK });

  doc.rect(totalsX - 12, ty - 5, 262 + 12, 30).fill(GOLD_SOFT);
  doc.font(FONT_BOLD).fontSize(12).fillColor(INK).text("GRAND TOTAL", totalsX, ty + 2, { width: 140 });
  doc.font(FONT_BOLD).fontSize(13).fillColor(paid ? GREEN : INK)
    .text(money(inv.total), totalsX + 140, ty + 1, { width: 110, align: "right" });
  ty += 38;

  doc.font(FONT_REG).fontSize(8.5).fillColor(MUTED)
    .text(`Amount in words: ${amountInWords(inv.total)}`, M, ty, { width: CONTENT_W });
  ty += 24;
  doc.font(FONT_REG).fontSize(8.5).fillColor(MUTED)
    .text("All prices are inclusive of applicable taxes. This is a demo store — no real transaction has occurred.", M, ty, { width: CONTENT_W });

  /* ===== Continue-shopping button (links to store home) ===== */
  const bw = 200, bh = 30;
  let bY = ty + 22;
  if (bY + bh > 742) bY = ty + 6; // never collide with footer (line at 772)
  if (bY + bh <= 742) {
    const bX = (PAGE_W - bw) / 2;
    doc.roundedRect(bX, bY, bw, bh, 15).fill(INK);
    doc.roundedRect(bX, bY, bw, bh, 15).lineWidth(1).strokeColor(GOLD).stroke();
    doc.font(FONT_BOLD).fontSize(10).fillColor("#f5efe2")
      .text("CONTINUE SHOPPING  →", bX, bY + 9.5, { width: bw, align: "center", lineBreak: false });
    if (origin) doc.link(bX, bY, bw, bh, `${origin}/`);
  }

  /* ===== Footer ===== */
  const fy = 772;
  doc.moveTo(M, fy).lineTo(PAGE_W - M, fy).lineWidth(1).strokeColor(GOLD).stroke();
  doc.font(FONT_BOLD).fontSize(9).fillColor(INK)
    .text("Thank you for shopping with VASTRA!", M, fy + 10, { width: CONTENT_W, align: "center", lineBreak: false });
  doc.font(FONT_REG).fontSize(7.8).fillColor(MUTED)
    .text("This is a computer-generated tax invoice and does not require a physical signature. For queries: support@vastra.in · +91 98200 00000", M, fy + 25, { width: CONTENT_W, align: "center", lineBreak: false });

  return doc;
}
