import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/api/client.js";
import { ClipboardCheck, Clock3, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch("exams/student")
      .then((response) => response.json())
      .then(setExams)
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-6">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="text-cyan-300" size={28} />
            <div><h1 className="text-2xl font-bold text-white">Exams</h1><p className="mt-1 text-sm text-gray-400">Complete your available programming exams.</p></div>
          </div>
        </header>
        {loading ? <p className="text-gray-400">Loading exams...</p> : exams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-gray-500">No exams are available yet.</div>
        ) : <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          {/* <div className="hidden border-b border-white/10 px-5 py-3 text-xs uppercase tracking-wider text-gray-500 sm:grid sm:grid-cols-[1fr_auto]">
            <span>Exam</span>
            <span>Action</span>
          </div> */}
          {exams.map((exam, index) => {
            const startsAt = exam.startTime ? new Date(exam.startTime) : null;
            const endsAt = exam.endTime ? new Date(exam.endTime) : null;
            const notStarted = startsAt && startsAt.getTime() > now;
            const running = !notStarted && (!endsAt || endsAt.getTime() > now);
            return (
            <div key={exam._id} className={`flex items-center justify-between gap-4 px-5 py-4 ${index > 0 ? "border-t border-white/10" : ""}`}>
              <div className="flex min-w-0 items-center gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{exam.title}</h2>
                </div>
                {running && (
                  <Clock3
                    size={21}
                    aria-label="Exam currently running"
                    className="shrink-0 animate-pulse text-amber-300"
                  />
                )}
              </div>
              <button
                disabled={notStarted}
                onClick={() => navigate(`/student/exams/${exam._id}`)}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-amber-400/30 disabled:bg-amber-500/10 disabled:text-amber-300"
              >
                <Eye size={15} />
                {notStarted ? `Starts ${startsAt.toLocaleString()}` : "View exam"}
              </button>
            </div>
            );
          })}
        </div>}
      </div>
    </div>
  );
}
