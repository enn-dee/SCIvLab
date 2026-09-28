import React, { useState } from "react";
import ArrayRenderer from "./ArrayRenderer";
import Flowchart from "./Flowchart";
import { Button } from "../../../../components/ui/button";

export default function AlgorithmVisualizer({ algo }) {
  const { animationSteps, input, flowChartData } = algo;


  const [activeIndices, setActiveIndices] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [found, setFound] = useState(false);
  const [running, setRunning] = useState(false);

  const [low, setLow] = useState(null);
  const [high, setHigh] = useState(null);

  const reset = () => {
    setActiveIndices([]);
    setActiveNode(null);
    setFound(false);
    setLow(null);
    setHigh(null);
  };

  const run = async () => {
    if (running) return;

    reset();
    setRunning(true);

    for (let step of animationSteps) {
      // Update active node for flowchart highlighting
      if (step.flowNode) {
        setActiveNode(step.flowNode);
      }

      switch (step.type) {
        case "setIndex":
        case "compare":
          setActiveIndices(
            step.indices || (step.index !== undefined ? [step.index] : [])
          );
          break;

        case "calculateMid":
          setActiveIndices([step.mid]);
          break;

        case "setBounds":
          setLow(step.low);
          setHigh(step.high);
          break;

        case "moveRight":
          setLow(step.low);
          break;

        case "moveLeft":
          setHigh(step.high);
          break;

        case "swap":
          setActiveIndices(step.indices || []);
          break;

        case "found":
          setActiveIndices([step.index]);
          setFound(true);
          break;

        default:
          break;
      }

      await new Promise(res => setTimeout(res, 800));
    }

    setRunning(false);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="w-full">
        <Flowchart 
          algo={algo} 
        />
      </div>
    </div>
  );
}