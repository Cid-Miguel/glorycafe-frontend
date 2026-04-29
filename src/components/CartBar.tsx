import { Link, useLocation } from "react-router-dom";
import {
  selectItemCount,
  selectSubtotal,
  useCartStore,
} from "../store/cartStore";

export default function CartBar() {
  const count = useCartStore(selectItemCount);
  const subtotal = useCartStore(selectSubtotal);
  const location = useLocation();

  if (count === 0) return null;
  if (location.pathname.startsWith("/cart")) return null;
  if (location.pathname.startsWith("/checkout")) return null;
  if (location.pathname.startsWith("/order/")) return null;

  return (
    <div className="sticky bottom-0 z-10 border-t border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="text-sm text-stone-700">
          <span className="font-semibold">{count}</span>{" "}
          {count === 1 ? "item" : "items"}
          <span className="text-stone-400"> · </span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <Link
          to="/cart"
          className="rounded-full bg-amber-700 px-5 py-2 text-sm font-medium text-white hover:bg-amber-800"
        >
          View cart
        </Link>
      </div>
    </div>
  );
}
