import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "@/api/client.js";
import { ArrowLeft, CalendarClock, Clock, Play } from "lucide-react";
import toast from "react-hot-toast";

export default function ExamPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    apiFetch(`exams/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load exam");
        return response.json();
      })
      .then(setExam)
      .catch((error) => toast.error(error.message));
  }, [id]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!exam) {
    return <div className="min-h-screen bg-zinc-950 p-8 text-gray-400">Loading exam...</div>;
  }

  const currentTime = new Date(now);
  const startsAt = exam.startTime ? new Date(exam.startTime) : null;
  const configuredEnd = exam.endTime ? new Date(exam.endTime) : null;
  const endsAt = configuredEnd;
  const notStarted = startsAt && currentTime < startsAt;
  const expired = endsAt && currentTime >= endsAt;
  const startExam = async () => {
    if (notStarted || expired) return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      toast.error("Fullscreen mode could not be enabled");
    }
    navigate(`/student/exams/${exam._id}/start`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <button
          onClick={() => navigate("/student/exams")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to exams
        </button>

        <section className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-white md:text-3xl">{exam.title}</h1>
          <p className="mt-4 whitespace-pre-wrap text-gray-300">
            {exam.description || "No description provided."}
          </p>

          <div className="mt-6 grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-3">
              <Clock size={16} className="text-cyan-300" />
              Duration: {startsAt && endsAt ? `${Math.floor((endsAt - startsAt) / 60000)} minutes` : "Not configured"}
            </div>
            {endsAt && (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-3">
                <CalendarClock size={16} className="text-cyan-300" />
                Ends: {endsAt.toLocaleString()}
              </div>
            )}
          </div>
        </section>

        {exam.instructions && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-lg font-semibold text-white">Instructions</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-400">
              {exam.instructions}
            </p>
          </section>
        )}

        <div className="flex justify-end">
          <button
            disabled={expired}
            onClick={startExam}
            className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-5 py-3 font-medium text-emerald-200 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play size={16} />
            {notStarted ? `Starts ${startsAt.toLocaleString()}` : expired ? "Exam closed" : "Start exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
