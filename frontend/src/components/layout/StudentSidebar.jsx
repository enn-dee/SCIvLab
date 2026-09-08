import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap, Code2, ChevronLeft,
  ChevronRight, LogOut, Home,
} from "lucide-react";

export default function StudentSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const updateConnectionStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);
    return () => {
      window.removeEventListener("online", updateConnectionStatus);
      window.removeEventListener("offline", updateConnectionStatus);
    };
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const menuItems = [
    {
      id: "dashboard",
      label: "Labs",
      icon: Home,
      path: "/student/dashboard"
    },
    {
      id: "algorithms",
      label: "Algorithms",
      icon: Code2,
      path: "/algo-dashboard",
      activePaths: ["/algo-dashboard", "/algo"]
    }
  ];

  const isActive = (item) => {
    if (item.activePaths) {
      return item.activePaths.some(p => location.pathname.startsWith(p));
    }
    return location.pathname === item.path;
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <motion.div
      animate={{ width: collapsed ? 72 : 260 }}
      className="relative h-screen bg-black/40 border-r border-white/10 backdrop-blur-xl flex flex-col shrink-0"
    >
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="group absolute -right-4 top-14 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 backdrop-blur-xl shadow-lg transition-all duration-300 hover:scale-110 hover:border-cyan-400/40 hover:shadow-cyan-500/20 active:scale-95"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/20 via-cyan-500/20 to-blue-500/20 opacity-0 blur-md transition-all duration-300 group-hover:opacity-100" />

        {/* Inner Circle */}
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 transition-all duration-300 group-hover:from-cyan-500/20 group-hover:to-emerald-500/20">
          <div className={`transition-transform duration-500 ease-in-out ${collapsed ? "rotate-0" : "rotate-180"}`}>
            <ChevronRight size={16} className="text-cyan-300 transition-all duration-300 group-hover:text-white" />
          </div>
        </div>
      </button>

      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div
          onClick={() => navigate("/student/dashboard")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 ${
              isOnline
                ? "bg-gradient-to-br from-emerald-500 to-cyan-600"
                : "bg-gradient-to-br from-red-600 to-rose-800"
            }`}
          >
            <GraduationCap size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="group relative flex items-center">

              <div
                className={`absolute -inset-2 rounded-xl blur-xl opacity-70 transition-all duration-700 group-hover:opacity-100 group-hover:blur-2xl ${
                  isOnline
                    ? "bg-gradient-to-r from-emerald-400/30 via-cyan-500/30 to-blue-500/30"
                    : "bg-gradient-to-r from-red-500/40 via-rose-500/30 to-red-700/30"
                }`}
              />

              <h1 className="relative text-2xl font-black tracking-tight flex items-center gap-1">

                <span
                  className={`bg-[length:200%_200%] bg-gradient-to-r bg-clip-text text-transparent animate-gradient ${
                    isOnline
                      ? "from-emerald-400 via-cyan-400 to-blue-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                      : "from-red-400 via-rose-400 to-red-600 drop-shadow-[0_0_12px_rgba(239,68,68,0.55)]"
                  }`}
                >
                  SCiV
                </span>

                <span className="text-white transition-all duration-500 group-hover:text-cyan-100">
                  Lab
                </span>

                <span
                  title={isOnline ? "Online" : "Offline"}
                  aria-label={isOnline ? "Online" : "Offline"}
                  className={`ml-1 h-2 w-2 rounded-full ${
                    isOnline
                      ? "bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"
                      : "bg-red-500 shadow-[0_0_10px_#ef4444]"
                  }`}
                />
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-sm text-white font-medium truncate">{user.fullName}</p>
          <p className="text-xs text-gray-500 truncate">{user.rollNumber}</p>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active
                ? "bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shadow-lg shadow-emerald-500/10"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              title={collapsed ? item.label : ""}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
              {!collapsed && active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition w-full"
          title={collapsed ? "Logout" : ""}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.div>
  );
}