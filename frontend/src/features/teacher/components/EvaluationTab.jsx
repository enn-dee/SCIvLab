import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client.js";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { CheckCheck, X, Search, Save } from "lucide-react";

export default function EvaluationTab({ lab }) {
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [evaluation, setEvaluation] = useState({
    remarks: "",
    status: "approved",
  });

  const [loading, setLoading] = useState({
    submissions: false,
    evaluation: false,
    saving: false,
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, [lab]);

  const fetchSubmissions = async () => {
    setLoading((prev) => ({ ...prev, submissions: true }));

    try {
      const res = await apiFetch(`submissions/lab/${lab._id}`);
      const data = await res.json();
      setSubmissions(data.filter((s) => s.status !== "pending"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load submissions");
    } finally {
      setLoading((prev) => ({ ...prev, submissions: false }));
    }
  };

  const handleSelect = async (submission) => {
    setSelected(submission);
    setEvaluation({ remarks: "", status: "approved" });

    setLoading((prev) => ({ ...prev, evaluation: true }));

    try {
      const res = await apiFetch(`evaluations/submission/${submission._id}`);
      const data = await res.json();

      if (data) {
        setEvaluation({
          remarks: data.remarks || "",
          status: data.status || "approved",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, evaluation: false }));
    }
  };

  const handleSave = async () => {
    if (!selected) return;

    setLoading((prev) => ({ ...prev, saving: true }));

    try {
      await apiFetch("evaluations", {
        method: "POST",
        body: JSON.stringify({
          submissionId: selected._id,
          remarks: evaluation.remarks,
          status: evaluation.status,
        }),
      });

      toast.success("Evaluation saved");
      setSelected(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  const filtered = submissions.filter(
    (s) =>
      (s.studentId?.fullName || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (s.studentId?.rollNumber || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <CheckCheck size={20} className="text-purple-400" />
        Evaluation
      </h3>

      {!selected ? (
        <>
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-3 text-gray-500"
            />

            <input
              type="text"
              placeholder="Search submissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            {loading.submissions ? (
              <div className="text-center py-10 text-gray-500">
                Loading submissions...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No submissions to evaluate
              </div>
            ) : (
              filtered.map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => handleSelect(s)}
                  className="cursor-pointer rounded-xl border border-white/10 bg-black/20 p-4 hover:border-purple-400/30 hover:bg-purple-500/5 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">
                        {s.studentId?.fullName} — {s.practicalId?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.studentId?.rollNumber}
                      </p>
                    </div>

                    <span className="text-xs text-gray-400">
                      {new Date(s.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-semibold">
                {selected.studentId?.fullName}
              </h4>

              <p className="text-sm text-gray-400">
                {selected.studentId?.rollNumber} —{" "}
                {selected.practicalId?.title}
              </p>
            </div>

            <button onClick={() => setSelected(null)}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {loading.evaluation && (
            <div className="text-sm text-gray-500">
              Loading evaluation...
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 block mb-2">
              Status
            </label>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setEvaluation({
                    ...evaluation,
                    status: "approved",
                  })
                }
                className={`px-4 py-2 rounded-xl border transition ${
                  evaluation.status === "approved"
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                    : "border-white/10 text-gray-400"
                }`}
              >
                Approve
              </button>

              <button
                onClick={() =>
                  setEvaluation({
                    ...evaluation,
                    status: "rejected",
                  })
                }
                className={`px-4 py-2 rounded-xl border transition ${
                  evaluation.status === "rejected"
                    ? "border-red-400 bg-red-500/20 text-red-300"
                    : "border-white/10 text-gray-400"
                }`}
              >
                Reject
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2">
              Remarks / Feedback
            </label>

            <textarea
              value={evaluation.remarks}
              onChange={(e) =>
                setEvaluation({
                  ...evaluation,
                  remarks: e.target.value,
                })
              }
              rows={4}
              placeholder="Write feedback for the student..."
              className="w-full p-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading.saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium"
          >
            <Save size={16} />
            {loading.saving ? "Saving..." : "Save Evaluation"}
          </button>
        </motion.div>
      )}
    </div>
  );
}