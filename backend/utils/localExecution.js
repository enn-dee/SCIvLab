import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import crypto from "crypto";

const inputFor = (input) => {
  if (typeof input === "string") return input;
  if (Array.isArray(input)) return input.join(" ");
  if (input && typeof input === "object") return Object.values(input).join(" ");
  return String(input ?? "");
};

const commands = {
  javascript: (dir) => ({ command: process.execPath, args: [path.join(dir, "Main.js")] }),
  python: (dir) => ({ command: process.platform === "win32" ? "python" : "python3", args: [path.join(dir, "Main.py")] }),
  c: (dir) => ({ command: path.join(dir, "Main.exe"), args: [] }),
  cpp: (dir) => ({ command: path.join(dir, "Main.exe"), args: [] }),
  java: (dir) => ({ command: "java", args: ["-cp", dir, "Main"] }),
};

const runProcess = ({ command, args, cwd, input, timeoutMs }) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, windowsHide: true });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Execution timed out"));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, code });
    });
    child.stdin.end(input);
  });

const compile = async (dir, language) => {
  if (language !== "c" && language !== "cpp" && language !== "java") return;
  const compiler =
    language === "java"
      ? { command: "javac", args: ["Main.java"] }
      : {
          command: language === "c" ? "gcc" : "g++",
          args: ["Main." + language, "-O2", "-o", "Main.exe"],
        };
  const result = await runProcess({
    ...compiler,
    cwd: dir,
    input: "",
    timeoutMs: 15000,
  });
  if (result.code !== 0) {
    throw new Error(result.stderr || "Compilation failed");
  }
};

export const runLocalExecution = async ({
  sourceCode,
  language,
  stdin = "",
  timeLimitSeconds = 5,
}) => {
  const commandFactory = commands[language];
  if (!commandFactory) throw new Error(`Unsupported local language: ${language}`);

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "scivlab-"));
  const extension = { javascript: "js", python: "py", c: "c", cpp: "cpp", java: "java" }[language];
  const filePath = path.join(dir, `Main.${extension}`);

  try {
    let source = sourceCode;
    if (language === "java" && !/\bclass\s+Main\b/.test(source)) {
      source = source.replace(/\bpublic\s+class\s+\w+/, "public class Main");
    }
    await fs.writeFile(filePath, source, "utf8");
    await compile(dir, language);
    return await runProcess({
      ...commandFactory(dir),
      cwd: dir,
      input: stdin,
      timeoutMs: Math.max(1000, timeLimitSeconds * 1000),
    });
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
};

export const runLocalCases = async ({
  practical,
  sourceCode,
  language,
  customStdin,
  includeHidden = false,
}) => {
  const tests = customStdin
    ? [{ input: customStdin, expected: "" }]
    : (practical.testCases || []).filter(
        (test) => includeHidden || test.visibility === "public",
      );
  if (!tests.length) throw new Error("No public test cases are available offline");

  const results = [];
  for (const test of tests) {
    const result = await runLocalExecution({
      sourceCode,
      language,
      stdin: inputFor(test.input),
      timeLimitSeconds: practical.execution?.timeLimitSeconds || 5,
    });
    const actualOutput = result.stdout.trim();
    results.push({
      passed: customStdin
        ? !result.stderr && result.code === 0
        : !result.stderr && result.code === 0 && actualOutput === String(test.expected ?? "").trim(),
      actualOutput,
      expected: test.expected,
      hidden: test.visibility !== "public",
      stderr: result.stderr,
    });
  }
  return results;
};
