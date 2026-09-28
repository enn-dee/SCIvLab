import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ALL_COMPLEXITIES = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)"];
const COLORS = {
  "O(1)": "#6366f1",
  "O(log n)": "#22c55e",
  "O(n)": "#3b82f6",
  "O(n log n)": "#eab308",
  "O(n^2)": "#ef4444",
};

const calc = (type, n) => {
  switch (type) {
    case "O(1)":
      return 1;
    case "O(log n)":
      return Math.log2(n);
    case "O(n)":
      return n;
    case "O(n log n)":
      return n * Math.log2(n);
    case "O(n^2)":
      return n * n;
    default:
      return n;
  }
};

const generateData = () => {
  const nValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,12,13,14,15];
  return nValues.map((n) => {
    const point = { n };
    ALL_COMPLEXITIES.forEach((type) => {
      point[type] = parseFloat(calc(type, n).toFixed(2));
    });
    return point;
  });
};

// const generateMultiData = (complexity) => {
//   const nValues = [1, 10, 50, 100, 500, 1000];

//   const calc = (type, n) => {
//     switch (type) {
//       case "O(1)":
//         return 1;
//       case "O(log n)":
//         return Math.log2(n);
//       case "O(n)":
//         return n;
//       case "O(n log n)":
//         return n * Math.log2(n);
//       case "O(n^2)":
//         return n * n;
//       case "O(2^n)":
//         return Math.pow(2, n);
//       default:
//         return n;
//     }
//   };

//   return nValues.map((n) => ({
//     n,
//     best: parseFloat(calc(complexity.best, n).toFixed(2)),
//     average: parseFloat(calc(complexity.average, n).toFixed(2)),
//     worst: parseFloat(calc(complexity.worst, n).toFixed(2)),
//   }));
// };

const parseComplexity = (comp) => {
  const complexities = {
    "O(1)": "O(1)",
    "O(log n)": "O(log n)",
    "O(n)": "O(n)",
    "O(n log n)": "O(n log n)",
    "O(n^2)": "O(n^2)",
    "O(n²)": "O(n^2)",
  };

  const foundComplexity = [];
  Object.keys(complexities).forEach((key) => {
      if (comp.includes(key)) foundComplexity.push(complexities[key]);
    });
    if (foundComplexity.length === 1) {
        return {
            best: foundComplexity[0],
            average: foundComplexity[0],
            worst: foundComplexity[0],
        };
    }
    if (foundComplexity.length === 2) {
        return {
            best: foundComplexity[0],
            average: foundComplexity[1],
            worst: foundComplexity[1],
        };
    }
    console.log(foundComplexity)
    
    return { best: "O(n)", average: "O(n)", worst: "O(n)" };
};

const data = generateData();

const CustomTooltip = ({ active, parsed }) => {
  if (!active) return null;
  return (
    <div className="bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm flex flex-col gap-1">
      <p className="text-emerald-400">Best: {parsed.best}</p>
      <p className="text-yellow-400">Average: {parsed.average}</p>
      <p className="text-red-400">Worst: {parsed.worst}</p>
    </div>
  );
};

const ComplexityGraph = ({ complexity }) => {
    const parsed = parseComplexity(complexity);

  return (
    <div className="w-full h-72 bg-black/30 rounded-xl px-4 pb-6 pt-2 border border-white/10">
      <h3 className="text-sm mb-3 text-gray-300">Time Complexity</h3>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="n"
            stroke="#94a3b8"
            tick={false}
            axisLine={true}
            tickLine={true}
            label={{
              value: "Input Size (n)",
              position: "insideBottom",
              offset: 5,
              fill: "#94a3b8",
              fontSize: 12,
            }}
          />

          <YAxis
            dataKey="n"
            stroke="#94a3b8"
            tick={false}
            axisLine={true}
            tickLine={true}
            label={{
              value: "Time",
              angle: -90,
              position: "insideLeft",
              offset: 32,
              fill: "#94a3b8",
              fontSize: 12,
            }}
          />

          <Tooltip
            content={<CustomTooltip parsed={parsed} />}
            cursor={false}
            isAnimationActive={false}
          />

          {ALL_COMPLEXITIES.map((type) => {
            const isActive =
              parsed.best === type ||
              parsed.average === type ||
              parsed.worst === type;

            return (
              <Line
                key={type}
                type="basis"
                dataKey={type}
                stroke={COLORS[type]}
                strokeWidth={isActive ? 3 : 1}
                strokeOpacity={isActive ? 1 : 0.15}
                strokeDasharray={isActive ? "0" : "4 4"}
                dot={false}
                activeDot={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComplexityGraph;
