import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "@/utils/api";
import {
  hideExpiredPracticals,
  isOffline,
  queueOfflineSubmission,
  getOfflineDraft,
  saveOfflineDraft,
  removeOfflineDraft,
} from "@/offline/offlineMode";
import { runOfflineTests } from "@/offline/offlineRunner";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";
import {
  ChevronLeft,
  FlaskConical,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Calendar,
  BarChart3,
  CalendarCheck,
  X,
  Send,
  RotateCcw,
  Code2,
  Play,
  MessageSquare,
  Lock,
} from "lucide-react";

const TABS = [
  { id: "practicals", label: "Practicals", icon: FlaskConical },
  { id: "marks", label: "Marks", icon: BarChart3 },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
];

export default function StudentLabDetail() {
  const { labId } = useParams();
  const navigate = useNavigate();

  const [lab, setLab] = useState(null);
  const [practicals, setPracticals] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [marks, setMarks] = useState({});
  const [attendance, setAttendance] = useState(null);
  const [activeTab, setActiveTab] = useState("practicals");
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editorPractical, setEditorPractical] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResults, setRunResults] = useState([]);
  const [runOutput, setRunOutput] = useState(null);
  const [failedTestCount, setFailedTestCount] = useState(0);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [submitConfirmationResolver, setSubmitConfirmationResolver] = useState(null);

  const [showInstructions, setShowInstructions] = useState(false);
  const [instructionsContent, setInstructionsContent] = useState("");
  const [customExpected, setCustomExpected] = useState("");
  const [editorPrefix, setEditorPrefix] = useState("");
  const [editorSuffix, setEditorSuffix] = useState("");

  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);

  const handleEditorMount = (editor, monaco) => {
    const errorMsg = "Copy-Paste not allowed";

    // Disable Ctrl+C (Copy)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
      toast.error(errorMsg);
    });

    // Disable Ctrl+V (Paste)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      toast.error(errorMsg);
    });

    // Disable Ctrl+X (Cut)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
      toast.error(errorMsg);
    });
  };
  const getStudentId = useCallback(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.id || "";
  }, []);

  const fetchAllData = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    try {
      const [labResult, pracResult, subResult, marksResult, attendanceResult] =
        await Promise.allSettled([
        apiFetch(`labs/${labId}`, { signal }),
        apiFetch(`practicals/lab/${labId}`, { signal }),
        apiFetch("submissions/my", { signal }),
        apiFetch(`marks/lab/${labId}`, { signal }),
        apiFetch(`attendance/student/${getStudentId()}/${labId}`, { signal }),
      ]);

      if (!isMounted.current) return;

      if (labResult.status === "rejected" || pracResult.status === "rejected") {
        throw labResult.status === "rejected"
          ? labResult.reason
          : pracResult.reason;
      }

      const labData = await labResult.value.json();
      const pracData = await pracResult.value.json();
      const subData =
        subResult.status === "fulfilled" ? await subResult.value.json() : [];
      const marksData =
        marksResult.status === "fulfilled" ? await marksResult.value.json() : [];
      const attData =
        attendanceResult.status === "fulfilled"
          ? await attendanceResult.value.json()
          : null;

      setLab(labData);
      setPracticals(
        hideExpiredPracticals(Array.isArray(pracData) ? pracData : [], labData?.deadline),
      );

      const subMap = {};
      const subArray = Array.isArray(subData) ? subData : [];
      subArray.forEach((s) => {
        subMap[s.practicalId?._id || s.practicalId] = s;
      });
      setSubmissions(subMap);

      const evalMap = {};
      for (const sub of subArray) {
        try {
          const practicalId = sub.practicalId?._id || sub.practicalId;
          if (!practicalId) continue;
          const evalRes = await apiFetch(`evaluations/submission/${sub._id}`, {
            signal,
          });
          if (!isMounted.current) return;
          const evalData = await evalRes.json();
          if (evalData?._id) evalMap[practicalId] = evalData;
        } catch {
          // ignore
        }
      }
      setEvaluations(evalMap);

      const marksMap = {};
      (Array.isArray(marksData) ? marksData : []).forEach((m) => {
        marksMap[m.practicalId?._id || m.practicalId] = m;
      });
      setMarks(marksMap);
      setAttendance(attData);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error(err);
    } finally {
      if (isMounted.current) setLoading(false);
      abortControllerRef.current = null;
    }
  }, [labId, getStudentId]);

  useEffect(() => {
    isMounted.current = true;
    fetchAllData();
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchAllData]);

  const sortedPracticals = useMemo(
    () => [...practicals].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [practicals],
  );

  const marksArray = useMemo(() => Object.values(marks), [marks]);

  const openEditor = useCallback(async (practical) => {
    setEditorPractical(practical);
    setShowEditor(true);
    setRunResults([]);
    setRunOutput(null);
    setCustomExpected("");

    const initialLanguage =
      practical.execution?.allowedLanguages?.[0] || "python";
    const savedDraft = getOfflineDraft(
      practical._id,
      practical.execution?.allowedLanguages || [initialLanguage],
    );
    const editorLanguage = savedDraft?.language || initialLanguage;
    setLanguage(editorLanguage);

    const template = practical.starterTemplate?.[editorLanguage];
    if (template) {
      setEditorPrefix(template.prefix || "");
      setEditorSuffix(template.suffix || "");
    } else {
      setEditorPrefix("");
      setEditorSuffix("");
    }

    try {
      if (savedDraft?.code !== undefined) {
        setCode(savedDraft.code);
        return;
      }

      const res = await apiFetch(`submissions/my/${practical._id}`);
      const data = await res.json();

      if (data?.submission?.code) {
        setCode(data.submission.code);
      } else {
        setCode(
          template?.starterSolution ||
            practical.starterCode ||
            "# Write your solution here\n",
        );
      }
    } catch (err) {
      setCode(
        template?.starterSolution ||
          practical.starterCode ||
          "# Write your solution here\n",
      );
    }
  }, []);

  const handleRunCode = useCallback(async () => {
    if (!editorPractical) return;
    if (!editorPractical.execution?.enabled) {
      toast.error("Code execution is not enabled for this practical");
      return;
    }

    setRunning(true);
    setRunOutput(null);
    setRunResults([]);

    try {
      const payload = { solutionCode: code, language };
      if (customExpected.trim()) {
        payload.customExpected = customExpected.trim();
      }

      let data;
      if (isOffline()) {
        try {
          const response = await apiFetch(
            `submissions/${editorPractical._id}/run?offline=1&all=1`,
            {
              method: "POST",
              body: JSON.stringify(payload),
            },
          );
          data = await response.json();
          if (!response.ok) throw new Error(data.error || "Local execution failed");
        } catch (localError) {
          const results = runOfflineTests(
            editorPractical,
            code,
            language,
            undefined,
            customExpected,
            true,
          );
          data = { results };
          if (language !== "javascript") throw localError;
        }
      } else {
        const response = await apiFetch(
          `submissions/${editorPractical._id}/run?all=1`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );
        data = await response.json();
        if (!response.ok) throw new Error(data.error || "Code execution failed");
      }

      // Custom input response
      if (data.mode === "custom") {
        setRunOutput({
          stdout: data.output.stdout || "",
          stderr: data.output.stderr || "",
        });
        if (data.output.stdout) toast.success("Execution completed");
        if (data.output.stderr) toast.error("Execution completed with errors");
        return;
      }

      // Public tests response
      const results = data.results || [];
      setRunResults(results);
      const passed = results.filter((r) => r.passed).length;
      const total = results.length;
      if (total === 0) {
        setRunOutput({ stdout: "No public test cases found.", stderr: "" });
      } else if (passed === total) {
        setRunOutput({
          stdout: `✅ All ${total} public tests passed!`,
          stderr: "",
        });
        toast.success("All tests passed!");
      } else {
        setRunOutput({
          stdout: `⚠️ ${passed}/${total} public tests passed.`,
        });
        toast.error(`${passed}/${total} tests passed`);
      }
    } catch (error) {
      setRunOutput({ stdout: "", stderr: error.message });
      toast.error(error.message);
    } finally {
      setRunning(false);
    }
  }, [editorPractical, code, language, customExpected]);

  const handleSubmitCode = useCallback(async () => {
    if (!editorPractical) return;
    setSubmitting(true);

    try {
      if (lab?.kind === "academic") {
        let results;
        if (isOffline()) {
          results = runOfflineTests(editorPractical, code, language, undefined, undefined, true);
        } else {
          const testResponse = await apiFetch(
            `submissions/${editorPractical._id}/run?all=1`,
            {
              method: "POST",
              body: JSON.stringify({ solutionCode: code, language }),
            },
          );
          const testData = await testResponse.json();
          if (!testResponse.ok) {
            throw new Error(testData.error || "Unable to validate test cases");
          }
          results = testData.results || [];
        }

        const failedTests = results.filter((result) => !result.passed);
        if (failedTests.length > 0) {
          const shouldSubmit = await new Promise((resolve) => {
            setFailedTestCount(failedTests.length);
            setSubmitConfirmationResolver(() => resolve);
            setShowSubmitConfirmation(true);
          });
          if (!shouldSubmit) return;
        }
      }

      if (isOffline()) {
        await queueOfflineSubmission(editorPractical, code, language);
        setSubmissions((current) => ({
          ...current,
          [editorPractical._id]: {
            practicalId: editorPractical._id,
            status: "queued",
            code,
            language,
          },
        }));
        toast.success("Saved offline. It will submit when you reconnect.");
      } else {
        const response = await apiFetch(
          `submissions/${editorPractical._id}/submit`,
          {
            method: "POST",
            body: JSON.stringify({
              solutionCode: code,
              language,
            }),
          },
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Submission failed");
        toast.success("Code submitted successfully!");
        removeOfflineDraft(editorPractical._id, language);
      }
      setShowEditor(false);
      setEditorPractical(null);
      fetchAllData(); // refresh submissions & marks
    } catch (err) {
      toast.error(err.message || "Failed to submit code");
    } finally {
      setSubmitting(false);
    }
  }, [editorPractical, code, language, fetchAllData, lab]);

  const getStatusBadge = useCallback(
    (practicalId) => {
      const sub = submissions[practicalId];
      if (!sub)
        return {
          icon: Clock,
          color: "text-gray-400 bg-gray-500/10",
          label: "Pending",
        };
      if (sub.status === "queued")
        return {
          icon: Clock,
          color: "text-amber-300 bg-amber-500/10",
          label: "Waiting to sync",
        };
      if (sub.status === "late")
        return {
          icon: AlertTriangle,
          color: "text-orange-400 bg-orange-500/10",
          label: "Late",
        };
      return {
        icon: CheckCircle,
        color: "text-emerald-400 bg-emerald-500/10",
        label: "Submitted",
      };
    },
    [submissions],
  );

  const resetCode = useCallback(() => {
    setCode(
      editorPractical?.starterTemplate?.[language]?.starterSolution ||
        "# Write your solution here\n\ndef solution(input):\n    # Your code here\n    pass\n",
    );
  }, [editorPractical, language]);

  const closeEditor = useCallback(() => {
    setShowEditor(false);
    setEditorPractical(null);
    setRunResults([]);
    setRunOutput(null);
  }, []);

  // --- Loading & error states ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-gray-400">Loading lab...</p>
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950 flex items-center justify-center">
        <p className="text-red-400">Lab not found</p>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => navigate("/student/dashboard")}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {lab.name}
            </h1>
            <p className="text-sm text-gray-400">
              {lab.subjectCode} — {lab.session}
            </p>
          </div>
        </motion.div>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-500/20 border border-emerald-400/40 text-white shadow-lg shadow-emerald-500/10"
                    : "bg-white/[0.03] border border-white/10 text-gray-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* PRACTICALS TAB */}
        {activeTab === "practicals" && (
          <motion.div
            key="practicals"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {sortedPracticals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-gray-500">
                <FlaskConical size={40} className="mx-auto mb-3 opacity-50" />
                <p>No practicals assigned yet</p>
              </div>
            ) : (
              sortedPracticals.map((p, i) => {
                // Determine deadline (fallback to lab deadline if not set)
                const deadline = p.deadline || lab?.deadline;
                const isPastDeadline = deadline
                  ? new Date(deadline) < new Date()
                  : false;
                // Debug: log to console to verify
                // console.log(`Practical "${p.title}" deadline:`, deadline, "isPastDeadline:", isPastDeadline);

                const badge = getStatusBadge(p._id);
                const BadgeIcon = badge.icon;
                const practicalMarks = marks[p._id];
                const practicalEval = evaluations[p._id];
                const isSubmitted = !!submissions[p._id];

                return (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl border backdrop-blur-xl p-5 transition-all ${
                      isPastDeadline
                        ? "opacity-50 bg-gray-800/20 border-gray-600/30 pointer-events-none select-none"
                        : practicalEval?.status === "approved"
                          ? "bg-emerald-500/5 border-emerald-400/30"
                          : practicalEval?.status === "rejected"
                            ? "bg-red-500/5 border-red-400/30"
                            : "bg-white/[0.04] border-white/10 hover:border-emerald-400/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-xs bg-white/5 px-2 py-1 rounded-full text-gray-500">
                            #{p.order || i + 1}
                          </span>
                          <h3 className="text-lg font-semibold text-white">
                            {p.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${badge.color}`}
                          >
                            <BadgeIcon size={12} />
                            {badge.label}
                          </span>
                          {practicalEval && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
                                practicalEval.status === "approved"
                                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-400/20"
                                  : "text-red-400 bg-red-500/10 border-red-400/20"
                              }`}
                            >
                              {practicalEval.status === "approved" ? (
                                <CheckCircle size={10} />
                              ) : (
                                <AlertTriangle size={10} />
                              )}
                              {practicalEval.status === "approved"
                                ? "Approved"
                                : "Rejected"}
                            </span>
                          )}
                          {isPastDeadline && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-300 border border-red-400/30">
                              <Lock size={10} />
                              Closed
                            </span>
                          )}
                        </div>

                        {p.description && (
                          <p className="text-sm text-gray-400 mb-3">
                            {p.description}
                          </p>
                        )}

                        {deadline && (
                          <p
                            className={`flex items-center gap-1 text-xs mb-3 ${
                              isPastDeadline ? "text-red-400" : "text-gray-500"
                            }`}
                          >
                            <Calendar size={12} />
                            Deadline: {new Date(deadline).toLocaleString()}
                            {isPastDeadline && " (Overdue)"}
                          </p>
                        )}

                        {isSubmitted && practicalEval && (
                          <div
                            className={`mt-2 p-4 rounded-xl border ${
                              practicalEval.status === "approved"
                                ? "bg-emerald-500/5 border-emerald-400/20"
                                : "bg-red-500/5 border-red-400/20"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {practicalEval.status === "approved" ? (
                                <CheckCircle
                                  size={16}
                                  className="text-emerald-400"
                                />
                              ) : (
                                <AlertTriangle
                                  size={16}
                                  className="text-red-400"
                                />
                              )}
                              <span
                                className={`text-sm font-semibold ${
                                  practicalEval.status === "approved"
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {practicalEval.status === "approved"
                                  ? "Approved"
                                  : "Rejected"}
                              </span>
                            </div>
                            {practicalEval.remarks ? (
                              <div className="flex items-start gap-2 mt-2">
                                <MessageSquare
                                  size={14}
                                  className="text-yellow-400 mt-0.5 shrink-0"
                                />
                                <p className="text-sm text-gray-300 leading-relaxed">
                                  {practicalEval.remarks}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 mt-1">
                                No feedback provided
                              </p>
                            )}
                          </div>
                        )}

                        {practicalMarks && (
                          <div className="mt-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-400/10">
                            <p className="text-sm text-emerald-400 font-medium">
                              Marks: {practicalMarks.total}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {/* ── Code button ── */}
                        {!(
                          lab.kind === "academic" &&
                          practicalEval?.status === "approved"
                        ) ? (
                          <button
                            onClick={() => openEditor(p)}
                            disabled={isPastDeadline}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition ${
                              isPastDeadline
                                ? "bg-gray-600/20 border-gray-500/30 text-gray-500 cursor-not-allowed"
                                : "bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30"
                            }`}
                          >
                            <Code2 size={15} />
                            {isPastDeadline
                              ? "Closed"
                              : submissions[p._id]
                                ? "Edit Code"
                                : "Write Code"}
                          </button>
                        ) : (
                          // Approved badge (only shown for academic labs)
                          <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-sm font-medium">
                            <CheckCircle size={15} />
                            Completed
                          </span>
                        )}

                        {/* ── Instructions button (unchanged) ── */}
                        {p.instructions && (
                          <button
                            onClick={() => {
                              setInstructionsContent(p.instructions);
                              setShowInstructions(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition"
                          >
                            <Eye size={15} />
                            <span className="hidden sm:inline">
                              Instructions
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* MARKS TAB */}
        {activeTab === "marks" && (
          <motion.div
            key="marks"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 overflow-x-auto">
              {marksArray.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <BarChart3 size={40} className="mx-auto mb-3 opacity-50" />
                  <p>No marks available yet</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-gray-400 border-b border-white/10">
                    <tr>
                      <th className="p-3">Practical</th>
                      <th className="p-3">Viva</th>
                      <th className="p-3">Execution</th>
                      <th className="p-3">Attendance</th>
                      <th className="p-3">Internal</th>
                      <th className="p-3 font-bold text-white">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marksArray.map((m, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="p-3 text-white">
                          {m.practicalId?.title || "—"}
                        </td>
                        <td className="p-3 text-gray-300">{m.viva}</td>
                        <td className="p-3 text-gray-300">{m.execution}</td>
                        <td className="p-3 text-gray-300">{m.attendance}</td>
                        <td className="p-3 text-gray-300">{m.internal}</td>
                        <td className="p-3 text-white font-bold">{m.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              {attendance ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-5 text-center">
                      <p className="text-4xl font-bold text-emerald-400">
                        {attendance.percentage}%
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Overall Attendance
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400">Present</span>
                        <span className="text-white font-semibold">
                          {attendance.present}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-400">Absent</span>
                        <span className="text-white font-semibold">
                          {attendance.absent}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-1 border-t border-white/10">
                        <span className="text-gray-400">Total</span>
                        <span className="text-white font-semibold">
                          {attendance.total}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-black/40 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${attendance.percentage}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${
                        attendance.percentage >= 75
                          ? "bg-gradient-to-r from-emerald-400 to-green-500"
                          : "bg-gradient-to-r from-orange-400 to-red-500"
                      }`}
                    />
                  </div>
                  {attendance.percentage < 75 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-400/20 text-orange-300 text-sm">
                      <AlertTriangle size={16} />
                      Low attendance — minimum 75% required
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <CalendarCheck
                    size={40}
                    className="mx-auto mb-3 opacity-50"
                  />
                  <p>No attendance records yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* CODE EDITOR MODAL */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl h-[85vh] rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5 shrink-0 flex-wrap gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {editorPractical?.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {editorPractical?.description || "Write your solution"}
                  </p>
                </div>
                <select
                  value={language}
                  onChange={(e) => {
                    const nextLang = e.target.value;
                    setLanguage(nextLang);
                    setCode(
                      editorPractical?.starterTemplate?.[nextLang]
                        ?.starterSolution || "",
                    );
                  }}
                  className="rounded-lg border border-white/10 bg-black px-2 py-1 text-xs text-white"
                >
                  {(
                    editorPractical?.execution?.allowedLanguages || ["python"]
                  ).map((item) => (
                    <option key={item} value={item}>
                      {item === "cpp" ? "C++" : item.toUpperCase()}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Expected output (optional)"
                  value={customExpected}
                  onChange={(e) => setCustomExpected(e.target.value)}
                  className="min-w-[120px] flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetCode}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10 transition"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
                {lab?.kind === "academic" && (
                  <button
                    onClick={handleRunCode}
                    disabled={running}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs hover:bg-cyan-500/20 transition disabled:opacity-50"
                  >
                    <Play size={12} />
                    {running ? "Running..." : "Run"}
                  </button>
                )}
                {showSubmitConfirmation && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="w-full max-w-md rounded-2xl border border-red-400/20 bg-[#0a0a0a] p-6 shadow-2xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-300">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Some tests failed</h3>
                          <p className="mt-2 text-sm leading-6 text-gray-400">
                            {failedTestCount} test case{failedTestCount === 1 ? "" : "s"} failed.
                            You can still submit your code for teacher review.
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setShowSubmitConfirmation(false);
                            submitConfirmationResolver?.(false);
                            setSubmitConfirmationResolver(null);
                          }}
                          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setShowSubmitConfirmation(false);
                            submitConfirmationResolver?.(true);
                            setSubmitConfirmationResolver(null);
                          }}
                          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
                        >
                          Submit anyway
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
                <button
                  onClick={handleSubmitCode}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Submit
                    </>
                  )}
                </button>
                <button
                  onClick={closeEditor}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Editor + Output Panel */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Prefix - read-only */}
              {editorPrefix && (
                <div className="shrink-0 border-b border-white/10">
                  <Editor
                    height={`${Math.max(40, editorPrefix.split("\n").length * 18 + 20)}px`}
                    theme="vs-dark"
                    language={language === "cpp" ? "cpp" : language}
                    value={editorPrefix}
                    options={{
                      readOnly: true,
                      domReadOnly: true,
                      contextmenu: false,
                      dragAndDrop: false,
                      selectionHighlight: false,
                      fontSize: 14,
                      minimap: { enabled: false },
                      padding: { top: 8, bottom: 8 },
                      scrollBeyondLastLine: false,
                      lineNumbers: "off",
                      glyphMargin: false,
                      folding: false,
                      wordWrap: "on",
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                    onMount={handleEditorMount}
                  />
                </div>
              )}

              {/* Editable code */}
              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={language === "cpp" ? "cpp" : language}
                  value={code}
                  onChange={(value) => {
                    const nextCode = value || "";
                    setCode(nextCode);
                    if (isOffline() && editorPractical?._id) {
                      saveOfflineDraft(editorPractical._id, language, nextCode);
                    }
                  }}
                  onMount={handleEditorMount}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    padding: { top: 8, bottom: 8 },
                    scrollBeyondLastLine: false,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    lineNumbers: "on",
                    renderLineHighlight: "line",
                    bracketPairColorization: { enabled: true },
                  }}
                />
              </div>

              {/* Suffix - read-only */}
              {editorSuffix && (
                <div className="shrink-0 border-t border-white/10">
                  <Editor
                    height={`${Math.max(40, editorSuffix.split("\n").length * 18 + 20)}px`}
                    theme="vs-dark"
                    language={language === "cpp" ? "cpp" : language}
                    value={editorSuffix}
                    options={{
                      readOnly: true,
                      domReadOnly: true,
                      contextmenu: false,
                      dragAndDrop: false,
                      selectionHighlight: false,
                      fontSize: 14,
                      minimap: { enabled: false },
                      padding: { top: 8, bottom: 8 },
                      scrollBeyondLastLine: false,
                      lineNumbers: "off",
                      glyphMargin: false,
                      folding: false,
                      wordWrap: "on",
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                    onMount={handleEditorMount}
                  />
                </div>
              )}
            </div>

            {/* Detailed test results (from /run) */}
            {runResults.length > 0 && (
              <div className="max-h-44 overflow-y-auto border-t border-white/10 bg-black/30 p-4 flex-shrink-0">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Public test results
                </p>
                <div className="space-y-2">
                  {runResults.map((result, index) => (
                    <div
                      key={result.caseId || index}
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        result.passed
                          ? "border-emerald-400/20 bg-emerald-500/5"
                          : "border-red-400/20 bg-red-500/5"
                      }`}
                    >
                      <span
                        className={
                          result.passed ? "text-emerald-300" : "text-red-300"
                        }
                      >
                        Test {index + 1}: {result.passed ? "Passed" : "Failed"}
                      </span>
                      {!result.hidden && !result.passed && (
                        <p className="mt-1 text-gray-400">
                          Expected: {String(result.expected ?? "")} · Actual:{" "}
                          {result.actualOutput || "(no output)"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
      {/* ─── INSTRUCTIONS MODAL ─── */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[80vh] rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5 shrink-0">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye size={18} className="text-cyan-400" />
                Instructions
              </h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed font-sans text-sm">
                  {instructionsContent}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/10 bg-white/5 shrink-0 flex justify-end">
              <button
                onClick={() => setShowInstructions(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-sm transition"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
