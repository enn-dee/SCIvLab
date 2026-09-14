import { useState } from "react";
import { apiFetch } from "@/utils/api";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Crown,
  Shield,
  GraduationCap,
} from "lucide-react";

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return toast.error("All fields are required");
    setLoading(true);
    try {
      const res = await apiFetch("superadmin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "superadmin");
      localStorage.setItem("superadmin", JSON.stringify(data.admin));
      toast.success("Welcome, Principal 👑");
      window.location.href = "/superadmin/dashboard";
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-amber-400/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center">
              <Crown size={28} className="text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold">Super Admin</h2>
            <p className="text-sm text-gray-400">
              Principal / Administration access
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className={`py-2.5 rounded-xl font-medium transition-all ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 shadow-md"
              }`}
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            {/* ─── Navigation to other portals ─── */}
            <div className="border-t border-white/10 pt-4 mt-2 flex flex-col gap-2">
              <p className="text-xs text-center text-gray-500 mb-1">
                Not a super admin?
              </p>

              <button
                onClick={() => (window.location.href = "/teacher/login")}
                className="w-full py-2 rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-300 text-sm hover:bg-purple-500/20 transition flex items-center justify-center gap-2"
              >
                <Shield size={14} />
                Teacher Login
              </button>

              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full py-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 text-sm hover:bg-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                <GraduationCap size={14} />
                Student Login
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
