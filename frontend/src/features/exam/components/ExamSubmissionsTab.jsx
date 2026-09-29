import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/api/client.js";
import { AlertTriangle, CheckCircle, FileText, Search, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ExamSubmissionsTab({ exams }) {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedExam, setSelectedExam] = useState("all");
  const [viewingSubmission, setViewingSubmission] = useState(null);

  useEffect(() => {
    apiFetch("exams/teacher/submissions")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load exam submissions");
        return response.json();
      })
      .then(setSubmissions)
      .catch((error) => toast.error(error.message));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return submissions.filter((submission) => {
      const student = submission.studentId;
      const matchesExam =
        selectedExam === "all" || submission.examId?._id === selectedExam;
      const matchesSearch =
        !query ||
        student?.fullName?.toLowerCase().includes(query) ||
        student?.rollNumber?.toLowerCase().includes(query) ||
        student?.registrationNumber?.toLowerCase().includes(query);
      return matchesExam && matchesSearch;
    });
  }, [search, selectedExam, submissions]);
  const hasPenalties =
    (viewingSubmission?.penalties?.windowChangeCount || 0) > 0 ||
    Boolean(viewingSubmission?.penalties?.fullscreenExitCount);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-lg font-semibold text-white">
        <FileText size={20} className="text-purple-400" />
        Submissions
        <span className="text-sm font-normal text-gray-500">
          ({filtered.length})
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative w-full max-w-md flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student name or roll number..."
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={selectedExam}
          onChange={(event) => setSelectedExam(event.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All exams</option>
          {exams.map((exam) => (
            <option key={exam._id} value={exam._id}>
              {exam.title}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-gray-500">
          <FileText size={40} className="mx-auto mb-3 opacity-50" />
          <p>No exam submissions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-black/20 text-gray-400">
              <tr>
                <th className="p-3 pl-5">Student</th>
                <th className="p-3">Exam</th>
                <th className="p-3">Status</th>
                <th className="p-3">Submitted at</th>
                <th className="p-3">Code</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((submission) => (
                <tr
                  key={submission._id}
                  className="border-b border-white/5 text-gray-300 hover:bg-white/[0.02]"
                >
                  <td className="p-3 pl-5">
                    <p className="font-medium text-white">
                      {submission.studentId?.fullName || "Unknown student"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {submission.studentId?.rollNumber ||
                        submission.studentId?.registrationNumber ||
                        "—"}
                    </p>
                  </td>
                  <td className="p-3">
                    {submission.examId?.title || "Unknown exam"}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                      <CheckCircle size={12} /> Submitted
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setViewingSubmission(submission)}
                      className="rounded-lg border border-purple-400/30 bg-purple-500/10 px-3 py-1.5 text-sm text-purple-200 transition hover:bg-purple-500/20"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {viewingSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setViewingSubmission(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Submission details"
            className="max-h-[94vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Submission details
                </h2>
                <p className="mt-1 text-base text-gray-400">
                  {viewingSubmission.studentId?.fullName || "Unknown student"} ·{" "}
                  {viewingSubmission.examId?.title || "Unknown exam"}
                </p>
              </div>
              <button
                onClick={() => setViewingSubmission(null)}
                aria-label="Close submission details"
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[calc(94vh-90px)] space-y-5 overflow-y-auto p-6 md:p-7">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                <span>
                  <span className="text-gray-500">Student:</span>{" "}
                  <span className="text-gray-200">
                    {viewingSubmission.studentId?.fullName || "Unknown student"}
                  </span>
                  <span className="text-gray-500">
                    {" "}
                    (
                    {viewingSubmission.studentId?.rollNumber ||
                      viewingSubmission.studentId?.registrationNumber ||
                      "—"}
                    )
                  </span>
                </span>
                <span>
                  <span className="text-gray-500">Exam:</span>{" "}
                  <span className="text-gray-200">
                    {viewingSubmission.examId?.title || "Unknown exam"}
                  </span>
                </span>
                <span>
                  <span className="text-gray-500">Submitted:</span>{" "}
                  <span className="text-gray-200">
                    {new Date(viewingSubmission.submittedAt).toLocaleString()}
                  </span>
                </span>
              </div>
              <div>
                <p className="mb-3 text-base font-medium text-gray-200">
                  Submission code
                </p>
                <pre className="max-h-[62vh] min-h-[42vh] overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/50 p-5 font-mono text-[15px] leading-7 text-gray-300">
                  {viewingSubmission.code}
                </pre>
              </div>
              <div
                className={`border-t px-4 py-3 pt-4 ${
                  hasPenalties
                    ? "border-red-400/20 bg-red-500/[0.04]"
                    : "border-emerald-400/20 bg-emerald-500/[0.04]"
                }`}
              >
                <p
                  className={`flex items-center gap-2 text-sm font-medium uppercase tracking-wide ${
                    hasPenalties ? "text-red-300" : "text-emerald-300"
                  }`}
                >
                  <AlertTriangle
                    size={16}
                    className={
                      hasPenalties ? "text-red-400" : "text-emerald-400"
                    }
                  />
                  Recorded penalties
                </p>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                  <span>
                    Window change:{" "}
                    <strong
                      className={`font-medium ${
                        hasPenalties ? "text-red-200" : "text-emerald-200"
                      }`}
                    >
                      {viewingSubmission.penalties?.windowChangeCount || 0}
                    </strong>{" "}
                    times
                  </span>
                  <span>
                    Fullscreen exit:{" "}
                    <strong
                      className={`font-medium ${
                        hasPenalties ? "text-red-200" : "text-emerald-200"
                      }`}
                    >
                      {viewingSubmission.penalties?.fullscreenExitCount
                        ? "Yes"
                        : "No"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
