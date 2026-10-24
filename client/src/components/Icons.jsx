// Hand-written inline SVG icon set (no icon library)
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" };

export const IconBag = (p) => (
  <svg width={p?.size || 21} height={p?.size || 21} viewBox="0 0 24 24" {...S}><path d="M6 7h12l1.2 13.2a1.6 1.6 0 0 1-1.6 1.8H6.4a1.6 1.6 0 0 1-1.6-1.8L6 7Z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" /></svg>
);
export const IconUser = (p) => (
  <svg width={p?.size || 21} height={p?.size || 21} viewBox="0 0 24 24" {...S}><circle cx="12" cy="8.2" r="3.6" /><path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" /></svg>
);
export const IconSearch = (p) => (
  <svg width={p?.size || 20} height={p?.size || 20} viewBox="0 0 24 24" {...S}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.8-3.8" /></svg>
);
export const IconHeart = (p) => (
  <svg width={p?.size || 19} height={p?.size || 19} viewBox="0 0 24 24" {...S}><path d="M12 20.5s-7.6-4.7-9.3-9.3C1.6 8.1 3.4 5 6.6 5c2 0 3.5 1.1 4.4 2.7h2c.9-1.6 2.4-2.7 4.4-2.7 3.2 0 5 3.1 3.9 6.2-1.7 4.6-9.3 9.3-9.3 9.3Z" /></svg>
);
export const IconStar = (p) => (
  <svg width={p?.size || 14} height={p?.size || 14} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.6l2.9 5.9 6.5 1-4.7 4.5 1.1 6.4L12 17.4l-5.8 3-1.1-6.4L.4 9.5l6.5-1L12 2.6z" /></svg>
);
export const IconTruck = (p) => (
  <svg width={p?.size || 22} height={p?.size || 22} viewBox="0 0 24 24" {...S}><path d="M1.5 6h12v11h-12zM13.5 10h4.2l3.3 3.5V17h-7.5" /><circle cx="6" cy="17.6" r="1.9" /><circle cx="17" cy="17.6" r="1.9" /></svg>
);
export const IconScissors = (p) => (
  <svg width={p?.size || 22} height={p?.size || 22} viewBox="0 0 24 24" {...S}><circle cx="6" cy="6.4" r="2.6" /><circle cx="6" cy="17.6" r="2.6" /><path d="M8.2 8.2 20 19.5M8.2 15.8 20 4.5" /></svg>
);
export const IconReturn = (p) => (
  <svg width={p?.size || 22} height={p?.size || 22} viewBox="0 0 24 24" {...S}><path d="M3 9h13a5 5 0 0 1 0 10H9" /><path d="M7 5 3 9l4 4" /></svg>
);
export const IconShield = (p) => (
  <svg width={p?.size || 22} height={p?.size || 22} viewBox="0 0 24 24" {...S}><path d="M12 2.8 4.5 5.6v6c0 4.6 3.2 7.6 7.5 9.6 4.3-2 7.5-5 7.5-9.6v-6L12 2.8Z" /><path d="m9 11.6 2.2 2.2 4-4.2" /></svg>
);
export const IconPlay = (p) => (
  <svg width={p?.size || 24} height={p?.size || 24} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.8v12.4c0 .9 1 1.4 1.7.9l9.5-6.2c.7-.4.7-1.4 0-1.8L9.7 4.9c-.7-.5-1.7 0-1.7.9Z" /></svg>
);
export const IconPlus = (p) => (
  <svg width={p?.size || 16} height={p?.size || 16} viewBox="0 0 24 24" {...S}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconMinus = (p) => (
  <svg width={p?.size || 16} height={p?.size || 16} viewBox="0 0 24 24" {...S}><path d="M5 12h14" /></svg>
);
export const IconX = (p) => (
  <svg width={p?.size || 20} height={p?.size || 20} viewBox="0 0 24 24" {...S}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconCheck = (p) => (
  <svg width={p?.size || 22} height={p?.size || 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
);
export const IconChevron = (p) => (
  <svg width={p?.size || 16} height={p?.size || 16} viewBox="0 0 24 24" {...S}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconArrowRight = (p) => (
  <svg width={p?.size || 18} height={p?.size || 18} viewBox="0 0 24 24" {...S}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);
export const IconTrash = (p) => (
  <svg width={p?.size || 16} height={p?.size || 16} viewBox="0 0 24 24" {...S}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l.8 12.1a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5L17.5 7" /></svg>
);
export const IconEdit = (p) => (
  <svg width={p?.size || 16} height={p?.size || 16} viewBox="0 0 24 24" {...S}><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="m13.5 6.5 3 3" /></svg>
);
export const IconShieldPay = (p) => (
  <svg width={p?.size || 20} height={p?.size || 20} viewBox="0 0 24 24" {...S}><rect x="2.5" y="5.5" width="19" height="13" rx="2.4" /><path d="M2.5 10h19M6 15h4" /></svg>
);
export const IconMapPin = (p) => (
  <svg width={p?.size || 20} height={p?.size || 20} viewBox="0 0 24 24" {...S}><path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 0 1 13 0c0 4.6-6.5 10-6.5 10Z" /><circle cx="12" cy="10.6" r="2.3" /></svg>
);
export const IconMenu = (p) => (
  <svg width={p?.size || 22} height={p?.size || 22} viewBox="0 0 24 24" {...S}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconWallet = (p) => (
  <svg width={p?.size || 20} height={p?.size || 20} viewBox="0 0 24 24" {...S}><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18v3" /><path d="M3 7.5V17a2.5 2.5 0 0 0 2.5 2.5H21v-9H5.5A2.5 2.5 0 0 1 3 7.5Z" /><path d="M16.4 14.6h.2" /></svg>
);
export const IconBank = (p) => (
  <svg width={p?.size || 20} height={p?.size || 20} viewBox="0 0 24 24" {...S}><path d="m3 9 9-5.5L21 9M4.5 9.5V18M19.5 9.5V18M9 12v6M15 12v6M3 20h18" /></svg>
);
export const IconPhone = (p) => (
  <svg width={p?.size || 20} height={p?.size || 20} viewBox="0 0 24 24" {...S}><rect x="7" y="2.5" width="10" height="19" rx="2.4" /><path d="M11 18.5h2" /></svg>
);
export const IconChart = (p) => (
  <svg width={p?.size || 20} height={p?.size || 20} viewBox="0 0 24 24" {...S}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg>
);
export const IconGrid = (p) => (
  <svg width={p?.size || 20} height={p?.size || 20} viewBox="0 0 24 24" {...S}><rect x="4" y="4" width="7" height="7" rx="1.4" /><rect x="13" y="4" width="7" height="7" rx="1.4" /><rect x="4" y="13" width="7" height="7" rx="1.4" /><rect x="13" y="13" width="7" height="7" rx="1.4" /></svg>
);
export const IconLock = (p) => (
  <svg width={p?.size || 20} height={p?.size || 20} viewBox="0 0 24 24" {...S}><rect x="5" y="10.5" width="14" height="10" rx="2.2" /><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" /></svg>
);
export const IconLogout = (p) => (
  <svg width={p?.size || 18} height={p?.size || 18} viewBox="0 0 24 24" {...S}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
);
export const Stars = ({ rating = 4.5, size = 13 }) => (
  <span className="stars" aria-label={`Rated ${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <IconStar key={i} size={size} />
    ))}
  </span>
);
