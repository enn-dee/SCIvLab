import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client.js";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { CalendarCheck, Save, AlertTriangle, Search } from "lucide-react";

export default function AttendanceTab({ lab }) {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("lab");
  const [practicalId, setPracticalId] = useState("");
  const [practicals, setPracticals] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [existing, setExisting] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchStudents();
    fetchPracticals();
    setLoading(false);
  }, [lab]);

  useEffect(() => {
    if (date) fetchAttendance();
  }, [date, type]);

  const fetchStudents = async () => {
    setLoading(true);

    const res = await apiFetch(`lab-students/${lab._id}`);
    setStudents(await res.json());
    setLoading(false);
  };

  const fetchPracticals = async () => {
    setLoading(true);
    const res = await apiFetch(`practicals/lab/${lab._id}`);
    setPracticals(await res.json());
    setLoading(false);
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ date, type });
      const res = await apiFetch(`attendance/lab/${lab._id}?${params}`);
      const data = await res.json();
      setExisting(data);
      const map = {};
      data.forEach((a) => {
        map[a.studentId?._id || a.studentId] = a.status;
      });
      setAttendance(map);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    const res = await apiFetch(`attendance/low-attendance/${lab._id}`);
    setAlerts(await res.json());
    setShowAlerts(true);
    setLoading(false);
  };

  const handleToggle = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present",
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const records = students.map((s) => ({
        studentId: s._id,
        labId: lab._id,
        practicalId: practicalId || null,
        date,
        type,
        status: attendance[s._id] || "present",
      }));

      await apiFetch("attendance", {
        method: "POST",
        body: JSON.stringify({ records }),
      });
      toast.success("Attendance saved");
      fetchAttendance();
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(attendance).filter(
    (s) => s === "present",
  ).length;
  const totalCount = students.length;

  const filtered = students.filter(
    (s) =>
      (s.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNumber || "").toLowerCase().includes(search.toLowerCase()),
  );

    if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading Attendance...</div>;
  }
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CalendarCheck size={20} className="text-purple-400" />
          Attendance
        </h3>
        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm hover:bg-orange-500/30 transition"
        >
          <AlertTriangle size={15} />
          Low Attendance Alerts
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="lab">Lab</option>
          <option value="lecture">Lecture</option>
        </select>
        {type === "lab" && (
          <select
            value={practicalId}
            onChange={(e) => setPracticalId(e.target.value)}
            className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Practicals</option>
            {practicals.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        )}
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-emerald-400">Present: {presentCount}</span>
          <span className="text-gray-500">|</span>
          <span className="text-red-400">
            Absent: {totalCount - presentCount}
          </span>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-3 text-gray-500" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((student, i) => (
          <motion.div
            key={student._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => handleToggle(student._id)}
            className={`cursor-pointer flex items-center justify-between rounded-xl border p-4 transition ${
              attendance[student._id] === "absent"
                ? "border-red-400/30 bg-red-500/10"
                : "border-emerald-400/30 bg-emerald-500/10"
            }`}
          >
            <div>
              <p className="text-white text-sm">{student.fullName}</p>
              <p className="text-xs text-gray-500">{student.rollNumber}</p>
            </div>
            <span
              className={`text-sm font-medium ${
                attendance[student._id] === "absent"
                  ? "text-red-400"
                  : "text-emerald-400"
              }`}
            >
              {attendance[student._id] === "absent" ? "Absent" : "Present"}
            </span>
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium"
      >
        <Save size={16} />
        {loading ? "Saving..." : "Save Attendance"}
      </button>

      {/* ALERTS MODAL */}
      {showAlerts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle size={20} className="text-orange-400" />
                Low Attendance Alerts
              </h3>
              <button
                onClick={() => setShowAlerts(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {alerts.length === 0 ? (
              <p className="text-gray-400 text-center py-6">
                All students have good attendance 🎉
              </p>
            ) : (
              <div className="space-y-2">
                {alerts.map((a, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-orange-400/20 bg-orange-500/10 p-3"
                  >
                    <p className="text-white font-medium">
                      {a.student.fullName}
                    </p>
                    <p className="text-sm text-gray-400">
                      {a.student.rollNumber}
                    </p>
                    <p className="text-sm text-orange-400 mt-1">
                      {a.percentage}% ({a.present}/{a.total} present)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
