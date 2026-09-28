import { Handle, Position } from "@xyflow/react";

const activeFilter = "drop-shadow(0 0 6px #22d3ee) drop-shadow(0 0 10px #22d3eeaa)"; //this active filter is used to highlight the flowchart nodes corresponding to the dryrun tab steps

const TerminalNode = ({ data }) => (
  <div
    style={{
      filter: data.isActive ? activeFilter : "none",
      transition: "filter 0.2s ease",
      display: "inline-block",
    }}
  >
    <div
      style={{
        padding: "10px 24px",
        borderRadius: 999,
        textAlign: "center",
        fontSize: 13,
        fontWeight: 600,
        background: data.background,
        border: `2px solid ${data.borderColor}`,
      }}
    >
      <Handle type="target" position={Position.Top} />
      {data.label}
      <Handle type="source" position={Position.Bottom} />
    </div>
  </div>
);

const ProcessNode = ({ data }) => (
  <div
    style={{
      filter: data.isActive ? activeFilter : "none",
      transition: "filter 0.2s ease",
      display: "inline-block",
    }}
  >
    <div
      style={{
        padding: "10px 16px",
        textAlign: "center",
        fontSize: 13,
        background: data.background,
        border: `2px solid ${data.borderColor}`,
      }}
    >
      <Handle type="target" position={Position.Top} />
      {data.label}
      <Handle type="source" position={Position.Bottom} />
    </div>
  </div>
);

const DecisionNode = ({ data }) => (
  <div
    style={{
      position: "relative",
      width: 200,
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      filter: data.isActive ? activeFilter : "none",
      transition: "filter 0.2s ease",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: data.background,
        border: `2px solid ${data.borderColor}`,
        clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
      }}
    />
    <span
      style={{
        position: "relative",
        zIndex: 1,
        fontSize: 12,
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      {data.label}
    </span>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} id="bottom" />
    <Handle type="source" position={Position.Left} id="left" />
    <Handle type="source" position={Position.Right} id="right" />
  </div>
);

const IoNode = ({ data }) => (
  <div
    style={{
      filter: data.isActive ? activeFilter : "none",
      transition: "filter 0.2s ease",
      display: "inline-block",
    }}
  >
    <div
      style={{
        padding: "10px 28px",
        textAlign: "center",
        fontSize: 13,
        background: data.background,
        border: `2px solid ${data.borderColor}`,
        clipPath: "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)",
      }}
    >
      <Handle type="target" position={Position.Top} />
      {data.label}
      <Handle type="source" position={Position.Bottom} />
    </div>
  </div>
);

const CallNode = ({ data }) => (
  <div
    style={{
      filter: data.isActive ? activeFilter : "none",
      transition: "filter 0.2s ease",
      display: "inline-block",
    }}
  >
    <div
      style={{
        position: "relative",
        padding: "10px 24px",
        textAlign: "center",
        fontSize: 13,
        background: data.background,
        border: `2px solid ${data.borderColor}`,
      }}
    >
      <Handle type="target" position={Position.Top} />
      {data.label}
      <Handle type="source" position={Position.Bottom} />
    </div>
  </div>
);

export const nodeTypes = {
  terminalNode: TerminalNode,
  processNode: ProcessNode,
  decisionNode: DecisionNode,
  ioNode: IoNode,
  callNode: CallNode,
};