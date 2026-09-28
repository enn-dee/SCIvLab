import React, { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";

import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useTheme } from "@/contexts/ThemeContext.jsx";

import {
  Play,
  Send,
  CheckCircle,
  VerifiedIcon,
  X,
  RotateCcw,
  Code2,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";

import { apiFetch } from "@/api/client.js";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../../../components/ui/resizable";

function CodeTab({ algo }) {
  const [code, setCode] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const editorRef = useRef(null);
  const { theme } = useTheme();

  const getTemplate = () => {
    const starter = algo?.problem?.starterCode?.python || "";
    const marker = "#edit below this line to solve the problem";
    const markerIndex = starter.indexOf(marker);
    const suffixIndex = starter.indexOf("\n\ndef solve():");

    if (
      markerIndex === -1 ||
      suffixIndex === -1 ||
      suffixIndex <= markerIndex
    ) {
      return { prefix: "", suffix: "", starterSolution: starter };
    }

    const markerEnd = starter.indexOf("\n", markerIndex) + 1;
    return {
      prefix: starter.slice(0, markerEnd),
      suffix: starter.slice(suffixIndex),
      starterSolution: starter.slice(markerEnd, suffixIndex).trim(),
    };
  };

  const sourceCode = () => {
    const template = getTemplate();
    return `${template.prefix}${code}${template.suffix}`;
  };

  const extractSolution = (savedCode) => {
    const template = getTemplate();
    if (
      template.prefix &&
      savedCode.startsWith(template.prefix) &&
      savedCode.endsWith(template.suffix)
    ) {
      return savedCode
        .slice(
          template.prefix.length,
          savedCode.length - template.suffix.length,
        )
        .trim();
    }
    return savedCode;
  };

  // ================= RESET =================

  const handleReset = async () => {
    const confirmReset = window.confirm("Reset your code to starter template?");

    if (!confirmReset) return;

    try {
      const starterCode = getTemplate().starterSolution;

      setCode(starterCode);
      setResults([]);
      setSubmitted(false);
      setCustomInput("");

      // ✅ FIXED: Use algo-progress endpoint
      await apiFetch(`algo-progress/reset/${algo.slug}`, {
        method: "DELETE",
      });

      toast.success("Code reset to template");
    } catch (err) {
      console.error("Failed resetting code:", err);
      toast.error("Failed to reset code");
    }
  };

  // ================= LOAD SAVED CODE =================

  useEffect(() => {
    if (!algo) return;

    const loadSavedCode = async () => {
      try {
        const res = await apiFetch(`algo-progress/${algo.slug}`);

        const data = await res.json();
        // console.log("data: ", data)
        if (data?.submission?.code) {
          setCode(extractSolution(data.submission.code));

          if (data.submission.passed) {
            setSubmitted(true);
          }
        } else {
          setCode(getTemplate().starterSolution);
        }
      } catch (err) {
        console.error("Failed loading saved code:", err);

        setCode(getTemplate().starterSolution);
      }
    };

    loadSavedCode();
  }, [algo]);

  // ================= CODE CHANGE =================

  const handleCodeChange = (value) => {
    setCode(value || "");
  };

  // ================= HELPERS =================

  const formatInput = (input) => {
    if (typeof input === "string") {
      return input;
    }

    if (Array.isArray(input)) {
      return input.join(" ");
    }

    if (typeof input === "object") {
      return Object.values(input).join(" ");
    }

    return String(input);
  };

  const formatOutput = (output) => {
    if (typeof output === "string") {
      return output.trim();
    }

    return String(output).trim();
  };

  const formatDisplay = (val) => {
    if (Array.isArray(val)) {
      return val.join(" ");
    }

    if (typeof val === "object") {
      return Object.values(val).join(" ");
    }

    return String(val);
  };

  // ================= JUDGE0 =================

  const runCode = async ({ code, input }) => {
    const response = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          source_code: code,
          language_id: 71,
          stdin: input,
        }),
      },
    );

    const data = await response.json();

    return {
      stdout: data.stdout ?? "",
      stderr: data.stderr ?? "",
      compile_output: data.compile_output ?? "",
    };
  };

  // ================= RUN =================

  const handleRun = async () => {
    toast.loading("Running code tests...");

    setLoading(true);
    setResults([]);

    try {
      const tests = algo.examples || [];

      const promises = tests.map((test) =>
        runCode({
          code: sourceCode(),
          input: customInput || formatInput(test.input),
        }),
      );

      const outputs = await Promise.all(promises);

      const resultsArray = outputs.map((res, i) => {
        const output = formatOutput(res.stdout);

        const expected = formatOutput(tests[i].output);

        const error = res.stderr || res.compile_output;

        return {
          passed: !error && output === expected,
          output,
          expected,
          error,
        };
      });
      toast.dismiss();
      setResults(resultsArray);
    } catch (err) {
      setResults([
        {
          passed: false,
          error: err.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ================= SUBMIT =================

  const handleSubmit = async () => {
    const loadingToast = toast.loading("Running all test cases...");

    setLoading(true);
    setResults([]);

    try {
      const tests = algo.testCases || [];

      const resultsArray = [];

      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];

        const res = await runCode({
          code: sourceCode(),
          input: formatInput(test.input),
        });

        const output = formatOutput(res.stdout);

        const expected = formatOutput(test.expected);

        const error = res.stderr || res.compile_output;

        const passed = !error && output === expected;

        resultsArray.push({
          passed,
          output,
          expected,
          error,
        });

        // STOP ON FIRST FAIL

        if (!passed) {
          setResults(resultsArray);

          // ✅ FIXED: Use algo-progress/save endpoint
          await apiFetch("algo-progress/save", {
            method: "POST",

            body: JSON.stringify({
              algorithmSlug: algo.slug,
              code: sourceCode(),
              language: "python",
              passed: false,
            }),
          });

          toast.dismiss(loadingToast);
          toast.error("Tests failed! Keep trying.");
          setLoading(false);

          return;
        }
      }

      // ✅ This endpoint stays the same - it's correct (progress/complete)
      await apiFetch("progress/complete", {
        method: "POST",

        body: JSON.stringify({
          algorithmSlug: algo.slug,
        }),
      });

      // ✅ FIXED: Use algo-progress/save endpoint
      await apiFetch("algo-progress/save", {
        method: "POST",

        body: JSON.stringify({
          algorithmSlug: algo.slug,
          code: sourceCode(),
          language: "python",
          passed: true,
        }),
      });

      setSubmitted(true);

      setResults([
        {
          passed: true,
          message: "🎉 All hidden test cases passed! Algorithm completed.",
        },
      ]);

      toast.dismiss(loadingToast);
      toast.success("All tests passed! Algorithm completed! 🎉");
    } catch (err) {
      setResults([
        {
          passed: false,
          error: err.message,
        },
      ]);

      toast.dismiss(loadingToast);
      toast.error("Error submitting code");
    } finally {
      setLoading(false);
    }
  };

  const handleEditorMount = (editor, monaco) => {
    const errorMsg = "Copy-Paste not allowed";
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
      toast.error(errorMsg);
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      toast.error(errorMsg);
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
      toast.error(errorMsg);
    });
  };

  return (
    <div className="h-[80vh] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
      <ResizablePanelGroup direction="horizontal">
        {/* LEFT PANEL */}

        <ResizablePanel defaultSize={30} minSize={22}>
          <div className="h-full overflow-y-auto border-r border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-5">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1">
                  <Sparkles size={13} className="text-emerald-400" />

                  <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-300">
                    Coding Challenge
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white">{algo.title}</h2>
            </div>

            {/* PROBLEM */}

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Problem Statement
                </h3>

                <p className="whitespace-pre-line text-sm leading-7 text-gray-300">
                  {algo.problem?.statement}
                </p>
              </div>

              {algo.problem?.inputFormat && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Input Format
                  </h3>

                  <p className="whitespace-pre-line text-sm leading-6 text-gray-400">
                    {algo.problem.inputFormat}
                  </p>
                </div>
              )}

              {algo.problem?.outputFormat && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                    Output Format
                  </h3>

                  <p className="whitespace-pre-line text-sm leading-6 text-gray-400">
                    {algo.problem.outputFormat}
                  </p>
                </div>
              )}

              {algo.problem?.constraints && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-400">
                    Constraints
                  </h3>

                  <p className="whitespace-pre-line text-sm leading-6 text-gray-400">
                    {algo.problem.constraints}
                  </p>
                </div>
              )}

              {/* EXAMPLES */}

              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Examples
                </h3>

                {(algo.examples || []).map((ex, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -2 }}
                    className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-4 shadow-lg"
                  >
                    <div className="space-y-2 text-xs font-mono">
                      <div className="text-cyan-300">
                        <span className="text-gray-500">Input:</span>{" "}
                        {formatDisplay(ex.input)}
                      </div>

                      <div className="text-emerald-300">
                        <span className="text-gray-500">Output:</span>{" "}
                        {formatDisplay(ex.output)}
                      </div>

                      {ex.explanation && (
                        <div className="pt-2 text-gray-400 leading-6">
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* RIGHT PANEL */}

        <ResizablePanel defaultSize={70}>
          <ResizablePanelGroup direction="vertical">
            {/* EDITOR */}

            <ResizablePanel defaultSize={70}>
              <div className="flex h-full flex-col bg-[#0a0a0a]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Code2 size={15} />

                    <span>Python Editor</span>
                  </div>

                  <div className="text-xs text-gray-500">Monaco IDE</div>
                </div>

                {/* <div className="mb-2 flex items-center justify-between text-xs text-cyan-300">
                  <span>{getTemplate().prefix ? "Starter code + editable solution" : "Editor"}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                    Read-only starter
                  </span>
                </div> */}

                <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]">
                  {getTemplate().prefix && (
                    <div className="">
                      <Editor
                        className="pointer-events-none cursor-none"
                        onMount={handleEditorMount}
                        key={`${algo.slug}-prefix`}
                        height={`${Math.max(
                          50,
                          getTemplate().prefix.split("\n").length + 1,
                        )}px`}
                        theme={theme === "light" ? "vs" : "vs-dark"}
                        language="python"
                        value={getTemplate().prefix.replace(/\n+$/, "")}
                        options={{
                          readOnly: true,
                          domReadOnly: true,
                          contextmenu: false,
                          dragAndDrop: false,
                          selectionHighlight: false,
                          fontSize: 14,
                          minimap: { enabled: false },
                          smoothScrolling: true,
                          padding: { top: 12, bottom: 0 },
                          scrollBeyondLastLine: false,
                          scrollbar: {
                            vertical: "hidden",
                            horizontal: "hidden",
                            handleMouseWheel: false,
                          },
                          lineNumbers: "off",
                          glyphMargin: false,
                          folding: false,
                          wordWrap: "on",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <Editor
                      key={algo.slug}
                      height="100%"
                      theme={theme === "light" ? "vs" : "vs-dark"}
                      language="python"
                      value={code}
                      onChange={handleCodeChange}
                      onMount={handleEditorMount}
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        smoothScrolling: true,
                        padding: { top: 0, bottom: 0 },
                        scrollBeyondLastLine: false,
                        lineNumbers: "off",
                        glyphMargin: false,
                        folding: false,
                        wordWrap: "on",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* RESULTS PANEL */}

            <ResizablePanel defaultSize={30}>
              <div className="flex h-full flex-col border-t border-white/10 bg-[#050505]">
                {/* ACTIONS */}

                <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-3">
                  <Button
                    onClick={handleRun}
                    disabled={loading}
                    className="gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:opacity-90"
                  >
                    <Play size={15} />
                    Run
                  </Button>

                  {!submitted && (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:opacity-90"
                    >
                      <Send size={15} />
                      Submit
                    </Button>
                  )}

                  <Button
                    onClick={handleReset}
                    disabled={loading}
                    className="gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    <RotateCcw size={15} />
                    Reset
                  </Button>

                  {submitted && (
                    <div className="ml-auto flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-300">
                      <CheckCircle size={15} />
                      Completed
                    </div>
                  )}
                </div>

                {/* RESULTS */}

                <div className="flex-1 overflow-y-auto p-3">
                  {results.length === 0 && (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      Run your code to see execution results...
                    </div>
                  )}

                  <div className="space-y-3">
                    {results.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl border p-4 ${
                          r.passed
                            ? "border-emerald-500/20 bg-emerald-500/[0.06]"
                            : "border-red-500/20 bg-red-500/[0.06]"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-medium">
                          {r.passed ? (
                            <VerifiedIcon
                              size={18}
                              className="text-emerald-400"
                            />
                          ) : (
                            <X size={18} className="text-red-400" />
                          )}

                          <span
                            className={
                              r.passed ? "text-emerald-300" : "text-red-300"
                            }
                          >
                            Test {i + 1} — {r.passed ? "Passed" : "Failed"}
                          </span>
                        </div>

                        {!r.passed && (
                          <div className="mt-3 space-y-1 pl-7 text-sm">
                            <div className="text-gray-400">
                              Expected:{" "}
                              <span className="text-white">{r.expected}</span>
                            </div>

                            <div className="text-gray-400">
                              Got:{" "}
                              <span className="text-white">{r.output}</span>
                            </div>
                          </div>
                        )}

                        {r.error && (
                          <div className="mt-3 rounded-xl bg-black/30 p-3 text-sm text-red-300">
                            {r.error}
                          </div>
                        )}

                        {r.message && (
                          <div className="mt-3 rounded-xl bg-black/30 p-3 text-sm text-emerald-300">
                            {r.message}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default CodeTab;
