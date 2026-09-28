import { apiFetch } from "../../../api/client.js";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { User, Lock, Eye, EyeOff, Sparkles, Hash, GraduationCap } from "lucide-react";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !password) return toast.error("All fields are required");
    if (!rollNumber.trim()) return toast.error("Roll number is required");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    setLoading(true);

    try {
      const res = await apiFetch("auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          rollNumber: rollNumber.trim().toUpperCase(),
          role: "student",
          password
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Registration failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Account created 🚀");
      window.location.href = "/";
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
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
              <GraduationCap size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Create Account</h2>
            <p className="text-sm text-gray-400">Start your learning journey</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="relative">
              <Hash className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                placeholder="Roll Number"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className={`mt-3 py-2.5 rounded-xl font-medium transition-all ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 shadow-md"
              }`}
            >
              {loading ? "Creating account..." : "Register"}
            </button>

            <p className="text-sm text-center text-gray-400 mt-2">
              Already have an account?{" "}
              <span
                className="text-emerald-400 cursor-pointer hover:underline"
                onClick={() => (window.location.href = "/login")}
              >
                Login
              </span>
            </p>

            <div className="border-t border-white/10 pt-4 mt-2">
              <p className="text-xs text-center text-gray-500 mb-3">Are you a teacher?</p>
              <button
                onClick={() => (window.location.href = "/teacher/register")}
                className="w-full py-2 rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-300 text-sm hover:bg-purple-500/20 transition"
              >
                Teacher Registration
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}