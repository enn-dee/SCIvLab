import {
  useLocation,
  useNavigate,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import TeacherNavbar from "./components/layout/TeacherNavbar";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherRegister from "./pages/TeacherRegister";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherLabDetail from "./pages/TeacherLabDetail";
import StudentDashboard from "./pages/StudentDashboard";
import StudentLabDetail from "./pages/StudentLabDetail";
import AlgoDashboard from "./components/layout/AlgoDashboard";
import AlgoWorkspace from "./components/layout/AlgoWorkspace";
import ProtectedRoute from "./utils/ProtectedRoute";
import TeacherRoute from "./utils/TeacherRoute";
import TeacherStudents from "./pages/TeacherStudents";
import OfflineBanner from "./components/layout/OfflineBanner";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminRoute from "./utils/SuperAdminRoute";
import {
  flushSubmissionOutbox,
  removeOfflineDraft,
} from "./offline/offlineMode";
import { apiFetch } from "./utils/api";

import { useEffect, useState } from "react";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  useEffect(() => {
    const sync = () =>
      flushSubmissionOutbox(async (item) => {
        const response = await apiFetch(
          `submissions/${item.practicalId}/submit`,
          {
            method: "POST",
            body: JSON.stringify({
              solutionCode: item.solutionCode,
              language: item.language,
            }),
          },
        );
        if (!response.ok) throw new Error("Submission sync failed");
        removeOfflineDraft(item.practicalId, item.language);
      });
    window.addEventListener("online", sync);
    sync();
    return () => window.removeEventListener("online", sync);
  }, []);

  useEffect(() => {
    if (!role) return;
    if (role === "teacher" && location.pathname === "/")
      navigate("/teacher/dashboard");
    if (role === "student" && location.pathname === "/")
      navigate("/student/dashboard");
  }, [role, location.pathname]);

  const isLanding = location.pathname === "/";
  const isTeacherRoute = location.pathname.startsWith("/teacher");
  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");

  const isStudentRoute =
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/algo");
  const isAuthPage = [
    "/login",
    "/register",
    "/teacher/login",
    "/teacher/register",
    "/superadmin/login",
  ].includes(location.pathname);

  const getNavbar = () => {
    if (isAuthPage || isLanding) return null;
    if (isSuperAdminRoute) return null;
    if (isTeacherRoute) return <TeacherNavbar />;
    if (isStudentRoute) return null;
    return <Navbar />;
  };

  return (
    <>
      <Toaster position="top-center" />
      <OfflineBanner />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-zinc-900 to-zinc-950 text-white">
        {getNavbar()}
        {!isStudentRoute && (
          <div className="sticky top-0 z-40 backdrop-blur-md bg-white/5 border-b border-white/10" />
        )}

        <div
          className={`flex-1 ${isLanding ? "" : !isStudentRoute ? "px-4 md:px-8 py-6" : ""}`}
        >
          <div
            className={
              isLanding || isStudentRoute
                ? ""
                : "max-w-full mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-md"
            }
          >
            <Routes>
              {/* PUBLIC */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              {/* <Route path="/register" element={<Register />} /> */}
              <Route
                path="/register"
                element={<Navigate to="/login" replace />}
              />

              {/* TEACHER AUTH */}
              <Route path="/teacher/login" element={<TeacherLogin />} />
              <Route path="/teacher/register" element={<TeacherRegister />} />

              {/* TEACHER PROTECTED */}
              <Route element={<TeacherRoute />}>
                <Route
                  path="/teacher/dashboard"
                  element={<TeacherDashboard />}
                />
                <Route
                  path="/teacher/lab/:labId"
                  element={<TeacherLabDetail />}
                />
                <Route path="/teacher/students" element={<TeacherStudents />} />
              </Route>

              {/* STUDENT - */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["student"]}
                    withLayout={true}
                  />
                }
              >
                <Route
                  path="/student/dashboard"
                  element={<StudentDashboard />}
                />
                <Route
                  path="/student/lab/:labId"
                  element={<StudentLabDetail />}
                />
                <Route path="/algo-dashboard" element={<AlgoDashboard />} />
                <Route path="/algo/:id" element={<AlgoWorkspace />} />
              </Route>
              {/* SUPER ADMIN */}
              <Route path="/superadmin/login" element={<SuperAdminLogin />} />
              <Route element={<SuperAdminRoute />}>
                <Route
                  path="/superadmin/dashboard"
                  element={<SuperAdminDashboard />}
                />
              </Route>
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
}
