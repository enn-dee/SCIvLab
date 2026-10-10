const languageNames = { c: "C", cpp: "C++", java: "Java" };

const topicDetails = {
  "Program structure and output": {
    objective:
      "Learn the basic structure of a runnable program and how to print text in the programming language.",
    requiredConcepts: ["entry point", "standard output", "source file structure"],
    constraints:
      "Do not read input. Print exactly the required message followed by a newline.",
    examples: [
      {
        input: "",
        output: "Hello, World!",
        explanation:
          "This first practical has no input; it introduces the entry point and output statement.",
      },
    ],
    hints: [
      "Start at the main entry point used by this language.",
      "Use the language's standard output function.",
      "Do not add prompts, labels, or extra punctuation.",
    ],
  },
  "Program structure": {
    objective: "Learn the minimum structure required to compile and run a program.",
    requiredConcepts: ["main function", "standard output", "compilation"],
    constraints: "The program must run without input and print the required message.",
    examples: [{ input: "", output: "Hello, World!", explanation: "A program with no input produces one deterministic output." }],
    hints: ["Start by creating the required entry point.", "Print only the requested message."],
  },
  "Variables": {
    objective: "Practice declaring typed variables, reading values, and formatting output.",
    requiredConcepts: ["int", "floating-point value", "character", "format specifier"],
    constraints: "The input contains an integer, a real number, and one character.",
    examples: [{ input: "5 2.5 a", output: "5, 2.50, a", explanation: "Each value is printed using the appropriate type format." }],
    hints: ["Read the values in the same order as the input format.", "Use two digits after the decimal point."],
  },
  "Operators": {
    objective: "Use arithmetic and relational operators and handle signed input correctly.",
    requiredConcepts: ["arithmetic operators", "integer division", "remainder"],
    constraints: "The second integer is non-zero for division and remainder cases.",
    examples: [{ input: "10 3", output: "13 7 30 3 1", explanation: "Print sum, difference, product, quotient, and remainder." }],
    hints: ["Compute each result before printing.", "Do not assume both numbers are positive."],
  },
  "Conditional": {
    objective: "Use branching to classify values into mutually exclusive cases.",
    requiredConcepts: ["if", "else if", "else"],
    constraints: "Input is one signed integer.",
    examples: [{ input: "0", output: "Zero", explanation: "Zero is neither positive nor negative." }],
    hints: ["Check zero explicitly.", "Only one classification should be printed."],
  },
  "Control flow": {
    objective: "Combine conditions and loops to control the path a program takes.",
    requiredConcepts: ["if/else", "remainder operator", "loop planning"],
    constraints: "Input is one integer. Print Even when it is divisible by two; otherwise print Odd.",
    examples: [{ input: "8", output: "Even", explanation: "8 has no remainder when divided by 2." }],
    hints: ["Use the remainder operator to test divisibility.", "Print exactly one classification."],
  },
  "Loops": {
    objective: "Use repetition to calculate a result for different input sizes.",
    requiredConcepts: ["for loop", "accumulator", "boundary condition"],
    constraints: "1 <= N <= 100000.",
    examples: [{ input: "5", output: "15", explanation: "The sum is 1 + 2 + 3 + 4 + 5." }],
    hints: ["Initialize the accumulator before the loop.", "Include N in the final addition."],
  },
  "Functions": {
    objective: "Break a calculation into reusable functions and call them from the entry point.",
    requiredConcepts: ["function declaration", "parameters", "return value"],
    constraints: "Input contains two signed integers.",
    examples: [{ input: "3 4", output: "7 9", explanation: "Print the sum and the product of the two values." }],
    hints: ["Keep each calculation in a separate function.", "Return values instead of printing inside helper functions."],
  },
  "Arrays": {
    objective: "Traverse an array once to calculate aggregate values.",
    requiredConcepts: ["array", "loop traversal", "sum and average"],
    constraints: "The input contains exactly five signed integers.",
    examples: [{ input: "10 20 30 40 50", output: "150 30", explanation: "Print the sum and integer average." }],
    hints: ["Initialize a running sum before the traversal.", "Divide the final sum by the number of elements."],
  },
  "Pointers": {
    objective: "Use a pointer to access and modify a value through its address.",
    requiredConcepts: ["address-of operator", "dereference operator", "pointer"],
    constraints: "Input contains one integer.",
    examples: [{ input: "10", output: "20", explanation: "Double the value through a pointer and print it." }],
    hints: ["Store the address of the integer in a pointer.", "Modify the pointed-to value, not a copied value."],
  },
  "Structures": {
    objective: "Group related fields in a structure and display a record.",
    requiredConcepts: ["structure declaration", "member access", "record"],
    constraints: "A record contains a single-word name, roll number, and marks.",
    examples: [{ input: "John 101 85", output: "John 101 85", explanation: "Read and print all structure members in order." }],
    hints: ["Declare the structure before main.", "Use member access consistently."],
  },
  "Classes": {
    objective: "Model data and behavior together using a class and a constructor.",
    requiredConcepts: ["class", "constructor", "method", "object"],
    constraints: "Input contains a single-word name and an integer roll number.",
    examples: [{ input: "John 20", output: "John 20", explanation: "Construct one object and display its fields." }],
    hints: ["Keep fields private where the language supports it.", "Initialize the object through its constructor."],
  },
  "Inheritance": {
    objective: "Reuse a base class and override behavior in derived classes.",
    requiredConcepts: ["base class", "derived class", "method overriding"],
    constraints: "Create at least two derived types with different behavior.",
    examples: [{ input: "", output: "Dog: Bark\nCat: Meow", explanation: "Each derived object supplies its own implementation." }],
    hints: ["Put shared behavior in the base type.", "The derived method must replace the base behavior."],
  },
  "Collections": {
    objective: "Store a variable-sized group of values and process it using a standard collection.",
    requiredConcepts: ["collection", "iteration", "sorting"],
    constraints: "The input contains between 1 and 100 integers.",
    examples: [{ input: "5 4 3 2 1", output: "1 2 3 4 5", explanation: "Print the values in ascending order." }],
    hints: ["Insert every input value before sorting.", "Print values with spaces and no extra labels."],
  },
  "Exception": {
    objective: "Handle invalid operations without terminating unexpectedly.",
    requiredConcepts: ["try/catch", "exception type", "finally"],
    constraints: "The divisor may be zero.",
    examples: [{ input: "10 0", output: "Cannot divide by zero", explanation: "The invalid operation is reported clearly." }],
    hints: ["Put only the risky operation inside the protected block.", "Keep cleanup in the finally block when supported."],
  },
  "File": {
    objective: "Write data to a file, read it back, and report errors clearly.",
    requiredConcepts: ["open", "write", "read", "close", "error handling"],
    constraints: "Use a local file named data.txt and do not rely on pre-existing content.",
    examples: [{ input: "", output: "Hello from the file.", explanation: "The starter writes a small file, reads it back, and prints the content." }],
    hints: ["Check every file-open operation.", "Close the write handle before opening the file for reading."],
  },
};

