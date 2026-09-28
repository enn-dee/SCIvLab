const languageIds = { python: 71, javascript: 63, c: 50, cpp: 54, java: 62 };

const normalise = (value) =>
  String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim();
const inputFor = (input) => {
  if (typeof input === "string") return input;
  if (Array.isArray(input)) return input.join(" ");
  if (input && typeof input === "object") return Object.values(input).join(" ");
  return String(input ?? "");
};

const defaultExecution = { timeLimitSeconds: 5, memoryLimitKb: 128000 };

// ─── Helper: encode to base64 ────────────────────────────────
const encodeBase64 = (str) => Buffer.from(str, "utf-8").toString("base64");

export async function runJudge0Simple({
  sourceCode,
  language,
  stdin = "",
  execution = defaultExecution,
}) {
  const languageId = languageIds[language];
  if (!languageId) throw new Error("Unsupported execution language");

  // Use base64 encoding
  const endpoint =
    process.env.JUDGE0_URL ||
    "https://ce.judge0.com/submissions?base64_encoded=true&wait=true";

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    (execution.timeLimitSeconds + 5) * 1000,
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        source_code: encodeBase64(sourceCode),
        language_id: languageId,
        stdin: encodeBase64(stdin),
        cpu_time_limit: execution.timeLimitSeconds,
        memory_limit: execution.memoryLimitKb,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Judge0 error response:", errorBody);
      throw new Error(`Code runner returned ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    // Judge0 returns base64-encoded stdout/stderr when base64_encoded=true
    const stdout = data.stdout
      ? Buffer.from(data.stdout, "base64").toString("utf-8")
      : "";
    const stderr = data.stderr
      ? Buffer.from(data.stderr, "base64").toString("utf-8")
      : "";
    const compile_output = data.compile_output
      ? Buffer.from(data.compile_output, "base64").toString("utf-8")
      : "";

    return {
      stdout: stdout ?? "",
      stderr: stderr || compile_output || "",
      runtimeMs: data.time ? Math.round(Number(data.time) * 1000) : undefined,
      memoryKb: data.memory,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function runJudge0Cases({
  sourceCode,
  language,
  testCases,
  execution,
}) {
  const languageId = languageIds[language];
  if (!languageId) throw new Error("Unsupported execution language");

  const endpoint =
    process.env.JUDGE0_URL ||
    "https://ce.judge0.com/submissions?base64_encoded=true&wait=true";
  const results = [];

  for (const testCase of testCases) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      (execution.timeLimitSeconds + 5) * 1000,
    );

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          source_code: encodeBase64(sourceCode),
          language_id: languageId,
          stdin: encodeBase64(inputFor(testCase.input)),
          cpu_time_limit: execution.timeLimitSeconds,
          memory_limit: execution.memoryLimitKb,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Judge0 error response:", errorBody);
        throw new Error(
          `Code runner returned ${response.status}: ${errorBody}`,
        );
      }

      const data = await response.json();

      const stdout = data.stdout
        ? Buffer.from(data.stdout, "base64").toString("utf-8")
        : "";
      const stderr = data.stderr
        ? Buffer.from(data.stderr, "base64").toString("utf-8")
        : "";
      const compile_output = data.compile_output
        ? Buffer.from(data.compile_output, "base64").toString("utf-8")
        : "";

      const actualOutput = normalise(stdout);
      const expectedNorm = normalise(String(testCase.expected ?? ""));

      results.push({
        caseId: testCase._id,
        passed: !stderr && !compile_output && actualOutput === expectedNorm,
        weight: testCase.weight || 1,
        runtimeMs: data.time ? Math.round(Number(data.time) * 1000) : undefined,
        memoryKb: data.memory,
        actualOutput,
        expected: testCase.expected,
        input: testCase.input,
        visibility: testCase.visibility,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
  return results;
}
