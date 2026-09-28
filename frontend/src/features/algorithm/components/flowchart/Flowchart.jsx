import React, { useMemo, useState, useCallback } from "react";
import "@xyflow/react/dist/style.css";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import { nodeTypes } from "@/features/algorithm/components/flowchart/NodeTypes.jsx";
import { buildSteps, INPUT_FIELDS } from "@/features/algorithm/lib/dryRunEngines.js";
import { Footprints } from "lucide-react";

// DAGRE code used for the auto vertical layout of the flowchart nodes
const nodeWidth = 180;
const nodeHeight = 70;
function getLayoutedElements(nodes, edges) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB" });
  nodes.forEach((n) =>
    dagreGraph.setNode(n.id, { width: nodeWidth, height: nodeHeight })
  );
  edges.forEach((e) => dagreGraph.setEdge(e.source, e.target));
  dagre.layout(dagreGraph);
  return {
    nodes: nodes.map((node) => {
      const pos = dagreGraph.node(node.id);
      return {
        ...node,
        position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 },
        sourcePosition: "bottom",
        targetPosition: "top",
      };
    }),
    edges,
  };
}

// ARRAY VISUALIZER (array boxes below run button) for array like in linear search
function ArrayViz({ arr, pointers = {} }) {
  if (!arr || arr.length === 0) return null;
  const { active = [], found = [], swapped = [], mid = [] } = pointers;

  return (
    <div className="flex flex-wrap gap-1 my-1">
      {arr.map((val, i) => {
        let bg = "bg-zinc-700 border-zinc-600 text-zinc-200";
        if (found.includes(i))
          bg = "bg-green-800 border-green-400 text-green-200";
        else if (swapped.includes(i))
          bg = "bg-yellow-800 border-yellow-400 text-yellow-200";
        else if (mid.includes(i))
          bg = "bg-purple-800 border-purple-400 text-purple-200";
        else if (active.includes(i))
          bg = "bg-cyan-800 border-cyan-400 text-cyan-200";

        return (
          <div
            key={i}
            className={`min-w-[28px] h-7 px-1 flex flex-col items-center justify-center rounded border font-mono text-xs font-bold ${bg}`}
          >
            <span>{val}</span>
            <span className="text-[9px] opacity-60">{i}</span>
          </div>
        );
      })}
    </div>
  );
}
 
// STRING VISUALIZER (array boxes below run button) for stirngs like in palindrome
function StringViz({ s, pointers = {} }) {
  if (!s) return null;
  const { left, right, matched = [] } = pointers;

  return (
    <div className="flex flex-wrap gap-1 my-1">
      {s.split("").map((ch, i) => {
        const isMatched = matched.includes(i);
        const isLeft = left === i && right !== i;
        const isRight = right === i && left !== i;
        const isBoth = left === i && right === i;

        let bg = "bg-zinc-700 border-zinc-600 text-zinc-200";
        if (isMatched) bg = "bg-green-800 border-green-400 text-green-200";
        if (isLeft) bg = "bg-cyan-800 border-cyan-400 text-cyan-200";
        if (isRight) bg = "bg-orange-800 border-orange-400 text-orange-200";
        if (isBoth) bg = "bg-purple-800 border-purple-400 text-purple-200";

        return (
          <div
            key={i}
            className={`w-7 h-7 flex items-center justify-center rounded border font-mono text-xs font-bold ${bg}`}
          >
            {ch}
          </div>
        );
      })}
    </div>
  );
}

