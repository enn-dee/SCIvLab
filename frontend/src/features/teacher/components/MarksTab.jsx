import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client.js";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { Save, Download, Search } from "lucide-react";

const components = ["viva", "execution", "attendance", "internal"];

export default function MarksTab({ lab }) {
  const [practicals, setPracticals] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [selectedPractical, setSelectedPractical] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPracticals();
    fetchStudents();
  }, [lab]);

  const fetchPracticals = async () => {
    try {
      const res = await apiFetch(`practicals/lab/${lab._id}`);
      const data = await res.json();
      setPracticals(data);
      if (data.length > 0 && !selectedPractical) {
        setSelectedPractical(data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await apiFetch(`lab-students/${lab._id}`);
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedPractical) fetchMarks();
  }, [selectedPractical]);

  const fetchMarks = async () => {
    try {
      const res = await apiFetch(`marks/practical/${selectedPractical}`);
      const data = await res.json();

      const marksArray = Array.isArray(data) ? data : [];
      const map = {};
      marksArray.forEach(m => {
        const id = m.studentId?._id || m.studentId;
        if (id) map[id] = m;
      });
      setMarksData(map);
    } catch (err) {
      console.error(err);
      setMarksData({});
    }
  };

  const handleChange = (studentId, field, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, practicalId: selectedPractical }),
        [field]: parseInt(value) || 0
      }
    }));
  };

  const handleSave = async (studentId) => {
    const data = marksData[studentId];
    if (!data) return;
    setSavingId(studentId);
    try {
      await apiFetch("marks", {
        method: "POST",
        body: JSON.stringify(data)
      });
      toast.success("Marks saved");
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setSavingId(null);
    }
  };

  const handleBulkSave = async () => {
    setLoading(true);
    try {
      const marksArray = Object.values(marksData).filter(m => m.studentId);
      await apiFetch("marks/bulk", {
        method: "POST",
        body: JSON.stringify({ marksData: marksArray })
      });
      toast.success("All marks saved");
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const getTotal = (studentId) => {
    const m = marksData[studentId];
    if (!m) return 0;
    return components.reduce((sum, c) => sum + (m[c] || 0), 0);
  };

  const filtered = students.filter(s =>
    (s.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNumber || "").toLowerCase().includes(search.toLowerCase())
  );

    if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading Marks...</div>;
  }
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Marks</h3>
          <select
            value={selectedPractical}
            onChange={(e) => setSelectedPractical(e.target.value)}
            className="p-2 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            {practicals.map(p => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBulkSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition disabled:opacity-50"
          >
            <Save size={15} />
            {loading ? "Saving..." : "Save All"}
          </button>
          {/* <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm hover:bg-emerald-500/30 transition">
            <Download size={15} />
            Export
          </button> */}
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

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-2xl">
          No students enrolled in this lab
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-3 min-w-[140px]">Student</th>
                {components.map(c => (
                  <th key={c} className="p-3 min-w-[80px] capitalize">{c}</th>
                ))}
                <th className="p-3 min-w-[80px] font-bold text-white">Total</th>
                <th className="p-3 min-w-[80px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => (
                <motion.tr
                  key={student._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="p-3">
                    <p className="text-white text-sm font-medium">{student.fullName}</p>
                    <p className="text-xs text-gray-500">{student.rollNumber}</p>
                  </td>
                  {components.map(c => (
                    <td key={c} className="p-2">
                      <input
                        type="number"
                        min="0"
                        value={marksData[student._id]?.[c] ?? ""}
                        onChange={(e) => handleChange(student._id, c, e.target.value)}
                        className="w-16 p-1.5 rounded-lg bg-black/30 border border-white/10 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </td>
                  ))}
                  <td className="p-3">
                    <span className="text-white font-semibold">{getTotal(student._id)}</span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleSave(student._id)}
                      disabled={savingId === student._id}
                      className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 disabled:opacity-50"
                    >
                      {savingId === student._id ? (
                        <div className="w-3.5 h-3.5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}