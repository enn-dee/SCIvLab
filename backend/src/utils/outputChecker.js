const normalise = (value) =>
  String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim();

const tokens = (value) => normalise(value).split(/\s+/).filter(Boolean);

const numericValues = (value) => {
  const values = tokens(value).map(Number);
  return values.every(Number.isFinite) ? values : null;
};

export const matchesExpected = (actual, expected, checker = "exact", tolerance = 0.000001) => {
  const actualText = normalise(actual);
  const expectedText = normalise(expected);

  switch (checker || "exact") {
    case "whitespace":
      return tokens(actualText).join(" ") === tokens(expectedText).join(" ");
    case "unordered_tokens": {
      const actualTokens = tokens(actualText).sort();
      const expectedTokens = tokens(expectedText).sort();
      return actualTokens.length === expectedTokens.length &&
        actualTokens.every((token, index) => token === expectedTokens[index]);
    }
    case "numeric_tolerance": {
      const actualNumbers = numericValues(actualText);
      const expectedNumbers = numericValues(expectedText);
      return actualNumbers !== null &&
        expectedNumbers !== null &&
        actualNumbers.length === expectedNumbers.length &&
        actualNumbers.every((number, index) =>
          Math.abs(number - expectedNumbers[index]) <= tolerance,
        );
    }
    case "exact":
    default:
      return actualText === expectedText;
  }
};
