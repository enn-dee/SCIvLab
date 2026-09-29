import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client.js";
import { ClipboardCheck, Edit3, FileText, Plus, Trash2, X, Users } from "lucide-react";
import ExamSubmissionsTab from "../components/ExamSubmissionsTab.jsx";
import toast from "react-hot-toast";

const blank = { title: "", description: "", instructions: "", language: "python", startTime: "", endTime: "", status: "published", studentIds: [] };
const toLocalDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [studentOptions, setStudentOptions] = useState([]);
  const [studentsOpen, setStudentsOpen] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentRollNumber, setStudentRollNumber] = useState("");
  const [studentBatch, setStudentBatch] = useState("All");
  const [activeTab, setActiveTab] = useState("exams");

  const load = () =>
    apiFetch("exams/teacher")
      .then((response) => response.json())
      .then(setExams)
      .catch((error) => toast.error(error.message));
  useEffect(() => {
    load();
  }, []);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const startEdit = (exam) => {
    setEditing(exam._id);
    setForm({ title: exam.title, description: exam.description || "", instructions: exam.instructions || "", language: exam.language || "python", startTime: toLocalDateTimeInput(exam.startTime), endTime: toLocalDateTimeInput(exam.endTime), status: exam.status, studentIds: exam.enrolledStudentIds || [] });
    setOpen(true);
  };
  const save = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.startTime || !form.endTime) return toast.error("Start time and end time are required");
    if (new Date(form.endTime) <= new Date(form.startTime)) return toast.error("End time must be after start time");
    const payload = { title: form.title, description: form.description, instructions: form.instructions, language: form.language, startTime: new Date(form.startTime).toISOString(), endTime: new Date(form.endTime).toISOString(), status: form.status };
    try {
      const response = await apiFetch(editing ? `exams/${editing}` : "exams", { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) });
      const savedExam = await response.json();
      const examId = editing || savedExam._id;
      if (editing && form.studentIds) {
        await apiFetch(`exams/${editing}/students`, { method: "PUT", body: JSON.stringify({ studentIds: form.studentIds }) });
      }
      toast.success(editing ? "Exam updated" : "Exam created");
      setOpen(false); setEditing(null); setForm(blank); load();
      if (!editing) await openStudents({ _id: examId });
    } catch (error) { toast.error(error.message); }
  };
  const openStudents = async (exam) => {
    try {
      const response = await apiFetch(`exams/${exam._id}/students`);
      const students = await response.json();
      setStudentOptions(students);
      setStudentsOpen(exam._id);
      setStudentSearch("");
      setStudentRollNumber("");
      setStudentBatch("All");
    } catch (error) { toast.error(error.message); }
  };
  const saveStudents = async () => {
    try {
      const studentIds = studentOptions.filter((student) => student.enrolled).map((student) => student._id);
      await apiFetch(`exams/${studentsOpen}/students`, { method: "PUT", body: JSON.stringify({ studentIds }) });
      setExams((current) => current.map((exam) => exam._id === studentsOpen ? { ...exam, enrolledStudentIds: studentIds } : exam));
      setStudentsOpen(null);
      toast.success("Exam students updated");
    } catch (error) { toast.error(error.message); }
  };
  const remove = async (id) => {
    if (!confirm("Delete this exam?")) return;
    try { await apiFetch(`exams/${id}`, { method: "DELETE" }); setExams((current) => current.filter((exam) => exam._id !== id)); toast.success("Exam deleted"); }
    catch (error) { toast.error(error.message); }
  };
  const getBatch = (student) => {
    if (student.batch) return String(student.batch);
    const match = student.rollNumber?.match(/^(\d{2})/);
    return match ? `20${match[1]}` : "";
  };
  const batches = [...new Set(studentOptions.map(getBatch).filter(Boolean))].sort();
  const visibleStudents = studentOptions.filter((student) => {
    const query = studentSearch.trim().toLowerCase();
    const matchesSearch = !query
      || student.fullName?.toLowerCase().includes(query)
      || student.rollNumber?.toLowerCase().includes(query);
    const matchesBatch = studentBatch === "All" || getBatch(student) === studentBatch;
    return matchesSearch && matchesBatch;
  });
  const addStudentByRollNumber = () => {
    const roll = studentRollNumber.trim().toLowerCase();
    const student = studentOptions.find((item) => item.rollNumber?.toLowerCase() === roll);
    if (!student) return toast.error("Student with this roll number was not found");
    setStudentOptions((current) => current.map((item) => item._id === student._id ? { ...item, enrolled: true } : item));
    setStudentRollNumber("");
    toast.success(`${student.rollNumber} added`);
  };
  const enrollVisibleStudents = () => {
    setStudentOptions((current) => current.map((student) => visibleStudents.some((item) => item._id === student._id) ? { ...student, enrolled: true } : student));
  };

  return <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950 p-4 md:p-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-purple-400/20 bg-purple-500/10 p-6"><div className="flex items-center gap-3"><ClipboardCheck className="text-purple-300" size={28} /><div><h1 className="text-2xl font-bold text-white">Exam Management</h1><p className="mt-1 text-sm text-gray-400">Create and manage your programming exams.</p></div></div><button onClick={() => { setEditing(null); setForm(blank); setOpen(true); }} className="flex items-center gap-2 rounded-xl bg-purple-500/20 px-4 py-2.5 text-purple-200 hover:bg-purple-500/30"><Plus size={16} /> Create exam</button></header>
      <div className="flex gap-2 overflow-x-auto border-b border-white/10 pb-2">
        <button onClick={() => setActiveTab("exams")} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${activeTab === "exams" ? "border border-purple-400/40 bg-purple-500/20 text-white" : "border border-white/10 bg-white/[0.03] text-gray-400 hover:text-white"}`}>
          <ClipboardCheck size={16} /> Exams
        </button>
        <button onClick={() => setActiveTab("submissions")} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${activeTab === "submissions" ? "border border-purple-400/40 bg-purple-500/20 text-white" : "border border-white/10 bg-white/[0.03] text-gray-400 hover:text-white"}`}>
          <FileText size={16} /> Submissions
        </button>
      </div>
      {activeTab === "exams" && open && <form onSubmit={save} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-white">{editing ? "Edit exam" : "Create exam"}</h2><button type="button" onClick={() => setOpen(false)}><X className="text-gray-400" size={18} /></button></div>{[["title","Title *"],["description","Description"],["instructions","Instructions"]].map(([key, label]) => <label key={key} className="block text-sm text-gray-400">{label}{key === "title" ? <input required value={form[key]} onChange={(event) => update(key, event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-purple-400/50" /> : <textarea value={form[key]} onChange={(event) => update(key, event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-purple-400/50" />}</label>)}<label className="block text-sm text-gray-400">Programming language<select required value={form.language} onChange={(event) => update("language", event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"><option value="python">Python</option><option value="cpp">C++</option><option value="c">C</option><option value="java">Java</option></select></label><div className="grid gap-4 md:grid-cols-2"><label className="text-sm text-gray-400">Start time<input required type="datetime-local" value={form.startTime} onChange={(event) => update("startTime", event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white [color-scheme:dark]" /></label><label className="text-sm text-gray-400">End time<input required type="datetime-local" value={form.endTime} onChange={(event) => update("endTime", event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white [color-scheme:dark]" /></label></div><label className="text-sm text-gray-400">Visibility<select value={form.status} onChange={(event) => update("status", event.target.value)} className="ml-2 rounded-xl border border-white/10 bg-black/30 p-3 text-white"><option value="published">Published</option><option value="draft">Draft</option></select></label><button className="rounded-xl bg-purple-500 px-5 py-2.5 font-medium text-white hover:bg-purple-600">Save exam</button></form>}
      {activeTab === "submissions" ? <ExamSubmissionsTab exams={exams} /> : <>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        {/* <div className="hidden border-b border-white/10 px-5 py-3 text-xs uppercase tracking-wider text-gray-500 sm:grid sm:grid-cols-[1fr_auto]">
          <span>Exam</span>
          <span>Actions</span>
        </div> */}
        {exams.map((exam, index) => (
          <div key={exam._id} className={`${index > 0 ? "border-t border-white/10" : ""}`}>
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-white">{exam.title}</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {exam.status === "published" ? "Published" : "Draft"} · {exam.startTime && exam.endTime ? `${Math.floor((new Date(exam.endTime) - new Date(exam.startTime)) / 60000)} minutes` : "Schedule incomplete"}
                  {exam.startTime && ` · Starts ${new Date(exam.startTime).toLocaleString()}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => studentsOpen === exam._id ? setStudentsOpen(null) : openStudents(exam)}
                  aria-label={`Manage students for ${exam.title}`}
                  className="flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-300/60 hover:bg-cyan-500/20 hover:text-cyan-100"
                >
                  <Users size={19} strokeWidth={2.25} />
                  {studentsOpen === exam._id ? "Close enrollment" : "Enroll students"}
                </button>
                <button onClick={() => startEdit(exam)} aria-label={`Edit ${exam.title}`} title="Edit exam" className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => remove(exam._id)} aria-label={`Delete ${exam.title}`} title="Delete exam" className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {studentsOpen === exam._id && (
              <div className="mx-5 mb-5 space-y-4 rounded-2xl border border-cyan-400/20 bg-black/20 p-5">
                <div className="flex flex-wrap items-end gap-3">
                  <label className="min-w-[220px] flex-1 text-xs text-gray-500">
                    Add by roll number
                    <input value={studentRollNumber} onChange={(event) => setStudentRollNumber(event.target.value.toUpperCase())} placeholder="e.g. 22CS001" className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-2.5 text-white" />
                  </label>
                  <button onClick={addStudentByRollNumber} className="rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-600">Add</button>
                  <label className="w-48 text-xs text-gray-500">
                    Filter by batch
                    <select value={studentBatch} onChange={(event) => setStudentBatch(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-2.5 text-white">
                      <option value="All">All batches</option>
                      {batches.map((batch) => <option key={batch} value={batch}>{batch}</option>)}
                    </select>
                  </label>
                </div>
                <div className="relative">
                  <input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search students..." className="w-full rounded-xl border border-white/10 bg-black/30 p-2.5 pl-4 text-white placeholder-gray-500" />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{visibleStudents.filter((student) => student.enrolled).length} selected · {visibleStudents.length} shown</span>
                  <button onClick={enrollVisibleStudents} className="text-emerald-300 hover:text-emerald-200">Add all shown</button>
                </div>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {visibleStudents.map((student) => (
                    <label key={student._id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-gray-300">
                      <input type="checkbox" checked={student.enrolled} onChange={(event) => setStudentOptions((current) => current.map((item) => item._id === student._id ? { ...item, enrolled: event.target.checked } : item))} />
                      <span>{student.fullName} <span className="text-gray-500">({student.rollNumber})</span></span>
                    </label>
                  ))}
                  {!visibleStudents.length && <p className="py-4 text-center text-sm text-gray-500">No matching students.</p>}
                </div>
                <button onClick={saveStudents} className="rounded-xl bg-purple-500 px-4 py-2 text-sm text-white">Save enrolled students</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {!exams.length && <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-gray-500">No exams created yet.</div>}
      </>}
    </div>
  </div>;
}
