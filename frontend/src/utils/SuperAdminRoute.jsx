import { Navigate, Outlet } from "react-router-dom";

export default function SuperAdminRoute() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/superadmin/login" replace />;
  if (role !== "superadmin") return <Navigate to="/" replace />;

  return <Outlet />;
}
