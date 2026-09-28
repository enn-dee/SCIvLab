import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/api/client.js";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  Upload,
  Trash2,
  X,
  Filter,
  Download,
  Loader2,
  ChevronLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function TeacherStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [batches, setBatches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMetadata();
    fetchStudents();
  }, []);

  const fetchMetadata = async () => {
    try {
      const res = await apiFetch("teacher/students/metadata");
      const data = await res.json();
      setBatches(data.batches || []);
      setBranches(data.branches || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (batchFilter !== "All") params.append("batch", batchFilter);
      if (branchFilter !== "All") params.append("branch", branchFilter);

      const res = await apiFetch(`teacher/students?${params}`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchStudents();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiFetch("teacher/students/import", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Import failed");

      toast.success(`Created ${data.created} students`);
      if (data.errors?.length) {
        toast.error(`${data.errors.length} errors occurred (check console)`);
        console.warn(data.errors);
      }
      fetchStudents();
    } catch (err) {
      toast.error(err.message || "Failed to import CSV");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (studentId) => {
    if (!confirm("Delete this student permanently?")) return;
    try {
      await apiFetch(`teacher/students/${studentId}`, {
        method: "DELETE",
      });
      toast.success("Student deleted");
      fetchStudents();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    if (!confirm(`Delete ${selectedStudents.length} students permanently?`))
      return;

    try {
      await apiFetch("teacher/students/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ studentIds: selectedStudents }),
      });
      toast.success(`${selectedStudents.length} students deleted`);
      setSelectedStudents([]);
      fetchStudents();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleSelect = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s._id));
    }
  };

  const filtered = students;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          {/* 🔥 Back to Dashboard */}
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="mt-1 p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition flex items-center gap-1.5"
            title="Back to Dashboard"
          >
            <ChevronLeft size={18} />
            <span className="text-sm hidden sm:inline">Dashboard</span>
          </button>

          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={22} className="text-purple-400" />
              Student Management
              <span className="text-sm text-gray-500 font-normal">
                ({students.length} total)
              </span>
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              System‑wide student accounts. Import CSV to create accounts with
              DOB as password.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition text-sm disabled:opacity-50"
          >
            <Upload size={16} />
            {importing ? "Importing..." : "Import CSV"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />

          {selectedStudents.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 transition text-sm"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedStudents.length})
            </button>
          )}
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, roll number, registration number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={batchFilter}
            onChange={(e) => {
              setBatchFilter(e.target.value);
              setTimeout(handleSearch, 100);
            }}
            className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Batches</option>
            {batches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setTimeout(handleSearch, 100);
            }}
            className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="text-purple-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>No students found</p>
            <p className="text-sm mt-1">
              Import a CSV to create student accounts
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b border-white/10 bg-black/20">
                <tr>
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedStudents.length === students.length &&
                        students.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-white/20 bg-black/30"
                    />
                  </th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Registration No.</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Batch</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3 w-20">Action</th>
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
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => toggleSelect(student._id)}
                        className="rounded border-white/20 bg-black/30"
                      />
                    </td>
                    <td className="p-3 text-white font-medium">
                      {student.rollNumber || "—"}
                    </td>
                    <td className="p-3 text-gray-300">
                      {student.registrationNumber || "—"}
                    </td>
                    <td className="p-3 text-gray-400 text-xs">
                      {student.email || "—"}
                    </td>
                    <td className="p-3 text-white">{student.fullName}</td>
                    <td className="p-3 text-gray-300">
                      {student.batch || "—"}
                    </td>
                    <td className="p-3 text-gray-300">
                      {student.branch || "—"}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="p-1.5 rounded-lg bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER */}
      {selectedStudents.length > 0 && (
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{selectedStudents.length} students selected</span>
          <button
            onClick={() => setSelectedStudents([])}
            className="text-gray-500 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
