import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/api/client.js";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  UserPlus,
  Trash2,
  Upload,
  Search,
  Users,
  X,
  Plus,
  UserCheck,
} from "lucide-react";

export default function StudentsTab({ lab, onUpdate }) {
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState({
    enrolled: false,
    students: false,
    adding: false,
    quickAdding: null,
    removing: null,
    removingAll: false,
    enrollingAll: false,
  });

  useEffect(() => {
    fetchEnrolledStudents();
    fetchAllStudents();
  }, [lab]);

  const fetchEnrolledStudents = async () => {
    setLoading((prev) => ({ ...prev, enrolled: true }));
    try {
      const res = await apiFetch(`lab-students/${lab._id}`);
      const data = await res.json();
      setEnrolledStudents(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load enrolled students");
    } finally {
      setLoading((prev) => ({ ...prev, enrolled: false }));
    }
  };

  const fetchAllStudents = async () => {
    setLoading((prev) => ({ ...prev, students: true }));
    try {
      const res = await apiFetch("auth/all-students");
      const data = await res.json();
      setAllStudents(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students");
    } finally {
      setLoading((prev) => ({ ...prev, students: false }));
    }
  };

  const handleAdd = async () => {
    if (!rollNumber.trim()) return toast.error("Enter a roll number");
    setLoading((prev) => ({ ...prev, adding: true }));
    try {
      const res = await apiFetch(`lab-students/${lab._id}/enroll`, {
        method: "POST",
        body: JSON.stringify({ rollNumber: rollNumber.trim() }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.msg || data.error || "Failed to add student");
      toast.success(data.msg || "Student added");
      setRollNumber("");
      fetchEnrolledStudents();
      onUpdate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, adding: false }));
    }
  };

  const handleQuickAdd = async (roll) => {
    setLoading((prev) => ({ ...prev, quickAdding: roll }));
    try {
      const res = await apiFetch(`lab-students/${lab._id}/enroll`, {
        method: "POST",
        body: JSON.stringify({ rollNumber: roll }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.msg || data.error || "Failed to add student");
      toast.success(`${roll} added`);
      fetchEnrolledStudents();
      onUpdate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, quickAdding: null }));
    }
  };

  const handleEnrollAll = async () => {
    if (availableStudents.length === 0)
      return toast.error("No students available to enroll");
    const rollNumbers = availableStudents.map((s) => s.rollNumber);
    setLoading((prev) => ({ ...prev, enrollingAll: true }));
    try {
      const res = await apiFetch(`lab-students/${lab._id}/bulk-enroll`, {
        method: "POST",
        body: JSON.stringify({ rollNumbers }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.msg || data.error || "Failed to enroll");
      toast.success(`${data.enrolled || 0} students enrolled`);
      fetchEnrolledStudents();
      onUpdate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, enrollingAll: false }));
    }
  };

  const handleRemove = async (studentId) => {
    if (!confirm("Remove this student?")) return;
    setLoading((prev) => ({ ...prev, removing: studentId }));
    try {
      await apiFetch(`lab-students/${lab._id}/remove/${studentId}`, {
        method: "DELETE",
      });
      toast.success("Student removed");
      fetchEnrolledStudents();
      onUpdate();
    } catch (err) {
      toast.error(`Failed to remove ${err.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, removing: null }));
    }
  };

  const handleRemoveAll = async () => {
    if (
      !confirm(`Remove ALL ${enrolledStudents.length} students from this lab?`)
    )
      return;
    setLoading((prev) => ({ ...prev, removingAll: true }));
    try {
      for (const student of enrolledStudents) {
        await apiFetch(`lab-students/${lab._id}/remove/${student._id}`, {
          method: "DELETE",
        });
      }
      toast.success("All students removed");
      fetchEnrolledStudents();
      onUpdate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove all students");
    } finally {
      setLoading((prev) => ({ ...prev, removingAll: false }));
    }
  };

  // ─── CSV IMPORT ────────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiFetch(`lab-students/${lab._id}/import-csv`, {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type header – fetch will add boundary
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Import failed");

      toast.success(`Imported ${data.enrolled} students successfully`);
      if (data.errors && data.errors.length) {
        toast.error(`${data.errors.length} errors occurred (check console)`);
        console.warn(data.errors);
      }
      fetchEnrolledStudents();
      onUpdate();
    } catch (err) {
      toast.error(err.message || "Failed to import CSV");
    } finally {
      setImporting(false);
      e.target.value = ""; // reset input
    }
  };

  // ─── FILTERING LOGIC ──────────────────────────────────────────────────
  const filteredEnrolled = enrolledStudents.filter(
    (s) =>
      (s.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNumber || "").toLowerCase().includes(search.toLowerCase()),
  );

  const enrolledRolls = new Set(
    enrolledStudents.map((s) => s.rollNumber?.toUpperCase()),
  );

  const batchesSet = new Set();
  allStudents.forEach((s) => {
    const rn = s.rollNumber || "";
    const m = rn.match(/^(\d{2})/);
    if (m) batchesSet.add("20" + m[1]);
  });
  const batches = Array.from(batchesSet).sort((a, b) => b.localeCompare(a));

  const availableStudents = allStudents.filter((s) => {
    const roll = s.rollNumber || "";
    const rollUpper = roll.toUpperCase();
    if (enrolledRolls.has(rollUpper)) return false;
    if (batchFilter === "All") return true;
    const m = roll.match(/^(\d{2})/);
    if (!m) return false;
    const batch = "20" + m[1];
    return batch === batchFilter;
  });

  // ─── RENDER ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users size={20} className="text-purple-400" />
            Enrolled Students
            <span className="text-sm text-gray-500 font-normal">
              ({enrolledStudents.length})
            </span>
          </h3>
        </div>

        <div className="flex gap-2">
          {/* ─── IMPORT CSV BUTTON ─── */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition text-sm disabled:opacity-50"
          >
            <Upload size={15} />
            {importing ? "Importing..." : "Import CSV"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />

          {enrolledStudents.length > 0 && (
            <button
              onClick={handleRemoveAll}
              disabled={loading.removingAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 transition text-sm disabled:opacity-50"
            >
              <Trash2 size={15} />
              {loading.removingAll ? "Removing..." : "Remove All"}
            </button>
          )}

          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 hover:bg-purple-500/30 transition"
          >
            <UserPlus size={16} />
            {showAdd ? "Close" : "Add Students"}
          </button>
        </div>
      </div>

      {/* ADD STUDENTS PANEL – unchanged except for new import button (already above) */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">
              Add Students to {lab.name}
            </h3>
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">
                Enter Roll Number
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 22CS001"
                className="w-full p-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="w-48">
              <label className="text-xs text-gray-500 mb-1 block">
                Filter by Batch
              </label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none"
              >
                <option value="All">All Batches</option>
                {batches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={loading.adding}
              className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium disabled:opacity-50"
            >
              {loading.adding ? "Adding..." : "Add"}
            </button>
          </div>

          {availableStudents.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <button
                onClick={handleEnrollAll}
                disabled={loading.enrollingAll}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 text-white font-medium transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.enrollingAll ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <UserCheck size={18} />
                    Enroll All Available Students ({
                      availableStudents.length
                    }) {batchFilter != "All" ? `Of Batch ${batchFilter}` : ""}
                  </>
                )}
              </button>
            </div>
          )}

          <div className="border-t border-white/10 pt-4">
            <label className="text-xs text-gray-500 mb-3 block">
              Available Students ({availableStudents.length} not enrolled)
            </label>
            {loading.students ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                Loading students...
              </div>
            ) : availableStudents.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-white/10 rounded-xl">
                All students are already enrolled 🎉
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5">
                {availableStudents.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.03] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-400 text-xs font-medium">
                        {student.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {student.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.rollNumber}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickAdd(student.rollNumber)}
                      disabled={loading.quickAdding === student.rollNumber}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-400/20 text-purple-300 text-xs hover:bg-purple-500/20 transition disabled:opacity-50"
                    >
                      {loading.quickAdding === student.rollNumber ? (
                        "Adding..."
                      ) : (
                        <>
                          <Plus size={12} /> Add
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-3 text-gray-500" />
        <input
          type="text"
          placeholder="Search enrolled students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* ENROLLED STUDENTS LIST */}
      <div className="flex flex-col gap-2">
        {loading.enrolled ? (
          <div className="text-center py-12 text-gray-500">
            Loading enrolled students...
          </div>
        ) : filteredEnrolled.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p>No students enrolled yet</p>
            <p className="text-xs mt-1">Click "Add Students" to enroll</p>
          </div>
        ) : (
          filteredEnrolled.map((student, i) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-400 text-sm font-semibold">
                  {student.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{student.fullName}</p>
                  <p className="text-sm text-gray-400">{student.rollNumber}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(student._id)}
                disabled={loading.removing === student._id}
                className="p-2 rounded-lg bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
              >
                {loading.removing === student._id ? (
                  "..."
                ) : (
                  <Trash2 size={15} />
                )}
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
