import connectDB from "../../config/db.js";
import Lab from "../../models/Lab.js";
import Practical from "../../models/Practical.js";
import dijkstraPracticalConfig from "./seedDijkstraPractical.js";
import { getSharedCurriculumContent } from "./sharedCurriculumContent.js";

const curriculum = [
  {
    name: "C Programming Lab",
    subjectCode: "CS-C",
    language: "c",
    topics: [
      "Program structure and output",
      "Variables and data types",
      "Operators and expressions",
      "Conditional statements",
      "Loops",
      "Functions",
      "Arrays",
      "Pointers",
      "Structures",
      "File handling",
      "Dijkstra's Algorithm",
    ],
  },
  {
    name: "C++ Programming Lab",
    subjectCode: "CS-CPP",
    language: "cpp",
    topics: [
      "Program structure and I/O",
      "Data types and control flow",
      "Functions and recursion",
      "Arrays and strings",
      "Pointers and references",
      "Classes and objects",
      "Inheritance",
      "Polymorphism",
      "STL containers",
      "File handling",
    ],
  },
  {
    name: "Java Programming Lab",
    subjectCode: "CS-JAVA",
    language: "java",
    topics: [
      "Program structure and output",
      "Data types and operators",
      "Control flow",
      "Methods and arrays",
      "Classes and objects",
      "Inheritance",
      "Interfaces and packages",
      "Exception handling",
      "Collections",
      "File I/O",
    ],
  },
];

