import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Lab from "../models/Lab.js";
import Practical from "../models/Practical.js";

// ═══════════════════════════════════════════════════════════════════
//  ✏️  EDIT THIS BLOCK ONLY
//  Configure the practical you want to add to an existing lab.
// ═══════════════════════════════════════════════════════════════════
const CONFIG = {
  // ── Which lab? Identify by subjectCode + kind, OR by _id ──
  labSubjectCode: "CS-C", // e.g., "CS-C", "CS-CPP", "CS-JAVA"
  labKind: "academic", // "academic" | "private"
  // labId: "6a9714790e5c082e49b8079e", // (optional) use this instead of subjectCode

  // ── Practical details ──
  title: "Reverse a String",
  description: "Read a string and print it reversed.",
  instructions:
    "1. Read a single line of input (string).\n2. Reverse the characters.\n3. Print the reversed string.\n\nExample:\nInput: hello\nOutput: olleh",

  order: 12, // display order in the lab
  deadline: null, // e.g., new Date("2026-12-31") or null

  // ── Starter template (prefix + editable + suffix) ──
  language: "c", // "c" | "cpp" | "java" | "python" | "javascript"
  starterTemplate: {
    prefix: "#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n",
    starterSolution: `    // Write your solution here\n    `,
    suffix: "\n    return 0;\n}\n",
  },

  // ── Test cases ──
  testCases: [
    {
      input: "hello",
      expected: "olleh",
      visibility: "public",
      weight: 1,
    },
    {
      input: "racecar",
      expected: "racecar",
      visibility: "hidden",
      weight: 2,
    },
    {
      input: "abcd",
      expected: "dcba",
      visibility: "hidden",
      weight: 2,
    },
  ],

  // ── Execution settings ──
  execution: {
    enabled: true,
    allowedLanguages: ["c"], // e.g., ["python"], ["c","cpp","java"]
    timeLimitSeconds: 2,
    memoryLimitKb: 128000,
  },

  // ── Behaviour ──
  replaceIfExists: true, // if true, delete existing practical with same title
};
// ═══════════════════════════════════════════════════════════════════
//  🚫  DO NOT EDIT BELOW THIS LINE UNLESS YOU KNOW WHAT YOU'RE DOING
// ═══════════════════════════════════════════════════════════════════

const seedOnePractical = async () => {
  try {
    await connectDB();
    console.log("🔗 Connected to MongoDB");

    // ── 1. Find the target lab ──
    let lab = null;
    if (CONFIG.labId) {
      lab = await Lab.findById(CONFIG.labId);
    } else {
      lab = await Lab.findOne({
        subjectCode: CONFIG.labSubjectCode,
        kind: CONFIG.labKind,
      });
    }

    if (!lab) {
      console.error(
        `❌ Lab not found (subjectCode="${CONFIG.labSubjectCode}", kind="${CONFIG.labKind}")`,
      );
      process.exit(1);
    }

    console.log(
      `📚 Target lab: ${lab.name} (${lab.subjectCode}, _id=${lab._id})`,
    );

    // ── 2. Handle existing practical with same title ──
    const existing = await Practical.findOne({
      labId: lab._id,
      title: CONFIG.title,
    });

    if (existing && !CONFIG.replaceIfExists) {
      console.warn(
        `⚠️  Practical "${CONFIG.title}" already exists. Set replaceIfExists=true to overwrite. Skipping.`,
      );
      process.exit(0);
    }

    if (existing && CONFIG.replaceIfExists) {
      await Practical.findByIdAndDelete(existing._id);
      console.log(`🗑️  Replaced existing practical "${CONFIG.title}"`);
    }

    // ── 3. Build the starter template object ──
    const starterTemplate = {
      [CONFIG.language]: {
        prefix: CONFIG.starterTemplate.prefix || "",
        suffix: CONFIG.starterTemplate.suffix || "",
        starterSolution: CONFIG.starterTemplate.starterSolution || "",
      },
    };

    // ── 4. Create the practical ──
    const practical = await Practical.create({
      labId: lab._id,
      title: CONFIG.title,
      description: CONFIG.description,
      instructions: CONFIG.instructions,
      order: CONFIG.order,
      deadline: CONFIG.deadline,
      starterTemplate,
      testCases: CONFIG.testCases,
      execution: CONFIG.execution,
    });

    console.log("✅ Practical created successfully!");
    console.log("   ─────────────────────────────────");
    console.log(`   Title:      ${practical.title}`);
    console.log(`   Lab:        ${lab.name}`);
    console.log(`   Order:      ${practical.order}`);
    console.log(`   Language:   ${CONFIG.language}`);
    console.log(
      `   Test cases: ${CONFIG.testCases.length} (${CONFIG.testCases.filter((t) => t.visibility === "public").length} public, ${CONFIG.testCases.filter((t) => t.visibility === "hidden").length} hidden)`,
    );
    console.log(`   _id:        ${practical._id}`);
    console.log("   ─────────────────────────────────");
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedOnePractical();
