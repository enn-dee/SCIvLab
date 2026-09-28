import { Navigate, Outlet } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";

export default function ProtectedRoute({ allowedRoles, withLayout = true }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;

  if (role === "student" && withLayout) {
    return (
      <StudentLayout>
        <Outlet />
      </StudentLayout>
    );
  }

  return <Outlet />;
}