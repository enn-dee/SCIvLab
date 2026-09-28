import { Navigate, Outlet } from "react-router-dom";

export default function TeacherRoute() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/teacher/login" replace />;
  if (role !== "teacher") return <Navigate to="/" replace />;

  return <Outlet />;
}