export const getSharedCurriculumContent = (language, topic) => {
  const normalizedTopic = topic.toLowerCase();
  const aliases = [
    ["Variables", ["variable", "data type"]],
    ["File", ["file"]],
    ["Exception", ["exception"]],
    ["Collections", ["collection", "stl"]],
    ["Inheritance", ["inheritance", "polymorphism", "interface"]],
    ["Classes", ["class", "object"]],
    ["Pointers", ["pointer", "reference"]],
    ["Arrays", ["array", "string"]],
    ["Functions", ["function", "method", "recursion"]],
    ["Control flow", ["control flow"]],
    ["Loops", ["loop"]],
    ["Conditional", ["conditional"]],
    ["Operators", ["operator"]],
    ["Structures", ["structure"]],
    ["Program structure and output", ["program structure", "i/o", "output"]],
  ];
  const key = normalizedTopic.includes("program structure")
    ? "Program structure and output"
    : aliases.find(([, terms]) =>
        terms.some((term) => normalizedTopic.includes(term)),
      )?.[0] || "Program structure";
  const detail = topicDetails[key];
  const languageName = languageNames[language] || language;
  return {
    ...detail,
    objective: `${detail.objective} Implement the solution in ${languageName}.`,
    instructions: [
      `You are working in the ${languageName} programming lab.`,
      "",
      "Task",
      detail.objective,
      "",
      "Implementation requirements",
      ...detail.requiredConcepts.map((concept) => `- Use or demonstrate: ${concept}.`),
      "",
      "Before submitting, test the example and at least two additional inputs.",
    ].join("\n"),
  };
};