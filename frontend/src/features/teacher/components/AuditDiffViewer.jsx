import { useMemo } from "react";
import { Plus, Minus, Edit3, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { computeDiff, formatDiffValue } from "@/lib/diff";

const TYPE_STYLES = {
  added: {
    bg: "bg-emerald-500/[0.06]",
    border: "border-emerald-400/20",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    icon: Plus,
    label: "Added",
  },
  removed: {
    bg: "bg-red-500/[0.06]",
    border: "border-red-400/20",
    badge: "bg-red-500/15 text-red-300 border-red-400/30",
    icon: Minus,
    label: "Removed",
  },
  changed: {
    bg: "bg-amber-500/[0.06]",
    border: "border-amber-400/20",
    badge: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    icon: Edit3,
    label: "Changed",
  },
};

function ChangeRow({ change }) {
  const style = TYPE_STYLES[change.type];
  const Icon = style.icon;

  return (
    <div
      className={`rounded-xl border ${style.border} ${style.bg} p-3 space-y-2`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-white truncate">
          {change.label}
        </p>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${style.badge}`}
        >
          <Icon size={10} />
          {style.label}
        </span>
      </div>

      {/* Value comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Old value (for changed + removed) */}
        {change.type !== "added" && (
          <div className="rounded-lg bg-red-500/[0.04] border border-red-400/10 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-red-400 mb-1 font-medium">
              Before
            </p>
            <p className="text-gray-300 break-words whitespace-pre-wrap font-mono text-[11px] leading-5">
              {formatDiffValue(change.oldValue)}
            </p>
          </div>
        )}

        {/* New value (for changed + added) */}
        {change.type !== "removed" && (
          <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-400/10 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1 font-medium">
              After
            </p>
            <p className="text-gray-300 break-words whitespace-pre-wrap font-mono text-[11px] leading-5">
              {formatDiffValue(change.newValue)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuditDiffViewer({ before, after, action }) {
  const [expanded, setExpanded] = useState(false);

  const changes = useMemo(() => computeDiff(before, after), [before, after]);

  // For "created" actions, only show the after snapshot
  const isCreated = action === "created";
  const isDeleted = action === "deleted";

  if (isCreated && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs text-gray-500 hover:text-gray-300 transition flex items-center gap-1"
      >
        <ChevronDown size={12} />
        View created fields
      </button>
    );
  }

  if (isDeleted && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs text-gray-500 hover:text-gray-300 transition flex items-center gap-1"
      >
        <ChevronDown size={12} />
        View deleted snapshot
      </button>
    );
  }

  if (changes.length === 0 && !isCreated && !isDeleted) {
    return (
      <p className="text-xs text-gray-500 italic">
        No field-level changes detected
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
          {isCreated
            ? "Created with"
            : isDeleted
              ? "Deleted data"
              : `${changes.length} field${changes.length === 1 ? "" : "s"} changed`}
        </p>
        {expanded && (isCreated || isDeleted) && (
          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-gray-500 hover:text-gray-300 transition flex items-center gap-1"
          >
            <ChevronUp size={12} />
            Hide
          </button>
        )}
      </div>

      {/* Rows */}
      {isCreated && expanded && (
        <div className="space-y-2">
          {Object.entries(after || {})
            .filter(
              ([key]) =>
                !["_id", "__v", "createdAt", "updatedAt", "labId"].includes(
                  key,
                ),
            )
            .map(([key, val]) => {
              // Skip empty values
              if (
                val === "" ||
                val === null ||
                val === undefined ||
                (Array.isArray(val) && val.length === 0)
              ) {
                return null;
              }
              return (
                <div
                  key={key}
                  className="rounded-xl border border-emerald-400/10 bg-emerald-500/[0.04] p-3"
                >
                  <p className="text-xs font-medium text-white mb-1 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="text-xs text-gray-300 font-mono break-words whitespace-pre-wrap">
                    {formatDiffValue(val)}
                  </p>
                </div>
              );
            })}
        </div>
      )}

      {isDeleted && expanded && (
        <div className="space-y-2">
          {Object.entries(before || {})
            .filter(
              ([key]) =>
                !["_id", "__v", "createdAt", "updatedAt", "labId"].includes(
                  key,
                ),
            )
            .map(([key, val]) => {
              if (
                val === "" ||
                val === null ||
                val === undefined ||
                (Array.isArray(val) && val.length === 0)
              ) {
                return null;
              }
              return (
                <div
                  key={key}
                  className="rounded-xl border border-red-400/10 bg-red-500/[0.04] p-3"
                >
                  <p className="text-xs font-medium text-white mb-1 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="text-xs text-gray-300 font-mono break-words whitespace-pre-wrap">
                    {formatDiffValue(val)}
                  </p>
                </div>
              );
            })}
        </div>
      )}

      {!isCreated && !isDeleted && (
        <div className="space-y-2">
          {changes.map((change) => (
            <ChangeRow key={change.key} change={change} />
          ))}
        </div>
      )}
    </div>
  );
}
