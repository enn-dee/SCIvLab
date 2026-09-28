import React, { useEffect, useState } from "react";
import AlgorithmVisualizer from "@/features/algorithm/components/flowchart/AlgorithmVisualizer.jsx";

export default function VisualTab({algo}) {


  if (!algo) return <div>Loading...</div>;

  return <AlgorithmVisualizer algo={algo} />;
}