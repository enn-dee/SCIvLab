import mongoose from "mongoose";
import connectDB from "../../config/db.js";
import Algorithm from "../../models/Algorithm.js";

const seedOneAlgorithm = async () => {
  await connectDB();

  // Optional: remove only this algorithm if it already exists
  await Algorithm.deleteOne({ slug: "palindrome-check" });

  const palindromeData = {
    order: 1,
    slug: "palindrome-check",
    title: "Palindrome Check",
    category: "Fundamentals",
    description: "Write a function that returns true if a given string reads the same forwards and backwards, and false otherwise.",
    problem: {
      statement: "Given a string s, return true if it is a palindrome, false otherwise.",
      inputFormat: "A single string s (may contain letters, digits, spaces, punctuation).",
      outputFormat: "Boolean true/false.",
      constraints: "1 ≤ s.length ≤ 10^5",
      starterCode: {
        python: `def is_palindrome(s: str) -> bool:
    #edit below this line to solve the problem


def solve():
    s = input().strip()
    result = is_palindrome(s)
    print(str(result).lower())


if __name__ == "__main__":
    solve()`
      }
    },
    examples: [
      { input: "racecar", output: true, explanation: "racecar reads the same forwards and backwards" },
      { input: "hello", output: false, explanation: "hello reversed is 'olleh', which is different" }
    ],
    testCases: [
      { input: "racecar", expected: true },
      { input: "hello", expected: false },
      { input: "A", expected: true },
      { input: "ab", expected: false }
    ],
    theory: {
      description: "A Palindrome Check determines whether a given string or array reads the same forwards and backwards. The classic approach uses two pointers — one starting at the beginning and one at the end — comparing characters and moving inward until they meet.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)"
    },
    keyPoints: [
      "Compares characters from both ends moving inward",
      "Stops as soon as a mismatch is found",
      "Works on strings and arrays alike"
    ],
    pros: [
      "Linear time complexity",
      "Constant extra space with two-pointer approach",
      "Simple and intuitive logic"
    ],
    cons: [
      "Case-sensitive by default (needs preprocessing for real-world use)",
      "Special characters and spaces must be handled separately"
    ],
    input: { array: ["r", "a", "c", "e", "c", "a", "r"], target: null },
    animationSteps: [
      { array: ["r", "a", "c", "e", "c", "a", "r"], active: [0, 6], found: true, message: "Compare index 0 ('r') and index 6 ('r'). Match!" },
      { array: ["r", "a", "c", "e", "c", "a", "r"], active: [1, 5], found: true, message: "Compare index 1 ('a') and index 5 ('a'). Match!" },
      { array: ["r", "a", "c", "e", "c", "a", "r"], active: [2, 4], found: true, message: "Compare index 2 ('c') and index 4 ('c'). Match!" },
      { array: ["r", "a", "c", "e", "c", "a", "r"], active: [3], found: true, message: "Pointers met at center." },
      { array: ["r", "a", "c", "e", "c", "a", "r"], active: [0, 1, 2, 3, 4, 5, 6], found: true, message: "It is a Palindrome!" }
    ],
    flowChartData: {
      rawNodes: [
        { id: "start", type: "terminalNode", data: { label: "Start", background: "#d1fae5", borderColor: "#10b981" } },
        { id: "input", type: "ioNode", data: { label: "Input string s", background: "#fef3c7", borderColor: "#f59e0b" } },
        { id: "init", type: "processNode", data: { label: "left = 0\nright = n - 1", background: "#fecaca", borderColor: "#ef4444" } },
        { id: "check_pointers", type: "decisionNode", data: { label: "left < right ?", background: "#dbeafe", borderColor: "#3b82f6" } },
        { id: "compare", type: "decisionNode", data: { label: "s[left] == s[right] ?", background: "#dbeafe", borderColor: "#3b82f6" } },
        { id: "not_palindrome", type: "ioNode", data: { label: "Not a Palindrome", background: "#e9d5ff", borderColor: "#8b5cf6" } },
        { id: "move_pointers", type: "processNode", data: { label: "left++\nright--", background: "#fde68a", borderColor: "#f59e0b" } },
        { id: "palindrome", type: "ioNode", data: { label: "Is a Palindrome", background: "#bbf7d0", borderColor: "#22c55e" } },
        { id: "end", type: "terminalNode", data: { label: "End", background: "#d1fae5", borderColor: "#10b981" } }
      ],
      rawEdges: [
        { id: "e1", source: "start", target: "input" },
        { id: "e2", source: "input", target: "init" },
        { id: "e3", source: "init", target: "check_pointers" },
        { id: "e4", source: "check_pointers", target: "compare", label: "Yes" },
        { id: "e5", source: "check_pointers", target: "palindrome", label: "No" },
        { id: "e6", source: "compare", target: "move_pointers", label: "Yes" },
        { id: "e7", source: "compare", target: "not_palindrome", label: "No" },
        { id: "e8", source: "move_pointers", target: "check_pointers" },
        { id: "e9", source: "palindrome", target: "end" },
        { id: "e10", source: "not_palindrome", target: "end" }
      ]
    },
    code: {
      python: `def is_palindrome(s: str) -> bool:
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True`
    },
    pseudocode: {
      lines: [
        "Procedure palindrome_check",
        "   s ← input string",
        "   left ← 0",
        "   right ← length(s) - 1",
        "   while left < right",
        "      if s[left] ≠ s[right]",
        "         return NOT PALINDROME",
        "      left ← left + 1",
        "      right ← right - 1",
        "   return PALINDROME",
        "end procedure"
      ]
    },
    verified: true
  }

  try {
    const result = await Algorithm.create(palindromeData);
    console.log("✅ Single algorithm inserted:", result.slug);
  } catch (error) {
    console.error(" Insert failed:", error.message);
  } finally {
    process.exit();
  }
};

seedOneAlgorithm();
