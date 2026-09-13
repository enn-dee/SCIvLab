import React, { useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FileText, Download, Clock, CheckCircle, AlertTriangle,
  Eye, Search, X, Code2, Copy, Check, MessageSquare,
  ShieldCheck, ShieldX, Play
} from "lucide-react";

export default function SubmissionsTab({ lab }) {
  const [submissions, setSubmissions] = useState([]);
  const [practicals, setPracticals] = useState([]);
  const [selectedPractical, setSelectedPractical] = useState("all");
  const [search, setSearch] = useState("");
  const [viewingCode, setViewingCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [runningSubmission, setRunningSubmission] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [runOutput, setRunOutput] = useState(null);
  const [customExpected, setCustomExpected] = useState("");

  useEffect(() => {
    fetchPracticals();
    fetchSubmissions();
  }, [lab]);

  const fetchPracticals = async () => {
    try {
      const res = await apiFetch(`practicals/lab/${lab._id}`);
      const data = await res.json();
      setPracticals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await apiFetch(`submissions/lab/${lab._id}`);
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCode = async () => {
    if (!viewingCode?.code) return;
    try {
      await navigator.clipboard.writeText(viewingCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleRunSubmission = async () => {
    if (!viewingCode) return;
    setRunningSubmission(true);
    setRunResults(null);
    setRunOutput(null);
    try {
      const response = await apiFetch(`submissions/submission/${viewingCode._id}/run`, {
        method: "POST",
        body: JSON.stringify({
          customExpected: customExpected.trim(),
        }),
      });
      const data = await response.json();
      if (data.mode === "simple" || data.mode === "custom") {
        setRunOutput(data.output || null);
      } else {
        setRunResults(data.results || []);
      }
      toast.success(data.mode === "tests" ? "Test case executed" : "Submission executed");
    } catch (error) {
      toast.error(error.message || "Unable to run submission");
    } finally {
      setRunningSubmission(false);
    }
  };

  const filtered = submissions.filter(s => {
    const matchPractical = selectedPractical === "all" || s.practicalId?._id === selectedPractical;
    const matchSearch =
      (s.studentId?.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.studentId?.rollNumber || "").toLowerCase().includes(search.toLowerCase());
    return matchPractical && matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "submitted":
        return {
          icon: CheckCircle,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-400/20",
          label: "Submitted"
        };
      case "late":
        return {
          icon: AlertTriangle,
          color: "text-orange-400 bg-orange-500/10 border-orange-400/20",
          label: "Late"
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-400 bg-gray-500/10 border-gray-400/20",
          label: "Pending"
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText size={20} className="text-purple-400" />
          Submissions
          <span className="text-sm text-gray-500 font-normal">
            ({filtered.length})
          </span>
        </h3>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={selectedPractical}
          onChange={(e) => setSelectedPractical(e.target.value)}
          className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Practicals</option>
          {practicals.map(p => (
            <option key={p._id} value={p._id}>{p.title}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-gray-500">
          <FileText size={40} className="mx-auto mb-3 opacity-50" />
          <p>No submissions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-white/10 bg-black/20">
              <tr>
                <th className="p-3 pl-5">Student</th>
                <th className="p-3">Practical</th>
                <th className="p-3">Status</th>
                <th className="p-3">Submitted At</th>
                <th className="p-3">Code / Files</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const badge = getStatusBadge(s.status);
                const BadgeIcon = badge.icon;
                const isApproved = s.evaluation?.status === "approved";
                const isRejected = s.evaluation?.status === "rejected";

                return (
                  <motion.tr
                    key={s._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b border-white/5 transition ${isApproved
                        ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                        : isRejected
                          ? "bg-red-500/5 hover:bg-red-500/10"
                          : "hover:bg-white/[0.02]"
                      }`}
                  >
                    <td className="p-3 pl-5">
                      <div className="flex items-center gap-2">
                        {isApproved && <ShieldCheck size={16} className="text-emerald-400 shrink-0" />}
                        {isRejected && <ShieldX size={16} className="text-red-400 shrink-0" />}
                        <div>
                          <p className="text-white font-medium">{s.studentId?.fullName || "Unknown"}</p>
                          <p className="text-xs text-gray-500">{s.studentId?.rollNumber || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-300">{s.practicalId?.title || "—"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${badge.color}`}>
                          <BadgeIcon size={12} />
                          {badge.label}
                        </span>
                        {s.evaluation && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${isApproved
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-400/20"
                              : "text-red-400 bg-red-500/10 border-red-400/20"
                            }`}>
                            {isApproved ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                            {isApproved ? "Approved" : "Rejected"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-gray-400 text-xs">
                      {s.submittedAt
                        ? new Date(s.submittedAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {s.code ? (
                          <button
                            onClick={() => {
                              setViewingCode(s);
                              setCustomExpected("");
                              setRunResults(null);
                              setRunOutput(null);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-500/20 transition"
                          >
                            <Code2 size={12} />
                            View Code
                          </button>
                        ) : s.files?.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {s.files.map((f, j) => (
                              <a
                                key={j}
                                href={f.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition"
                              >
                                <Download size={11} />
                                {f.filename}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                        {s.evaluation?.remarks && (
                          <button
                            onClick={() =>
                              toast(s.evaluation.remarks, {
                                duration: 8000,
                                icon: "💬",
                                style: {
                                  background: "#1a1a2e",
                                  color: "#fff",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  fontSize: "14px",
                                },
                              })
                            }
                            className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-400/20 text-yellow-400 hover:bg-yellow-500/20 transition"
                            title="View teacher feedback"
                          >
                            <MessageSquare size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CODE VIEWER MODAL */}
      {viewingCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl max-h-[85vh] rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.03] shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-400 text-sm font-semibold">
                    {viewingCode.studentId?.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {viewingCode.studentId?.fullName || "Unknown Student"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {viewingCode.studentId?.rollNumber || "—"} • {viewingCode.practicalId?.title || "Practical"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 ml-[52px]">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getStatusBadge(viewingCode.status).color
                    }`}>
                    {React.createElement(getStatusBadge(viewingCode.status).icon, { size: 10 })}
                    {getStatusBadge(viewingCode.status).label}
                  </span>
                  {viewingCode.evaluation && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${viewingCode.evaluation.status === "approved"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-400/20"
                        : "text-red-400 bg-red-500/10 border-red-400/20"
                      }`}>
                      {viewingCode.evaluation.status === "approved" ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                      {viewingCode.evaluation.status === "approved" ? "Approved" : "Rejected"}
                    </span>
                  )}
                  {viewingCode.submittedAt && (
                    <span className="text-xs text-gray-500">
                      Submitted: {new Date(viewingCode.submittedAt).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                {viewingCode.evaluation?.remarks && (
                  <div className="mt-3 ml-[52px] p-3 rounded-xl bg-yellow-500/5 border border-yellow-400/20">
                    <p className="text-xs text-yellow-400 font-medium mb-1">Teacher Feedback:</p>
                    <p className="text-sm text-gray-300">{viewingCode.evaluation.remarks}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 hover:text-white transition"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy Code
                    </>
                  )}
                </button>
                <input
                  type="text"
                  placeholder="Expected output (optional)"
                  value={customExpected}
                  onChange={(event) => setCustomExpected(event.target.value)}
                  className="w-44 rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                <button
                  onClick={handleRunSubmission}
                  disabled={runningSubmission}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-sm hover:bg-emerald-500/20 transition disabled:opacity-50"
                >
                  {runningSubmission ? "Running..." : <><Play size={14} /> Run Code</>}
                </button>
                <button
                  onClick={() => {
                    setViewingCode(null);
                    setCopied(false);
                    setCustomExpected("");
                  }}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Code Display */}
            <div className="flex-1 overflow-auto">
              <pre className="p-5 text-sm leading-6 text-gray-200 font-mono">
                <code>{viewingCode.code || "// No code submitted"}</code>
              </pre>
              {runOutput && (
                <div className="border-t border-white/10 p-5 space-y-2">
                  <h4 className="text-sm font-medium text-white">Output</h4>
                  {runOutput.stdout && (
                    <pre className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-3 text-xs text-emerald-200 whitespace-pre-wrap">{runOutput.stdout}</pre>
                  )}
                  {runOutput.stderr && (
                    <pre className="rounded-lg border border-red-400/20 bg-red-500/5 p-3 text-xs text-red-300 whitespace-pre-wrap">{runOutput.stderr}</pre>
                  )}
                  {!runOutput.stdout && !runOutput.stderr && (
                    <p className="text-xs text-gray-500">No output produced</p>
                  )}
                </div>
              )}
              {runResults && (
                <div className="border-t border-white/10 p-5 space-y-2">
                  <h4 className="text-sm font-medium text-white">Test results</h4>
                  {runResults.map((result, index) => (
                    <div key={result.caseId || index} className={`rounded-lg border p-3 text-xs ${result.passed ? "border-emerald-400/20 bg-emerald-500/5" : "border-red-400/20 bg-red-500/5"}`}>
                      <span className={result.passed ? "text-emerald-300" : "text-red-300"}>Test {index + 1}: {result.passed ? "Passed" : "Failed"}</span>
                      <p className="mt-1 text-gray-400">Expected: {String(result.expected)} · Actual: {result.actualOutput || "(no output)"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/10 bg-white/[0.02] shrink-0 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Language: {viewingCode.language || "python"}
              </span>
              <span className="text-xs text-gray-500">
                {viewingCode.code?.split("\n").length || 0} lines
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
