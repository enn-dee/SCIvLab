const IGNORED_KEYS = new Set(["_id", "__v", "createdAt", "updatedAt", "labId"]);

// Check if a value is a plain object (not Date, not Array, not null)
const isPlainObject = (val) =>
  val !== null &&
  typeof val === "object" &&
  !Array.isArray(val) &&
  !(val instanceof Date);

// Human-readable formatting for a value
const formatValue = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (val instanceof Date) return val.toLocaleString();
  if (Array.isArray(val)) {
    if (val.length === 0) return "(empty)";
    // Array of primitives → comma-joined
    if (val.every((v) => typeof v !== "object" || v === null)) {
      return val.map((v) => String(v)).join(", ");
    }
    // Array of objects → show count
    return `${val.length} item${val.length === 1 ? "" : "s"}`;
  }
  if (isPlainObject(val)) {
    const keys = Object.keys(val);
    if (keys.length === 0) return "(empty)";
    return `${keys.length} field${keys.length === 1 ? "" : "s"}`;
  }
  // Dates stored as strings
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
    try {
      return new Date(val).toLocaleString();
    } catch {
      return val;
    }
  }
  return String(val);
};

// Flatten nested objects into dotted keys: "rules.lateSubmissionAllowed": true
const flatten = (obj, prefix = "", out = {}) => {
  if (obj === null || obj === undefined) return out;
  if (!isPlainObject(obj)) {
    out[prefix] = obj;
    return out;
  }
  Object.entries(obj).forEach(([key, val]) => {
    if (IGNORED_KEYS.has(key)) return;
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(val)) {
      flatten(val, path, out);
    } else {
      out[path] = val;
    }
  });
  return out;
};

// Pretty-print a field key: "rules.lateSubmissionAllowed" → "Rules → Late Submission Allowed"
const prettyKey = (key) =>
  key
    .split(".")
    .map((part) =>
      part
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (c) => c.toUpperCase())
        .trim(),
    )
    .join(" → ");

// Compare two arrays of primitives
const arraysEqual = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((v, i) => String(v) === String(b[i]));
};

// Main diff function
export const computeDiff = (before, after) => {
  const b = flatten(before || {});
  const a = flatten(after || {});

  const allKeys = new Set([...Object.keys(b), ...Object.keys(a)]);
  const changes = [];

  allKeys.forEach((key) => {
    const oldVal = b[key];
    const newVal = a[key];

    // Skip if both undefined
    if (oldVal === undefined && newVal === undefined) return;

    // Arrays of primitives (like students[])
    if (Array.isArray(oldVal) || Array.isArray(newVal)) {
      if (arraysEqual(oldVal, newVal)) return;
      changes.push({
        key,
        label: prettyKey(key),
        oldValue: oldVal,
        newValue: newVal,
        type: "changed",
      });
      return;
    }

    // Deep compare via JSON stringify (works for objects/arrays/primitives)
    const oldStr = JSON.stringify(oldVal);
    const newStr = JSON.stringify(newVal);

    if (oldStr === newStr) return;

    let type = "changed";
    if (oldVal === undefined) type = "added";
    else if (newVal === undefined) type = "removed";

    changes.push({
      key,
      label: prettyKey(key),
      oldValue: oldVal,
      newValue: newVal,
      type,
    });
  });

  return changes;
};

export const formatDiffValue = formatValue;
