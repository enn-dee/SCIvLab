import { useState } from "react";
import { apiFetch } from "@/api/client.js";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { Eye, EyeOff, Lock, Mail, Shield, Crown } from "lucide-react";

export default function TeacherLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return toast.error("All fields are required");
    }

    setLoading(true);

    try {
      const res = await apiFetch("teacher/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "teacher");
      localStorage.setItem("teacher", JSON.stringify(data.teacher));

      toast.success("Welcome back 👋");
      window.location.href = "/teacher/dashboard";
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
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center">
              <Shield size={28} className="text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold">Teacher Login</h2>
            <p className="text-sm text-gray-400">
              Access your lab management dashboard
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
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  : "bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 shadow-md"
              }`}
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <p className="text-sm text-center text-gray-400 mt-2">
              Accounts are created by the administrator.
            </p>

            <div className="border-t border-white/10 pt-4 mt-2 flex flex-col gap-2">
              <p className="text-xs text-center text-gray-500 mb-1">
                Are you a student?
              </p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full py-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 text-sm hover:bg-emerald-500/20 transition"
              >
                Student Login
              </button>

              <button
                onClick={() => (window.location.href = "/superadmin/login")}
                className="w-full py-2 rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-300 text-sm hover:bg-amber-500/20 transition flex items-center justify-center gap-1.5"
              >
                <Crown size={14} />
                Super Admin (Principal)
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
