const matchesExpected = (actual, expected, checker = "exact", tolerance = 0.000001) => {
  const normalise = (value) => String(value ?? "").trim();
  if (checker === "whitespace") {
    return normalise(actual).split(/\s+/).filter(Boolean).join(" ") ===
      normalise(expected).split(/\s+/).filter(Boolean).join(" ");
  }
  if (checker === "unordered_tokens") {
    const actualTokens = normalise(actual).split(/\s+/).filter(Boolean).sort();
    const expectedTokens = normalise(expected).split(/\s+/).filter(Boolean).sort();
    return actualTokens.length === expectedTokens.length &&
      actualTokens.every((token, index) => token === expectedTokens[index]);
  }
  if (checker === "numeric_tolerance") {
    const actualNumbers = normalise(actual).split(/\s+/).filter(Boolean).map(Number);
    const expectedNumbers = normalise(expected).split(/\s+/).filter(Boolean).map(Number);
    return actualNumbers.length === expectedNumbers.length &&
      actualNumbers.every((number, index) =>
        Number.isFinite(number) &&
        Number.isFinite(expectedNumbers[index]) &&
        Math.abs(number - expectedNumbers[index]) <= tolerance,
      );
  }
  return normalise(actual) === normalise(expected);
};

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
      "Offline execution currently not supported. Reconnect to run tests.",
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
        passed: matchesExpected(
          output,
          test.expected,
          test.checker,
          test.tolerance,
        ),
        output,
        expected: formatOutput(test.expected),
        hidden: test.visibility !== "public",
      };
    } catch (error) {
      return { passed: false, output: "", expected: formatOutput(test.expected), error: error.message };
    }
  });
};
