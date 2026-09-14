import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/utils/api";
import { hideExpiredLabs } from "@/offline/offlineMode";
import { motion } from "motion/react";
import {
  BookOpen, FlaskConical, Code2, ChevronRight,
  ArrowUpRight, Calendar, User, Clock, Sparkles,
  BrainCircuit, Rocket, Flame
} from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [labs, setLabs] = useState([]);
  const [algos, setAlgos] = useState([]);
  const [completedAlgos, setCompletedAlgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [labsResult, algosResult, progressResult] = await Promise.allSettled([
        apiFetch(`student/labs?includeEnrollmentStatus=1&fresh=1&statusAt=${Date.now()}`),
        apiFetch("algorithms"),
        apiFetch("progress/user-progress"),
      ]);

      if (labsResult.status === "rejected") {
        throw labsResult.reason;
      }

      const labsData = await labsResult.value.json();
      setLabs(hideExpiredLabs(Array.isArray(labsData) ? labsData : []));

      if (algosResult.status === "fulfilled") {
        const algosData = await algosResult.value.json();
        setAlgos(
          Array.isArray(algosData)
            ? algosData.sort((a, b) => (a.order || 0) - (b.order || 0))
            : [],
        );
      }

      if (progressResult.status === "fulfilled") {
        const progressData = await progressResult.value.json();
        const progressArray = Array.isArray(progressData) ? progressData : [];
        setCompletedAlgos(
          progressArray.filter((p) => p.completed).map((p) => p.algorithmSlug),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = completedAlgos.length;
  const totalAlgoCount = algos.length;
  const progressPercent = totalAlgoCount > 0 ? Math.round((completedCount / totalAlgoCount) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950">
      <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-purple-500/10 backdrop-blur-2xl px-6 py-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
                <Sparkles size={22} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Welcome, {user?.fullName || "Student"}
                </h1>
                <p className="text-sm text-gray-400">
                  {user?.rollNumber && `Roll: ${user.rollNumber}`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5"
          >
            <div className="flex items-center gap-3">
              <FlaskConical size={24} className="text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-white">{labs.length}</p>
                <p className="text-sm text-gray-400">Enrolled Labs</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5"
          >
            <div className="flex items-center gap-3">
              <BrainCircuit size={24} className="text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-white">{completedCount}/{totalAlgoCount}</p>
                <p className="text-sm text-gray-400">Algorithms Done</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-5"
          >
            <div className="flex items-center gap-3">
              <Rocket size={24} className="text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{progressPercent}%</p>
                <p className="text-sm text-gray-400">Overall Progress</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* LABS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FlaskConical size={20} className="text-emerald-400" />
              My Labs
            </h2>
          </div>

          {labs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-gray-500">
              <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
              <p>No labs assigned yet</p>
              <p className="text-xs mt-1">Your teacher will add you to a lab</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labs.map((lab, i) => {
                const expired = Boolean(lab.deadline && new Date(lab.deadline) < new Date());
                return <motion.div
                  key={lab._id}
                  whileHover={expired ? undefined : { y: -4 }}
                  onClick={() => !expired && navigate(`/student/lab/${lab._id}`)}
                  aria-disabled={expired}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition-all ${expired ? "border-white/5 bg-zinc-900/70 text-gray-500 opacity-55 cursor-not-allowed grayscale" : "border-white/10 bg-white/[0.04] backdrop-blur-xl cursor-pointer hover:border-emerald-400/30"}`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_40%)]" />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
                          <FlaskConical size={22} className="text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-white">{lab.name}</h3>
                            {lab.kind === "academic" && (
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[11px] ${
                                  lab.isEnrolled
                                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                    : "border-gray-400/20 bg-gray-500/10 text-gray-300"
                                }`}
                              >
                                {lab.isEnrolled ? "Enrolled" : "Not enrolled"}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{lab.subjectCode}</p>
                          {lab.kind === "academic" && (
                            <span className="mt-1 inline-block rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300">Shared curriculum</span>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight size={18} className="text-gray-500 group-hover:text-emerald-400 transition" />
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {lab.session}</span>
                      <span className="flex items-center gap-1"><User size={12} /> {lab.teacherId?.fullName || "Teacher"}</span>
                      {expired && <span className="flex items-center gap-1 text-red-300"><Clock size={12} /> Closed</span>}
                    </div>
                  </div>
                </motion.div>;
              })}
            </div>
          )}
        </motion.div>

        {/* ALGORITHMS SECTION */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Code2 size={20} className="text-purple-400" />
              Algorithm Learning
            </h2>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-black/40 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {algos.slice(0, 6).map((algo, i) => {
              const isCompleted = completedAlgos.includes(algo.slug);
              const isUnlocked = i === 0 || completedAlgos.includes(algos[i - 1]?.slug);

              return (
                <motion.div
                  key={algo._id}
                  whileHover={{ y: isUnlocked ? -4 : 0 }}
                  onClick={() => isUnlocked && navigate(`/algo/${algo.slug}`)}
                  className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
                    isUnlocked
                      ? "border-white/10 bg-white/[0.04] cursor-pointer hover:border-purple-400/30"
                      : "border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">#{algo.order || i + 1}</span>
                        <h3 className="text-white font-semibold text-sm">{algo.title}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{algo.category}</p>
                    </div>
                    {isCompleted ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/20">Done</span>
                    ) : isUnlocked ? (
                      <ChevronRight size={16} className="text-gray-500" />
                    ) : (
                      <span className="text-xs text-gray-600">🔒</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {algos.length > 6 && (
            <button
              onClick={() => navigate("/algo-dashboard")}
              className="mt-4 w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-sm"
            >
              View All Algorithms ({algos.length})
            </button>
          )}
        </motion.div> */}

      </div>
    </div>
  );
}