//DRY RUN TAB
function DryRunTab({
  algo,
  activeStep,
  steps,
  onNext,
  onPrev,
  onReset,
  inputs,
  onInputChange,
  onRun,
}) {
  const fields = INPUT_FIELDS[algo.slug] || [];
  const st = steps[activeStep];
  const isString = algo.slug === "palindrome-check";

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto h-full">
      <div className="bg-zinc-800 border border-zinc-700 rounded p-2.5 text-xs text-zinc-400 leading-relaxed">
        Input your data below and click the{" "}
        <span className="text-cyan-400 font-medium">Run</span> button. You can
        use <span className="text-cyan-400 font-medium">Next</span> and{" "}
        <span className="text-cyan-400 font-medium">Prev</span> to go through
        the algorithm that corresponds to the flowchart nodes.
      </div>
      {/* Input fields */}
      <div className="flex flex-col gap-2">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center">
            <label className="text-xs text-zinc-400 w-28 shrink">
              {field.label}
            </label>
            <input
              className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder={field.placeholder}
              value={inputs[field.key] ?? ""}
              onChange={(e) => onInputChange(field.key, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onRun()}
            />
          </div>
        ))}
        <button
          onClick={onRun}
          className="mt-1 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium transition-colors"
        >
          Run ↗
        </button>
      </div>

      {/* Visualizer -- array display [][][][] */}
      {steps.length > 0 && (
        <div>
          {isString ? (
            <>
              <div className="flex gap-3 text-[10px] text-zinc-400 mb-1">
                <span>
                  <span className="inline-block w-2 h-2 rounded-sm bg-cyan-700 border border-cyan-400 mr-1" />
                  left
                </span>
                <span>
                  <span className="inline-block w-2 h-2 rounded-sm bg-orange-700 border border-orange-400 mr-1" />
                  right
                </span>
                <span>
                  <span className="inline-block w-2 h-2 rounded-sm bg-purple-700 border border-purple-400 mr-1" />
                  both
                </span>
                <span>
                  <span className="inline-block w-2 h-2 rounded-sm bg-green-800 border border-green-400 mr-1" />
                  matched
                </span>
              </div>
              <StringViz s={inputs["0"]} pointers={st?.pointers ?? {}} />
            </>
          ) : st?.arrayCopy ? (
            <>
              <div className="flex gap-3 text-[10px] text-zinc-400 mb-1">
                <span>
                  <span className="inline-block w-2 h-2 rounded-sm bg-cyan-700 border border-cyan-400 mr-1" />
                  active
                </span>
                <span>
                  <span className="inline-block w-2 h-2 rounded-sm bg-yellow-700 border border-yellow-400 mr-1" />
                  swap
                </span>
                <span>
                  <span className="inline-block w-2 h-2 rounded-sm bg-green-800 border border-green-400 mr-1" />
                  found/done
                </span>
              </div>
              <ArrayViz arr={st.arrayCopy} pointers={st.arrayPointers ?? {}} />
            </>
          ) : st?.arrayPointers ? (
            <>
              <div className="flex gap-3 text-[10px] text-zinc-400 mb-1">
                <span>
                  <span className="inline-block w-2 h-2 rounded-sm bg-cyan-700 border border-cyan-400 mr-1" />
                  active
                </span>
                <span>
                  <span className="inline-block w-2 h-2 rounded-sm bg-green-800 border border-green-400 mr-1" />
                  found
                </span>
              </div>
              <ArrayViz
                arr={inputs["0"]?.split(",").map(Number) ?? []}
                pointers={st.arrayPointers ?? {}}
              />
            </>
          ) : null}
        </div>
      )}

      {/* Variable cards to display current value stored in a variable. Displayed above the prev and next button*/}
      {steps.length > 0 && st?.vars && Object.keys(st.vars).length > 0 && (
        <div className="h-30 grid grid-cols-2 grid-rows-2 gap-1.5 border-2 p-1">
          {Object.entries(st.vars).map(([k, v]) => (
            <div
              key={k}
              className="bg-zinc-800 rounded p-1.5 border border-zinc-700"
            >
              <div className="text-[10px] text-zinc-500">{k}</div>
              <div className="text-sm font-mono font-semibold text-white truncate">
                {String(v)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step counter labels + controls */}
      {steps.length > 0 && (
        <>
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              Step {activeStep + 1} / {steps.length}
            </span>
            <button
              onClick={onReset}
              className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onPrev}
              disabled={activeStep === 0}
              className="flex-1 py-1 text-xs border border-zinc-600 rounded text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={onNext}
              disabled={activeStep === steps.length - 1}
              className="flex-1 py-1 text-xs border border-zinc-600 rounded text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </>
      )}

      {/* Step log */}
      {steps.length > 0 && (
        <div className="flex flex-col gap-1">
          {[...steps]
            .slice(0, activeStep + 1)
            .reverse()
            .map((step, i) => {
              let cls = "border-l-2 pl-2 py-0.5 text-[11px] rounded-r ";
              if (i === 0 && step.result === "yes")
                cls +=
                  "border-green-400 bg-green-950 text-green-300 font-medium";
              else if (i === 0 && step.result === "no")
                cls += "border-red-400 bg-red-950 text-red-300 font-medium";
              else if (i === 0) cls += "border-cyan-400 bg-zinc-800 text-white";
              else cls += "border-zinc-700 text-zinc-500";
              return (
                <div key={i} className={cls}>
                  {step.label}
                </div>
              );
            })}
        </div>
      )}

      {steps.length === 0 && (
        <p className="text-xs text-zinc-500 mt-2">
          Fill in the inputs and press Run to step through the algorithm.
        </p>
      )}
    </div>
  );
}

// ─── VISUAL TAB
function VisualTab({ algo }) {
  const rawNodes = algo?.flowChartData?.rawNodes || [];
  const rawEdges = algo?.flowChartData?.rawEdges || [];

  const [inputs, setInputs] = useState({});
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  const activeNodeId = steps[activeStep]?.nodeId ?? null;

  const handleInputChange = useCallback((key, val) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleRun = useCallback(() => {
    const fields = INPUT_FIELDS[algo.slug] || [];
    const vals = fields.map((f) => inputs[f.key] ?? "");
    if (vals.some((v) => v === "")) return;
    const s = buildSteps(algo.slug, vals);
    setSteps(s);
    setActiveStep(0);
  }, [algo.slug, inputs]);

  const handleReset = useCallback(() => {
    setSteps([]);
    setActiveStep(0);
    setInputs({});
  }, []);

  // Styled edges
  const styledEdges = useMemo(
    () =>
      rawEdges.map((edge) => ({
        ...edge,
        type: "smoothstep",
        animated: true,
        labelStyle: { fontWeight: "bold", fill: "#000" },
        style: { strokeWidth: 2 },
        markerEnd: { type: "arrowclosed", color: "#fff" },
      })),
    [rawEdges]
  );

  // Layout
  const { nodes: layoutedNodes, edges } = useMemo(
    () => getLayoutedElements(rawNodes, styledEdges),
    [rawNodes, styledEdges]
  );

  // Inject isActive into node data
  const nodes = useMemo(
    () =>
      layoutedNodes.map((node) => ({
        ...node,
        data: { ...node.data, isActive: node.id === activeNodeId },
      })),
    [layoutedNodes, activeNodeId]
  );

  return (
    <div className="flex h-[85vh]">
      {/* ── Flowchart ── */}
      <div className="flex-1 min-w-0 back">
        <h2 className="font-bold mb-2">{algo.title} Flow Chart</h2>
        <div className="w-full h-full text-black">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            zoomOnScroll={false}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            panOnDrag={true}
            nodesDraggable={false}
            elementsSelectable={false}
          >
            <Background gap={30} />
            <Controls
              className="p-4"
              fitViewOptions
              showZoom={false}
              showInteractive={false}
            />
          </ReactFlow>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-52 sm:w-72 md:w-80 shrink-0 flex flex-col bg-zinc-900 border rounded-xl border-zinc-700 overflow-hidden">
        {/* Tab bar */}
        <div>
          <p
            className={`w-full flex justify-center items-center py-2 gap-1 text-xs font-semibold uppercase tracking-wider transition-colors text-cyan-200 bg-gray-800 border-b`}
          >
            <Footprints size={16} />
            {"Walkthrough"}
          </p>
        </div>

        <div className="flex-1 overflow-hidden">
          <DryRunTab
            algo={algo}
            activeStep={activeStep}
            steps={steps}
            onNext={() =>
              setActiveStep((p) => Math.min(p + 1, steps.length - 1))
            }
            onPrev={() => setActiveStep((p) => Math.max(p - 1, 0))}
            onReset={handleReset}
            inputs={inputs}
            onInputChange={handleInputChange}
            onRun={handleRun}
          />
        </div>
      </div>
    </div>
  );
}

export default VisualTab;
