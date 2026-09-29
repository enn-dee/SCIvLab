import Groq from "groq-sdk";
import {
  buildPracticalSystemPrompt,
  buildPracticalUserPrompt,
  LANGUAGE_LABELS,
} from "../../utils/practicalPrompt.js";

// ─── Init Groq client (lazy) ─────────────────────────────────────
let groqClient = null;

export const logAvailableModels = async () => {
  try {
    const groq = getGroq();
    const models = await groq.models.list();
    console.log(
      "✅ Groq models available:",
      models.data.map((m) => m.id).join(", "),
    );
  } catch (err) {
    console.warn("Could not list Groq models:", err.message);
  }
};

const getGroq = () => {
  if (groqClient) return groqClient;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in environment");
  }
  groqClient = new Groq({ apiKey });
  return groqClient;
};

// ─── JSON schema for the practical draft ─────────────────────────
const PRACTICAL_SCHEMA = {
  type: "object",
  properties: {
    description: { type: "string" },
    instructions: { type: "string" },
    inputFormat: { type: "string" },
    outputFormat: { type: "string" },
    pseudocode: {
      type: "array",
      items: { type: "string" },
    },
    timeComplexity: { type: "string" },
    spaceComplexity: { type: "string" },
    starterTemplate: {
      type: "object",
      properties: {
        prefix: { type: "string" },
        starterSolution: { type: "string" },
        suffix: { type: "string" },
      },
      required: ["prefix", "starterSolution", "suffix"],
      additionalProperties: false,
    },
    testCases: {
      type: "array",
      items: {
        type: "object",
        properties: {
          input: { type: "string" },
          expected: { type: "string" },
          visibility: { type: "string", enum: ["public", "hidden"] },
          weight: { type: "number" },
        },
        required: ["input", "expected", "visibility", "weight"],
        additionalProperties: false,
      },
    },
    execution: {
      type: "object",
      properties: {
        timeLimitSeconds: { type: "number" },
        memoryLimitKb: { type: "number" },
      },
      required: ["timeLimitSeconds", "memoryLimitKb"],
      additionalProperties: false,
    },
  },
  required: [
    "description",
    "instructions",
    "inputFormat",
    "outputFormat",
    "pseudocode",
    "timeComplexity",
    "spaceComplexity",
    "starterTemplate",
    "testCases",
    "execution",
  ],
  additionalProperties: false,
};

// ─── Generate a full practical draft ─────────────────────────────
export const generatePracticalDraft = async ({
  title,
  language = "c",
  difficulty = "intermediate",
}) => {
  if (!title || !title.trim()) {
    throw new Error("title is required");
  }
  if (!LANGUAGE_LABELS[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const groq = getGroq();
  const systemPrompt = buildPracticalSystemPrompt(language);
  const userPrompt = buildPracticalUserPrompt(
    title.trim(),
    language,
    difficulty,
  );

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b", // best-quality free model
    temperature: 0.4,
    max_tokens: 2500,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "practical_draft",
        strict: true,
        schema: PRACTICAL_SCHEMA,
      },
    },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Groq returned an empty response");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Groq returned malformed JSON");
  }

  return {
    ...parsed,
    language, // echo back for convenience
    suggestedTitle: title.trim(), // original input
  };
};

// ─── Regenerate only the test cases ──────────────────────────────
export const regenerateTestCases = async ({
  title,
  language = "c",
  description = "",
  count = 3,
}) => {
  const groq = getGroq();

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    temperature: 0.6,
    max_tokens: 1200,
    messages: [
      {
        role: "system",
        content: `You are a ${LANGUAGE_LABELS[language]} instructor.
Generate ${count} test cases for the given practical.
Return valid JSON only.`,
      },
      {
        role: "user",
        content: `Practical: "${title}"
Description: ${description}
Provide ${count} test cases. The first must be "public", the rest "hidden".`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "test_cases",
        strict: true,
        schema: {
          type: "object",
          properties: {
            testCases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  input: { type: "string" },
                  expected: { type: "string" },
                  visibility: { type: "string", enum: ["public", "hidden"] },
                  weight: { type: "number" },
                },
                required: ["input", "expected", "visibility", "weight"],
                additionalProperties: false,
              },
            },
          },
          required: ["testCases"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = completion.choices[0]?.message?.content;
  const parsed = JSON.parse(raw);
  return parsed.testCases;
};

// ─── Refine a single field based on teacher feedback ─────────────
export const refineField = async ({ field, currentValue, feedback, title }) => {
  const groq = getGroq();

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    temperature: 0.4,
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: `You rewrite a single field of a programming practical based on teacher feedback.
Return ONLY the new value of the field as plain text. No quotes, no extra commentary.`,
      },
      {
        role: "user",
        content: `Practical: "${title}"
Field: ${field}
Current value:
${currentValue}

Teacher feedback: ${feedback}

Rewrite the field.`,
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || currentValue;
};
