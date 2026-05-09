import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import AdminLayout from "../components/admin/AdminLayout";
import RequireAuth from "../components/admin/RequireAuth";
import Home from "../pages/public/Home";
import Shop from "../pages/public/Shop";
import About from "../pages/public/About";
import Cart from "../pages/public/Cart";
import Checkout from "../pages/public/Checkout";
import OrderConfirm from "../pages/public/OrderConfirm";
import HealthCheck from "../pages/public/HealthCheck";
import NotFound from "../pages/public/NotFound";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminChangePassword from "../pages/admin/AdminChangePassword";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminOrderDetail from "../pages/admin/AdminOrderDetail";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminCategories from "../pages/admin/AdminCategories";

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
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/change-password" element={<AdminChangePassword />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
