// dryRunEngines.js
// Each engine returns: Array<{ nodeId, label, vars, result? }>
// vars: object of variable name → value shown in the var cards

// ─── Palindrome Check ────────────────────────────────────────────────────────
function buildPalindromeSteps(s) {
  if (!s) return [];
  const n = s.length;
  const steps = [];

  steps.push({ nodeId: "start",  label: "Start",                                vars: {} });
  steps.push({ nodeId: "input",  label: `Input: "${s}"`,                         vars: {} });
  steps.push({ nodeId: "init",   label: `left = 0,  right = ${n - 1}`,           vars: { left: 0, right: n - 1 } });

  let l = 0, r = n - 1, matched = [];

  while (true) {
    steps.push({
      nodeId: "check_pointers",
      label: `left < right?  (${l} < ${r})  →  ${l < r}`,
      vars: { left: l, right: r },
      pointers: { left: l, right: r, matched: [...matched] },
    });

    if (l >= r) {
      steps.push({ nodeId: "palindrome",     label: "✓ Is a Palindrome", vars: { left: l, right: r }, result: "yes", pointers: { left: l, right: r, matched: [...matched] } });
      steps.push({ nodeId: "end",            label: "End",               vars: {}, pointers: { left: l, right: r, matched: [...matched] } });
      break;
    }

    steps.push({
      nodeId: "compare",
      label: `s[${l}]='${s[l]}' == s[${r}]='${s[r]}'?  →  ${s[l] === s[r]}`,
      vars: { left: l, right: r, "s[left]": s[l], "s[right]": s[r] },
      pointers: { left: l, right: r, matched: [...matched] },
    });

    if (s[l] !== s[r]) {
      steps.push({ nodeId: "not_palindrome", label: `Mismatch: '${s[l]}' ≠ '${s[r]}' → Not a Palindrome`, vars: { left: l, right: r }, result: "no", pointers: { left: l, right: r, matched: [...matched] } });
      steps.push({ nodeId: "end",            label: "End", vars: {}, pointers: { left: l, right: r, matched: [...matched] } });
      break;
    }

    matched = [...matched, l, r];
    l++; r--;
    steps.push({
      nodeId: "move_pointers",
      label: `Match! Move pointers → left=${l},  right=${r}`,
      vars: { left: l, right: r },
      pointers: { left: l, right: r, matched: [...matched] },
    });
  }

  return steps;
}

// ─── Linear Search ───────────────────────────────────────────────────────────
function buildLinearSearchSteps(arr, target) {
  const steps = [];
  const n = arr.length;

  steps.push({ nodeId: "start",   label: "Start",                        vars: {} });
  steps.push({ nodeId: "init",    label: "i = 0",                        vars: { i: 0 } });

  for (let i = 0; i <= n; i++) {
    steps.push({
      nodeId: "loop",
      label: `i < n?  (${i} < ${n})  →  ${i < n}`,
      vars: { i, n },
      arrayPointers: { active: i < n ? [i] : [] },
    });

    if (i >= n) {
      steps.push({ nodeId: "not_found", label: "Return -1 (not found)", vars: { result: -1 }, result: "no" });
      break;
    }

    steps.push({
      nodeId: "compare",
      label: `arr[${i}]=${arr[i]} == target=${target}?  →  ${arr[i] === target}`,
      vars: { i, "arr[i]": arr[i], target },
      arrayPointers: { active: [i] },
    });

    if (arr[i] === target) {
      steps.push({ nodeId: "found", label: `✓ Found ${target} at index ${i}`, vars: { result: i }, result: "yes", arrayPointers: { active: [i], found: [i] } });
      break;
    }

    steps.push({
      nodeId: "increment",
      label: `i++ → ${i + 1}`,
      vars: { i: i + 1 },
      arrayPointers: { active: [i] },
    });
  }

  return steps;
}

