import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "@/api/client.js";
import { motion } from "motion/react";
import TeacherNavbar from "../../../components/layout/TeacherNavbar";
import StudentsTab from "../components/StudentsTab";
import PracticalsTab from "../components/PracticalsTab";
import SubmissionsTab from "../components/SubmissionsTab";
import EvaluationTab from "../components/EvaluationTab";
import MarksTab from "../components/MarksTab";
import AttendanceTab from "../components/AttendanceTab";
import ReportsTab from "../components/ReportsTab";
import AuditDiffViewer from "../components/AuditDiffViewer";

import {
  ChevronLeft,
  Users,
  FlaskConical,
  FileText,
  CheckCheck,
  BarChart3,
  CalendarCheck,
  FileSpreadsheet,
  Settings,
  History,
  Plus,
  Edit3,
  Trash2,
} from "lucide-react";

const tabs = [
  { id: "practicals", label: "Practicals", icon: FlaskConical },
  { id: "students", label: "Students", icon: Users },
  { id: "submissions", label: "Submissions", icon: FileText },
  { id: "evaluation", label: "Evaluation", icon: CheckCheck },
  { id: "marks", label: "Marks", icon: BarChart3 },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "reports", label: "Reports", icon: FileSpreadsheet },
  { id: "history", label: "History", icon: History },
];

const ACTION_STYLES = {
  created: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    icon: Plus,
    label: "Created",
  },
  updated: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    icon: Edit3,
    label: "Updated",
  },
  deleted: {
    badge: "bg-red-500/15 text-red-300 border-red-400/30",
    icon: Trash2,
    label: "Deleted",
  },
};

function HistoryTab({ history }) {
  if (!history.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <History size={40} className="mx-auto mb-3 opacity-30" />
        <p>No changes recorded yet</p>
        <p className="text-xs mt-1">
          Edits to labs and practicals will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => {
        const style = ACTION_STYLES[entry.action] || ACTION_STYLES.updated;
        const Icon = style.icon;
        const entityLabel =
          entry.entityType === "practical" ? "Practical" : "Lab";

        return (
          <div
            key={entry._id}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${style.badge}`}
                >
                  <Icon size={10} />
                  {style.label}
                </span>
                <span className="text-xs text-gray-500">{entityLabel}</span>
              </div>

              <div className="text-right text-xs text-gray-500">
                <p className="text-gray-400">
                  {entry.actorName}{" "}
                  <span className="text-gray-600">({entry.actorRole})</span>
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  {new Date(entry.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Diff viewer */}
            <AuditDiffViewer
              before={entry.before}
              after={entry.after}
              action={entry.action}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function TeacherLabDetail() {
  const { labId } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [activeTab, setActiveTab] = useState("students");
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchLab();
  }, [labId]);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab, labId]);

  const fetchLab = async () => {
    try {
      const res = await apiFetch(`labs/${labId}`);
      const data = await res.json();
      setLab(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await apiFetch(`labs/${labId}/history`);
      const data = await response.json();
      if (response.ok) setHistory(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!lab) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950">
        {/* <TeacherNavbar /> */}
        <div className="text-center py-24 text-red-400">Lab not found</div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "students":
        return <StudentsTab lab={lab} onUpdate={fetchLab} />;
      case "practicals":
        return <PracticalsTab lab={lab} />;
      case "submissions":
        return <SubmissionsTab lab={lab} />;
      case "evaluation":
        return <EvaluationTab lab={lab} />;
      case "marks":
        return <MarksTab lab={lab} />;
      case "attendance":
        return <AttendanceTab lab={lab} />;
      case "reports":
        return <ReportsTab lab={lab} />;
      case "history":
        return <HistoryTab history={history} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950">
      {/* <TeacherNavbar /> */}

      <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col gap-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/teacher/dashboard")}
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {lab.name}
              </h1>
              <p className="text-sm text-gray-400">
                {lab.subjectCode} — {lab.session} — {lab.students?.length || 0}{" "}
                Students
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs border ${
              lab.status === "current"
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                : "border-gray-400/20 bg-gray-500/10 text-gray-400"
            }`}
          >
            {lab.status === "current" ? "Active" : "Previous"}
          </div>
        </motion.div>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? "bg-purple-500/20 border border-purple-400/40 text-white shadow-lg shadow-purple-500/10"
                    : "bg-white/[0.03] border border-white/10 text-gray-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 min-h-[60vh]"
        >
          {renderTab()}
        </motion.div>
      </div>
    </div>
  );
}
