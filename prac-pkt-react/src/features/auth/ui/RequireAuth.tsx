import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../model/auth.store";

export default function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
