import { Link, useLocation, useParams } from "react-router-dom";
import { BTN_PRIMARY_MD } from "../../styles/buttons";

interface LocationState {
  totalAmount?: number;
  dailyOrderNumber?: number;
}

export default function OrderConfirm() {
  const { id } = useParams<{ id: string }>();
  const state = useLocation().state as LocationState | null;
  const totalAmount = state?.totalAmount;
  const dailyOrderNumber = state?.dailyOrderNumber;

  return (
    <section className="mx-auto max-w-md px-4 py-12 text-center sm:py-16">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-moss/15 text-3xl text-moss">
        ✓
      </div>
      <h1 className="font-display mt-4 text-3xl text-espresso sm:text-4xl">
        Order placed
      </h1>
      <p className="mt-2 text-sm text-coffee-soft">
        We've received your order. The cafe is being notified.
      </p>

      {dailyOrderNumber !== undefined && (
        <div className="mt-6 rounded-2xl border border-terracotta/30 bg-gradient-to-br from-terracotta/15 to-cream-200 p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta-dark">
            Today's order number
          </p>
          <p className="font-display mt-2 text-7xl font-bold text-espresso">
            #{dailyOrderNumber}
          </p>
          <p className="mt-3 text-xs text-coffee-soft">
            Show this at the counter when you collect your order.
          </p>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-cream-300 bg-parchment p-5 text-left shadow-sm">
        {totalAmount !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-coffee-soft">Total</span>
            <span className="font-display font-semibold text-espresso">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        )}
        {id && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-coffee-soft/70">Reference</span>
            <span className="font-mono text-coffee-soft/70">#{id}</span>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-terracotta/20 bg-terracotta/5 p-4 text-left text-sm text-coffee">
        <p className="font-medium text-espresso">Payment pending</p>
        <p className="mt-1 text-coffee-soft">
          Online payment will be enabled soon. For now please pay at the
          counter when you pick up.
        </p>
      </div>

      <Link to="/shop" className={`mt-8 ${BTN_PRIMARY_MD}`}>
        Back to menu
      </Link>
    </section>
  );
}
