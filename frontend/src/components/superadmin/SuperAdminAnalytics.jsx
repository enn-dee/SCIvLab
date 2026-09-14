import { useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Crown,
  Users,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Activity,
  AlertTriangle,
  Award,
  GraduationCap,
  Building,
} from "lucide-react";

const COLORS = [
  "#f59e0b",
  "#a855f7",
  "#22c55e",
  "#06b6d4",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
];
const tooltipStyle = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  color: "#fff",
};

function StatCard({ title, value, sub, icon }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 shadow-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">
            {title}
          </p>
          <h2 className="text-3xl font-bold mt-2 text-white">{value}</h2>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function SuperAdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("superadmin/analytics");
        setData(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return null;

  const {
    summary,
    teacherStats,
    departments,
    topByStudents,
    inactiveTeachers,
    submissionActivity,
    labKindBreakdown,
  } = data;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Crown size={22} className="text-amber-400" />
          Institutional Analytics
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Live overview of faculty, labs, and student engagement
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Teachers"
          value={summary.totalTeachers}
          icon={<Users size={20} className="text-purple-400" />}
        />
        <StatCard
          title="Labs"
          value={summary.totalLabs}
          icon={<BookOpen size={20} className="text-emerald-400" />}
        />
        <StatCard
          title="Students"
          value={summary.totalStudents}
          icon={<GraduationCap size={20} className="text-cyan-400" />}
        />
        <StatCard
          title="Practicals"
          value={summary.totalPracticals}
          icon={<CheckCircle2 size={20} className="text-blue-400" />}
        />
        <StatCard
          title="Submissions"
          value={summary.totalSubmissions}
          icon={<TrendingUp size={20} className="text-orange-400" />}
        />
      </div>

      {/* ROW 1 — CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-400" />
            Submission Activity (Last 7 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={submissionActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-400" />
            Lab Types
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={labKindBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {labKindBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ROW 2 — TOP + INACTIVE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award size={18} className="text-yellow-400" />
            Top Professors (by students)
          </h3>
          <div className="space-y-2">
            {topByStudents.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet</p>
            ) : (
              topByStudents.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 p-3"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                      i === 0
                        ? "bg-yellow-500/20 text-yellow-300"
                        : i === 1
                          ? "bg-gray-400/20 text-gray-300"
                          : i === 2
                            ? "bg-orange-500/20 text-orange-300"
                            : "bg-white/5 text-gray-400"
                    }`}
                  >
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-white">{t.fullName}</p>
                    <p className="truncate text-xs text-gray-500">
                      {t.department} · {t.labs} labs · {t.practicals} practicals
                    </p>
                  </div>
                  <span className="text-xs font-medium text-emerald-400">
                    {t.students} students
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-red-400/20 bg-red-500/[0.03] backdrop-blur-xl p-5"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" />
            Teachers Needing Attention
            <span className="text-xs text-gray-500 font-normal">
              (no labs or submissions)
            </span>
          </h3>
          {inactiveTeachers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              All professors are active 🎉
            </p>
          ) : (
            <div className="space-y-2">
              {inactiveTeachers.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-red-400/10 bg-black/20 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{t.fullName}</p>
                    <p className="truncate text-xs text-gray-500">
                      {t.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-400">
                      {t.labs === 0
                        ? "No labs"
                        : `${t.submissions} submissions`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ROW 3 — DEPARTMENT DISTRIBUTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Building size={18} className="text-cyan-400" />
          Departments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {departments.map((d) => (
            <div
              key={d.name}
              className="rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <p className="text-white font-semibold truncate">{d.name}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold text-purple-400">
                    {d.teachers}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase">
                    Teachers
                  </p>
                </div>
                <div>
                  <p className="text-xl font-bold text-emerald-400">{d.labs}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Labs</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-cyan-400">
                    {d.students}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase">
                    Students
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ROW 4 — FULL FACULTY TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Activity size={18} className="text-purple-400" />
          Faculty Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-3">Professor</th>
                <th className="p-3">Department</th>
                <th className="p-3">Labs</th>
                <th className="p-3">Active</th>
                <th className="p-3">Practicals</th>
                <th className="p-3">Students</th>
                <th className="p-3">Submissions</th>
                <th className="p-3">Completion</th>
              </tr>
            </thead>
            <tbody>
              {teacherStats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    No teachers yet
                  </td>
                </tr>
              ) : (
                teacherStats.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="p-3">
                      <p className="text-white">{t.fullName}</p>
                      <p className="text-xs text-gray-500">{t.email}</p>
                    </td>
                    <td className="p-3 text-gray-400">{t.department}</td>
                    <td className="p-3 text-gray-300">{t.labs}</td>
                    <td className="p-3 text-emerald-400">{t.activeLabs}</td>
                    <td className="p-3 text-gray-300">{t.practicals}</td>
                    <td className="p-3 text-cyan-400">{t.students}</td>
                    <td className="p-3 text-gray-300">{t.submissions}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-black/30 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              t.completion >= 70
                                ? "bg-gradient-to-r from-emerald-400 to-green-500"
                                : t.completion >= 40
                                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                  : "bg-gradient-to-r from-orange-400 to-red-500"
                            }`}
                            style={{ width: `${Math.min(t.completion, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {t.completion}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
