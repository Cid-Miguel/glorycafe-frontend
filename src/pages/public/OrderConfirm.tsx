import { Link, useLocation, useParams } from "react-router-dom";

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
    <section className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
        ✓
      </div>
      <h1 className="mt-4 text-2xl font-bold text-stone-900">Order placed</h1>
      <p className="mt-2 text-stone-600">
        We've received your order. The cafe is being notified.
      </p>

      {dailyOrderNumber !== undefined && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-xs uppercase tracking-wide text-amber-700">
            Today's order number
          </p>
          <p className="mt-1 font-mono text-5xl font-bold text-amber-900">
            #{dailyOrderNumber}
          </p>
          <p className="mt-2 text-xs text-amber-700">
            Show this at the counter when you collect your order.
          </p>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-stone-200 bg-white p-5 text-left shadow-sm">
        {totalAmount !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Total</span>
            <span className="font-semibold text-stone-900">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        )}
        {id && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-stone-400">Reference</span>
            <span className="font-mono text-stone-400">#{id}</span>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800">
        <p className="font-medium">Payment pending</p>
        <p className="mt-1 text-amber-700">
          Online payment will be enabled soon. For now please pay at the
          counter when you pick up.
        </p>
      </div>

      <Link
        to="/shop"
        className="mt-8 inline-flex rounded-full bg-amber-700 px-6 py-2 text-sm font-medium text-white hover:bg-amber-800"
      >
        Back to menu
      </Link>
    </section>
  );
}
