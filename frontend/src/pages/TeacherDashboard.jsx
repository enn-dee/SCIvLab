import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/utils/api";
import { motion } from "motion/react";
import TeacherAnalytics from "../components/teacher/TeacherAnalytics";
import {
  BookOpen,
  Users,
  Clock,
  AlertCircle,
  Plus,
  ChevronRight,
  GraduationCap,
  Layers,
  ArrowUpRight,
  Activity,
  Sparkles,
  Trash2,
} from "lucide-react";

import TeacherNavbar from "../components/layout/TeacherNavbar";

function StatCard({ title, value, icon, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 shadow-xl ${gradient}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">
            {title}
          </p>
          <h2 className="text-3xl font-bold mt-2 text-white">{value}</h2>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [labToDelete, setLabToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [view, setView] = useState("labs"); // "labs" | "analytics"
  const [newLab, setNewLab] = useState({
    name: "",
    subjectCode: "",
    session: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, labsRes] = await Promise.all([
        apiFetch("reports/dashboard-stats"),
        apiFetch("labs"),
      ]);
      const statsData = await statsRes.json();
      const labsData = await labsRes.json();
      setStats(statsData);
      setLabs(labsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLab = async () => {
    if (!labToDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`labs/${labToDelete._id}`, { method: "DELETE" });
      setLabs((prev) => prev.filter((l) => l._id !== labToDelete._id));
      setLabToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete lab: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateLab = async () => {
    try {
      const res = await apiFetch("labs", {
        method: "POST",
        body: JSON.stringify(newLab),
      });
      const data = await res.json();
      setLabs([...labs, data]);
      setShowCreateModal(false);
      setNewLab({ name: "", subjectCode: "", session: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const currentLabs = labs.filter((l) => l.status === "current");
  const previousLabs = labs.filter((l) => l.status === "previous");

  return (
    <>
      <div className="p-4 md:p-6 max-w-full mx-auto flex flex-col gap-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-fuchsia-500/10 backdrop-blur-2xl px-6 py-7"
        >
          <div className="absolute top-0 right-0 w-52 h-52 bg-purple-500/10 blur-3xl rounded-full" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Teacher Dashboard
              </h1>
              <p className="text-sm text-gray-400 mt-2">
                Manage your labs, students, and evaluations
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {/* 🔥 View toggle: Labs / Analytics */}
              <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                <button
                  onClick={() => setView("labs")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    view === "labs"
                      ? "bg-purple-500/30 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Labs
                </button>
                <button
                  onClick={() => setView("analytics")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    view === "analytics"
                      ? "bg-purple-500/30 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Analytics
                </button>
              </div>

              {/* Manage Students button */}
              <button
                onClick={() => navigate("/teacher/students")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition"
              >
                <Users size={18} />
                Manage Students
              </button>

              {/* New Lab button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-all shadow-lg shadow-purple-500/20"
              >
                <Plus size={18} />
                New Lab
              </button>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Total Labs"
            value={stats?.totalLabs || 0}
            icon={<BookOpen size={22} className="text-purple-400" />}
          />
          <StatCard
            title="Active Labs"
            value={stats?.currentLabs || 0}
            icon={<Activity size={22} className="text-emerald-400" />}
          />
          <StatCard
            title="Students"
            value={stats?.totalStudents || 0}
            icon={<Users size={22} className="text-cyan-400" />}
          />
          <StatCard
            title="Pending Eval"
            value={stats?.pendingEvaluations || 0}
            icon={<AlertCircle size={22} className="text-orange-400" />}
          />
        </div>

        {/* ────────────── VIEW SWITCH ────────────── */}
        {view === "labs" ? (
          <>
            {/* CURRENT LABS */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers size={20} className="text-emerald-400" />
                  <h2 className="text-xl font-bold text-white">Current Labs</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {currentLabs.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-white/10 py-12 text-center text-gray-500">
                    No current labs. Create your first lab!
                  </div>
                ) : (
                  currentLabs.map((lab, i) => (
                    <motion.div
                      key={lab._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(`/teacher/lab/${lab._id}`)}
                      className="group relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 p-5 cursor-pointer"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_40%)]" />
                      <div className="relative">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {lab.name}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <ArrowUpRight
                              size={18}
                              className="text-emerald-400 opacity-0 group-hover:opacity-100 transition"
                            />
                            {/* Delete button — only for private labs owned by this teacher */}
                            {lab.kind !== "academic" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLabToDelete(lab);
                                }}
                                className="p-1.5 rounded-lg bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 transition opacity-0 group-hover:opacity-100"
                                title="Delete lab"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {lab.subjectCode}
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users size={12} /> {lab.students?.length || 0}{" "}
                            Students
                          </span>
                          <span>{lab.session}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* PREVIOUS LABS */}
            {previousLabs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={20} className="text-gray-500" />
                  <h2 className="text-xl font-bold text-gray-400">
                    Previous Labs
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {previousLabs.map((lab, i) => (
                    <motion.div
                      key={lab._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(`/teacher/lab/${lab._id}`)}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 cursor-pointer opacity-70 hover:opacity-100 transition"
                    >
                      <h3 className="text-lg font-semibold text-white">
                        {lab.name}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {lab.subjectCode} — {lab.session}
                      </p>
                      <div className="flex items-center justify-end mt-3">
                        <ChevronRight size={16} className="text-gray-500" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ────────────── ANALYTICS VIEW ────────────── */
          <TeacherAnalytics />
        )}
      </div>

      {/* CREATE LAB MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Create New Lab
            </h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Lab Name"
                value={newLab.name}
                onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
                className="p-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Subject Code"
                value={newLab.subjectCode}
                onChange={(e) =>
                  setNewLab({ ...newLab, subjectCode: e.target.value })
                }
                className="p-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Session (e.g., 2025-26)"
                value={newLab.session}
                onChange={(e) =>
                  setNewLab({ ...newLab, session: e.target.value })
                }
                className="p-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLab}
                  className="flex-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* DELETE LAB CONFIRMATION MODAL */}
      {labToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-red-400/20 bg-zinc-900 p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-300">
                <AlertCircle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Delete Lab?</h2>
                <p className="mt-2 text-sm text-gray-400">
                  You are about to permanently delete{" "}
                  <span className="text-white font-medium">
                    {labToDelete.name}
                  </span>
                  .
                </p>
                <ul className="mt-3 text-xs text-red-300 space-y-1 list-disc list-inside">
                  <li>All practicals</li>
                  <li>All student submissions</li>
                  <li>All evaluations and marks</li>
                  <li>All attendance records</li>
                  <li>All enrollments</li>
                </ul>
                <p className="mt-3 text-xs text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setLabToDelete(null)}
                disabled={deleting}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLab}
                disabled={deleting}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
