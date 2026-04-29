import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/public/Home";
import Shop from "../pages/public/Shop";
import About from "../pages/public/About";
import Cart from "../pages/public/Cart";
import Checkout from "../pages/public/Checkout";
import OrderConfirm from "../pages/public/OrderConfirm";
import HealthCheck from "../pages/public/HealthCheck";
import NotFound from "../pages/public/NotFound";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id/confirm" element={<OrderConfirm />} />
          <Route path="/health" element={<HealthCheck />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
