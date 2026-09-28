import connectDB from "../../config/db.js";
import Algorithm from "../../models/Algorithm.js";

const seed = async () => {
  await connectDB();

  await Algorithm.deleteMany();

  const algorithms = [
    // 1. Palindrome Check
    {
      order: 1,
      slug: "palindrome-check",
      title: "Palindrome Check",
      category: "Fundamentals",
      description:
        "Write a function that returns true if a given string reads the same forwards and backwards, and false otherwise.",
      problem: {
        statement:
          "Given a string s, return true if it is a palindrome, false otherwise.",
        inputFormat:
          "A single string s (may contain letters, digits, spaces, punctuation).",
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
    solve()`,
        },
      },
      examples: [
        {
          input: "racecar",
          output: true,
          explanation: "racecar reads the same forwards and backwards",
        },
        {
          input: "hello",
          output: false,
          explanation: "hello reversed is 'olleh', which is different",
        },
      ],
      testCases: [
        { input: "racecar", expected: true },
        { input: "hello", expected: false },
        { input: "A", expected: true },
        { input: "ab", expected: false },
      ],
      theory: {
        description:
          "A Palindrome Check determines whether a given string or array reads the same forwards and backwards. The palindrome problem is a classic algorithmic challenge that tests understanding of two-pointer techniques and string manipulation. \n\nWhen checking if a string is a palindrome, the most efficient approach uses two pointers — one starting at the beginning (left) and one at the end (right). These pointers move toward each other, comparing characters at each step. If at any point the characters don't match, the string is not a palindrome. If the pointers cross or meet without finding any mismatches, the string is a palindrome.\n\nThis algorithm works on both odd and even length strings. For odd-length strings, the middle character is automatically valid since it compares with itself. Common variations include ignoring case sensitivity, ignoring non-alphanumeric characters (for checking phrases like 'A man, a plan, a canal: Panama'), or checking palindrome for numbers.\n\nThe two-pointer approach is optimal because it only requires a single pass through the string, checking each character at most once. This algorithm can be extended to check if a linked list is a palindrome or to find the longest palindromic substring (which requires dynamic programming).\n\nEdge cases to consider: empty strings (typically considered palindromes), single-character strings (always palindromes), strings with spaces and punctuation, very long strings (up to 10^5 characters), and Unicode characters which might require special handling.",
        timeComplexity: "O(1), O(n)",
        spaceComplexity: "O(1) - Only two pointer variables are used regardless of input size. No additional data structures needed."
      },
      keyPoints: [
        "Compares characters from both ends moving inward",
        "Stops as soon as a mismatch is found",
        "Works on strings and arrays alike",
      ],
      pros: [
        "Linear time complexity",
        "Constant extra space with two-pointer approach",
        "Simple and intuitive logic",
      ],
      cons: [
        "Case-sensitive by default (needs preprocessing for real-world use)",
        "Special characters and spaces must be handled separately",
      ],
      input: { array: ["r", "a", "c", "e", "c", "a", "r"], target: null },
      animationSteps: [
        {
          array: ["r", "a", "c", "e", "c", "a", "r"],
          active: [0, 6],
          found: true,
          message: "Compare index 0 ('r') and index 6 ('r'). Match!",
        },
        {
          array: ["r", "a", "c", "e", "c", "a", "r"],
          active: [1, 5],
          found: true,
          message: "Compare index 1 ('a') and index 5 ('a'). Match!",
        },
        {
          array: ["r", "a", "c", "e", "c", "a", "r"],
          active: [2, 4],
          found: true,
          message: "Compare index 2 ('c') and index 4 ('c'). Match!",
        },
        {
          array: ["r", "a", "c", "e", "c", "a", "r"],
          active: [3],
          found: true,
          message: "Pointers met at center.",
        },
        {
          array: ["r", "a", "c", "e", "c", "a", "r"],
          active: [0, 1, 2, 3, 4, 5, 6],
          found: true,
          message: "It is a Palindrome!",
        },
      ],
      flowChartData: {
        rawNodes: [
          {
            id: "start",
            type: "terminalNode",
            data: {
              label: "Start",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
          {
            id: "input",
            type: "ioNode",
            data: {
              label: "Input string s",
              background: "#fef3c7",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "init",
            type: "processNode",
            data: {
              label: "left = 0\nright = n - 1",
              background: "#fecaca",
              borderColor: "#ef4444",
            },
          },
          {
            id: "check_pointers",
            type: "decisionNode",
            data: {
              label: "left < right ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "compare",
            type: "decisionNode",
            data: {
              label: "s[left] == s[right] ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "not_palindrome",
            type: "ioNode",
            data: {
              label: "Not a Palindrome",
              background: "#e9d5ff",
              borderColor: "#8b5cf6",
            },
          },
          {
            id: "move_pointers",
            type: "processNode",
            data: {
              label: "left++\nright--",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "palindrome",
            type: "ioNode",
            data: {
              label: "Is a Palindrome",
              background: "#bbf7d0",
              borderColor: "#22c55e",
            },
          },
          {
            id: "end",
            type: "terminalNode",
            data: {
              label: "End",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
        ],
        rawEdges: [
          { id: "e1", source: "start", target: "input" },
          { id: "e2", source: "input", target: "init" },
          { id: "e3", source: "init", target: "check_pointers" },
          {
            id: "e4",
            source: "check_pointers",
            target: "compare",
            label: "Yes",
          },
          {
            id: "e5",
            source: "check_pointers",
            target: "palindrome",
            label: "No",
            sourceHandle: "right",
          },
          {
            id: "e6",
            source: "compare",
            target: "move_pointers",
            label: "Yes",
          },
          {
            id: "e7",
            source: "compare",
            target: "not_palindrome",
            label: "No",
            sourceHandle: "left",
          },
          { id: "e8", source: "move_pointers", target: "check_pointers" },
          { id: "e9", source: "palindrome", target: "end" },
          { id: "e10", source: "not_palindrome", target: "end" },
        ],
      },
      code: {
        python: `def is_palindrome(s: str) -> bool:
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True`,
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
          "end procedure",
        ],
      },
      verified: true,
    },

    // 2. Sum of Two Numbers
    {
      order: 2,
      slug: "sum-of-two-numbers",
      title: "Sum of Two Numbers",
      category: "Basic Math",
      description:
        "Write a function that takes two integers and returns their sum.",
      problem: {
        statement: "Given two integers a and b, return their sum.",
        inputFormat: "Two space‑separated integers a and b.",
        outputFormat: "A single integer representing a + b.",
        constraints: "-10^9 ≤ a, b ≤ 10^9",
        starterCode: {
          python: `def add(a: int, b: int) -> int:
    #edit below this line to solve the problem


def solve():
    a, b = map(int, input().split())
    result = add(a, b)
    print(result)


if __name__ == "__main__":
    solve()`,
        },
      },
      examples: [
        { input: "2 3", output: 5, explanation: "2 + 3 = 5" },
        { input: "-1 5", output: 4, explanation: "-1 + 5 = 4" },
      ],
      testCases: [
        { input: "1 1", expected: 2 },
        { input: "10 -3", expected: 7 },
        { input: "0 0", expected: 0 },
        { input: "-5 -7", expected: -12 },
      ],
      theory: {
        description:
          "Addition is the most fundamental arithmetic operation in computer science, serving as the building block for more complex mathematical computations. At the hardware level, addition is implemented using logic gates (specifically half-adders and full-adders) that form the Arithmetic Logic Unit (ALU) of a processor.\n\nThe addition operation in programming is typically implemented using the '+' operator, which for integers is a constant-time operation in most programming languages. However, understanding how addition works at a deeper level reveals interesting concepts like two's complement for representing negative numbers, overflow handling, and the difference between signed and unsigned integer addition.\n\nWhen adding two numbers, several important considerations come into play:\n-  Integer overflow : In many languages, adding numbers beyond the maximum representable value wraps around (in C/C++) or raises an exception (in Python with big integers)\n-  Sign handling : Negative numbers are handled automatically through two's complement representation\n-  Precision : For floating-point numbers, addition can lead to precision issues due to IEEE 754 representation\n\nThis simple operation teaches fundamental concepts about data types, memory representation, and the limits of computer arithmetic. It's also the basis for understanding more complex operations like subtraction (adding a negative), multiplication (repeated addition), and even algorithmic concepts like prefix sums and cumulative totals.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1) - Only the input parameters and return value are stored, no additional data structures needed."
      },
      keyPoints: ["Use the + operator", "Handle negative numbers correctly"],
      pros: ["Trivial to implement", "Constant time"],
      cons: ["Too simple for experienced developers"],
      input: { array: [5, 7], target: null },
      animationSteps: [
        {
          array: [5, 7],
          active: [0],
          found: false,
          message: "Read first number: 5",
        },
        {
          array: [5, 7],
          active: [1],
          found: false,
          message: "Read second number: 7",
        },
        {
          array: [5, 7],
          active: [0, 1],
          found: true,
          message: "Add them: 5 + 7 = 12. Return 12.",
        },
      ],
      flowChartData: {
        rawNodes: [
          {
            id: "start",
            type: "terminalNode",
            data: {
              label: "Start",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
          {
            id: "input",
            type: "ioNode",
            data: {
              label: "Read a and b",
              background: "#fef3c7",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "calc",
            type: "processNode",
            data: {
              label: "sum = a + b",
              background: "#fecaca",
              borderColor: "#ef4444",
            },
          },
          {
            id: "output",
            type: "ioNode",
            data: {
              label: "Print sum",
              background: "#bbf7d0",
              borderColor: "#22c55e",
            },
          },
          {
            id: "end",
            type: "terminalNode",
            data: {
              label: "End",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
        ],
        rawEdges: [
          { id: "e1", source: "start", target: "input" },
          { id: "e2", source: "input", target: "calc" },
          { id: "e3", source: "calc", target: "output" },
          { id: "e4", source: "output", target: "end" },
        ],
      },
      code: {
        python: `def add(a: int, b: int) -> int:
    return a + b`,
      },
      pseudocode: {
        lines: ["function add(a, b)", "   return a + b", "end function"],
      },
      verified: true,
    },

    // 3. Maximum of Three Numbers
    {
      order: 3,
      slug: "maximum-of-three",
      title: "Maximum of Three Numbers",
      category: "Basic Math",
      description:
        "Write a function that returns the largest of three given integers.",
      problem: {
        statement:
          "Given three integers a, b, c, return the maximum value among them.",
        inputFormat: "Three space‑separated integers a b c.",
        outputFormat: "A single integer – the maximum.",
        constraints: "-10^9 ≤ a, b, c ≤ 10^9",
        starterCode: {
          python: `def max_of_three(a: int, b: int, c: int) -> int:
    #edit below this line to solve the problem


def solve():
    a, b, c = map(int, input().split())
    result = max_of_three(a, b, c)
    print(result)


if __name__ == "__main__":
    solve()`,
        },
      },
      examples: [
        { input: "5 9 2", output: 9, explanation: "9 is the largest" },
        {
          input: "-1 -5 -3",
          output: -1,
          explanation: "-1 is the largest (closest to zero)",
        },
      ],
      testCases: [
        { input: "10 20 15", expected: 20 },
        { input: "7 7 7", expected: 7 },
        { input: "-10 -20 -5", expected: -5 },
      ],
      theory: {
        description:
          "Finding the maximum of multiple numbers is a fundamental problem that introduces conditional logic and comparison operations. While seemingly trivial, this problem teaches important concepts about decision-making in algorithms, comparison operators, and the importance of handling edge cases.\n\nThe maximum (or minimum) finding algorithm is essentially a search problem where we track the best candidate seen so far. This pattern appears repeatedly in more complex algorithms, such as finding the maximum subarray sum (Kadane's algorithm), finding peaks in arrays, or implementing priority queues.\n\nFor three numbers, we have multiple valid approaches:\n1.  Nested conditionals : Compare a vs b, then compare the winner vs c\n2.  Logical operators : Use AND conditions like `a >= b and a >= c`\n3.  Built-in functions : Use `max()` or `Math.max()`\n4.  Reduction approach : Initialize max = a, then compare with b and c sequentially\n\nEach approach has its own merits. Nested conditionals are explicit and educational, showing the decision tree. Logical operators provide a more declarative style. Built-in functions are concise but abstract away the logic. The reduction approach scales well to any number of inputs.\n\nImportant considerations when finding maximum values:\n-  Equal values : When numbers are equal, any of them is considered the maximum\n-  Negative numbers : Comparisons work correctly with negatives (e.g., -1 > -5)\n-  Large numbers : Should handle numbers at the extremes of integer ranges\n-  Type handling : Ensure consistent comparison rules (e.g., integers vs floats)\n\nThis problem extends naturally to finding maximum in an array (which requires iteration), finding top K maximum values (using heaps), or finding maximum with custom comparison logic (using comparators). Understanding this simple case builds intuition for more complex optimization problems.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1) - Only the three input parameters are stored, no auxiliary data structures needed."
      },
      keyPoints: [
        "Use nested if statements or logical operators",
        "Edge case: equal numbers",
      ],
      pros: ["Teaches conditionals", "Simple"],
      cons: ["Trivial for advanced users"],
      input: { array: [12, 45, 23], target: null },
      animationSteps: [
        {
          array: [12, 45, 23],
          active: [0, 1],
          found: false,
          message: "Compare 12 and 45 → max = 45",
        },
        {
          array: [12, 45, 23],
          active: [1, 2],
          found: false,
          message: "Compare 45 and 23 → max = 45",
        },
        {
          array: [12, 45, 23],
          active: [1],
          found: true,
          message: "Final maximum is 45",
        },
      ],
      flowChartData: {
        rawNodes: [
          {
            id: "start",
            type: "terminalNode",
            data: {
              label: "Start",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
          {
            id: "cmp1",
            type: "decisionNode",
            data: {
              label: "a ≥ b ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "cmp2",
            type: "decisionNode",
            data: {
              label: "a ≥ c ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "cmp3",
            type: "decisionNode",
            data: {
              label: "b ≥ c ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "out_a",
            type: "ioNode",
            data: {
              label: "return a",
              background: "#bbf7d0",
              borderColor: "#22c55e",
            },
          },
          {
            id: "out_b",
            type: "ioNode",
            data: {
              label: "return b",
              background: "#bbf7d0",
              borderColor: "#22c55e",
            },
          },
          {
            id: "out_c",
            type: "ioNode",
            data: {
              label: "return c",
              background: "#bbf7d0",
              borderColor: "#22c55e",
            },
          },
        ],
        rawEdges: [
          { id: "e1", source: "start", target: "cmp1" },
          {
            id: "e2",
            source: "cmp1",
            target: "cmp2",
            label: "Yes",
            sourceHandle: "left",
          },
          {
            id: "e3",
            source: "cmp1",
            target: "cmp3",
            label: "No",
            sourceHandle: "right",
          },
          { id: "e4", source: "cmp2", target: "out_a", label: "Yes" },
          {
            id: "e5",
            source: "cmp2",
            target: "out_c",
            label: "No",
            sourceHandle: "right",
          },
          {
            id: "e6",
            source: "cmp3",
            target: "out_b",
            label: "Yes",
            sourceHandle: "right",
          },
          { id: "e7", source: "cmp3", target: "out_c", label: "No" },
        ],
      },
      code: {
        python: `def max_of_three(a: int, b: int, c: int) -> int:
    return max(a, b, c)`,
      },
      pseudocode: {
        lines: [
          "function maxOfThree(a, b, c)",
          "   if a >= b and a >= c: return a",
          "   if b >= a and b >= c: return b",
          "   return c",
          "end function",
        ],
      },
      verified: true,
    },

    // 4. Factorial (iterative)
    {
      order: 4,
      slug: "factorial",
      title: "Factorial",
      category: "Basic Math",
      description:
        "Compute the factorial of a non‑negative integer n (n! = n × (n‑1) × ... × 1, with 0! = 1).",
      problem: {
        statement: "Given a non‑negative integer n, return n! (n factorial).",
        inputFormat: "A single integer n.",
        outputFormat: "Integer representing n!.",
        constraints: "0 ≤ n ≤ 20",
        starterCode: {
          python: `def factorial(n: int) -> int:
    #edit below this line to solve the problem


def solve():
    n = int(input().strip())
    result = factorial(n)
    print(result)


if __name__ == "__main__":
    solve()`,
        },
      },
      examples: [
        { input: "5", output: 120, explanation: "5! = 5×4×3×2×1 = 120" },
        { input: "0", output: 1, explanation: "0! is defined as 1" },
      ],
      testCases: [
        { input: "0", expected: 1 },
        { input: "1", expected: 1 },
        { input: "4", expected: 24 },
        { input: "6", expected: 720 },
      ],
      theory: {
        description:
          "Factorial is a mathematical function that multiplies a number by all positive integers less than it. Factorials grow extremely fast — 20! is already about 2.4 × 10¹⁸, which exceeds 64-bit integer limits in many languages. This rapid growth makes factorial calculation interesting from both algorithmic and computational perspectives.\n\nThere are two primary approaches to computing factorial: iterative and recursive.\n\n Iterative approach : Uses a loop to multiply numbers from 1 to n. This is generally preferred because:\n- It doesn't risk stack overflow (n can't be too large due to integer overflow anyway)\n- It's easier to understand and debug\n- It's typically more efficient with O(1) space complexity\n\n Recursive approach : Defines factorial as n! = n × (n-1)! with base case 0! = 1. While elegant and mathematically pure, recursion has overhead and risks stack overflow for large n.\n\n Mathematical properties :\n- Factorials are used extensively in combinatorics (permutations and combinations)\n- The number of trailing zeros in n! equals the number of times 5 divides n! (since there are always more factors of 2 than 5)\n- Stirling's approximation gives an asymptotic formula: n! ≈ √(2πn) × (n/e)ⁿ\n\n Implementation considerations :\n-  Integer overflow : In languages without arbitrary-precision integers (like C, C++, Java), factorial quickly exceeds maximum values\n-  Memoization : For computing multiple factorials, caching results can dramatically improve performance\n-  Large number libraries : For large n, specialized big integer libraries are needed\n-  Modular arithmetic : Many problems require n! mod M, which can be computed without overflow using modular multiplication\n\nThis problem serves as an excellent introduction to iteration vs recursion, growth rates, and handling large numbers in programming. It's also the foundation for understanding combinatorial computations in probability and statistics.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) - Iterative implementation uses constant extra memory (only loop counter and result variable). Recursive version would use O(n) stack space."
      },
      keyPoints: [
        "Base case: 0! = 1",
        "Use a for loop to multiply from 1 to n",
      ],
      pros: ["Simple loop", "No recursion overhead"],
      cons: ["Values grow quickly", "Only works for small n"],
      input: { array: [5], target: null },
      animationSteps: [
        {
          array: [5],
          active: [0],
          found: false,
          message: "n = 5. Start result = 1, i = 1",
        },
        {
          array: [5],
          active: [0],
          found: false,
          message: "i = 1 → result = 1 * 1 = 1",
        },
        {
          array: [5],
          active: [0],
          found: false,
          message: "i = 2 → result = 1 * 2 = 2",
        },
        {
          array: [5],
          active: [0],
          found: false,
          message: "i = 3 → result = 2 * 3 = 6",
        },
        {
          array: [5],
          active: [0],
          found: false,
          message: "i = 4 → result = 6 * 4 = 24",
        },
        {
          array: [5],
          active: [0],
          found: true,
          message: "i = 5 → result = 24 * 5 = 120. Return 120",
        },
      ],
      flowChartData: {
        rawNodes: [
          {
            id: "start",
            type: "terminalNode",
            data: {
              label: "Start",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
          {
            id: "init",
            type: "processNode",
            data: {
              label: "result = 1",
              background: "#fecaca",
              borderColor: "#ef4444",
            },
          },
          {
            id: "loop",
            type: "decisionNode",
            data: {
              label: "i = 1 to n ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "multiply",
            type: "processNode",
            data: {
              label: "result = result × i",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "output",
            type: "ioNode",
            data: {
              label: "Return result",
              background: "#bbf7d0",
              borderColor: "#22c55e",
            },
          },
        ],
        rawEdges: [
          { id: "e1", source: "start", target: "init" },
          { id: "e2", source: "init", target: "loop" },
          { id: "e3", source: "loop", target: "multiply", label: "Yes" },
          { id: "e4", source: "multiply", target: "loop" },
          { id: "e5", source: "loop", target: "output", label: "No" },
        ],
      },
      code: {
        python: `def factorial(n: int) -> int:
    result = 1
    for i in range(2, n+1):
        result *= i
    return result`,
      },
      pseudocode: {
        lines: [
          "function factorial(n)",
          "   result = 1",
          "   for i = 2 to n",
          "       result = result × i",
          "   return result",
          "end function",
        ],
      },
      verified: true,
    },

    // 5. Linear Search
    {
      order: 5,
      slug: "linear-search",
      title: "Linear Search",
      category: "Searching",
      description:
        "Find the index of a target value in an array by checking each element one by one.",
      problem: {
        statement:
          "Given an array of integers arr and an integer target, return the index of target if it exists, otherwise return -1.",
        inputFormat:
          "First line: space‑separated integers (array). Second line: target integer.",
        outputFormat: "Integer index or -1.",
        constraints: "1 ≤ arr.length ≤ 10^4, -10^9 ≤ arr[i], target ≤ 10^9",
        starterCode: {
          python: `def linear_search(arr: list, target: int) -> int:
    #edit below this line to solve the problem


def solve():
    arr = list(map(int, input().split()))
    target = int(input().strip())
    result = linear_search(arr, target)
    print(result)


if __name__ == "__main__":
    solve()`,
        },
      },
      examples: [
        { input: "4 2 7 1 9\n7", output: 2, explanation: "7 is at index 2" },
        { input: "4 2 7 1 9\n5", output: -1, explanation: "5 not found" },
      ],
      testCases: [
        { input: "10 20 30\n20", expected: 1 },
        { input: "5\n5", expected: 0 },
        { input: "1 2 3\n4", expected: -1 },
      ],
      theory: {
        description:
          "Linear search is the simplest searching algorithm that sequentially checks each element in a collection until the target is found or all elements have been examined. Despite its simplicity, linear search has important real-world applications, especially when data is unsorted, the collection is small, or when elements are accessed in a streaming fashion.\n\n How it works :\n1. Start from the first element (index 0)\n2. Compare the current element with the target\n3. If they match, return the current index\n4. If they don't match, move to the next element\n5. Repeat until the end of the array\n6. If the target is never found, return -1 (or a sentinel value indicating 'not found')\n\n Algorithm characteristics :\n-  Unsorted data friendly : Unlike binary search, linear search works perfectly on unsorted arrays\n-  Online algorithm : Can search as data streams in without preprocessing\n-  Multiple occurrences : Can be easily modified to find all occurrences, not just the first\n-  Any data type : Works with any comparable data type, including objects with custom equality\n\n Performance analysis :\n- Best case: Target at first position → 1 comparison (Ω(1))\n- Worst case: Target at last position or not present → n comparisons (O(n))\n- Average case: (n+1)/2 comparisons when target exists, n comparisons when it doesn't\n\n Variations and improvements :\n-  Sentinel linear search : Place target at the end of array to eliminate bounds checking\n-  Ordered linear search : If data is sorted, can stop early when passing target's sorted position\n-  Probability-based search : If some elements are accessed more frequently, reorganize array to put them front\n-  Self-organizing lists : Move accessed elements toward the front to optimize for repeated searches\n\nLinear search is often the best choice for small datasets (n < 100) due to its simplicity and lack of preprocessing overhead. For larger datasets, more sophisticated algorithms like binary search (O(log n)) or hash-based search (O(1) average) are preferred, but they require sorted data or additional memory, respectively.\n\nUnderstanding linear search provides the foundation for understanding algorithm analysis, time complexity, and the trade-offs between simplicity and performance.",
        timeComplexity: "O(1), O(n)",
        spaceComplexity: "O(1) - Only a single index variable is used regardless of array size. No additional data structures required."
      },
      keyPoints: [
        "Works on any array (sorted or unsorted)",
        "Simple but slow for large arrays",
      ],
      pros: ["No preprocessing needed", "Works with any data type"],
      cons: ["Slow for large data sets (O(n))"],
      input: { array: [4, 2, 7, 1, 9], target: 7 },
      animationSteps: [
        {
          array: [4, 2, 7, 1, 9],
          active: [0],
          found: false,
          message: "Check index 0: 4 != 7",
        },
        {
          array: [4, 2, 7, 1, 9],
          active: [1],
          found: false,
          message: "Check index 1: 2 != 7",
        },
        {
          array: [4, 2, 7, 1, 9],
          active: [2],
          found: true,
          message: "Check index 2: 7 == 7 → found",
        },
      ],
      flowChartData: {
        rawNodes: [
          {
            id: "start",
            type: "terminalNode",
            data: {
              label: "Start",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
          {
            id: "init",
            type: "processNode",
            data: {
              label: "i = 0",
              background: "#fecaca",
              borderColor: "#ef4444",
            },
          },
          {
            id: "loop",
            type: "decisionNode",
            data: {
              label: "i < n ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "compare",
            type: "decisionNode",
            data: {
              label: "arr[i] == target ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "increment",
            type: "processNode",
            data: {
              label: "i++",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "found",
            type: "ioNode",
            data: {
              label: "Return i",
              background: "#bbf7d0",
              borderColor: "#22c55e",
            },
          },
          {
            id: "not_found",
            type: "ioNode",
            data: {
              label: "Return -1",
              background: "#e9d5ff",
              borderColor: "#8b5cf6",
            },
          },
        ],
        rawEdges: [
          { id: "e1", source: "start", target: "init" },
          { id: "e2", source: "init", target: "loop" },
          { id: "e3", source: "loop", target: "compare", label: "Yes" },
          { id: "e4", source: "compare", target: "found", label: "Yes" },
          { id: "e5", source: "compare", target: "increment", label: "No" },
          { id: "e6", source: "increment", target: "loop" },
          { id: "e7", source: "loop", target: "not_found", label: "No" },
        ],
      },
      code: {
        python: `def linear_search(arr: list, target: int) -> int:
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1`,
      },
      pseudocode: {
        lines: [
          "function linearSearch(arr, target)",
          "   for i = 0 to length(arr)-1",
          "       if arr[i] == target then return i",
          "   return -1",
          "end function",
        ],
      },
      verified: true,
    },

    // 6. Bubble Sort
    {
      order: 6,
      slug: "bubble-sort",
      title: "Bubble Sort",
      category: "Sorting",
      description:
        "Sort an array by repeatedly swapping adjacent elements if they are in the wrong order.",
      problem: {
        statement:
          "Given an array of integers, sort it in ascending order using the bubble sort algorithm.",
        inputFormat: "Space‑separated integers.",
        outputFormat:
          "Same integers sorted in ascending order, space‑separated.",
        constraints: "1 ≤ n ≤ 10^3, -10^5 ≤ arr[i] ≤ 10^5",
        starterCode: {
          python: `def bubble_sort(arr: list) -> list:
    #edit below this line to solve the problem


def solve():
    arr = list(map(int, input().split()))
    sorted_arr = bubble_sort(arr)
    print(' '.join(map(str, sorted_arr)))


if __name__ == "__main__":
    solve()`,
        },
      },
      examples: [
        {
          input: "5 1 4 2 8",
          output: [1, 2, 4, 5, 8],
          explanation: "After bubble sort passes, the array becomes sorted.",
        },
      ],
      testCases: [
        {
          input: "64 34 25 12 22 11 90",
          expected: [11, 12, 22, 25, 34, 64, 90],
        },
        { input: "1 2 3 4 5", expected: [1, 2, 3, 4, 5] },
        { input: "5 4 3 2 1", expected: [1, 2, 3, 4, 5] },
      ],
      theory: {
        description:
          "Bubble sort is one of the simplest sorting algorithms, often taught as an introduction to sorting concepts. It works by repeatedly stepping through the list, comparing adjacent elements, and swapping them if they're in the wrong order. The algorithm gets its name because smaller elements 'bubble' to the top (front) of the list, while larger elements 'sink' to the bottom (end).\n\n Algorithm breakdown :\n1. Start from the beginning of the array\n2. Compare each pair of adjacent elements\n3. If they're in the wrong order (left > right for ascending sort), swap them\n4. After each pass, the largest unsorted element moves to its correct position at the end\n5. Repeat for the remaining unsorted portion (excluding the already sorted tail)\n6. Optimize: Stop early if no swaps occurred during a pass (array is sorted)\n\n Performance characteristics :\n-  Worst-case (reverse sorted) : O(n²) comparisons and swaps\n-  Best-case (already sorted with optimization) : O(n) comparisons, 0 swaps\n-  Average-case : O(n²) with approximately n²/4 comparisons\n-  Stability : Bubble sort is stable - equal elements maintain their relative order\n-  Adaptive : With the early-termination optimization, it performs well on nearly-sorted data\n\n Variations :\n-  Cocktail shaker sort  (bidirectional bubble sort): Alternates direction between passes\n-  Odd-even sort : Uses separate passes for odd-even and even-odd index pairs\n-  Comb sort : Starts with larger gap and reduces it (improves on bubble sort)\n\nDespite its poor average performance, bubble sort's simplicity makes it valuable for teaching fundamental programming concepts like nested loops, conditionals, swapping variables, and algorithm optimization.",
        timeComplexity: "O(n), O(n^2)",
        spaceComplexity: "O(1) - Sorts the array in place using only a constant amount of extra space for swapping variables."
      },
      keyPoints: [
        "In‑place sorting",
        "Stable algorithm",
        "Educational but inefficient for large datasets",
      ],
      pros: ["Simple to understand and implement", "No extra memory required"],
      cons: ["Very slow for large arrays", "Many comparisons and swaps"],
      input: { array: [5, 1, 4, 2, 8], target: null },
      animationSteps: [
        {
          array: [5, 1, 4, 2, 8],
          active: [0, 1],
          found: false,
          message: "Swap 5 and 1 → [1,5,4,2,8]",
        },
        {
          array: [1, 5, 4, 2, 8],
          active: [1, 2],
          found: false,
          message: "Swap 5 and 4 → [1,4,5,2,8]",
        },
        {
          array: [1, 4, 5, 2, 8],
          active: [2, 3],
          found: false,
          message: "Swap 5 and 2 → [1,4,2,5,8]",
        },
        {
          array: [1, 4, 2, 5, 8],
          active: [1, 2],
          found: false,
          message: "Swap 4 and 2 → [1,2,4,5,8]",
        },
      ],
      flowChartData: {
        rawNodes: [
          {
            id: "start",
            type: "terminalNode",
            data: {
              label: "Start",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
          {
            id: "outer",
            type: "processNode",
            data: {
              label: "for i = 0 to n-1",
              background: "#fecaca",
              borderColor: "#ef4444",
            },
          },
          {
            id: "inner",
            type: "processNode",
            data: {
              label: "for j = 0 to n-i-2",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "compare",
            type: "decisionNode",
            data: {
              label: "arr[j] > arr[j+1] ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "swap",
            type: "processNode",
            data: {
              label: "swap arr[j], arr[j+1]",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "end",
            type: "terminalNode",
            data: {
              label: "Return sorted array",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
        ],

        rawEdges: [
          { id: "e1", source: "start", target: "outer" },
          { id: "e2", source: "outer", target: "inner" },

          // inner loop → compare
          { id: "e3", source: "inner", target: "compare" },

          // decision branches
          { id: "e4", source: "compare", target: "swap", label: "Yes" },
          { id: "e5", source: "compare", target: "inner", label: "No" },

          // after swap → continue inner loop
          { id: "e6", source: "swap", target: "inner" },

          // when inner loop finishes → go back to outer loop
          { id: "e7", source: "inner", target: "outer" },

          // when outer loop finishes → end
          { id: "e8", source: "outer", target: "end" },
        ],
      },
      code: {
        python: `def bubble_sort(arr: list) -> list:
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`,
      },
      pseudocode: {
        lines: [
          "procedure bubbleSort(arr)",
          "   n = length(arr)",
          "   for i = 0 to n-1",
          "       for j = 0 to n-i-2",
          "           if arr[j] > arr[j+1] then",
          "               swap arr[j] and arr[j+1]",
          "           end if",
          "       end for",
          "   end for",
          "   return arr",
          "end procedure",
        ],
      },
      verified: true,
    },

    // 7. Binary Search
    {
      order: 7,
      slug: "binary-search",
      title: "Binary Search",
      category: "Searching",
      description:
        "Find the index of a target value in a sorted array by repeatedly dividing the search interval in half.",
      problem: {
        statement:
          "Given a sorted array of integers nums and an integer target, return the index of target if it exists, otherwise return -1.",
        inputFormat:
          "First line: space‑separated integers (sorted ascending). Second line: target integer.",
        outputFormat: "Integer index or -1.",
        constraints:
          "1 ≤ nums.length ≤ 10^5, -10^9 ≤ nums[i], target ≤ 10^9, array sorted ascending",
        starterCode: {
          python: `def binary_search(nums: list, target: int) -> int:
    #edit below this line to solve the problem


def solve():
    nums = list(map(int, input().split()))
    target = int(input().strip())
    result = binary_search(nums, target)
    print(result)


if __name__ == "__main__":
    solve()`,
        },
      },
      examples: [
        {
          input: "-1 0 3 5 9 12\n9",
          output: 4,
          explanation: "9 exists at index 4.",
        },
        {
          input: "-1 0 3 5 9 12\n2",
          output: -1,
          explanation: "2 is not present in the array.",
        },
      ],
      testCases: [
        { input: "1 2 3 4 5\n3", expected: 2 },
        { input: "1 2 3 4 5\n6", expected: -1 },
        { input: "10\n10", expected: 0 },
      ],
      theory: {
        description:
          "Binary search is one of the most fundamental and elegant algorithms in computer science. It's a classic example of the divide-and-conquer paradigm, where a problem is repeatedly divided into smaller subproblems until a solution is found. Binary search leverages the property of sorted data to achieve logarithmic time complexity, making it exponentially faster than linear search for large datasets.\n\n How binary search works :\nThe algorithm maintains a search interval [left, right] that contains the target (if present). In each iteration:\n1. Calculate the middle index: mid = (left + right) // 2\n2. Compare the middle element with the target\n3. If equal → return mid (target found)\n4. If middle < target → search right half: left = mid + 1\n5. If middle > target → search left half: right = mid - 1\n6. Repeat until left > right (target not found)\n\n Key properties :\n-  Precondition : Array must be sorted (in non-decreasing order)\n-  Deterministic : Always finds the first occurrence (depending on implementation)\n-  In-place : No additional data structures needed\n-  Logarithmic : Number of steps = ceil(log₂(n)) + 1\n\n Variations and extensions :\n1.  Lower bound : Find first position where element ≥ target\n2.  Upper bound : Find first position where element > target\n3.  Binary search on answer : Used in optimization problems (e.g., finding square root)\n4.  Rotated array search : Binary search modified for rotated sorted arrays\n5.  Exponential search : Combined with binary search for unbounded arrays\n\n Applications :\n- Dictionary/phonebook lookups\n- Debugging (binary search for first failing commit in git bisect)\n- Database index searching (B-trees are extensions of binary search)\n- Algorithmic problem solving (searching in sorted data structures)\n- Implementation of lower_bound/upper_bound in C++ STL\n\n Common pitfalls :\n- Integer overflow when computing mid: (left+right) could overflow; safer: left + (right-left)//2\n- Off-by-one errors: careful with loop condition (left ≤ right vs left < right)\n- Handling duplicates: decide whether to return first, last, or any occurrence\n\nUnderstanding binary search is crucial because it forms the foundation for many advanced data structures (binary search trees, balanced BSTs, segment trees) and algorithms.",
        timeComplexity: "O(1), O(log n)",
        spaceComplexity: "O(1) - Iterative version uses only three integer variables (left, right, mid) regardless of input size."
      },
      keyPoints: [
        "Requires sorted input",
        "Very fast for large datasets",
        "Works on random‑access data structures",
      ],
      pros: ["Logarithmic time complexity", "Minimal memory usage"],
      cons: ["Only works on sorted arrays", "Inefficient for small arrays"],
      input: { array: [-1, 0, 3, 5, 9, 12], target: 9 },
      animationSteps: [
        {
          array: [-1, 0, 3, 5, 9, 12],
          active: [0, 5],
          found: false,
          message: "left=0, right=5, mid=2, arr[2]=3 < 9 → search right half",
        },
        {
          array: [-1, 0, 3, 5, 9, 12],
          active: [3, 5],
          found: false,
          message: "left=3, right=5, mid=4, arr[4]=9 == 9 → found at index 4",
        },
      ],
      flowChartData: {
        rawNodes: [
          {
            id: "start",
            type: "terminalNode",
            data: {
              label: "Start",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
          {
            id: "init",
            type: "processNode",
            data: {
              label: "left=0, right=n-1",
              background: "#fecaca",
              borderColor: "#ef4444",
            },
          },
          {
            id: "loop",
            type: "decisionNode",
            data: {
              label: "left ≤ right ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "mid",
            type: "processNode",
            data: {
              label: "mid = (left+right)//2",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "check",
            type: "decisionNode",
            data: {
              label: "nums[mid] == target ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "left_up",
            type: "processNode",
            data: {
              label: "left = mid+1",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "right_up",
            type: "processNode",
            data: {
              label: "right = mid-1",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "found",
            type: "ioNode",
            data: {
              label: "Return mid",
              background: "#bbf7d0",
              borderColor: "#22c55e",
            },
          },
          {
            id: "not_found",
            type: "ioNode",
            data: {
              label: "Return -1",
              background: "#e9d5ff",
              borderColor: "#8b5cf6",
            },
          },
        ],
        rawEdges: [
          { id: "e1", source: "start", target: "init" },
          { id: "e2", source: "init", target: "loop" },
          { id: "e3", source: "loop", target: "mid", label: "Yes" },
          { id: "e4", source: "mid", target: "check" },
          { id: "e5", source: "check", target: "found", label: "Yes" },
          {
            id: "e6",
            source: "check",
            target: "left_up",
            label: "nums[mid] < target",
          },
          {
            id: "e7",
            source: "check",
            target: "right_up",
            label: "nums[mid] > target",
          },
          { id: "e8", source: "left_up", target: "loop" },
          { id: "e9", source: "right_up", target: "loop" },
          { id: "e10", source: "loop", target: "not_found", label: "No" },
        ],
      },
      code: {
        python: `def binary_search(nums: list, target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      },
      pseudocode: {
        lines: [
          "function binarySearch(nums, target)",
          "   left = 0, right = length(nums)-1",
          "   while left ≤ right",
          "       mid = floor((left+right)/2)",
          "       if nums[mid] == target: return mid",
          "       else if nums[mid] < target: left = mid+1",
          "       else: right = mid-1",
          "   return -1",
          "end function",
        ],
      },
      verified: true,
    },

    // 8. Selection Sort
    {
      order: 8,
      slug: "selection-sort",
      title: "Selection Sort",
      category: "Sorting",
      description:
        "Sort an array by repeatedly finding the minimum element from the unsorted part and putting it at the beginning.",
      problem: {
        statement:
          "Given an array of integers, sort it in ascending order using selection sort.",
        inputFormat: "Space‑separated integers.",
        outputFormat: "Sorted integers, space‑separated.",
        constraints: "1 ≤ n ≤ 10^4, -10^5 ≤ arr[i] ≤ 10^5",
        starterCode: {
          python: `def selection_sort(arr: list) -> list:
    #edit below this line to solve the problem


def solve():
    arr = list(map(int, input().split()))
    sorted_arr = selection_sort(arr)
    print(' '.join(map(str, sorted_arr)))


if __name__ == "__main__":
    solve()`,
        },
      },
      examples: [
        {
          input: "64 25 12 22 11",
          output: [11, 12, 22, 25, 64],
          explanation:
            "Each pass selects the smallest remaining element and swaps it into place.",
        },
      ],
      testCases: [
        { input: "5 4 3 2 1", expected: [1, 2, 3, 4, 5] },
        { input: "1 2 3 4 5", expected: [1, 2, 3, 4, 5] },
        { input: "3 1 2", expected: [1, 2, 3] },
      ],
      theory: {
        description:
          "Selection sort is an in-place comparison sorting algorithm that divides the input list into two parts: a sorted sublist at the left end and an unsorted sublist at the right end. It repeatedly selects the smallest (or largest, depending on sorting order) element from the unsorted portion and moves it to the sorted portion. While not efficient for large datasets, selection sort's simplicity and predictable performance (always O(n²) comparisons regardless of input) make it valuable for educational purposes and scenarios where memory writes are expensive.\n\n Algorithm breakdown :\n1. Start with i = 0\n2. Find the minimum element in the subarray from i to n-1\n3. Swap this minimum with the element at position i\n4. Increment i to expand the sorted portion\n5. Repeat steps 2-4 until i reaches n-1\n\n Key characteristics :\n-  In-place : Requires O(1) extra space\n-  Unstable : Equal elements may not maintain their original relative order\n-  Not adaptive : Always performs O(n²) comparisons, even on already sorted data\n-  Minimum swaps : Makes at most n-1 swaps total (good for expensive swap operations)\n\n Comparison with other O(n²) sorts :\n-  Bubble sort : Makes many more swaps (O(n²) average) but can terminate early on sorted data\n-  Insertion sort : More efficient on nearly-sorted data and stable, but requires shifting elements\n-  Selection sort : Minimum number of swaps, but always O(n²) comparisons\n\n Variations :\n-  Double selection sort : Finds both minimum and maximum in each pass, reducing passes by half\n-  Stable selection sort : Uses insertion to maintain stability but increases complexity\n-  Heap sort : An optimized version of selection sort using a heap data structure (O(n log n))\n\nDespite its O(n²) complexity, selection sort teaches important concepts about dividing the problem space (sorted vs unsorted portions), finding extremes in a dataset, and the trade-off between comparisons and swaps.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1) - The algorithm sorts in place using only a constant amount of extra space for the min index and temporary swap storage."
      },
      keyPoints: [
        "In‑place but unstable",
        "Performs fewer swaps than bubble sort",
      ],
      pros: ["Simple", "Minimal swaps"],
      cons: ["Always O(n²) even if already sorted", "Not stable"],
      input: { array: [64, 25, 12, 22, 11], target: null },
      animationSteps: [
        {
          array: [64, 25, 12, 22, 11],
          active: [0, 4],
          found: false,
          message:
            "Pass 1: min=11 at index 4 → swap indices 0 and 4 → [11,25,12,22,64]",
        },
        {
          array: [11, 25, 12, 22, 64],
          active: [1, 2],
          found: false,
          message:
            "Pass 2: min=12 at index 2 → swap indices 1 and 2 → [11,12,25,22,64]",
        },
        {
          array: [11, 12, 25, 22, 64],
          active: [2, 3],
          found: false,
          message:
            "Pass 3: min=22 at index 3 → swap indices 2 and 3 → [11,12,22,25,64]",
        },
      ],
      flowChartData: {
        rawNodes: [
          {
            id: "start",
            type: "terminalNode",
            data: {
              label: "Start",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
          {
            id: "outer",
            type: "processNode",
            data: {
              label: "i = 0 to n-2",
              background: "#fecaca",
              borderColor: "#ef4444",
            },
          },
          {
            id: "min",
            type: "processNode",
            data: {
              label: "minIdx = i",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "inner",
            type: "processNode",
            data: {
              label: "j = i+1 to n-1",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "cmp",
            type: "decisionNode",
            data: {
              label: "arr[j] < arr[minIdx] ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "update",
            type: "processNode",
            data: {
              label: "minIdx = j",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "swap",
            type: "processNode",
            data: {
              label: "swap arr[i] and arr[minIdx]",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
        ],
        rawEdges: [
          { id: "e1", source: "start", target: "outer" },
          { id: "e2", source: "outer", target: "min" },
          { id: "e3", source: "min", target: "inner" },
          { id: "e4", source: "inner", target: "cmp" },
          { id: "e5", source: "cmp", target: "update", label: "Yes" },
          { id: "e6", source: "update", target: "inner" },
          {
            id: "e7",
            source: "cmp",
            target: "inner",
            label: "No",
            sourceHandle: "right",
          },
          { id: "e8", source: "inner", target: "swap" },
        ],
      },
      code: {
        python: `def selection_sort(arr: list) -> list:
    n = len(arr)
    for i in range(n-1):
        min_idx = i
        for j in range(i+1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
      },
      pseudocode: {
        lines: [
          "procedure selectionSort(arr)",
          "   n = length(arr)",
          "   for i = 0 to n-2",
          "       minIdx = i",
          "       for j = i+1 to n-1",
          "           if arr[j] < arr[minIdx] then minIdx = j",
          "       end for",
          "       swap arr[i] and arr[minIdx]",
          "   end for",
          "   return arr",
          "end procedure",
        ],
      },
      verified: true,
    },

    // 9. Fibonacci (DP)
    {
      order: 9,
      slug: "fibonacci-dp",
      title: "Fibonacci Number (DP)",
      category: "Dynamic Programming",
      description:
        "Compute the nth Fibonacci number efficiently using dynamic programming (iteration).",
      problem: {
        statement:
          "Given an integer n, return the nth Fibonacci number, where F(0)=0, F(1)=1, and F(n)=F(n-1)+F(n-2) for n>1.",
        inputFormat: "Single integer n.",
        outputFormat: "Integer F(n).",
        constraints: "0 ≤ n ≤ 10^5 (results modulo 10^9+7 if needed)",
        starterCode: {
          python: `def fib(n: int) -> int:
    #edit below this line to solve the problem


def solve():
    n = int(input().strip())
    result = fib(n)
    print(result)


if __name__ == "__main__":
    solve()`,
        },
      },
      examples: [
        { input: "2", output: 1, explanation: "F(2)=F(1)+F(0)=1+0=1" },
        { input: "3", output: 2, explanation: "F(3)=F(2)+F(1)=1+1=2" },
      ],
      testCases: [
        { input: "0", expected: 0 },
        { input: "1", expected: 1 },
        { input: "6", expected: 8 },
        { input: "10", expected: 55 },
      ],
      theory: {
        description:
          "The Fibonacci sequence is one of the most famous sequences in mathematics, appearing in nature (spiral patterns, leaf arrangements), art (golden ratio), and computer science (analysis of algorithms). The sequence is defined by the recurrence relation F(n) = F(n-1) + F(n-2), with base cases F(0) = 0 and F(1) = 1. This problem serves as an excellent introduction to dynamic programming, showcasing how naive recursion leads to exponential time complexity, while memoization or iteration achieves linear time.\n\n Approaches to Fibonacci :\n\n1.  Naive Recursion  (Exponential time):\nThis approach recalculates the same subproblems repeatedly, leading to O(2ⁿ) time complexity. For n=40, this makes over 100 million recursive calls!\n\n2.  Memoization (Top-down DP) :\nStores computed values in a dictionary, reducing time to O(n) at the cost of O(n) space.\n\n3.  Iterative DP (Tabulation)  (OPTIMAL):\nThe optimal solution - O(n) time and O(1) space. This is our recommended approach.\n\n4.  Matrix Exponentiation  (O(log n) time):\nUses the matrix identity to compute Fibonacci in logarithmic time.\n\n Real-world applications :\n- Analysis of Euclid's algorithm (worst-case runtime involves Fibonacci numbers)\n- Fibonacci search technique (similar to binary search but for sorted arrays)\n- Fibonacci heap data structure\n- Biological growth models (rabbit populations, honeybee ancestry)\n- Financial markets (Fibonacci retracement in technical analysis)\n\n Mathematical properties :\n-  Golden ratio : F(n) ≈ φⁿ/√5, where φ ≈ 1.618 (the golden ratio)\n-  Cassini's identity : F(n-1)·F(n+1) - F(n)² = (-1)ⁿ\n-  Sum of first n Fibonacci numbers : ΣF(i) = F(n+2) - 1\n\nUnderstanding Fibonacci and dynamic programming lays the foundation for solving optimization problems where overlapping subproblems and optimal substructure are present, including shortest paths, knapsack, and sequence alignment problems.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) - The optimal solution uses only two variables to track the last two Fibonacci numbers, regardless of n. No additional data structures needed."
      },
      keyPoints: [
        "Base cases: F(0)=0, F(1)=1",
        "Iterative solution is optimal",
        "Avoid naive recursion",
      ],
      pros: ["Linear time", "Constant space", "No recursion overhead"],
      cons: ["Still linear (not logarithmic like matrix exponentiation)"],
      input: { array: [10], target: null },
      animationSteps: [
        {
          array: [0],
          active: [0],
          found: true,
          message: "Initialize: F(0) = 0",
        },
        {
          array: [0, 1],
          active: [1],
          found: true,
          message: "Initialize: F(1) = 1",
        },
        {
          array: [0, 1, 1],
          active: [2],
          found: true,
          message: "i=2 → F(2) = F(1) + F(0) = 1",
        },
        {
          array: [0, 1, 1, 2],
          active: [3],
          found: true,
          message: "i=3 → F(3) = F(2) + F(1) = 2",
        },
        {
          array: [0, 1, 1, 2, 3],
          active: [4],
          found: true,
          message: "i=4 → F(4) = F(3) + F(2) = 3",
        },
        {
          array: [0, 1, 1, 2, 3, 5],
          active: [5],
          found: true,
          message: "i=5 → F(5) = F(4) + F(3) = 5",
        },
        {
          array: [0, 1, 1, 2, 3, 5],
          active: [0, 1, 2, 3, 4, 5],
          found: true,
          message: "Final Answer: F(5) = 5",
        },
      ],
      flowChartData: {
        rawNodes: [
          {
            id: "start",
            type: "terminalNode",
            data: {
              label: "Start",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
          {
            id: "base",
            type: "decisionNode",
            data: {
              label: "n ≤ 1 ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "returnN",
            type: "ioNode",
            data: {
              label: "return n",
              background: "#bbf7d0",
              borderColor: "#22c55e",
            },
          },
          {
            id: "init",
            type: "processNode",
            data: {
              label: "a=0, b=1",
              background: "#fecaca",
              borderColor: "#ef4444",
            },
          },
          {
            id: "loop",
            type: "processNode",
            data: {
              label: "for i = 2 to n",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "update",
            type: "processNode",
            data: {
              label: "c = a+b; a=b; b=c",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "returnB",
            type: "ioNode",
            data: {
              label: "return b",
              background: "#bbf7d0",
              borderColor: "#22c55e",
            },
          },
        ],
        rawEdges: [
          { id: "e1", source: "start", target: "base" },
          { id: "e2", source: "base", target: "returnN", label: "Yes" },
          { id: "e3", source: "base", target: "init", label: "No" },
          { id: "e4", source: "init", target: "loop" },
          { id: "e5", source: "loop", target: "update" },
          { id: "e6", source: "update", target: "loop" },
          { id: "e7", source: "loop", target: "returnB" },
        ],
      },
      code: {
        python: `def fib(n: int) -> int:
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n+1):
        a, b = b, a + b
    return b`,
      },
      pseudocode: {
        lines: [
          "function fib(n)",
          "   if n ≤ 1: return n",
          "   a = 0, b = 1",
          "   for i = 2 to n",
          "       c = a + b",
          "       a = b",
          "       b = c",
          "   return b",
          "end function",
        ],
      },
      verified: true,
    },

    // 10. Two Sum
    {
      order: 10,
      slug: "two-sum",
      title: "Two Sum",
      category: "Hash Table",
      description:
        "Find two numbers in an array that add up to a target and return their indices.",
      problem: {
        statement:
          "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. Assume exactly one solution, and you may not use the same element twice.",
        inputFormat:
          "First line: space‑separated integers (array). Second line: target integer.",
        outputFormat: "Two space‑separated indices.",
        constraints: "2 ≤ nums.length ≤ 10^4, -10^9 ≤ nums[i], target ≤ 10^9",
        starterCode: {
          python: `def two_sum(nums: list, target: int) -> list:
    #edit below this line to solve the problem


def solve():
    nums = list(map(int, input().split()))
    target = int(input().strip())
    result = two_sum(nums, target)
    print(result[0], result[1])


if __name__ == "__main__":
    solve()`,
        },
      },
      examples: [
        {
          input: "2 7 11 15\n9",
          output: [0, 1],
          explanation: "nums[0]+nums[1]=2+7=9",
        },
        { input: "3 2 4\n6", output: [1, 2], explanation: "2+4=6" },
      ],
      testCases: [
        { input: "2 7 11 15\n9", expected: [0, 1] },
        { input: "3 2 4\n6", expected: [1, 2] },
        { input: "3 3\n6", expected: [0, 1] },
      ],
      theory: {
        description:
          "Two Sum is a classic problem that introduces the use of hash tables for efficient lookups. The problem asks to find two numbers in an array that sum to a target value. While a brute-force approach (checking all pairs) works in O(n²) time, the optimal solution uses a hash map to achieve O(n) time complexity.\n\n Problem variations :\n-  Return indices vs values  (often indices to track positions)\n-  Multiple solutions  (find all pairs or first occurrence)\n-  Sorted array variant  (two-pointer technique with O(n) time)\n-  Return boolean  (whether any pair exists)\n-  Output the numbers themselves  (not indices)\n\n Algorithm approaches :\n\n1.  Brute force  (O(n²) time, O(1) space): Check every pair\n\n2.  Two-pass hash map  (O(n) time, O(n) space):\n- First pass: Store all elements in hash map (value → index)\n- Second pass: For each element, check if complement exists and index differs\n\n3.  One-pass hash map  (O(n) time, O(n) space) - OPTIMAL:\n- Iterate through array once\n- For each element, compute complement = target - current\n- If complement exists in hash map, return [index of complement, current index]\n- Otherwise, store current element and its index in hash map\n\n Why hash maps work well :\n- Average O(1) lookup time\n- Can store values along with their indices\n- Perfect for 'complement' problems where you need to check existence\n\n Edge cases :\n- Duplicate values: hash map stores the first occurrence, which is fine as long as duplicates aren't used together (unless they sum to target)\n- Negative numbers: complements work correctly with negative values\n- Same element twice: explicitly prevented by checking complement index ≠ current index\n- Multiple valid pairs: problem typically assumes exactly one solution\n\n Extensions and related problems :\n-  Three Sum : Find triplets that sum to zero (adds one more loop + two-pointer technique)\n-  Four Sum : Find quadruplets (can use two-sum as subroutine)\n-  Two Sum II (sorted input) : Use two pointers for O(n) time, O(1) space\n-  Two Sum IV (BST input) : In-order traversal + two-pointer or hash set traversal\n-  Subarray sum equals K : Prefix sum with hash map\n\n Real-world applications :\n- Payment systems: Find two items that sum to a given budget\n- Data deduplication: Identify pairs that match a criterion\n- Financial trading: Find two transactions that net to zero\n- Matching problems: Pair entities based on complementary attributes\n\nThe Two Sum problem is often the first encounter with hash table optimization, demonstrating how using additional space (O(n)) can dramatically improve time complexity from O(n²) to O(n). This space-time trade-off is a fundamental concept in algorithm design.",
        timeComplexity: "O(1), O(n)",
        spaceComplexity: "O(n) - The hash map may store up to n-1 entries in the worst case (when the pair is the last two elements)."
      },
      keyPoints: [
        "Single‑pass hash map solution",
        "Only one valid answer",
        "Cannot reuse same element",
      ],
      pros: ["Optimal time complexity", "Easy to implement"],
      cons: ["Extra memory for hash map"],
      input: { array: [2, 7, 11, 15], target: 9 },
      animationSteps: [
        {
          array: [2, 7, 11, 15],
          active: [],
          found: false,
          message: "Goal: find two numbers that sum to target = 9.",
        },
        {
          array: [2, 7, 11, 15],
          active: [0],
          found: false,
          message: "i=0 → num=2. Compute complement = 9 - 2 = 7.",
        },
        {
          array: [2, 7, 11, 15],
          active: [0],
          found: false,
          message: "7 is not in map. Add 2 to map → {2: 0}.",
        },
        {
          array: [2, 7, 11, 15],
          active: [1],
          found: false,
          message: "i=1 → num=7. Compute complement = 9 - 7 = 2.",
        },
        {
          array: [2, 7, 11, 15],
          active: [0, 1],
          found: true,
          message: "2 IS in map at index 0 → pair found!",
        },
        {
          array: [2, 7, 11, 15],
          active: [0, 1],
          found: true,
          message: "Return indices [0, 1]. (2 + 7 = 9)",
        },
      ],
      flowChartData: {
        rawNodes: [
          {
            id: "start",
            type: "terminalNode",
            data: {
              label: "Start",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
          {
            id: "init",
            type: "processNode",
            data: {
              label: "map = {}",
              background: "#fecaca",
              borderColor: "#ef4444",
            },
          },
          {
            id: "loop",
            type: "processNode",
            data: {
              label: "for i, num in enumerate(nums)",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "comp",
            type: "processNode",
            data: {
              label: "complement = target - num",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "check",
            type: "decisionNode",
            data: {
              label: "complement in map ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "add",
            type: "processNode",
            data: {
              label: "map[num] = i",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "found",
            type: "ioNode",
            data: {
              label: "return [map[complement], i]",
              background: "#bbf7d0",
              borderColor: "#22c55e",
            },
          },
        ],
        rawEdges: [
          { id: "e1", source: "start", target: "init" },
          { id: "e2", source: "init", target: "loop" },
          { id: "e3", source: "loop", target: "comp" },
          { id: "e4", source: "comp", target: "check" },
          { id: "e5", source: "check", target: "found", label: "Yes" },
          { id: "e6", source: "check", target: "add", label: "No" },
          { id: "e7", source: "add", target: "loop" },
        ],
      },
      code: {
        python: `def two_sum(nums: list, target: int) -> list:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      },
      pseudocode: {
        lines: [
          "function twoSum(nums, target)",
          "   seen = empty dictionary",
          "   for i from 0 to length(nums)-1",
          "       complement = target - nums[i]",
          "       if complement in seen: return [seen[complement], i]",
          "       seen[nums[i]] = i",
          "   return []",
          "end function",
        ],
      },
      verified: true,
    },

    // 11. Insertion Sort
    {
      order: 11,
      slug: "insertion-sort",
      title: "Insertion Sort",
      category: "Sorting",
      description:
        "Sort an array by building the final sorted array one element at a time, inserting each new element into its correct position.",
      problem: {
        statement:
          "Given an array of integers, sort it in ascending order using insertion sort.",
        inputFormat: "Space‑separated integers.",
        outputFormat: "Sorted integers, space‑separated.",
        constraints: "1 ≤ n ≤ 10^4, -10^5 ≤ arr[i] ≤ 10^5",
        starterCode: {
          python: `def insertion_sort(arr: list) -> list:
    #edit below this line to solve the problem


def solve():
    arr = list(map(int, input().split()))
    sorted_arr = insertion_sort(arr)
    print(' '.join(map(str, sorted_arr)))


if __name__ == "__main__":
    solve()`,
        },
      },
      examples: [
        {
          input: "5 2 4 6 1 3",
          output: [1, 2, 3, 4, 5, 6],
          explanation:
            "Each element is inserted into the already sorted left part.",
        },
      ],
      testCases: [
        { input: "12 11 13 5 6", expected: [5, 6, 11, 12, 13] },
        { input: "1 2 3 4 5", expected: [1, 2, 3, 4, 5] },
        { input: "5 4 3 2 1", expected: [1, 2, 3, 4, 5] },
      ],
      theory: {
        description:
          "Insertion sort is a simple sorting algorithm that builds the final sorted array one element at a time. It works similarly to how people sort playing cards in their hand: take one card at a time and insert it into its correct position among the already-sorted cards. Insertion sort is efficient for small datasets and nearly-sorted arrays, making it a practical choice in many real-world scenarios.\n\n Algorithm breakdown :\n1. Start with the second element (index 1) - consider the first element as already sorted\n2. Store the current element as 'key'\n3. Compare key with elements in the sorted portion (to its left)\n4. Shift larger elements one position to the right\n5. Insert key into its correct position\n6. Repeat for all remaining elements\n\n Performance characteristics :\n-  Best case (already sorted) : O(n) comparisons, O(1) swaps\n-  Worst case (reverse sorted) : O(n²) comparisons and shifts\n-  Average case : O(n²) with approximately n²/4 comparisons\n-  Adaptive : Performance improves significantly with partial ordering\n-  Stable : Equal elements maintain their relative order\n-  In-place : Requires O(1) extra space\n-  Online : Can sort as elements arrive (doesn't need all data upfront)\n\n Comparison with other O(n²) sorts :\n-  Bubble sort : More swaps, not as adaptive\n-  Selection sort : Fewer swaps but always O(n²) comparisons, not adaptive\n-  Insertion sort : Best for small or nearly-sorted data, stable, adaptive\n\n Optimizations :\n-  Binary insertion sort : Use binary search to find insertion point (reduces comparisons to O(n log n) but shifts remain O(n²))\n-  Shell sort : Generalization that compares elements separated by a gap\n\n Real-world applications :\n- Sorting small arrays in hybrid sorts (e.g., Timsort, introspective sort)\n- Online sorting where data arrives incrementally\n- Sorting small datasets in embedded systems\n- As part of more advanced algorithms (e.g., sorting networks)\n- When stability is required and data is small or nearly sorted\n\nDespite its O(n²) worst-case complexity, insertion sort is widely used in practice because it's incredibly efficient for small n (n < 50 often beats O(n log n) algorithms due to low overhead), it's adaptive (nearly sorted data approaches O(n)), and it's stable and in-place.",
        timeComplexity: "O(n), O(n²)",
        spaceComplexity: "O(1) - The algorithm sorts in place using only a constant amount of extra storage for the key and loop counters."
      },
      keyPoints: [
        "Efficient for small or nearly sorted arrays",
        "Stable sort",
        "Online algorithm (can sort as it receives input)",
      ],
      pros: ["Simple", "Adaptive (fast for nearly sorted)", "Stable"],
      cons: ["O(n²) for reverse‑sorted data"],
      input: { array: [5, 2, 4, 6, 1, 3], target: null },
      animationSteps: [
        {
          array: [5, 2, 4, 6, 1, 3],
          active: [1],
          found: false,
          message: "Insert key=2 → shift 5 right → [2,5,4,6,1,3]",
        },
        {
          array: [2, 5, 4, 6, 1, 3],
          active: [2],
          found: false,
          message: "Insert key=4 → shift 5 right → [2,4,5,6,1,3]",
        },
        {
          array: [2, 4, 5, 6, 1, 3],
          active: [3],
          found: false,
          message: "key=6 → already in place",
        },
        {
          array: [2, 4, 5, 6, 1, 3],
          active: [4],
          found: false,
          message: "Insert key=1 → shift all right → [1,2,4,5,6,3]",
        },
        {
          array: [1, 2, 4, 5, 6, 3],
          active: [5],
          found: true,
          message: "Insert key=3 → shift 4,5,6 right → [1,2,3,4,5,6]",
        },
      ],
      flowChartData: {
        rawNodes: [
          {
            id: "start",
            type: "terminalNode",
            data: {
              label: "Start",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
          {
            id: "outer",
            type: "processNode",
            data: {
              label: "i = 1 to n-1",
              background: "#fecaca",
              borderColor: "#ef4444",
            },
          },
          {
            id: "key",
            type: "processNode",
            data: {
              label: "key = arr[i], j = i-1",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "inner",
            type: "decisionNode",
            data: {
              label: "j >= 0 and arr[j] > key ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "shift",
            type: "processNode",
            data: {
              label: "arr[j+1] = arr[j]; j--",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "place",
            type: "processNode",
            data: {
              label: "arr[j+1] = key",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
        ],
        rawEdges: [
          { id: "e1", source: "start", target: "outer" },
          { id: "e2", source: "outer", target: "key" },
          { id: "e3", source: "key", target: "inner" },
          {
            id: "e4",
            source: "inner",
            target: "shift",
            label: "Yes",
            sourceHandle: "left",
          },
          { id: "e5", source: "shift", target: "inner" },
          {
            id: "e6",
            source: "inner",
            target: "place",
            label: "No",
            sourceHandle: "right",
          },
        ],
      },
      code: {
        python: `def insertion_sort(arr: list) -> list:
    for i in range(1, len(arr)):
        key = arr[i]
        j = i-1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key
    return arr`,
      },
      pseudocode: {
        lines: [
          "procedure insertionSort(arr)",
          "   for i = 1 to length(arr)-1",
          "       key = arr[i]",
          "       j = i-1",
          "       while j ≥ 0 and arr[j] > key",
          "           arr[j+1] = arr[j]",
          "           j = j-1",
          "       end while",
          "       arr[j+1] = key",
          "   return arr",
          "end procedure",
        ],
      },
      verified: true,
    },

    // 12. Merge Sort (divide and conquer)
    {
      order: 12,
      slug: "merge-sort",
      title: "Merge Sort",
      category: "Sorting",
      description:
        "Sort an array using the divide‑and‑conquer merge sort algorithm.",
      problem: {
        statement:
          "Given an array of integers, sort it in ascending order using merge sort.",
        inputFormat: "Space‑separated integers.",
        outputFormat: "Sorted integers, space‑separated.",
        constraints: "1 ≤ n ≤ 10^5, -10^9 ≤ arr[i] ≤ 10^9",
        starterCode: {
          python: `def merge_sort(arr: list) -> list:
    #edit below this line to solve the problem


def solve():
    arr = list(map(int, input().split()))
    sorted_arr = merge_sort(arr)
    print(' '.join(map(str, sorted_arr)))


if __name__ == "__main__":
    solve()`,
        },
      },
      examples: [
        {
          input: "38 27 43 3 9 82 10",
          output: [3, 9, 10, 27, 38, 43, 82],
          explanation:
            "Merge sort recursively divides the array into halves, sorts them, and merges.",
        },
      ],
      testCases: [
        { input: "5 4 3 2 1", expected: [1, 2, 3, 4, 5] },
        { input: "1 2 3 4 5", expected: [1, 2, 3, 4, 5] },
        { input: "3 1 2", expected: [1, 2, 3] },
      ],
      theory: {
        description:
          "Merge sort is a classic divide-and-conquer sorting algorithm that guarantees O(n log n) performance regardless of input order. Invented by John von Neumann in 1945, merge sort demonstrates the power of recursive problem decomposition and is a cornerstone of algorithm design. Its predictable performance and stability make it popular for sorting large datasets, especially when linked lists are involved or when external sorting is needed.\n\n How merge sort works :\nThe algorithm follows three main steps recursively:\n\n1.  Divide : Split the array into two halves (approximately equal size)\n2.  Conquer : Recursively sort both halves using merge sort\n3.  Combine : Merge the two sorted halves into a single sorted array\n\n Merge process details :\n- Use two pointers to traverse the left and right halves\n- Compare elements at both pointers\n- Take the smaller element and advance its pointer\n- Repeat until one half is exhausted\n- Append remaining elements from the other half\n\n Key characteristics :\n-  Stable : Maintains relative order of equal elements\n-  Predictable : Always O(n log n) regardless of input\n-  Divide and conquer : Classic example of the paradigm\n-  External sorting : Natural for sorting data too large to fit in memory\n-  Parallelizable : Left and right halves can be sorted in parallel\n\n Space complexity trade-offs :\n- Standard implementation: O(n) auxiliary space (new array for merging)\n- In-place merge sort: possible but complex and slower\n- Linked list version: O(log n) space (recursion stack only)\n\n Optimizations :\n-  Hybrid with insertion sort : Use insertion sort for small subarrays (n < 15-20)\n-  Iterative bottom-up : Avoid recursion by merging from size 1 upward\n-  Tim sort : Python's hybrid sort (merge + insertion) used in practice\n-  Parallel merge sort : Multiple cores can sort halves concurrently\n\n Real-world applications :\n- External sorting (sorting files larger than RAM)\n- Sorting linked lists (O(n log n) time, O(1) extra space for linked lists)\n- Inversion counting (count pairs out of order)\n- Stable sorting requirements\n- Database sorting algorithms\n\n Advantages over quicksort :\n- Guaranteed O(n log n) worst-case (quicksort can degrade to O(n²))\n- Stable by default (quicksort typically unstable)\n- Better for linked lists (no random access needed)\n- Naturally parallelizable\n\n Disadvantages :\n- Requires O(n) extra memory (quicksort can be in-place)\n- Higher constant factors than quicksort for in-memory sorts\n\nMerge sort is fundamental to understanding recursion, divide-and-conquer, and algorithmic analysis. Its predictable performance and stability make it the sorting algorithm of choice when worst-case guarantees are essential, when the data structure is a linked list, or when external sorting is required.",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n) - The standard implementation uses an auxiliary array of size n during merging. Recursive version adds O(log n) stack space."
      },
      keyPoints: ["Stable sort", "Guaranteed O(n log n)", "Divide and conquer"],
      pros: ["Predictable performance", "Works well on linked lists", "Stable"],
      cons: [
        "Requires extra memory O(n)",
        "More complex to implement iteratively",
      ],
      input: { array: [38, 27, 43, 3, 9, 82, 10], target: null },
      animationSteps: [
        {
          array: [38, 27, 43, 3, 9],
          active: [0,1,2],
          found: false,
          message: "Split into [38,27,43] and [3,9]",
        },
        {
          array: [38, 27, 43, 3, 9],
          active: [3,4],
          found: false,
          message: "Split into [38,27,43] and [3,9]",
        },

        // --- Left side ---
        {
          array: [38, 27, 43, 3, 9],
          active: [0, 1],
          found: false,
          message: "Compare 38 and 27 → place 27 first",
        },
        {
          array: [27, 38, 43, 3, 9],
          active: [0],
          found: true,
          message: "Placed 27 first",
        },
        {
          array: [27, 38, 43, 3, 9],
          active: [1, 2],
          found: false,
          message: "Compare 38 and 43 → keep 38",
        },

        // --- Right side ---
        {
          array: [27, 38, 43, 3, 9],
          active: [3, 4],
          found: false,
          message: "Compare 3 and 9 → already sorted",
        },

        // --- Final merge ---
        {
          array: [27, 38, 43, 3, 9],
          active: [0, 3],
          found: false,
          message: "Compare 27 and 3",
        },
        {
          array: [3, 27, 38, 43, 9],
          active: [0],
          found: true,
          message: "Place 3",
        },
        {
          array: [3, 27, 38, 43, 9],
          active: [1,4],
          found: false,
          message: "Compare 27 and 9",
        },
        {
          array: [3, 9, 27, 38, 43],
          active: [1],
          found: true,
          message: "Place 9",
        },
        {
          array: [3, 9, 27, 38, 43],
          active: [0,1,2,3,4],
          found: true,
          message: "Final sorted array",
        },
      ],
      flowChartData: {
        rawNodes: [
          {
            id: "start",
            type: "terminalNode",
            data: {
              label: "Start",
              background: "#d1fae5",
              borderColor: "#10b981",
            },
          },
          {
            id: "base",
            type: "decisionNode",
            data: {
              label: "length ≤ 1 ?",
              background: "#dbeafe",
              borderColor: "#3b82f6",
            },
          },
          {
            id: "return",
            type: "ioNode",
            data: {
              label: "return arr",
              background: "#bbf7d0",
              borderColor: "#22c55e",
            },
          },
          {
            id: "mid",
            type: "processNode",
            data: {
              label: "mid = n//2",
              background: "#fecaca",
              borderColor: "#ef4444",
            },
          },
          {
            id: "left",
            type: "processNode",
            data: {
              label: "left = merge_sort(arr[0:mid])",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "right",
            type: "processNode",
            data: {
              label: "right = merge_sort(arr[mid:n])",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
          {
            id: "merge",
            type: "processNode",
            data: {
              label: "return merge(left, right)",
              background: "#fde68a",
              borderColor: "#f59e0b",
            },
          },
        ],
        rawEdges: [
          { id: "e1", source: "start", target: "base" },
          { id: "e2", source: "base", target: "return", label: "Yes" },
          { id: "e3", source: "base", target: "mid", label: "No" },
          { id: "e4", source: "mid", target: "left" },
          { id: "e5", source: "left", target: "right" },
          { id: "e6", source: "right", target: "merge" },
        ],
      },
      code: {
        python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
      },
      pseudocode: {
        lines: [
          "function mergeSort(arr)",
          "   if length(arr) ≤ 1: return arr",
          "   mid = floor(length(arr)/2)",
          "   left = mergeSort(arr[0..mid-1])",
          "   right = mergeSort(arr[mid..end])",
          "   return merge(left, right)",
          "end function",
          "function merge(left, right)",
          "   result = []",
          "   while left and right are not empty",
          "       if left[0] ≤ right[0]: pop left to result",
          "       else: pop right to result",
          "   append remaining elements",
          "   return result",
          "end function",
        ],
      },
      verified: true,
    },
  ];

  await Algorithm.insertMany(algorithms);

  console.log(`✅ ${algorithms.length} algorithms seeded successfully`);
  process.exit();
};

seed();
