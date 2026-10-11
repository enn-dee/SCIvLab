import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { LogOut, Shield, GraduationCap } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

export default function TeacherNavbar() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("teacher");
    if (t) setTeacher(JSON.parse(t));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/teacher/login";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/30 backdrop-blur-2xl shadow-lg">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div
          onClick={() => navigate("/teacher/dashboard")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
          >
            <GraduationCap size={22} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                SCi
              </span>
              <span className="text-white">Vlab</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {teacher && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-400/20 bg-purple-500/10">
              <Shield size={14} className="text-purple-400" />
              <span className="text-sm text-purple-300">
                {teacher.fullName}
              </span>
            </div>
          )}
          <ThemeToggle compact />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut size={16} />
            <span className="hidden md:inline text-sm">Logout</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