// ─── Binary Search ───────────────────────────────────────────────────────────
function buildBinarySearchSteps(arr, target) {
  const steps = [];
  const n = arr.length;
  let left = 0, right = n - 1;

  steps.push({ nodeId: "start", label: "Start", vars: {} });
  steps.push({ nodeId: "init",  label: `left=0,  right=${n - 1}`, vars: { left, right } });

  while (true) {
    steps.push({
      nodeId: "loop",
      label: `left ≤ right?  (${left} ≤ ${right})  →  ${left <= right}`,
      vars: { left, right },
      arrayPointers: { active: [left, right] },
    });

    if (left > right) {
      steps.push({ nodeId: "not_found", label: "Return -1 (not found)", vars: { result: -1 }, result: "no" });
      break;
    }

    const mid = Math.floor((left + right) / 2);
    steps.push({
      nodeId: "mid",
      label: `mid = (${left}+${right})//2 = ${mid},  nums[${mid}]=${arr[mid]}`,
      vars: { left, right, mid, "arr[mid]": arr[mid] },
      arrayPointers: { active: [left, mid, right], mid: [mid] },
    });
    steps.push({
      nodeId: "check",
      label: `arr[${mid}]=${arr[mid]} == target=${target}?  →  ${arr[mid] === target}`,
      vars: { "arr[mid]": arr[mid], target },
      arrayPointers: { active: [mid], mid: [mid] },
    });

    if (arr[mid] === target) {
      steps.push({ nodeId: "found", label: `✓ Found at index ${mid}`, vars: { result: mid }, result: "yes", arrayPointers: { found: [mid] } });
      break;
    } else if (arr[mid] < target) {
      steps.push({ nodeId: "left_up",  label: `arr[mid] < target → left = ${mid + 1}`, vars: { left: mid + 1, right }, arrayPointers: { active: [mid] } });
      left = mid + 1;
    } else {
      steps.push({ nodeId: "right_up", label: `arr[mid] > target → right = ${mid - 1}`, vars: { left, right: mid - 1 }, arrayPointers: { active: [mid] } });
      right = mid - 1;
    }
  }

  return steps;
}

// ─── Bubble Sort ─────────────────────────────────────────────────────────────
function buildBubbleSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;

  steps.push({ nodeId: "start", label: "Start", vars: {} });
  steps.push({ nodeId: "outer", label: `Outer loop: i=0 to ${n - 1}`, vars: { n } });

  for (let i = 0; i < n; i++) {
    steps.push({ nodeId: "outer",  label: `Outer pass i=${i}`, vars: { i }, arrayPointers: { active: [] } });
    steps.push({ nodeId: "inner",  label: `Inner loop j=0 to n-i-2=${n - i - 2}`, vars: { i }, arrayPointers: { active: [] } });

    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        nodeId: "compare",
        label: `arr[${j}]=${a[j]} > arr[${j + 1}]=${a[j + 1]}?  →  ${a[j] > a[j + 1]}`,
        vars: { i, j, "arr[j]": a[j], "arr[j+1]": a[j + 1] },
        arrayPointers: { active: [j, j + 1] },
        arrayCopy: [...a],
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          nodeId: "swap",
          label: `Swap → arr is now [${a.join(", ")}]`,
          vars: { i, j },
          arrayPointers: { active: [j, j + 1], swapped: [j, j + 1] },
          arrayCopy: [...a],
        });
      } else {
        steps.push({
          nodeId: "inner",
          label: `No swap. j++ → ${j + 1}`,
          vars: { i, j: j + 1 },
          arrayPointers: { active: [j, j + 1] },
          arrayCopy: [...a],
        });
      }
    }
  }

  steps.push({ nodeId: "end", label: `Sorted: [${a.join(", ")}]`, vars: {}, result: "yes", arrayCopy: [...a], arrayPointers: { found: a.map((_, i) => i) } });
  return steps;
}

// ─── Selection Sort ──────────────────────────────────────────────────────────
function buildSelectionSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;

  steps.push({ nodeId: "start", label: "Start", vars: {} });

  for (let i = 0; i < n - 1; i++) {
    steps.push({ nodeId: "outer",  label: `Outer pass i=${i}`, vars: { i }, arrayCopy: [...a], arrayPointers: { active: [i] } });
    steps.push({ nodeId: "min",    label: `minIdx = ${i}`,     vars: { i, minIdx: i }, arrayCopy: [...a], arrayPointers: { active: [i] } });

    let minIdx = i;
    steps.push({ nodeId: "inner",  label: `Inner loop j=${i + 1} to ${n - 1}`, vars: { i, minIdx }, arrayCopy: [...a], arrayPointers: { active: [i] } });

    for (let j = i + 1; j < n; j++) {
      steps.push({
        nodeId: "cmp",
        label: `arr[${j}]=${a[j]} < arr[minIdx=${minIdx}]=${a[minIdx]}?  →  ${a[j] < a[minIdx]}`,
        vars: { i, j, minIdx, "arr[j]": a[j], "arr[minIdx]": a[minIdx] },
        arrayCopy: [...a],
        arrayPointers: { active: [j, minIdx] },
      });

      if (a[j] < a[minIdx]) {
        minIdx = j;
        steps.push({ nodeId: "update", label: `New min at index ${minIdx}`, vars: { minIdx }, arrayCopy: [...a], arrayPointers: { active: [minIdx] } });
      }
    }

    [a[i], a[minIdx]] = [a[minIdx], a[i]];
    steps.push({ nodeId: "swap", label: `Swap arr[${i}] and arr[${minIdx}] → [${a.join(", ")}]`, vars: { i, minIdx }, arrayCopy: [...a], arrayPointers: { swapped: [i, minIdx] } });
  }

  steps.push({ nodeId: "start", label: `Sorted: [${a.join(", ")}]`, vars: {}, result: "yes", arrayCopy: [...a], arrayPointers: { found: a.map((_, i) => i) } });
  return steps;
}

