import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { getAdminOrders, updateOrderStatus } from "../../api/admin";
import type { AdminOrderSummary, OrderStatus } from "../../types/admin";

const TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "Pending", value: "Pending" },
  { label: "Preparing", value: "Preparing" },
  { label: "Ready", value: "Ready" },
  { label: "Completed", value: "Completed" },
  { label: "All", value: "all" },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  Pending: "Preparing",
  Preparing: "Ready",
  Ready: "Completed",
};

export default function AdminOrders() {
  const [tab, setTab] = useState<OrderStatus | "all">("Pending");

  const ordersQuery = useQuery({
    queryKey: ["admin", "orders", tab],
    queryFn: () => getAdminOrders(tab === "all" ? undefined : tab),
    refetchInterval: 15_000,
  });

  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Orders</h1>
          <p className="text-sm text-stone-500">
            Tap an order to see items. Use the buttons to advance status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => ordersQuery.refetch()}
          disabled={ordersQuery.isFetching}
          className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-white disabled:opacity-50"
        >
          {ordersQuery.isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.value
                ? "bg-amber-700 text-white"
                : "bg-white text-stone-700 hover:bg-stone-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {ordersQuery.isLoading && (
        <p className="text-stone-500">Loading orders…</p>
      )}
      {ordersQuery.error && (
        <p className="text-red-600">Failed to load orders.</p>
      )}

      {ordersQuery.data && ordersQuery.data.length === 0 && (
        <p className="rounded-md border border-stone-200 bg-white p-6 text-center text-sm text-stone-500">
          No orders in this view.
        </p>
      )}

      {ordersQuery.data && ordersQuery.data.length > 0 && (
        <ul className="space-y-2">
          {ordersQuery.data.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </ul>
      )}
    </section>
  );
}

function OrderRow({ order }: { order: AdminOrderSummary }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (next: OrderStatus) => updateOrderStatus(order.id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "order", order.id] });
    },
    onError: (err) => {
      if (err instanceof AxiosError && err.response?.status === 409) {
        setError("Invalid status transition.");
      } else {
        setError("Update failed.");
      }
    },
  });

  const next = NEXT_STATUS[order.status];

  return (
    <li className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/admin/orders/${order.id}`}
          className="flex-1 hover:opacity-80"
        >
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-bold text-amber-700">
              #{order.dailyOrderNumber}
            </span>
            <span className="font-semibold text-stone-900">
              {order.customerFirstName} {order.customerLastName}
            </span>
            <StatusPill status={order.status} />
          </div>
          <div className="mt-1 text-xs text-stone-500">
            {order.itemCount} item{order.itemCount !== 1 && "s"} ·{" "}
            <span className="font-semibold text-stone-700">
              ${order.totalAmount.toFixed(2)}
            </span>{" "}
            · pickup {formatTime(order.estimatedPickupTime)} · placed{" "}
            {formatTime(order.createdAt)}
          </div>
        </Link>

        {next && (
          <button
            type="button"
            onClick={() => mutation.mutate(next)}
            disabled={mutation.isPending}
            className="rounded-full bg-amber-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {mutation.isPending ? "Updating…" : `Mark as ${next}`}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </li>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const colors: Record<OrderStatus, string> = {
    Pending: "bg-amber-100 text-amber-800",
    Paid: "bg-blue-100 text-blue-800",
    Preparing: "bg-orange-100 text-orange-800",
    Ready: "bg-emerald-100 text-emerald-800",
    Completed: "bg-stone-200 text-stone-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors[status]}`}
    >
      {status}
    </span>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
