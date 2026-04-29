import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { HubConnectionState } from "@microsoft/signalr";
import { useAuthStore } from "../../store/authStore";
import { useOrderNotifications } from "../../hooks/useOrderNotifications";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-amber-700" : "text-stone-600 hover:text-stone-900"
  }`;

export default function AdminLayout() {
  const displayName = useAuthStore((s) => s.displayName);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const hubState = useOrderNotifications();

  function handleLogout() {
    clear();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-full flex-col bg-stone-100">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/admin/orders" className="text-lg font-semibold text-stone-900">
            Glory Cafe <span className="text-stone-400">/ admin</span>
          </Link>
          <nav className="flex items-center gap-5">
            <NavLink to="/admin/orders" className={navLinkClass}>
              Orders
            </NavLink>
            <LiveIndicator state={hubState} />
            <span className="hidden text-xs text-stone-500 sm:inline">
              {displayName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-stone-600 hover:text-red-600"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function LiveIndicator({ state }: { state: HubConnectionState }) {
  const isLive = state === HubConnectionState.Connected;
  const isReconnecting = state === HubConnectionState.Reconnecting;
  const label = isLive ? "Live" : isReconnecting ? "Reconnecting…" : "Offline";
  const dotClass = isLive
    ? "bg-emerald-500"
    : isReconnecting
      ? "bg-amber-500 animate-pulse"
      : "bg-stone-400";
  return (
    <span
      className="hidden items-center gap-1.5 text-xs text-stone-500 sm:inline-flex"
      title={`Realtime: ${label}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}
