import { Navigate, useLocation } from "react-router-dom";
import { isSessionValid, useAuthStore } from "../../store/authStore";

interface Props {
  children: React.ReactNode;
}

/**
 * Gate for the admin layout. Three states are possible:
 *  - No valid session  → bounce to /admin/login.
 *  - Valid session but mustChangePassword=true → force /admin/change-password
 *    so the seeded credential can't be used to access the dashboard.
 *  - Valid session with rotated password → render children.
 */
export default function RequireAuth({ children }: Props) {
  const state = useAuthStore();
  const location = useLocation();

  if (!isSessionValid(state)) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  }

  if (state.mustChangePassword) {
    return <Navigate to="/admin/change-password" replace />;
  }

  return <>{children}</>;
}
