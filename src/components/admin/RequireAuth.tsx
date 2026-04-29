import { Navigate, useLocation } from "react-router-dom";
import { isSessionValid, useAuthStore } from "../../store/authStore";

interface Props {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: Props) {
  const state = useAuthStore();
  const location = useLocation();

  if (!isSessionValid(state)) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  }
  return <>{children}</>;
}
