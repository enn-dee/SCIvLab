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
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  Activity,
  BookOpen,
  Award,
  Clock,
} from "lucide-react";

const COLORS = [
  "#a855f7",
  "#22c55e",
  "#06b6d4",
  "#eab308",
  "#ef4444",
  "#f97316",
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

export default function TeacherAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("reports/teacher-overview");
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
        <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return null;

  const {
    summary,
    submissionActivity,
    attendanceTrend,
    labBreakdown,
    topStudents,
    atRiskStudents,
  } = data;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity size={22} className="text-purple-400" />
          Analytics Overview
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Real-time insights across all your labs and students
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Labs"
          value={summary.totalLabs}
          sub={`${summary.activeLabs} active`}
          icon={<BookOpen size={20} className="text-purple-400" />}
        />
        <StatCard
          title="Students"
          value={summary.totalStudents}
          icon={<Users size={20} className="text-cyan-400" />}
        />
        <StatCard
          title="Practicals"
          value={summary.totalPracticals}
          icon={<CheckCircle2 size={20} className="text-emerald-400" />}
        />
        <StatCard
          title="Submissions"
          value={summary.totalSubmissions}
          icon={<TrendingUp size={20} className="text-blue-400" />}
        />
        <StatCard
          title="Pending Eval"
          value={summary.pendingEvaluations}
          icon={<Clock size={20} className="text-orange-400" />}
        />
        <StatCard
          title="At Risk"
          value={atRiskStudents.length}
          sub="Low attendance"
          icon={<AlertTriangle size={20} className="text-red-400" />}
        />
      </div>

      {/* CHARTS ROW 1 */}
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
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
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
            <Users size={18} className="text-cyan-400" />
            Students per Lab
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={labBreakdown}
                  dataKey="students"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {labBreakdown.map((_, i) => (
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

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity size={18} className="text-emerald-400" />
            Attendance Trend (Last 30 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`${v}%`, "Attendance"]}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#22c55e" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award size={18} className="text-yellow-400" />
            Top Students
          </h3>
          <div className="space-y-2">
            {topStudents.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet</p>
            ) : (
              topStudents.map((s, i) => (
                <div
                  key={s.id}
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
                    <p className="truncate text-sm text-white">{s.fullName}</p>
                    <p className="truncate text-xs text-gray-500">
                      {s.rollNumber}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-emerald-400">
                    {s.completed} done
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* LAB BREAKDOWN TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-purple-400" />
          Lab Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-3">Lab</th>
                <th className="p-3">Code</th>
                <th className="p-3">Students</th>
                <th className="p-3">Practicals</th>
                <th className="p-3">Submissions</th>
                <th className="p-3">Completion</th>
              </tr>
            </thead>
            <tbody>
              {labBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No labs yet
                  </td>
                </tr>
              ) : (
                labBreakdown.map((lab) => {
                  const expected = lab.students * lab.practicals;
                  const pct = expected
                    ? Math.round((lab.submissions / expected) * 100)
                    : 0;
                  return (
                    <tr
                      key={lab.id}
                      className="border-b border-white/5 hover:bg-white/[0.02]"
                    >
                      <td className="p-3 text-white">{lab.name}</td>
                      <td className="p-3 text-gray-400 text-xs">
                        {lab.subjectCode}
                      </td>
                      <td className="p-3 text-gray-300">{lab.students}</td>
                      <td className="p-3 text-gray-300">{lab.practicals}</td>
                      <td className="p-3 text-gray-300">{lab.submissions}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-black/30 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* AT-RISK STUDENTS */}
      {atRiskStudents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-red-400/20 bg-red-500/[0.03] backdrop-blur-xl p-5"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" />
            Students Needing Attention
            <span className="text-xs text-gray-500 font-normal">
              (attendance below 75%)
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {atRiskStudents.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-red-400/10 bg-black/20 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{s.fullName}</p>
                  <p className="truncate text-xs text-gray-500">
                    {s.rollNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-400">
                    {s.attendance}%
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {s.completed} done
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
