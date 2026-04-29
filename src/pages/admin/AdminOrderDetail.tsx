import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAdminOrder } from "../../api/admin";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "order", orderId],
    queryFn: () => getAdminOrder(orderId),
    enabled: Number.isFinite(orderId),
  });

  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      <Link
        to="/admin/orders"
        className="text-sm text-stone-600 hover:text-stone-900"
      >
        ← Back to orders
      </Link>

      {isLoading && <p className="mt-4 text-stone-500">Loading…</p>}
      {error && <p className="mt-4 text-red-600">Could not load order.</p>}

      {data && (
        <>
          <header className="mt-2 flex items-baseline justify-between">
            <h1 className="text-2xl font-bold text-stone-900">
              <span className="font-mono text-stone-400">#{data.id}</span>{" "}
              {data.customerFirstName} {data.customerLastName}
            </h1>
            <span className="text-sm text-stone-500">{data.status}</span>
          </header>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Block label="Phone" value={data.customerPhone ?? "—"} />
            <Block label="Email" value={data.customerEmail ?? "—"} />
            <Block
              label="Pickup"
              value={new Date(data.estimatedPickupTime).toLocaleString()}
            />
            <Block
              label="Placed"
              value={new Date(data.createdAt).toLocaleString()}
            />
          </div>

          <h2 className="mt-6 mb-2 text-base font-semibold text-stone-800">
            Items
          </h2>
          <ul className="rounded-lg border border-stone-200 bg-white shadow-sm">
            {data.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between border-b border-stone-100 px-4 py-3 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {item.productNameSnapshot}
                  </p>
                  <p className="text-xs text-stone-500">
                    ${item.unitPrice.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <span className="font-semibold text-stone-900">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-stone-600">Total</span>
            <span className="text-lg font-semibold text-stone-900">
              ${data.totalAmount.toFixed(2)}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-sm text-stone-800">{value}</p>
    </div>
  );
}
