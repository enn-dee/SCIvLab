import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client.js";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  Plus,
  Edit3,
  Trash2,
  Clock,
  FileText,
  X,
  Save,
  Sparkles,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Code2,
  FlaskConical,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const LANGUAGES = [
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
];

const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const emptyForm = () => ({
  title: "",
  description: "",
  instructions: "",
  inputFormat: "",
  outputFormat: "",
  pseudocode: [],
  timeComplexity: "",
  spaceComplexity: "",
  deadline: null,
  order: 0,
  language: "c",
  difficulty: "intermediate",
  starterTemplate: {
    prefix: "",
    starterSolution: "",
    suffix: "",
  },
  testCases: [],
  execution: {
    enabled: true,
    allowedLanguages: ["c"],
    timeLimitSeconds: 2,
    memoryLimitKb: 128000,
  },
});

export default function PracticalsTab({ lab }) {
  const [practicals, setPracticals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [timeString, setTimeString] = useState("23:59");

  const [generating, setGenerating] = useState(false);
  const [regeneratingTests, setRegeneratingTests] = useState(false);
  const [showStarterEditor, setShowStarterEditor] = useState(false);
  const [showTestEditor, setShowTestEditor] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState({
    practicals: false,
    saving: false,
    deleting: null,
  });

  useEffect(() => {
    fetchPracticals();
  }, [lab]);

  const fetchPracticals = async () => {
    setLoading((prev) => ({ ...prev, practicals: true }));
    try {
      const res = await apiFetch(`practicals/lab/${lab._id}`);
      const data = await res.json();
      setPracticals(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load practicals");
    } finally {
      setLoading((prev) => ({ ...prev, practicals: false }));
    }
  };

  const resetForm = () => {
    setForm(emptyForm());
    setTimeString("23:59");
    setEditing(null);
    setShowForm(false);
    setShowStarterEditor(false);
    setShowTestEditor(false);
    setShowAdvanced(false);
  };

  const getCombinedDeadline = () => {
    if (!form.deadline) return null;
    const [hours, minutes] = timeString.split(":").map(Number);
    const deadline = new Date(form.deadline);
    deadline.setHours(hours, minutes, 0, 0);
    return deadline.toISOString();
  };

  // ─── AI: Generate practical ─────────────────────────────────────
  const handleGenerate = async () => {
    if (!form.title.trim()) {
      return toast.error("Enter a title first");
    }
    setGenerating(true);
    try {
      const res = await apiFetch("teacher/ai/generate-practical", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          language: form.language,
          difficulty: form.difficulty,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      const draft = data.draft;
      setForm((prev) => ({
        ...prev,
        description: draft.description || prev.description,
        inputFormat: draft.inputFormat || "",
        outputFormat: draft.outputFormat || "",
        pseudocode: Array.isArray(draft.pseudocode) ? draft.pseudocode : [],
        timeComplexity: draft.timeComplexity || "",
        spaceComplexity: draft.spaceComplexity || "",
        instructions: draft.instructions || prev.instructions,
        starterTemplate: draft.starterTemplate || prev.starterTemplate,
        testCases: Array.isArray(draft.testCases) ? draft.testCases : [],
        execution: {
          ...prev.execution,
          enabled: true,
          allowedLanguages: [form.language],
          timeLimitSeconds: draft.execution?.timeLimitSeconds || 2,
          memoryLimitKb: draft.execution?.memoryLimitKb || 128000,
        },
      }));
      setShowStarterEditor(true);
      setShowTestEditor(true);
      setShowAdvanced(true);
      toast.success("Practical generated — review and edit below");
    } catch (err) {
      toast.error(err.message || "AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  // ─── AI: Regenerate test cases ──────────────────────────────────
  const handleRegenerateTests = async () => {
    if (!form.title.trim()) return toast.error("Enter a title first");
    setRegeneratingTests(true);
    try {
      const res = await apiFetch("teacher/ai/regenerate-test-cases", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          language: form.language,
          description: form.description,
          count: 3,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setForm((prev) => ({
        ...prev,
        testCases: data.testCases || [],
      }));
      toast.success("Test cases regenerated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRegeneratingTests(false);
    }
  };

  // ─── Starter template helpers ───────────────────────────────────
  const updateStarter = (field, value) => {
    setForm((prev) => ({
      ...prev,
      starterTemplate: { ...prev.starterTemplate, [field]: value },
    }));
  };

  // ─── Pseudocode helper ──────────────────────────────────────────
  const pseudocodeText = Array.isArray(form.pseudocode)
    ? form.pseudocode.join("\n")
    : form.pseudocode || "";

  const handlePseudocodeChange = (value) => {
    setForm((prev) => ({
      ...prev,
      pseudocode: value.split("\n"),
    }));
  };

  // ─── Test case helpers ──────────────────────────────────────────
  const updateTestCase = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.testCases];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, testCases: next };
    });
  };

  const addTestCase = () => {
    setForm((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        { input: "", expected: "", visibility: "hidden", weight: 1 },
      ],
    }));
  };

  const removeTestCase = (index) => {
    setForm((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
  };

  // ─── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error("Title is required");

    setLoading((prev) => ({ ...prev, saving: true }));
    try {
      const payload = {
        title: form.title,
        description: form.description,
        instructions: form.instructions,
        inputFormat: form.inputFormat,
        outputFormat: form.outputFormat,
        pseudocode: form.pseudocode || [],
        timeComplexity: form.timeComplexity || "",
        spaceComplexity: form.spaceComplexity || "",
        labId: lab._id,
        deadline: getCombinedDeadline(),
        order: form.order,
        starterTemplate: {
          [form.language]: {
            prefix: form.starterTemplate.prefix || "",
            starterSolution: form.starterTemplate.starterSolution || "",
            suffix: form.starterTemplate.suffix || "",
          },
        },
        testCases: form.testCases,
        execution: {
          ...form.execution,
          enabled: true,
          allowedLanguages: [form.language],
        },
      };

      if (editing) {
        await apiFetch(`practicals/${editing}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Practical updated");
      } else {
        await apiFetch("practicals", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Practical created");
      }

      resetForm();
      fetchPracticals();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save");
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  // ─── Edit existing ──────────────────────────────────────────────
  const handleEdit = (p) => {
    setEditing(p._id);
    const deadlineDate = p.deadline ? new Date(p.deadline) : null;

    const detectedLanguage =
      p.execution?.allowedLanguages?.[0] ||
      Object.keys(p.starterTemplate || {}).find(
        (k) => p.starterTemplate[k]?.prefix || p.starterTemplate[k]?.suffix,
      ) ||
      "c";

    const langTemplate = p.starterTemplate?.[detectedLanguage] || {
      prefix: "",
      starterSolution: "",
      suffix: "",
    };

    setForm({
      title: p.title || "",
      description: p.description || "",
      instructions: p.instructions || "",
      inputFormat: p.inputFormat || "",
      outputFormat: p.outputFormat || "",
      pseudocode: Array.isArray(p.pseudocode) ? p.pseudocode : [],
      timeComplexity: p.timeComplexity || "",
      spaceComplexity: p.spaceComplexity || "",
      deadline: deadlineDate,
      order: p.order || 0,
      language: detectedLanguage,
      difficulty: "intermediate",
      starterTemplate: {
        prefix: langTemplate.prefix || "",
        starterSolution: langTemplate.starterSolution || "",
        suffix: langTemplate.suffix || "",
      },
      testCases: Array.isArray(p.testCases) ? p.testCases : [],
      execution: {
        enabled: p.execution?.enabled ?? true,
        allowedLanguages: p.execution?.allowedLanguages || [detectedLanguage],
        timeLimitSeconds: p.execution?.timeLimitSeconds || 2,
        memoryLimitKb: p.execution?.memoryLimitKb || 128000,
      },
    });

    if (deadlineDate) {
      const h = deadlineDate.getHours().toString().padStart(2, "0");
      const m = deadlineDate.getMinutes().toString().padStart(2, "0");
      setTimeString(`${h}:${m}`);
    } else {
      setTimeString("23:59");
    }

    setShowStarterEditor(!!langTemplate.prefix || !!langTemplate.suffix);
    setShowTestEditor((p.testCases || []).length > 0);
    setShowAdvanced(
      !!p.inputFormat ||
        !!p.outputFormat ||
        (p.pseudocode && p.pseudocode.length > 0) ||
        !!p.timeComplexity ||
        !!p.spaceComplexity,
    );
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this practical?")) return;
    setLoading((prev) => ({ ...prev, deleting: id }));
    try {
      await apiFetch(`practicals/${id}`, { method: "DELETE" });
      toast.success("Practical deleted");
      fetchPracticals();
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setLoading((prev) => ({ ...prev, deleting: null }));
    }
  };

  const isOverdue = (deadline) =>
    deadline ? new Date(deadline) < new Date() : false;

  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return (
      date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const inputCls =
    "w-full p-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500";
  const labelCls = "text-xs text-gray-500 mb-1 block";

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText size={20} className="text-purple-400" />
          Practicals ({practicals.length})
        </h3>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          disabled={loading.saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 hover:bg-purple-500/30 transition disabled:opacity-50"
        >
          <Plus size={16} />
          Add Practical
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">
              {editing ? "Edit Practical" : "New Practical"}
            </h3>
            <button onClick={resetForm}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* TITLE + AI */}
          <div>
            <label className={labelCls}>
              Title *{" "}
              <span className="text-gray-600">
                — then click Generate to auto-fill
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Reverse a String"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputCls}
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !form.title.trim()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white font-medium text-sm whitespace-nowrap disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LANGUAGE + DIFFICULTY */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Language</label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className={inputCls}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Difficulty (for AI)</label>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm({ ...form, difficulty: e.target.value })
                }
                className={inputCls}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              placeholder="Brief description..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* INPUT / OUTPUT FORMAT */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Input Format</label>
              <textarea
                placeholder="e.g., A single line of text."
                value={form.inputFormat}
                onChange={(e) =>
                  setForm({ ...form, inputFormat: e.target.value })
                }
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className={labelCls}>Output Format</label>
              <textarea
                placeholder="e.g., The reversed string."
                value={form.outputFormat}
                onChange={(e) =>
                  setForm({ ...form, outputFormat: e.target.value })
                }
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* INSTRUCTIONS */}
          <div>
            <label className={labelCls}>Instructions</label>
            <textarea
              placeholder="Step-by-step instructions..."
              value={form.instructions}
              onChange={(e) =>
                setForm({ ...form, instructions: e.target.value })
              }
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* ADVANCED (collapsible) — pseudocode + complexity */}
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] transition"
            >
              <span className="flex items-center gap-2 text-sm text-white">
                <Sparkles size={15} className="text-amber-400" />
                Pseudocode &amp; Complexity
                {(form.timeComplexity ||
                  form.spaceComplexity ||
                  (form.pseudocode && form.pseudocode.length > 0)) && (
                  <span className="text-[10px] text-emerald-400 border border-emerald-400/20 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                    filled
                  </span>
                )}
              </span>
              {showAdvanced ? (
                <ChevronUp size={14} className="text-gray-400" />
              ) : (
                <ChevronDown size={14} className="text-gray-400" />
              )}
            </button>
            {showAdvanced && (
              <div className="p-4 space-y-3 bg-black/20">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Time Complexity</label>
                    <input
                      type="text"
                      placeholder="e.g., O(n)"
                      value={form.timeComplexity}
                      onChange={(e) =>
                        setForm({ ...form, timeComplexity: e.target.value })
                      }
                      className={`${inputCls} font-mono text-xs`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Space Complexity</label>
                    <input
                      type="text"
                      placeholder="e.g., O(1)"
                      value={form.spaceComplexity}
                      onChange={(e) =>
                        setForm({ ...form, spaceComplexity: e.target.value })
                      }
                      className={`${inputCls} font-mono text-xs`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>
                    Pseudocode{" "}
                    <span className="text-gray-600">(one line per row)</span>
                  </label>
                  <textarea
                    value={pseudocodeText}
                    onChange={(e) => handlePseudocodeChange(e.target.value)}
                    rows={6}
                    placeholder={
                      "procedure reverse(s)\n    left ← 0\n    right ← length(s) - 1\nend procedure"
                    }
                    className={`${inputCls} font-mono text-xs resize-none`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* STARTER TEMPLATE (collapsible) */}
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowStarterEditor((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] transition"
            >
              <span className="flex items-center gap-2 text-sm text-white">
                <Code2 size={15} className="text-cyan-400" />
                Starter Template
                {form.starterTemplate.prefix && (
                  <span className="text-[10px] text-emerald-400 border border-emerald-400/20 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                    filled
                  </span>
                )}
              </span>
              {showStarterEditor ? (
                <ChevronUp size={14} className="text-gray-400" />
              ) : (
                <ChevronDown size={14} className="text-gray-400" />
              )}
            </button>
            {showStarterEditor && (
              <div className="p-4 space-y-3 bg-black/20">
                <div>
                  <label className={labelCls}>
                    Prefix{" "}
                    <span className="text-gray-600">
                      (read-only part above the solution)
                    </span>
                  </label>
                  <textarea
                    value={form.starterTemplate.prefix}
                    onChange={(e) => updateStarter("prefix", e.target.value)}
                    rows={3}
                    className={`${inputCls} font-mono text-xs resize-none`}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Starter Solution{" "}
                    <span className="text-gray-600">(editable area)</span>
                  </label>
                  <textarea
                    value={form.starterTemplate.starterSolution}
                    onChange={(e) =>
                      updateStarter("starterSolution", e.target.value)
                    }
                    rows={2}
                    className={`${inputCls} font-mono text-xs resize-none`}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Suffix{" "}
                    <span className="text-gray-600">
                      (read-only part below the solution)
                    </span>
                  </label>
                  <textarea
                    value={form.starterTemplate.suffix}
                    onChange={(e) => updateStarter("suffix", e.target.value)}
                    rows={3}
                    className={`${inputCls} font-mono text-xs resize-none`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* TEST CASES (collapsible) */}
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTestEditor((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] transition"
            >
              <span className="flex items-center gap-2 text-sm text-white">
                <FlaskConical size={15} className="text-emerald-400" />
                Test Cases
                {form.testCases.length > 0 && (
                  <span className="text-[10px] text-emerald-400 border border-emerald-400/20 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                    {form.testCases.length}
                  </span>
                )}
              </span>
              {showTestEditor ? (
                <ChevronUp size={14} className="text-gray-400" />
              ) : (
                <ChevronDown size={14} className="text-gray-400" />
              )}
            </button>
            {showTestEditor && (
              <div className="p-4 space-y-3 bg-black/20">
                {form.testCases.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No test cases yet. Generate with AI or add manually.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {form.testCases.map((tc, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            Test #{i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeTestCase(i)}
                            className="p-1 rounded-lg bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">
                              Input (stdin)
                            </label>
                            <textarea
                              value={tc.input ?? ""}
                              onChange={(e) =>
                                updateTestCase(i, "input", e.target.value)
                              }
                              rows={2}
                              className={`${inputCls} font-mono text-xs resize-none`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">
                              Expected (stdout)
                            </label>
                            <textarea
                              value={tc.expected ?? ""}
                              onChange={(e) =>
                                updateTestCase(i, "expected", e.target.value)
                              }
                              rows={2}
                              className={`${inputCls} font-mono text-xs resize-none`}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">
                              Visibility
                            </label>
                            <select
                              value={tc.visibility || "hidden"}
                              onChange={(e) =>
                                updateTestCase(i, "visibility", e.target.value)
                              }
                              className={`${inputCls} text-xs`}
                            >
                              <option value="public">Public</option>
                              <option value="hidden">Hidden</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">
                              Weight
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={tc.weight ?? 1}
                              onChange={(e) =>
                                updateTestCase(
                                  i,
                                  "weight",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className={`${inputCls} text-xs`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addTestCase}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 text-xs transition"
                  >
                    <Plus size={13} />
                    Add Test Case
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateTests}
                    disabled={regeneratingTests}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-amber-400/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs transition disabled:opacity-50"
                  >
                    {regeneratingTests ? (
                      <>
                        <div className="w-3 h-3 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RotateCcw size={13} />
                        Regenerate with AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DEADLINE */}
          <div>
            <label className={labelCls}>Deadline</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/10 text-left ${
                        !form.deadline ? "text-gray-500" : "text-white"
                      }`}
                    >
                      <span>
                        {form.deadline
                          ? format(form.deadline, "PPP")
                          : "Pick a date"}
                      </span>
                      {form.deadline && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm({ ...form, deadline: null });
                          }}
                          className="text-gray-500 hover:text-red-400"
                        >
                          <X size={14} />
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl">
                    <Calendar
                      mode="single"
                      selected={form.deadline}
                      onSelect={(date) => setForm({ ...form, deadline: date })}
                      initialFocus
                      className="rounded-xl bg-zinc-900 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-32 relative">
                <Clock
                  size={15}
                  className="absolute left-3 top-3 text-gray-500"
                />
                <input
                  type="time"
                  value={timeString}
                  onChange={(e) => setTimeString(e.target.value)}
                  className="w-full pl-10 pr-3 p-2.5 rounded-xl bg-black/30 border border-white/10 text-white [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* ORDER */}
          <div>
            <label className={labelCls}>Order</label>
            <input
              type="number"
              min="0"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: parseInt(e.target.value) || 0 })
              }
              className={inputCls}
            />
          </div>

          {/* SUBMIT */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading.saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition disabled:opacity-50"
            >
              <Save size={16} />
              {loading.saving
                ? editing
                  ? "Updating..."
                  : "Creating..."
                : editing
                  ? "Update Practical"
                  : "Create Practical"}
            </button>
          </div>
        </motion.div>
      )}

      {/* LIST */}
      <div className="flex flex-col gap-3">
        {loading.practicals ? (
          <div className="text-center py-12 text-gray-500">
            Loading practicals...
          </div>
        ) : practicals.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p>No practicals yet</p>
            <p className="text-xs mt-1">Click "Add Practical" to create one</p>
          </div>
        ) : (
          practicals
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-white/10 bg-black/20 p-4 hover:border-purple-400/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-gray-500">
                        #{p.order || 0}
                      </span>
                      <h4 className="text-white font-semibold">{p.title}</h4>
                    </div>
                    {p.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    {p.deadline && (
                      <p
                        className={`flex items-center gap-1 text-xs mt-2 ${
                          isOverdue(p.deadline)
                            ? "text-red-400"
                            : "text-gray-500"
                        }`}
                      >
                        <Clock size={12} />
                        {isOverdue(p.deadline) ? "Overdue: " : "Deadline: "}
                        {formatDeadline(p.deadline)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-500/20 transition"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      disabled={loading.deleting === p._id}
                      className="p-2 rounded-lg bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                    >
                      {loading.deleting === p._id ? (
                        "..."
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
        )}
      </div>
    </div>
  );
}
