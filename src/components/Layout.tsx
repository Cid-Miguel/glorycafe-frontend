import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartBar from "./CartBar";

export default function Layout() {
  return (
    <div className="flex min-h-full flex-col bg-stone-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <CartBar />
      <Footer />
    </div>
  );
}
