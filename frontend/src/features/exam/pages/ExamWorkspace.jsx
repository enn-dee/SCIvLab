import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "@/api/client.js";
import { CircleAlert, ArrowLeft, Send, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";
import { useTheme } from "@/contexts/ThemeContext.jsx";

const getDraftKey = (examId) => `scivlab:exam-draft:${examId}`;

export default function ExamWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [submitted, setSubmitted] = useState(false);
  const [penalties, setPenalties] = useState(null);
  const [editing, setEditing] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const autoSubmitStarted = useRef(false);
  const { theme } = useTheme();

  const handleEditorMount = (editor, monaco) => {
    const errorMessage = "Copy-Paste not allowed";
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
      toast.error(errorMessage);
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      toast.error(errorMessage);
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
      toast.error(errorMessage);
    });
  };

  useEffect(() => {
    Promise.all([apiFetch(`exams/${id}`), apiFetch(`exams/${id}/submission`)])
      .then(async ([examResponse, submissionResponse]) => {
        const examData = await examResponse.json();
        const submissionData = await submissionResponse.json();
        setExam(examData);
        const saved = submissionData.submission;
        setPenalties(submissionData.penalties || null);
        const initialLanguage = examData.language || saved?.language || "python";
        const draft = localStorage.getItem(getDraftKey(id));
        setLanguage(initialLanguage);
        setCode(
          (draft ??
            saved?.code) ||
            examData.starterTemplate?.[initialLanguage]?.starterSolution ||
            "# Write your solution here\n"
        );
        setSubmitted(Boolean(saved));
        setEditing(Boolean(saved && draft !== null));
      })
      .catch((error) => toast.error(error.message));
  }, [id]);

  useEffect(() => {
    if (!exam || (!editing && submitted)) return;
    localStorage.setItem(getDraftKey(id), code);
  }, [code, editing, exam, id, submitted]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!exam) return undefined;
    const isRunning = () => {
      const currentTime = Date.now();
      const startsAt = exam.startTime ? new Date(exam.startTime).getTime() : null;
      const endsAt = exam.endTime ? new Date(exam.endTime).getTime() : null;
      return (!startsAt || currentTime >= startsAt) && (!endsAt || currentTime < endsAt);
    };
    const recordPenalty = (type) => {
      if (!isRunning()) return;
      apiFetch(`exams/${id}/penalties`, {
        method: "POST",
        body: JSON.stringify({ type }),
      })
        .then((response) => {
          if (!response.ok) throw new Error(`Unable to record ${type} penalty`);
          return response.json();
        })
        .then((data) => setPenalties(data.penalties))
        .catch((error) => console.error(`Unable to record ${type} penalty:`, error));
    };
    const handleWindowChange = () => recordPenalty("windowChange");
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) recordPenalty("fullscreenExit");
    };
    window.addEventListener("blur", handleWindowChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      window.removeEventListener("blur", handleWindowChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [exam, id]);

  const submit = useCallback(async (isAutomatic = false) => {
    if ((submitted && !editing) || autoSubmitStarted.current) return;
    if (isAutomatic) autoSubmitStarted.current = true;
    try {
      if (isAutomatic) setAutoSubmitting(true);
      const response = await apiFetch(`exams/${id}/submit`, { method: "POST", body: JSON.stringify({ solutionCode: code, language, autoSubmit: isAutomatic }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      setSubmitted(true);
      setEditing(false);
      localStorage.removeItem(getDraftKey(id));
      toast.success(isAutomatic ? "Time ended. Your exam was submitted automatically." : "Exam submitted successfully");
    } catch (error) {
      toast.error(error.message);
      if (isAutomatic) autoSubmitStarted.current = false;
    } finally {
      if (isAutomatic) setAutoSubmitting(false);
    }
  }, [code, editing, id, language, submitted]);

  useEffect(() => {
    const endsAt = exam?.endTime ? new Date(exam.endTime).getTime() : null;
    if (endsAt && now >= endsAt && (!submitted || editing) && !autoSubmitStarted.current) {
      submit(true);
    }
  }, [editing, exam, now, submitted, submit]);

  if (!exam)
    return (
      <div className="min-h-screen bg-zinc-950 p-8 text-gray-400">
        Loading exam...
      </div>
    );
  const startsAt = exam.startTime ? new Date(exam.startTime).getTime() : null;
  const configuredEnd = exam.endTime ? new Date(exam.endTime).getTime() : null;
  const endsAt = configuredEnd;
  const beforeStart = startsAt && now < startsAt;
  const remainingMs = endsAt ? Math.max(0, endsAt - now) : null;
  const remaining =
    remainingMs === null
      ? null
      : `${String(Math.floor(remainingMs / 3600000)).padStart(2, "0")}:${String(
          Math.floor((remainingMs % 3600000) / 60000)
        ).padStart(2, "0")}:${String(
          Math.floor((remainingMs % 60000) / 1000)
        ).padStart(2, "0")}`;
  const windowEnded = remainingMs !== null && remainingMs <= 0;
  const locked = beforeStart || windowEnded || (submitted && !editing);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <button
          onClick={() => navigate("/student/exams")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={16} /> Back to exams
        </button>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{exam.title}</h1>
              <p className="mt-2 text-sm text-gray-400">{exam.description}</p>
              <p className="mt-2 text-xs text-cyan-300">
                Duration:{" "}
                {startsAt && endsAt
                  ? `${Math.floor((endsAt - startsAt) / 60000)} minutes`
                  : "Not configured"}{" "}
                · Ends:{" "}
                {endsAt ? new Date(endsAt).toLocaleString() : "Not configured"}
              </p>
            </div>
            <div
              className={`rounded-xl border px-5 py-3 font-mono text-md font-semibold tracking-wide ${
                beforeStart || windowEnded
                  ? "border-amber-400/30 text-amber-300"
                  : "border-emerald-400/30 text-emerald-300"
              }`}
            >
              {beforeStart
                ? `Starts in ${String(
                    Math.max(0, Math.floor((startsAt - now) / 60000))
                  ).padStart(2, "0")}m`
                : windowEnded
                ? "Time ended"
                : remaining
                ? `Time left ${remaining}`
                : "Timed exam"}
            </div>
            {/* <select
              value={language}
              disabled={locked}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
            >
              {(exam.execution?.allowedLanguages || ["python"]).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select> */}
          </div>
          {exam.instructions && (
            <section className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
              <h2 className="flex items-center gap-2 font-semibold text-white">
                <Eye size={15} /> Instructions
              </h2>
              <p className="mt-2 whitespace-pre-wrap leading-6 text-gray-400">
                {exam.instructions}
              </p>
            </section>
          )}
          <div className={`mt-4 border-t px-1 pt-3 text-sm ${penalties?.windowChangeCount || penalties?.fullscreenExitCount ? "border-red-400/20 text-red-200" : "border-emerald-400/20 text-emerald-200"}`}>
            <p className="flex items-center gap-2 font-medium">
              Recorded penalties
              <span
                title="Recorded penalties may lead to deduction of marks."
                aria-label="Recorded penalties may lead to deduction of marks"
                className="inline-flex text-gray-400"
              >
                <CircleAlert size={15} />
              </span>
            </p>
            <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-400">
              <span>Window change: <strong className="text-gray-200">{penalties?.windowChangeCount || 0}</strong> times</span>
              <span>Fullscreen exit: <strong className="text-gray-200">{penalties?.fullscreenExitCount ? "Yes" : "No"}</strong></span>
            </div>
          </div>
        </div>
        <div className="h-[52vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] disabled:opacity-70">
          <Editor
            height="100%"
            theme={theme === "light" ? "vs" : "vs-dark"}
            language={language === "cpp" ? "cpp" : language}
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorMount}
            options={{
              readOnly: locked,
              domReadOnly: locked,
              contextmenu: false,
              dragAndDrop: false,
              selectionHighlight: false,
              fontSize: 14,
              minimap: { enabled: false },
              padding: { top: 12, bottom: 12 },
              scrollBeyondLastLine: false,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: "on",
              renderLineHighlight: "line",
              bracketPairColorization: { enabled: true },
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {submitted && !editing && !windowEnded && !beforeStart && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-2.5 text-cyan-200 hover:bg-cyan-500/20"
            >
              Edit code
            </button>
          )}
          <button
            disabled={locked || autoSubmitting}
            onClick={() => submit(false)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-5 py-2.5 text-emerald-200 disabled:opacity-40"
          >
            <Send size={16} /> {autoSubmitting ? "Submitting..." : submitted ? "Resubmit exam" : "Submit exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
