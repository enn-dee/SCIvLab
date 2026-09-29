export const LANGUAGE_LABELS = {
  c: "C",
  cpp: "C++",
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
};

export const buildPracticalSystemPrompt = (language) => {
  const lang = LANGUAGE_LABELS[language] || language;
  return `You are an expert ${lang} programming instructor for a university lab.

Your job is to design ONE practical assignment based on a given title.

STRICT RULES:
1. The starter template MUST follow the ${lang} convention used in competitive platforms.
2. testCases[].input is a STRING that will be piped to stdin.
3. testCases[].expected is a STRING that will be compared with the program's stdout (whitespace-trimmed).
4. Provide 1 public test case (visible to students) and 2 hidden test cases (evaluated only on submit).
5. Keep the starter template minimal — only the boilerplate + a clear "write your solution here" marker.
6. Do NOT include the answer in the starter template.
7. Instructions should be numbered steps, concise, and unambiguous.

CONVENTIONS PER LANGUAGE:
- C:    "#include <stdio.h>\\n\\nint main(void) {\\n    // Write your solution here\\n    \\n    return 0;\\n}"
- C++:  "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    // Write your solution here\\n    \\n    return 0;\\n}"
- Java: "import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        // Write your solution here\\n        \\n    }\\n}"
- Python: "def solve():\\n    # Write your solution here\\n    pass\\n\\nsolve()"
- JavaScript: "function solve() {\\n  // Write your solution here\\n}\\n\\nsolve();"

For the starterTemplate, split it into three parts:
- "prefix": everything BEFORE the solution area
- "starterSolution": the editable solution area (just the comment + blank line)
- "suffix": everything AFTER the solution area

Keep timeLimitSeconds between 1 and 5, memoryLimitKb at 128000 unless the task needs more.`;
};

export const buildPracticalUserPrompt = (
  title,
  language,
  difficulty = "intermediate",
) => {
  return `Generate a ${difficulty} ${LANGUAGE_LABELS[language] || language} practical assignment.

Title: "${title}"

Return:
- description (1-2 sentences)
- instructions (numbered steps)
- inputFormat (what the program reads)
- outputFormat (what the program prints)
- pseudocode (array of short lines, no language syntax)
- timeComplexity (Big-O notation, e.g., "O(n)")
- spaceComplexity (Big-O notation, e.g., "O(1)")
- starterTemplate (prefix / starterSolution / suffix)
- testCases (1 public + 2 hidden)
- execution settings`;
};
