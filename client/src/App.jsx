import { useEffect } from "react";
import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import CollectionPage from "./pages/CollectionPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import VideosPage from "./pages/VideosPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ScrollTopButton from "./components/ScrollTopButton.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

/** Shared layout: sticky navbar + animated page outlet + sticky footer */
function Layout() {
  const location = useLocation();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }} key={location.pathname} className="page">
        <Outlet />
      </main>
      <Footer />
      <ScrollTopButton />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/men" element={<CollectionPage category="MEN" key="men" />} />
          <Route path="/women" element={<CollectionPage category="WOMEN" key="women" />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AccountPage initialTab="admin" />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