// ─── Insertion Sort ──────────────────────────────────────────────────────────
function buildInsertionSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;

  steps.push({ nodeId: "start", label: "Start", vars: {} });
  steps.push({ nodeId: "outer", label: `Loop i=1 to ${n - 1}`, vars: {} });

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;

    steps.push({ nodeId: "outer", label: `i=${i}, key=${key}`, vars: { i }, arrayCopy: [...a], arrayPointers: { active: [i] } });
    steps.push({ nodeId: "key",   label: `key = arr[${i}] = ${key},  j = ${j}`, vars: { key, j }, arrayCopy: [...a], arrayPointers: { active: [i] } });

    while (j >= 0 && a[j] > key) {
      steps.push({
        nodeId: "inner",
        label: `j=${j} ≥ 0 and arr[${j}]=${a[j]} > key=${key}?  →  true`,
        vars: { j, "arr[j]": a[j], key },
        arrayCopy: [...a],
        arrayPointers: { active: [j, j + 1] },
      });
      a[j + 1] = a[j];
      steps.push({ nodeId: "shift", label: `Shift arr[${j}]=${a[j + 1]} → arr[${j + 1}]`, vars: { j }, arrayCopy: [...a], arrayPointers: { active: [j, j + 1] } });
      j--;
    }

    steps.push({
      nodeId: "inner",
      label: `Inner condition false (j=${j})`,
      vars: { j },
      arrayCopy: [...a],
      arrayPointers: { active: [] },
    });
    a[j + 1] = key;
    steps.push({ nodeId: "place", label: `Place key=${key} at arr[${j + 1}]  →  [${a.join(", ")}]`, vars: { key, "position": j + 1 }, arrayCopy: [...a], arrayPointers: { active: [j + 1] } });
  }

  steps.push({ nodeId: "outer", label: `Sorted: [${a.join(", ")}]`, vars: {}, result: "yes", arrayCopy: [...a], arrayPointers: { found: a.map((_, i) => i) } });
  return steps;
}

// ─── Bubble Sort ─────────────────────────────────────────────────────────────
function buildFactorialSteps(n) {
  const steps = [];

  steps.push({ nodeId: "start",   label: "Start",            vars: {} });
  steps.push({ nodeId: "init",    label: `result = 1`,        vars: { result: 1 } });

  steps.push({
    nodeId: "loop",
    label: `Loop i=1 to ${n}`,
    vars: { n },
  });

  let result = 1;
  for (let i = 1; i <= n; i++) {
    steps.push({
      nodeId: "loop",
      label: `i=${i} ≤ ${n}?  →  true`,
      vars: { i, result },
    });
    result *= i;
    steps.push({
      nodeId: "multiply",
      label: `result = ${result / i} × ${i} = ${result}`,
      vars: { i, result },
    });
  }

  steps.push({ nodeId: "loop",   label: `Loop done (i > ${n})`, vars: { i: n + 1 } });
  steps.push({ nodeId: "output", label: `Return ${result}`, vars: { result }, result: "yes" });

  return steps;
}

// ─── Sum of Two Numbers ───────────────────────────────────────────────────────
function buildSumSteps(a, b) {
  return [
    { nodeId: "start",  label: "Start",              vars: {} },
    { nodeId: "input",  label: `Read a=${a}, b=${b}`, vars: { a, b } },
    { nodeId: "calc",   label: `sum = ${a} + ${b} = ${a + b}`, vars: { a, b, sum: a + b } },
    { nodeId: "output", label: `Print ${a + b}`,      vars: { sum: a + b }, result: "yes" },
    { nodeId: "end",    label: "End",                 vars: {} },
  ];
}