// ─── Helper: test cases per topic ──────────────────────────────────────
function getTestCasesForTopic(language, topic) {
  let publicTests = [];
  let hiddenTests = [];

  // Simple mappings based on topic (adjust to your starters)
  if (
    topic.includes("Variables and data types") ||
    topic.includes("Data types")
  ) {
    publicTests = [
      {
        input: "5 2.5 a",
        expected: "5, 2.50, a",
        visibility: "public",
        weight: 1,
      },
    ];
    hiddenTests = [
      {
        input: "10 3.14 z",
        expected: "10, 3.14, z",
        visibility: "hidden",
        weight: 2,
      },
      {
        input: "-5 0.0 b",
        expected: "-5, 0.00, b",
        visibility: "hidden",
        weight: 2,
      },
    ];
  } else if (
    topic.includes("Program structure") ||
    topic.includes("Program structure and output")
  ) {
    publicTests = [
      { input: "", expected: "Hello, World!", visibility: "public", weight: 1 },
    ];
    hiddenTests = [
      { input: "", expected: "Hello, World!", visibility: "hidden", weight: 2 },
      { input: "", expected: "Hello, World!", visibility: "hidden", weight: 2 },
    ];
  } else if (topic.includes("Operators")) {
    publicTests = [
      {
        input: "10 3",
        expected: "13 7 30 3 1",
        visibility: "public",
        weight: 1,
      },
    ];
    hiddenTests = [
      { input: "5 2", expected: "7 3 10 2 1", visibility: "hidden", weight: 2 },
      {
        input: "-5 -2",
        expected: "-7 -3 10 2 -1",
        visibility: "hidden",
        weight: 2,
      },
    ];
  } else if (topic.includes("Conditional")) {
    publicTests = [
      { input: "5", expected: "Positive", visibility: "public", weight: 1 },
    ];
    hiddenTests = [
      { input: "-3", expected: "Negative", visibility: "hidden", weight: 2 },
      { input: "0", expected: "Zero", visibility: "hidden", weight: 2 },
    ];
  } else if (topic.includes("Control flow")) {
    publicTests = [
      { input: "8", expected: "Even", visibility: "public", weight: 1 },
    ];
    hiddenTests = [
      { input: "7", expected: "Odd", visibility: "hidden", weight: 1 },
      { input: "0", expected: "Even", visibility: "hidden", weight: 1 },
    ];
  } else if (topic.includes("Loops")) {
    publicTests = [
      { input: "5", expected: "15", visibility: "public", weight: 1 },
    ];
    hiddenTests = [
      { input: "10", expected: "55", visibility: "hidden", weight: 2 },
      { input: "1", expected: "1", visibility: "hidden", weight: 2 },
    ];
  } else if (topic.includes("Functions")) {
    publicTests = [
      { input: "3 4", expected: "7 9", visibility: "public", weight: 1 },
    ];
    hiddenTests = [
      { input: "5 2", expected: "7 25", visibility: "hidden", weight: 2 },
      { input: "0 0", expected: "0 0", visibility: "hidden", weight: 2 },
    ];
  } else if (topic.includes("Arrays")) {
    publicTests = [
      {
        input: "10 20 30 40 50",
        expected: "150 30",
        visibility: "public",
        weight: 1,
      },
    ];
    hiddenTests = [
      { input: "1 2 3 4 5", expected: "15 3", visibility: "hidden", weight: 2 },
      { input: "5 5 5 5 5", expected: "25 5", visibility: "hidden", weight: 2 },
    ];
  } else if (topic.includes("Pointers")) {
    publicTests = [
      { input: "10", expected: "20", visibility: "public", weight: 1 },
    ];
    hiddenTests = [
      { input: "5", expected: "10", visibility: "hidden", weight: 2 },
      { input: "0", expected: "0", visibility: "hidden", weight: 2 },
    ];
  } else if (topic.includes("Structures")) {
    publicTests = [
      {
        input: "John 101 85",
        expected: "John 101 85",
        visibility: "public",
        weight: 1,
      },
    ];
    hiddenTests = [
      {
        input: "Alice 202 92",
        expected: "Alice 202 92",
        visibility: "hidden",
        weight: 2,
      },
      {
        input: "Bob 303 75",
        expected: "Bob 303 75",
        visibility: "hidden",
        weight: 2,
      },
    ];
  } else if (topic.includes("File handling") || topic.includes("File I/O")) {
    publicTests = [
      {
        input: "",
        expected: "Hello from the file.",
        visibility: "public",
        weight: 1,
      },
    ];
    hiddenTests = [];
  } else if (topic.includes("Inheritance") || topic.includes("Polymorphism")) {
    publicTests = [
      {
        input: "",
        expected: "Dog: Bark\nCat: Meow",
        visibility: "public",
        weight: 1,
        checker: "whitespace",
      },
    ];
    hiddenTests = [
      {
        input: "",
        expected: "Dog: Bark\nCat: Meow",
        visibility: "hidden",
        weight: 1,
        checker: "whitespace",
      },
    ];
  } else if (
    topic.includes("Classes and objects") ||
    topic.includes("Classes and Objects")
  ) {
    publicTests = [
      {
        input: "John 20",
        expected: "John 20",
        visibility: "public",
        weight: 1,
      },
    ];
    hiddenTests = [
      {
        input: "Alice 25",
        expected: "Alice 25",
        visibility: "hidden",
        weight: 2,
      },
    ];
  } else if (topic.includes("Interfaces")) {
    publicTests = [
      {
        input: "",
        expected: "Drawing a circle",
        visibility: "public",
        weight: 1,
      },
    ];
    hiddenTests = [
      {
        input: "",
        expected: "Drawing a circle",
        visibility: "hidden",
        weight: 2,
      },
    ];
  } else if (
    topic.includes("Collections") ||
    topic.includes("STL containers")
  ) {
    publicTests = [
      {
        input: "5 4 3 2 1",
        expected: "1 2 3 4 5",
        visibility: "public",
        weight: 1,
      },
    ];
    hiddenTests = [
      {
        input: "9 8 7 6",
        expected: "6 7 8 9",
        visibility: "hidden",
        weight: 2,
      },
    ];
  } else if (topic.includes("Exception handling")) {
    publicTests = [
      {
        input: "10 0",
        expected: "Cannot divide by zero",
        visibility: "public",
        weight: 1,
      },
    ];
    hiddenTests = [
      { input: "10 2", expected: "5", visibility: "hidden", weight: 2 },
    ];
  } else {
    // fallback
    publicTests = [
      { input: "", expected: "OK", visibility: "public", weight: 1 },
    ];
    hiddenTests = [
      { input: "", expected: "OK", visibility: "hidden", weight: 1 },
    ];
  }

  // Keep public examples first and remove accidental duplicate cases.
  const seen = new Set();
  return [...publicTests, ...hiddenTests.slice(0, 6)].filter((test) => {
    const key = `${JSON.stringify(test.input)}:${JSON.stringify(test.expected)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Helper: detailed instructions based on language & topic ────────
function getDetailedInstructions(language, topic) {
  const langName = { c: "C", cpp: "C++", java: "Java" }[language] || language;
  const base = `Write a ${langName} program that demonstrates the concept of **"${topic}"**.\n\n`;

  const details = {
    c: {
      "Program structure and output":
        "1. Include the standard input-output header (`stdio.h`).\n2. Define the `main()` function.\n3. Use `printf()` to print a message like 'Hello, World!'.\n4. Compile and run the program.",
      "Variables and data types":
        "1. Declare variables of different types: `int`, `float`, `char`.\n2. Assign values to them.\n3. Print their values using `printf()` with appropriate format specifiers (`%d`, `%f`, `%c`).",
      "Operators and expressions":
        "1. Take two numbers as input (or hardcode them).\n2. Perform arithmetic operations: `+`, `-`, `*`, `/`, `%`.\n3. Print the results of each operation.",
      "Conditional statements":
        "1. Read a number from the user.\n2. Use `if`, `else if`, and `else` to check if the number is positive, negative, or zero.\n3. Print the appropriate message.",
      Loops:
        "1. Use a `for` loop to print numbers from 1 to 10.\n2. Use a `while` loop to calculate the sum of first N natural numbers.\n3. Use a `do-while` loop to print a menu at least once.",
      Functions:
        "1. Write a function that takes two integers and returns their sum.\n2. Write another function that takes a number and returns its square.\n3. Call these functions from `main()` and print the results.",
      Arrays:
        "1. Declare an integer array of size 5.\n2. Take 5 values as input using a loop.\n3. Find and print the sum and average of the array elements.",
      Pointers:
        "1. Declare an integer variable and a pointer to it.\n2. Assign the address of the variable to the pointer.\n3. Modify the variable's value through the pointer.\n4. Print the value and address.",
      Structures:
        "1. Define a `struct` for a student with fields: `name`, `roll`, `marks`.\n2. Create a variable of this struct.\n3. Assign values to its members and print them.",
      "File handling":
        "1. Open a file named 'data.txt' in write mode.\n2. Write a few lines to the file.\n3. Close the file.\n4. Reopen it in read mode and print its content.",
    },
    cpp: {
      "Program structure and I/O":
        "1. Include the `iostream` header.\n2. Use `std::cout` to print a message.\n3. Use `std::cin` to read a user's name and greet them.",
      "Data types and control flow":
        "1. Declare variables of types: `int`, `float`, `double`, `bool`.\n2. Use `if`-`else` to compare two numbers and print the larger one.\n3. Use `switch` to print the day name based on a number (1-7).",
      "Functions and recursion":
        "1. Write a function to calculate the factorial of a number using recursion.\n2. Write a function to calculate `nCr` using another function.\n3. Call these functions from `main()`.",
      "Arrays and strings":
        "1. Create a string array of 3 names.\n2. Print all names using a loop.\n3. Find the length of a string using `.length()`.",
      "Pointers and references":
        "1. Declare an integer and a pointer to it.\n2. Use the pointer to modify the integer.\n3. Declare a reference variable to the same integer and show how it works.",
      "Classes and objects":
        "1. Define a `class` `Student` with private attributes `name` and `roll`.\n2. Use a constructor to initialize them.\n3. Create an object and call a method to display its details.",
      Inheritance:
        "1. Define a base class `Shape` with a `area()` method.\n2. Derive `Rectangle` and `Circle` from it.\n3. Override `area()` in each and demonstrate polymorphism.",
      Polymorphism:
        "1. Create a base class pointer to a derived class object.\n2. Use `virtual` functions to call the correct overridden method.\n3. Print the area of different shapes.",
      "STL containers":
        "1. Use `std::vector` to store 5 integers.\n2. Sort the vector using `std::sort`.\n3. Use `std::map` to store roll numbers and names, and print them.",
      "File handling":
        "1. Use `std::fstream` to write data to a file.\n2. Read the same file and display its content.\n3. Append a new line to the file.",
    },
    java: {
      "Program structure and output":
        "1. Create a class named `Main`.\n2. Define the `public static void main(String[] args)` method.\n3. Use `System.out.println()` to print 'Hello, World!'.",
      "Data types and operators":
        "1. Declare variables of types: `int`, `double`, `char`, `boolean`.\n2. Perform arithmetic operations and assign results.\n3. Print all values.",
      "Control flow":
        "1. Read an integer from the user using `Scanner`.\n2. Use `if`-`else` to check if it's even or odd.\n3. Use a `for` loop to print the Fibonacci series up to N terms.",
      "Methods and arrays":
        "1. Write a method that returns the maximum of an array.\n2. Create an array of 5 integers from user input.\n3. Call the method and print the max.",
      "Classes and objects":
        "1. Define a class `Student` with attributes `roll` and `name`.\n2. Create a constructor to set them.\n3. Create an object and print its details.",
      Inheritance:
        "1. Define a class `Animal` with a method `sound()`.\n2. Create subclasses `Dog` and `Cat` that override `sound()`.\n3. Demonstrate polymorphism in `main()`.",
      "Interfaces and packages":
        "1. Define an interface `Drawable` with a method `draw()`.\n2. Implement it in a class `Circle`.\n3. Create a package `shapes` and put the class in it.\n4. Import and use it in the main class.",
      "Exception handling":
        "1. Write code that divides two numbers.\n2. Use `try`-`catch` to handle `ArithmeticException`.\n3. Use a `finally` block to print 'Execution completed'.",
      Collections:
        "1. Use `ArrayList` to store 5 strings.\n2. Sort the list using `Collections.sort()`.\n3. Iterate over it using an enhanced `for` loop.",
      "File I/O":
        "1. Use `FileWriter` to write text to a file.\n2. Use `BufferedReader` to read the file content.\n3. Handle `IOException` properly.",
    },
  };

  const langDetails = details[language] || {};
  const topicKey =
    Object.keys(langDetails).find((key) => topic.includes(key)) || topic;
  const instruction =
    langDetails[topicKey] ||
    `Practice the concept of "${topic}" by writing a ${langName} program.`;

  return base + instruction;
}

// ─── Helper: starter template ──────────────────────────────────────────
const templateForRaw = (language, title) => {
  const topic = title.toLowerCase();
  if (language === "c") {
    if (topic.includes("program structure")) {
      return {
        prefix: "#include <stdio.h>\n\nint main(void) {\n",
        starterSolution: "    /* TODO: print Hello, World! */",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("variables")) {
      return {
        prefix: "#include <stdio.h>\n\nint main(void) {\n    int wholeNumber;\n    float decimalNumber;\n    char letter;\n\n    scanf(\"%d %f %c\", &wholeNumber, &decimalNumber, &letter);\n",
        starterSolution: "    /* TODO: print the values in the required format */",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("operators")) {
      return {
        prefix: "#include <stdio.h>\n\nint main(void) {\n    int a, b;\n    scanf(\"%d %d\", &a, &b);\n",
        starterSolution: "    /* TODO: calculate and print the five results */",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("conditional")) {
      return {
        prefix: "#include <stdio.h>\n\nint main(void) {\n    int number;\n    scanf(\"%d\", &number);\n",
        starterSolution: "    /* TODO: classify number and print Positive, Negative, or Zero */",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("loops")) {
      return {
        prefix: "#include <stdio.h>\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    int sum = 0;\n",
        starterSolution: "    /* TODO: use a loop to calculate and print the sum */",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("functions")) {
      return {
        prefix: "#include <stdio.h>\n\nint add(int a, int b) {\n    /* TODO: return the sum */\n    return 0;\n}\n\nint multiply(int a, int b) {\n    /* TODO: return the product */\n    return 0;\n}\n\nint main(void) {\n    int a, b;\n    scanf(\"%d %d\", &a, &b);\n",
        starterSolution: "    /* TODO: call the functions and print their results */",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("arrays")) {
      return {
        prefix: "#include <stdio.h>\n\nint main(void) {\n    int values[5];\n    for (int i = 0; i < 5; i++) {\n        scanf(\"%d\", &values[i]);\n    }\n    int sum = 0;\n",
        starterSolution: "    /* TODO: calculate and print the sum and average */",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("pointers")) {
      return {
        prefix: "#include <stdio.h>\n\nint main(void) {\n    int value;\n    scanf(\"%d\", &value);\n    int *pointer = &value;\n",
        starterSolution: "    /* TODO: modify the value through pointer and print it */",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("structures")) {
      return {
        prefix: "#include <stdio.h>\n\nstruct Student {\n    char name[50];\n    int roll;\n    int marks;\n};\n\nint main(void) {\n    struct Student student;\n    scanf(\"%49s %d %d\", student.name, &student.roll, &student.marks);\n",
        starterSolution: "    /* TODO: print the student's fields */",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("file")) {
      return {
        prefix: "#include <stdio.h>\n\nint main(void) {\n    FILE *file = fopen(\"data.txt\", \"w\");\n    if (file == NULL) return 1;\n    /* TODO: write the requested data */\n    fclose(file);\n\n    file = fopen(\"data.txt\", \"r\");\n    if (file == NULL) return 1;\n",
        starterSolution: "    /* TODO: write data, read it back, and print the content */",
        suffix: "\n    return 0;\n}\n",
      };
    }
    return {
      prefix: "#include <stdio.h>\n\nint main(void) {\n",
      starterSolution: "    /* Write the solution here. */",
      suffix: "\n    return 0;\n}\n",
    };
  }
  if (language === "cpp") {
    if (topic.includes("program structure")) {
      return {
        prefix: "#include <iostream>\n\nint main() {\n",
        starterSolution: "    // TODO: print Hello, World!",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("data types")) {
      return {
        prefix: "#include <iomanip>\n#include <iostream>\n\nint main() {\n    int wholeNumber;\n    double decimalNumber;\n    char letter;\n    std::cin >> wholeNumber >> decimalNumber >> letter;\n",
        starterSolution: "    // TODO: print the values in the required format",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("functions")) {
      return {
        prefix: "#include <iostream>\n\nint add(int a, int b) { /* TODO: return the sum */ return 0; }\nint multiply(int a, int b) { /* TODO: return the product */ return 0; }\n\nint main() {\n    int a, b;\n    std::cin >> a >> b;\n",
        starterSolution: "    // TODO: call the functions and print their results",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("arrays")) {
      return {
        prefix: "#include <iostream>\n\nint main() {\n    int values[5];\n    for (int& value : values) std::cin >> value;\n    int sum = 0;\n",
        starterSolution: "    // TODO: calculate and print the sum and average",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("pointers")) {
      return {
        prefix: "#include <iostream>\n\nint main() {\n    int value;\n    std::cin >> value;\n    int* pointer = &value;\n",
        starterSolution: "    // TODO: modify the value through pointer and print it",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("file")) {
      return {
        prefix: "#include <fstream>\n#include <iostream>\n#include <string>\n\nint main() {\n    std::ofstream output(\"data.txt\");\n    std::ifstream input(\"data.txt\");\n    std::string line;\n",
        starterSolution: "    // TODO: write data, read it back, and print the content",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("classes")) {
      return {
        prefix: "#include <iostream>\n#include <string>\n\nclass Student {\npublic:\n    Student(const std::string& name, int roll) : name(name), roll(roll) {}\n    void display() const { /* TODO: print the student details */ }\nprivate:\n    std::string name;\n    int roll;\n};\n\nint main() {\n    std::string name;\n    int roll;\n    std::cin >> name >> roll;\n    Student student(name, roll);\n",
        starterSolution: "    // TODO: display the student's details",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("inheritance") || topic.includes("polymorphism")) {
      return {
        prefix: "#include <iostream>\n\nclass Animal {\npublic:\n    virtual void sound() const { /* TODO: implement base behavior */ }\n    virtual ~Animal() = default;\n};\n\nclass Dog : public Animal {\npublic:\n    void sound() const override { /* TODO: implement Dog behavior */ }\n};\n\nclass Cat : public Animal {\npublic:\n    void sound() const override { /* TODO: implement Cat behavior */ }\n};\n\nint main() {\n    Dog dog;\n    Cat cat;\n    Animal* animals[] = {&dog, &cat};\n",
        starterSolution: "    // TODO: call sound through the base-class pointers",
        suffix: "\n    return 0;\n}\n",
      };
    }
    if (topic.includes("collections") || topic.includes("stl")) {
      return {
        prefix: "#include <algorithm>\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> values;\n    int value;\n    while (std::cin >> value) values.push_back(value);\n",
        starterSolution: "    // TODO: sort the values and print them",
        suffix: "\n    return 0;\n}\n",
      };
    }
    return {
      prefix: "#include <iostream>\n\nint main() {\n",
      starterSolution: "    /* Write the solution here. */",
      suffix: "\n    return 0;\n}\n",
    };
  }
  if (topic.includes("program structure")) {
    return {
      prefix: "public class Main {\n    public static void main(String[] args) {\n",
      starterSolution: "        // TODO: print Hello, World!",
      suffix: "\n    }\n}\n",
    };
  }
  if (topic.includes("control flow")) {
    return {
      prefix: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int number = scanner.nextInt();\n",
      starterSolution: "        // TODO: classify the number as Even or Odd",
      suffix: "\n    }\n}\n",
    };
  }
  if (topic.includes("data types")) {
    return {
      prefix: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int wholeNumber = scanner.nextInt();\n        double decimalNumber = scanner.nextDouble();\n        char letter = scanner.next().charAt(0);\n",
      starterSolution: "        // TODO: print the values in the required format",
      suffix: "\n    }\n}\n",
    };
  }
  if (topic.includes("methods") || topic.includes("arrays")) {
    return {
      prefix: "import java.util.Scanner;\n\npublic class Main {\n    static int sum(int[] values) {\n        int total = 0;\n        for (int value : values) total += value;\n        return total;\n    }\n\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int[] values = new int[5];\n        for (int i = 0; i < values.length; i++) values[i] = scanner.nextInt();\n",
      starterSolution: "        // TODO: call sum and print the sum and average",
      suffix: "\n    }\n}\n",
    };
  }
  if (topic.includes("classes")) {
    return {
      prefix: "import java.util.Scanner;\n\npublic class Main {\n    static class Student {\n        private final String name;\n        private final int roll;\n\n        Student(String name, int roll) {\n            this.name = name;\n            this.roll = roll;\n        }\n\n        void display() {\n            /* TODO: print the student details */\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        String name = scanner.next();\n        int roll = scanner.nextInt();\n        Student student = new Student(name, roll);\n",
      starterSolution: "        // TODO: display the student's details",
      suffix: "\n    }\n}\n",
    };
  }
  if (topic.includes("inheritance")) {
    return {
      prefix: "public class Main {\n    static class Animal {\n        void sound() { /* TODO: implement base behavior */ }\n    }\n\n    static class Dog extends Animal {\n        @Override void sound() { /* TODO: implement Dog behavior */ }\n    }\n\n    static class Cat extends Animal {\n        @Override void sound() { /* TODO: implement Cat behavior */ }\n    }\n\n    public static void main(String[] args) {\n        Animal[] animals = {new Dog(), new Cat()};\n",
      starterSolution: "        // TODO: call sound polymorphically for each animal",
      suffix: "\n    }\n}\n",
    };
  }
  if (topic.includes("interfaces")) {
    return {
      prefix: "public class Main {\n    interface Drawable {\n        void draw();\n    }\n\n    static class Circle implements Drawable {\n        public void draw() { /* TODO: implement drawing */ }\n    }\n\n    public static void main(String[] args) {\n        Drawable shape = new Circle();\n",
      starterSolution: "        // TODO: call draw through the interface",
      suffix: "\n    }\n}\n",
    };
  }
  if (topic.includes("exception")) {
    return {
      prefix: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int numerator = scanner.nextInt();\n        int denominator = scanner.nextInt();\n",
      starterSolution: "        // TODO: handle division and the zero-denominator exception",
      suffix: "\n    }\n}\n",
    };
  }
  if (topic.includes("collections")) {
    return {
      prefix: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        List<Integer> values = new ArrayList<>();\n        while (scanner.hasNextInt()) values.add(scanner.nextInt());\n",
      starterSolution: "        // TODO: sort the collection and print its values",
      suffix: "\n    }\n}\n",
    };
  }
  if (topic.includes("file")) {
    return {
      prefix: "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        try (PrintWriter writer = new PrintWriter(\"data.txt\")) {\n            /* TODO: write the requested data */\n        } catch (IOException error) {\n            return;\n        }\n\n        try (BufferedReader reader = new BufferedReader(new FileReader(\"data.txt\"))) {\n",
      starterSolution: "            // TODO: read the file and print its content",
      suffix: "\n        } catch (IOException error) {\n            System.out.println(\"File error\");\n        }\n    }\n}\n",
    };
  }
  // Java fallback: the editable area remains inside a valid Main class.
  return {
    prefix: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n",
    starterSolution: "        // Write the solution here.",
    suffix: "\n    }\n}\n",
  };
};

// Keep only imports/includes locked. The complete program scaffold stays in
// the editable middle editor so students can implement every required part.
const templateFor = (language, title) => {
  const template = templateForRaw(language, title);
  const topic = title.toLowerCase();
  const requiresEditableScaffold = [
    "functions",
    "file",
    "classes",
    "inheritance",
    "polymorphism",
    "interfaces",
  ].some((part) => topic.includes(part));

  if (!requiresEditableScaffold) return template;

  const headerPattern =
    language === "java"
      ? /^(?:import [^\n]+\n)+/
      : /^(?:#include [^\n]+\n)+/;
  const header = template.prefix.match(headerPattern)?.[0] || "";
  return {
    prefix: header,
    starterSolution: `${template.prefix.slice(header.length)}${template.starterSolution || ""}${template.suffix || ""}`,
    suffix: "",
  };
};

// ─── Seed function ──────────────────────────────────────────────────────
const seed = async () => {
  await connectDB();
  await Lab.deleteMany({ session: "Shared Curriculum" });

  for (const item of curriculum) {
    let lab = await Lab.findOne({
      subjectCode: item.subjectCode,
      kind: "academic",
    });
    if (!lab) {
      lab = await Lab.create({
        name: item.name,
        subjectCode: item.subjectCode,
        session: "Shared Curriculum",
        kind: "academic",
        status: "current",
      });
    }

    for (const [index, title] of item.topics.entries()) {
      const existing = await Practical.findOne({
        labId: lab._id,
        order: index + 1,
      });
      if (!existing) {
        // Determine if this is the custom Dijkstra practical
        const customPractical =
          item.language === "c" && title === "Dijkstra's Algorithm"
            ? dijkstraPracticalConfig() // ✅ uses imported function
            : null;

        // ── Build the practical fields based on custom or dev ──
        let description, instructions, starterTemplate, testCases;
        let objective = "";
        let examples = [];
        let hints = [];
        let requiredConcepts = [];
        let constraints = "";
        let inputFormat = "";
        let outputFormat = "";

        if (customPractical) {
          description = customPractical.description;
          instructions = customPractical.instructions;
          starterTemplate = customPractical.starterTemplate;
          testCases = customPractical.testCases;
          objective = customPractical.description;
        } else {
          const content = getSharedCurriculumContent(item.language, title);
          description = content.objective;
          instructions = `${content.instructions}\n\nInput format\n${content.constraints}\n\nExample\nInput: ${content.examples[0].input || "(none)"}\nOutput: ${content.examples[0].output}`;
          objective = content.objective;
          examples = content.examples;
          hints = content.hints;
          requiredConcepts = content.requiredConcepts;
          constraints = content.constraints;
          inputFormat = content.constraints;
          outputFormat = String(content.examples[0].output ?? "");
          starterTemplate = {
            [item.language]: templateFor(item.language, title),
          };
          testCases = getTestCasesForTopic(item.language, title);
        }

        await Practical.create({
          labId: lab._id,
          title: `${index + 1}. ${title}`,
          description,
          instructions,
          objective,
          examples,
          hints,
          requiredConcepts,
          constraints,
          inputFormat,
          outputFormat,
          order: index + 1,
          starterTemplate,
          testCases,
          execution: {
            enabled: true,
            allowedLanguages: [item.language],
            timeLimitSeconds: 2,
            memoryLimitKb: 128000,
          },
        });
      }
    }
  }

  console.log(
    "Academic C, C++, and Java curricula seeded with detailed instructions, plus Dijkstra's Algorithm custom practical.",
  );
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
