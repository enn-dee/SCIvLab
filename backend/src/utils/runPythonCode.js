import { PythonShell } from "python-shell";

export const runPythonCode = async (code, testCases) => {
  const results = [];

  for (let testCase of testCases) {
    const script = `
import json

${code}

try:
    result = solution(${JSON.stringify(testCase.input)})
    print(json.dumps({"success": True, "result": result}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`;

    const options = {
      mode: "text",
      pythonOptions: ["-u"],
      timeout: 5000,
    };

    const output = await new Promise((resolve) => {
      PythonShell.runString(script, options, (err, out) => {
        if (err) {
          resolve({ success: false, error: err.message });
        } else {
          try {
            resolve(JSON.parse(out[out.length - 1]));
          } catch {
            resolve({ success: false, error: out.join("\n") });
          }
        }
      });
    });

    if (output.success) {
      const passed =
        JSON.stringify(output.result) ===
        JSON.stringify(testCase.expected);

      results.push({
        passed,
        input: testCase.input,
        expected: testCase.expected,
        output: output.result,
      });
    } else {
      results.push({
        passed: false,
        error: output.error,
      });
    }
  }

  return results;
};

export const runSimplePythonCode = async (code) => {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonOptions: ['-u'],
      timeout: 5000
    };
    
    PythonShell.runString(code, options, (err, output) => {
      if (err) {
        resolve({
          success: false,
          output: err.message,
          error: err.traceback || err.message
        });
      } else {
        resolve({
          success: true,
          output: output.join('\n'),
          error: null
        });
      }
    });
  });
};