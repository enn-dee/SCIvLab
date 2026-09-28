import { runJudge0Cases } from "../../utils/judge0.js";

export const exposeResults = (results, testCases) =>
  results.map((result, index) => {
    const testCase = testCases[index];
    return {
      ...result,
      expected: testCase.expected,
      visibility: testCase.visibility,
      hidden: testCase.visibility !== "public",
    };
  });

export const resolveLanguage = (practical, submissionLanguage) => {
  const allowed = practical.execution?.allowedLanguages?.length
    ? practical.execution.allowedLanguages
    : ["python"];
  if (allowed.includes(submissionLanguage)) return submissionLanguage;
  return allowed[0];
};

export const buildSourceCode = (practical, solutionCode, language) => {
  const template = practical.starterTemplate?.[language];
  if (template?.prefix || template?.suffix) {
    return `${template.prefix || ""}\n${solutionCode}\n${template.suffix || ""}`;
  }
  return solutionCode;
};

export const evaluatePracticalSubmission = async (
  practical,
  solutionCode,
  language,
  publicOnly,
) => {
  const sourceCode = buildSourceCode(practical, solutionCode, language);
  const testCases = practical.testCases.filter(
    (test) => !publicOnly || test.visibility === "public",
  );
  if (!testCases.length) throw new Error("No test cases are configured");
  const results = await runJudge0Cases({
    sourceCode,
    language,
    testCases,
    execution: practical.execution,
  });
  return {
    testCases,
    results: results.map((result, index) => ({
      ...result,
      expected: testCases[index].expected,
    })),
  };
};
