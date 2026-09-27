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
  checkServerOnline,
  flushSubmissionOutbox,
  removeOfflineDraft,
  subscribeToAutoSyncStatus,
} from "./offline/offlineMode";
import { syncAutoSyncDrafts } from "./offline/autoSync";
import { apiFetch } from "./utils/api";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

import { useEffect, useState } from "react";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [autoSyncStatuses, setAutoSyncStatuses] = useState([]);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAutoSyncStatus((status) => {
      if (!status.draft) return;
      const statusKey = `${status.draft.practicalId}:${status.draft.language}:${status.draft.savedAt}`;
      setAutoSyncStatuses((current) => {
        const index = current.findIndex(
          (item) =>
            `${item.draft.practicalId}:${item.draft.language}:${item.draft.savedAt}` ===
            statusKey,
        );
        if (index < 0) return [...current, status].slice(-8);
        return current.map((item, itemIndex) =>
          itemIndex === index ? status : item,
        );
      });
    });
    let lastKnownOnline = null;
    const checkHealth = () =>
      checkServerOnline(true).then((online) => {
        const shouldSync = online && (lastKnownOnline === null || !lastKnownOnline);
        lastKnownOnline = online;
        if (shouldSync && localStorage.getItem("role") === "student") {
          return syncAutoSyncDrafts();
        }
      });
    checkHealth();
    window.addEventListener("online", checkHealth);
    window.addEventListener("offline", checkHealth);
    const interval = window.setInterval(checkHealth, 15000);
    return () => {
      unsubscribe();
      window.removeEventListener("online", checkHealth);
      window.removeEventListener("offline", checkHealth);
      window.clearInterval(interval);
    };
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
      {autoSyncStatuses.length > 0 && (
        <div className="fixed bottom-5 right-5 z-[80] flex max-h-[80vh] w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-3 overflow-y-auto">
          {autoSyncStatuses.map((autoSyncStatus) => (
            <div
              key={`${autoSyncStatus.draft.practicalId}:${autoSyncStatus.draft.language}:${autoSyncStatus.draft.savedAt}`}
              className="rounded-xl border border-white/10 bg-zinc-950/95 p-4 text-white shadow-2xl backdrop-blur"
            >
              <div className="flex items-start gap-3">
                {autoSyncStatus.state === "failed" ? (
                  <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={18} />
                ) : autoSyncStatus.state === "success" ? (
                  <CheckCircle className="mt-0.5 shrink-0 text-emerald-300" size={18} />
                ) : autoSyncStatus.state === "cancelled" ? (
                  <X className="mt-0.5 shrink-0 text-gray-400" size={18} />
                ) : autoSyncStatus.state === "syncing" ? (
                  <div className="mt-0.5 h-[18px] w-[18px] shrink-0 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
                ) : (
                  <X className="mt-0.5 shrink-0 text-rose-300" size={18} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {autoSyncStatus.state === "syncing" && "Syncing offline code"}
                    {autoSyncStatus.state === "success" && "Code synced successfully"}
                    {autoSyncStatus.state === "failed" && "Tests failed; draft not submitted"}
                    {autoSyncStatus.state === "error" && "Code could not be synced"}
                    {autoSyncStatus.state === "cancelled" && "Auto sync cancelled"}
                  </p>
                  {autoSyncStatus.draft && (
                    <p className="mt-1 truncate text-xs text-gray-400">
                      {autoSyncStatus.labName} · {autoSyncStatus.practicalTitle}
                    </p>
                  )}
                  {autoSyncStatus.message && (
                    <p className="mt-2 text-xs text-rose-300">{autoSyncStatus.message}</p>
                  )}
                  {autoSyncStatus.failedTests?.length > 0 && (
                    <div className="mt-2 max-h-36 space-y-2 overflow-y-auto text-xs text-amber-100">
                      {autoSyncStatus.failedTests.map((test, index) => (
                        <div key={index} className="rounded-md bg-white/5 p-2">
                          <p className="font-medium">
                            Test case {index + 1} - Failed
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {autoSyncStatus.draft &&
                    autoSyncStatus.state !== "syncing" && (
                    <button
                      onClick={() => {
                        navigate(
                          `/student/lab/${autoSyncStatus.draft.labId}?practical=${autoSyncStatus.draft.practicalId}`,
                        );
                        setAutoSyncStatuses((current) =>
                          current.filter((item) => item !== autoSyncStatus),
                        );
                      }}
                      className="mt-3 rounded-lg bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/25"
                    >
                      Go to the practical
                    </button>
                  )}
                </div>
                {autoSyncStatus.state !== "syncing" &&
                  (
                  <button
                    onClick={() =>
                      setAutoSyncStatuses((current) =>
                        current.filter((item) => item !== autoSyncStatus),
                      )
                    }
                    aria-label="Dismiss auto-sync message"
                    className="shrink-0 text-gray-500 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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
