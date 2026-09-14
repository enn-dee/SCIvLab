import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/utils/api";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import SuperAdminAnalytics from "../components/superadmin/SuperAdminAnalytics";
import {
  Crown,
  Users,
  Search,
  Upload,
  Trash2,
  Plus,
  X,
  Loader2,
  Mail,
  Lock,
  User,
  Building,
  LogOut,
  AlertTriangle,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [departments, setDepartments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [importing, setImporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState("teachers"); // "teachers" | "analytics"
  const [newTeacher, setNewTeacher] = useState({
    fullName: "",
    email: "",
    password: "",
    department: "",
  });
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { mode: "single" | "bulk", teacher?: {...}, ids?: [...] }
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const admin = JSON.parse(localStorage.getItem("superadmin") || "{}");

  useEffect(() => {
    fetchMetadata();
    fetchTeachers();
  }, []);

  const fetchMetadata = async () => {
    try {
      const res = await apiFetch("superadmin/teachers/metadata");
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (departmentFilter !== "All")
        params.append("department", departmentFilter);
      const res = await apiFetch(`superadmin/teachers?${params}`);
      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.fullName || !newTeacher.email || !newTeacher.password) {
      return toast.error("All fields are required");
    }
    if (newTeacher.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setCreating(true);
    try {
      const res = await apiFetch("superadmin/teachers", {
        method: "POST",
        body: JSON.stringify(newTeacher),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed");
      toast.success("Teacher created");
      setShowAddModal(false);
      setNewTeacher({ fullName: "", email: "", password: "", department: "" });
      fetchTeachers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiFetch("superadmin/teachers/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      toast.success(`Created ${data.created} teachers`);
      if (data.errors?.length) {
        toast.error(`${data.errors.length} errors (see console)`);
        console.warn(data.errors);
      }
      fetchTeachers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  // ─── Open delete confirmation modal ─────────────────────────────
  const openDeleteModal = (teacher) => {
    setDeleteTarget({ mode: "single", teacher });
  };

  const openBulkDeleteModal = () => {
    if (!selected.length) return;
    const targetTeachers = teachers.filter((t) => selected.includes(t._id));
    setDeleteTarget({ mode: "bulk", teachers: targetTeachers, ids: selected });
  };

  // ─── Execute the confirmed deletion ─────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      if (deleteTarget.mode === "single") {
        const res = await apiFetch(
          `superadmin/teachers/${deleteTarget.teacher._id}`,
          { method: "DELETE" },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Delete failed");

        const d = data.deleted || {};
        toast.success(
          `Deleted "${deleteTarget.teacher.fullName}" · ${d.labs || 0} labs · ${d.practicals || 0} practicals · ${d.submissions || 0} submissions`,
          { duration: 5000 },
        );
      } else {
        const res = await apiFetch("superadmin/teachers/bulk-delete", {
          method: "POST",
          body: JSON.stringify({ teacherIds: deleteTarget.ids }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Delete failed");

        const d = data.deleted || {};
        toast.success(
          `Deleted ${d.teachers || 0} teachers · ${d.labs || 0} labs · ${d.practicals || 0} practicals · ${d.submissions || 0} submissions`,
          { duration: 5000 },
        );
        setSelected([]);
      }

      setDeleteTarget(null);
      fetchTeachers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === teachers.length) setSelected([]);
    else setSelected(teachers.map((t) => t._id));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/superadmin/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950 text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 backdrop-blur-2xl px-6 py-7"
        >
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center">
                <Crown size={22} className="text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {admin?.fullName || "Principal"} — Manage all staff accounts
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {/* VIEW TOGGLE */}
              <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                <button
                  onClick={() => setView("teachers")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    view === "teachers"
                      ? "bg-amber-500/30 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Teachers
                </button>
                <button
                  onClick={() => setView("analytics")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    view === "analytics"
                      ? "bg-amber-500/30 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Analytics
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </motion.div>

        {/* VIEW SWITCH */}
        {view === "teachers" ? (
          <>
            {/* ACTIONS */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative max-w-md">
                  <Search
                    size={16}
                    className="absolute left-3 top-3 text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchTeachers()}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setTimeout(fetchTeachers, 100);
                  }}
                  className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-white"
                >
                  <option value="All">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                {selected.length > 0 && (
                  <button
                    onClick={openBulkDeleteModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 transition text-sm"
                  >
                    <Trash2 size={16} />
                    Delete ({selected.length})
                  </button>
                )}
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
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-medium transition"
                >
                  <Plus size={16} />
                  Add Teacher
                </button>
              </div>
            </div>

            {/* TEACHERS TABLE */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={28} className="text-amber-400 animate-spin" />
                </div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No teachers yet</p>
                  <p className="text-sm mt-1">Import CSV or add manually</p>
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
                              selected.length === teachers.length &&
                              teachers.length > 0
                            }
                            onChange={toggleSelectAll}
                            className="rounded border-white/20 bg-black/30"
                          />
                        </th>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Department</th>
                        <th className="p-3 w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((t, i) => (
                        <motion.tr
                          key={t._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-white/5 hover:bg-white/[0.02]"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selected.includes(t._id)}
                              onChange={() => toggleSelect(t._id)}
                              className="rounded border-white/20 bg-black/30"
                            />
                          </td>
                          <td className="p-3 text-white font-medium">
                            {t.fullName}
                          </td>
                          <td className="p-3 text-gray-300">{t.email}</td>
                          <td className="p-3 text-gray-400">
                            {t.department || "—"}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => openDeleteModal(t)}
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
          </>
        ) : (
          <SuperAdminAnalytics />
        )}
      </div>

      {/* ──────── ADD TEACHER MODAL ──────── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-amber-400/20 bg-zinc-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Crown size={18} className="text-amber-400" />
                  Add Teacher
                </h2>
                <button onClick={() => setShowAddModal(false)}>
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <User
                    className="absolute left-3 top-3 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newTeacher.fullName}
                    onChange={(e) =>
                      setNewTeacher({ ...newTeacher, fullName: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3 text-gray-400"
                    size={16}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newTeacher.email}
                    onChange={(e) =>
                      setNewTeacher({ ...newTeacher, email: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Password"
                    value={newTeacher.password}
                    onChange={(e) =>
                      setNewTeacher({ ...newTeacher, password: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="relative">
                  <Building
                    className="absolute left-3 top-3 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Department (optional)"
                    value={newTeacher.department}
                    onChange={(e) =>
                      setNewTeacher({
                        ...newTeacher,
                        department: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTeacher}
                    disabled={creating}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-medium disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────── DELETE CONFIRMATION MODAL ──────── */}
      <AnimatePresence>
        {deleteTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-red-400/30 bg-[#0a0a0a] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start gap-4 p-6 border-b border-white/5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 border border-red-400/20">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">
                    {deleteTarget.mode === "single"
                      ? "Delete this teacher?"
                      : `Delete ${deleteTarget.teachers.length} teachers?`}
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    {deleteTarget.mode === "single" ? (
                      <>
                        You are about to permanently remove{" "}
                        <span className="text-white font-medium">
                          {deleteTarget.teacher.fullName}
                        </span>{" "}
                        ({deleteTarget.teacher.email})
                      </>
                    ) : (
                      <>
                        You are about to permanently remove{" "}
                        <span className="text-white font-medium">
                          {deleteTarget.teachers.length} teachers
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Warning list */}
              <div className="p-6 bg-red-500/[0.02]">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">
                  This will also delete
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  {[
                    "All labs owned by these teachers",
                    "All practicals inside those labs",
                    "All student submissions",
                    "All evaluations and marks",
                    "All attendance records",
                    "All lab enrollments",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/5 p-3">
                  <p className="text-xs text-red-300 flex items-center gap-2">
                    <AlertTriangle size={12} />
                    This action cannot be undone. Data will be permanently lost.
                  </p>
                </div>
              </div>

              {/* List of names (if bulk, show first few) */}
              {deleteTarget.mode === "bulk" && (
                <div className="px-6 pb-4 max-h-32 overflow-y-auto">
                  <p className="text-xs text-gray-500 mb-2">
                    Teachers being deleted:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {deleteTarget.teachers.slice(0, 8).map((t) => (
                      <span
                        key={t._id}
                        className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-gray-400"
                      >
                        {t.fullName}
                      </span>
                    ))}
                    {deleteTarget.teachers.length > 8 && (
                      <span className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-gray-500">
                        +{deleteTarget.teachers.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 p-6 pt-4 border-t border-white/5">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