// ─── Max of Three ─────────────────────────────────────────────────────────────
function buildMaxOfThreeSteps(a, b, c) {
  const steps = [];
  steps.push({ nodeId: "start", label: "Start", vars: {} });
  steps.push({ nodeId: "cmp1",  label: `a=${a} ≥ b=${b}?  →  ${a >= b}`, vars: { a, b, c } });

  if (a >= b) {
    steps.push({ nodeId: "cmp2",  label: `a=${a} ≥ c=${c}?  →  ${a >= c}`, vars: { a, b, c } });
    if (a >= c) {
      steps.push({ nodeId: "out_a", label: `Return a = ${a}`, vars: { result: a }, result: "yes" });
    } else {
      steps.push({ nodeId: "out_c", label: `Return c = ${c}`, vars: { result: c }, result: "yes" });
    }
  } else {
    steps.push({ nodeId: "cmp3",  label: `b=${b} ≥ c=${c}?  →  ${b >= c}`, vars: { a, b, c } });
    if (b >= c) {
      steps.push({ nodeId: "out_b", label: `Return b = ${b}`, vars: { result: b }, result: "yes" });
    } else {
      steps.push({ nodeId: "out_c", label: `Return c = ${c}`, vars: { result: c }, result: "yes" });
    }
  }

  return steps;
}

// ─── Fibonacci ────────────────────────────────────────────────────────────────
function buildFibSteps(n) {
  const steps = [];
  steps.push({ nodeId: "start",   label: "Start",      vars: {} });
  steps.push({ nodeId: "base",    label: `n=${n} ≤ 1?  →  ${n <= 1}`, vars: { n } });

  if (n <= 1) {
    steps.push({ nodeId: "returnN", label: `Return ${n}`, vars: { result: n }, result: "yes" });
    return steps;
  }

  let a = 0, b = 1;
  steps.push({ nodeId: "init",    label: `a=0, b=1`,   vars: { a, b } });
  steps.push({ nodeId: "loop",    label: `Loop i=2 to ${n}`, vars: {} });

  for (let i = 2; i <= n; i++) {
    const c = a + b;
    steps.push({ nodeId: "loop",   label: `i=${i} ≤ ${n}?  →  true`, vars: { i, a, b } });
    steps.push({ nodeId: "update", label: `c=${a}+${b}=${c}; a=${b}; b=${c}`, vars: { a: b, b: c } });
    a = b; b = c;
  }

  steps.push({ nodeId: "loop",    label: `Loop done (i > ${n})`, vars: {} });
  steps.push({ nodeId: "returnB", label: `Return b = ${b}`, vars: { result: b }, result: "yes" });
  return steps;
}

// ─── Two Sum ─────────────────────────────────────────────────────────────────
function buildTwoSumSteps(arr, target) {
  const steps = [];
  const map = {};

  steps.push({ nodeId: "start", label: "Start", vars: {} });
  steps.push({ nodeId: "init",  label: "map = {}", vars: {} });
  steps.push({ nodeId: "loop",  label: `Loop over nums=[${arr.join(",")}]`, vars: { target } });

  for (let i = 0; i < arr.length; i++) {
    const num = arr[i];
    const complement = target - num;

    steps.push({ nodeId: "loop",  label: `i=${i}, num=${num}`, vars: { i, num, target }, arrayPointers: { active: [i] } });
    steps.push({ nodeId: "comp",  label: `complement = ${target} - ${num} = ${complement}`, vars: { num, complement }, arrayPointers: { active: [i] } });
    steps.push({ nodeId: "check", label: `${complement} in map?  →  ${complement in map}`, vars: { complement, map: JSON.stringify(map) }, arrayPointers: { active: [i] } });

    if (complement in map) {
      steps.push({ nodeId: "found", label: `✓ Return [${map[complement]}, ${i}]`, vars: { result: `[${map[complement]}, ${i}]` }, result: "yes", arrayPointers: { found: [map[complement], i] } });
      break;
    }

    map[num] = i;
    steps.push({ nodeId: "add",   label: `map[${num}] = ${i}  →  map=${JSON.stringify(map)}`, vars: { "map": JSON.stringify(map) }, arrayPointers: { active: [i] } });
  }

  return steps;
}

