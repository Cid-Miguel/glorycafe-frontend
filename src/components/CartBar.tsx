import { Link, useLocation } from "react-router-dom";
import {
  selectItemCount,
  selectSubtotal,
  useCartStore,
} from "../store/cartStore";
import { BTN_PRIMARY_MD } from "../styles/buttons";

export default function CartBar() {
  const count = useCartStore(selectItemCount);
  const subtotal = useCartStore(selectSubtotal);
  const location = useLocation();

  if (count === 0) return null;
  if (location.pathname.startsWith("/cart")) return null;
  if (location.pathname.startsWith("/checkout")) return null;
  if (location.pathname.startsWith("/order/")) return null;

  return (
    <div className="sticky bottom-0 z-10 border-t border-cream-300 bg-parchment/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="text-sm text-coffee">
          <span className="font-semibold text-espresso">{count}</span>{" "}
          {count === 1 ? "item" : "items"}
          <span className="text-coffee-soft/60"> · </span>
          <span className="font-display font-semibold text-espresso">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <Link to="/cart" className={BTN_PRIMARY_MD}>
          View cart →
        </Link>
      </div>
    </div>
  );
}
