const formatInput = (input) => {
  if (typeof input === "string") return input;
  if (Array.isArray(input)) return input.join(" ");
  if (input && typeof input === "object") return JSON.stringify(input);
  return String(input ?? "");
};

const formatOutput = (output) =>
  typeof output === "string" ? output.trim() : String(output ?? "").trim();

export const runOfflineTests = (
  practical,
  solutionCode,
  language,
  customStdin,
  customExpected,
  includeHidden = false,
) => {
  if (language !== "javascript") {
    throw new Error(
      "Offline execution currently supports JavaScript assignments. Reconnect to run this language.",
    );
  }

  const template = practical.starterTemplate?.[language];
  const source = `${template?.prefix || ""}\n${solutionCode}\n${template?.suffix || ""}`;
  const tests = customStdin
    ? [{ input: customStdin, expected: undefined }]
    : customExpected
      ? [{ input: practical.testCases?.[0]?.input ?? "", expected: customExpected }]
    : (practical.testCases || []).filter(
        (test) => includeHidden || test.visibility === "public",
      );

  if (!tests.length) throw new Error("No public test cases are available offline");

  return tests.map((test) => {
    try {
      const execute = new Function(
        "input",
        `${source}\nreturn typeof solve === "function" ? solve(input) : typeof main === "function" ? main(input) : undefined;`,
      );
      const output = formatOutput(execute(formatInput(test.input)));
      return {
        passed: output === formatOutput(test.expected),
        output,
        expected: test.visibility === "public" ? formatOutput(test.expected) : "",
        hidden: test.visibility !== "public",
      };
    } catch (error) {
      return { passed: false, output: "", expected: formatOutput(test.expected), error: error.message };
    }
  });
};