// ─── Merge Sort ───────────────────────────────────────────────────────────────
function buildMergeSortSteps(arr) {
  const steps = [];
  steps.push({ nodeId: "start", label: "Start", vars: {} });

  function mergeSort(a, depth = 0) {
    const indent = "  ".repeat(depth);
    steps.push({ nodeId: "base", label: `${indent}mergeSort([${a.join(",")}]) → length=${a.length} ≤ 1?  →  ${a.length <= 1}`, vars: { length: a.length }, arrayCopy: [...a] });
    if (a.length <= 1) {
      steps.push({ nodeId: "return", label: `${indent}Return [${a.join(",")}]`, vars: {}, arrayCopy: [...a] });
      return [...a];
    }
    const mid = Math.floor(a.length / 2);
    steps.push({ nodeId: "mid",   label: `${indent}mid = ${mid}`, vars: { mid }, arrayCopy: [...a] });
    steps.push({ nodeId: "left",  label: `${indent}Sort left  half: [${a.slice(0, mid).join(",")}]`, vars: {}, arrayCopy: a.slice(0, mid) });
    const sortedLeft  = mergeSort(a.slice(0, mid), depth + 1);
    steps.push({ nodeId: "right", label: `${indent}Sort right half: [${a.slice(mid).join(",")}]`, vars: {}, arrayCopy: a.slice(mid) });
    const sortedRight = mergeSort(a.slice(mid), depth + 1);

    const merged = [];
    let i = 0, j = 0;
    while (i < sortedLeft.length && j < sortedRight.length) {
      if (sortedLeft[i] <= sortedRight[j]) { merged.push(sortedLeft[i++]); }
      else { merged.push(sortedRight[j++]); }
    }
    while (i < sortedLeft.length)  merged.push(sortedLeft[i++]);
    while (j < sortedRight.length) merged.push(sortedRight[j++]);

    steps.push({ nodeId: "merge", label: `${indent}Merge → [${merged.join(",")}]`, vars: {}, arrayCopy: [...merged] });
    return merged;
  }

  const sorted = mergeSort(arr);
  steps.push({ nodeId: "merge", label: `Final sorted: [${sorted.join(",")}]`, vars: {}, result: "yes", arrayCopy: [...sorted] });
  return steps;
}

// Router - returns the current algo steps
export function buildSteps(slug, inputs) {
  switch (slug) {
    case "palindrome-check":     return buildPalindromeSteps(inputs[0]);
    case "sum-of-two-numbers":   return buildSumSteps(Number(inputs[0]), Number(inputs[1]));
    case "maximum-of-three":     return buildMaxOfThreeSteps(Number(inputs[0]), Number(inputs[1]), Number(inputs[2]));
    case "factorial":            return buildFactorialSteps(Number(inputs[0]));
    case "linear-search":        return buildLinearSearchSteps(inputs[0].split(",").map(Number), Number(inputs[1]));
    case "bubble-sort":          return buildBubbleSortSteps(inputs[0].split(",").map(Number));
    case "binary-search":        return buildBinarySearchSteps(inputs[0].split(",").map(Number), Number(inputs[1]));
    case "selection-sort":       return buildSelectionSortSteps(inputs[0].split(",").map(Number));
    case "fibonacci-dp":         return buildFibSteps(Number(inputs[0]));
    case "two-sum":              return buildTwoSumSteps(inputs[0].split(",").map(Number), Number(inputs[1]));
    case "insertion-sort":       return buildInsertionSortSteps(inputs[0].split(",").map(Number));
    case "merge-sort":           return buildMergeSortSteps(inputs[0].split(",").map(Number));
    default:                     return [];
  }
}

// Per-slug input field definitions for the panel UI
// Each field: { label, placeholder, key }
// this is used to define the label, placeholder of the input field in each flowchart
export const INPUT_FIELDS = {
  "palindrome-check":   [{ label: "String", placeholder: "e.g. racecar", key: "0" }],
  "sum-of-two-numbers": [{ label: "a", placeholder: "e.g. 5", key: "0" }, { label: "b", placeholder: "e.g. 7", key: "1" }],
  "maximum-of-three":   [{ label: "a", placeholder: "5", key: "0" }, { label: "b", placeholder: "9", key: "1" }, { label: "c", placeholder: "2", key: "2" }],
  "factorial":          [{ label: "n", placeholder: "e.g. 5", key: "0" }],
  "linear-search":      [{ label: "Array (comma-separated)", placeholder: "4,2,7,1,9", key: "0" }, { label: "Target", placeholder: "7", key: "1" }],
  "bubble-sort":        [{ label: "Array (comma-separated)", placeholder: "5,1,4,2,8", key: "0" }],
  "binary-search":      [{ label: "Sorted array (comma-separated)", placeholder: "-1,0,3,5,9,12", key: "0" }, { label: "Target", placeholder: "9", key: "1" }],
  "selection-sort":     [{ label: "Array (comma-separated)", placeholder: "64,25,12,22,11", key: "0" }],
  "fibonacci-dp":       [{ label: "n", placeholder: "e.g. 6", key: "0" }],
  "two-sum":            [{ label: "Array (comma-separated)", placeholder: "2,7,11,15", key: "0" }, { label: "Target", placeholder: "9", key: "1" }],
  "insertion-sort":     [{ label: "Array (comma-separated)", placeholder: "5,2,4,6,1,3", key: "0" }],
  "merge-sort":         [{ label: "Array (comma-separated)", placeholder: "38,27,43,3,9", key: "0" }],
};