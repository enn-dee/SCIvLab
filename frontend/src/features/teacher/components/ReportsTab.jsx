import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client.js";
import { motion } from "motion/react";
import { FileSpreadsheet, TrendingUp, Users, ClipboardCheck, CalendarCheck, Download } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ReportsTab({ lab }) {
  const [performance, setPerformance] = useState([]);
  const [marksAnalysis, setMarksAnalysis] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAllReports();
  }, [lab, selectedMonth, selectedYear]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [perfRes, marksRes, attRes] = await Promise.all([
        apiFetch(`reports/student-performance/${lab._id}`),
        apiFetch(`reports/marks-analysis/${lab._id}`),
        apiFetch(`reports/attendance-summary/${lab._id}?month=${selectedMonth}&year=${selectedYear}`)
      ]);
      setPerformance(await perfRes.json());
      setMarksAnalysis(await marksRes.json());
      setAttendanceSummary(await attRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportPerformance = () => {
    if (!performance.length) {
      toast.error("No data to export");
      return;
    }

    const exportData = performance.map(p => ({
      "Student Name": p.student.fullName,
      "Roll Number": p.student.rollNumber,
      "Practicals Completed": `${p.practicalsCompleted}/${p.totalPracticals}`,
      "Average Marks": p.avgMarks,
      "Total Marks": p.totalMarks,
      "Attendance %": `${p.attendancePercent}%`
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Performance");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `${lab.name}_Student_Performance.xlsx`);
    toast.success("Performance report exported");
  };

  const exportMarksAnalysis = () => {
    if (!marksAnalysis.length) {
      toast.error("No data to export");
      return;
    }

    const exportData = marksAnalysis.map(m => ({
      "Practical": m.practical.title,
      "Highest Marks": m.highest,
      "Lowest Marks": m.lowest,
      "Average Marks": m.average,
      "Submissions": m.submissions
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marks Analysis");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `${lab.name}_Marks_Analysis.xlsx`);
    toast.success("Marks analysis exported");
  };

  const exportAttendance = () => {
    if (!attendanceSummary) {
      toast.error("No data to export");
      return;
    }

    const exportData = [
      { "Type": "Lab", "Total Classes": attendanceSummary.lab.total, "Present": attendanceSummary.lab.present, "Percentage": `${attendanceSummary.lab.percentage}%` },
      { "Type": "Lecture", "Total Classes": attendanceSummary.lecture.total, "Present": attendanceSummary.lecture.present, "Percentage": `${attendanceSummary.lecture.percentage}%` }
    ];

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Summary");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `${lab.name}_Attendance_Summary.xlsx`);
    toast.success("Attendance report exported");
  };

  const exportAllReports = () => {
    if (!performance.length && !marksAnalysis.length && !attendanceSummary) {
      toast.error("No data to export");
      return;
    }

    const wb = XLSX.utils.book_new();

    if (performance.length) {
      const perfData = performance.map(p => ({
        "Student Name": p.student.fullName,
        "Roll Number": p.student.rollNumber,
        "Practicals Completed": `${p.practicalsCompleted}/${p.totalPracticals}`,
        "Average Marks": p.avgMarks,
        "Total Marks": p.totalMarks,
        "Attendance %": `${p.attendancePercent}%`
      }));
      const perfWs = XLSX.utils.json_to_sheet(perfData);
      XLSX.utils.book_append_sheet(wb, perfWs, "Student Performance");
    }

    if (marksAnalysis.length) {
      const marksData = marksAnalysis.map(m => ({
        "Practical": m.practical.title,
        "Highest Marks": m.highest,
        "Lowest Marks": m.lowest,
        "Average Marks": m.average,
        "Submissions": m.submissions
      }));
      const marksWs = XLSX.utils.json_to_sheet(marksData);
      XLSX.utils.book_append_sheet(wb, marksWs, "Marks Analysis");
    }

    if (attendanceSummary) {
      const attData = [
        { "Type": "Lab", "Total Classes": attendanceSummary.lab.total, "Present": attendanceSummary.lab.present, "Percentage": `${attendanceSummary.lab.percentage}%` },
        { "Type": "Lecture", "Total Classes": attendanceSummary.lecture.total, "Present": attendanceSummary.lecture.present, "Percentage": `${attendanceSummary.lecture.percentage}%` }
      ];
      const attWs = XLSX.utils.json_to_sheet(attData);
      XLSX.utils.book_append_sheet(wb, attWs, "Attendance Summary");
    }

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `${lab.name}_Complete_Report.xlsx`);
    toast.success("Complete report exported");
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileSpreadsheet size={20} className="text-purple-400" />
          Reports & Analytics
        </h3>
        <div className="flex gap-2">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="p-2 rounded-xl bg-black/30 border border-white/10 text-white text-sm"
          >
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
              <option key={i} value={i+1}>{m}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="p-2 rounded-xl bg-black/30 border border-white/10 text-white text-sm"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={exportAllReports}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm hover:bg-emerald-500/30 transition"
          >
            <Download size={15} />
            Export All
          </button>
        </div>
      </div>

      {attendanceSummary && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <CalendarCheck size={18} className="text-cyan-400" />
              Attendance Summary — {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][selectedMonth-1]} {selectedYear}
            </h4>
            <button
              onClick={exportAttendance}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10"
            >
              <Download size={12} /> Export
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">{attendanceSummary.lab.percentage}%</p>
              <p className="text-sm text-gray-400">Lab Attendance</p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <TrendingUp size={18} className="text-yellow-400" />
            Marks Analysis
          </h4>
          <button
            onClick={exportMarksAnalysis}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10"
          >
            <Download size={12} /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-3">Practical</th>
                <th className="p-3">Highest</th>
                <th className="p-3">Lowest</th>
                <th className="p-3">Average</th>
                <th className="p-3">Submissions</th>
              </tr>
            </thead>
            <tbody>
              {marksAnalysis.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">No data</td></tr>
              ) : (
                marksAnalysis.map((m, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-3 text-white">{m.practical.title}</td>
                    <td className="p-3 text-emerald-400">{m.highest}</td>
                    <td className="p-3 text-red-400">{m.lowest}</td>
                    <td className="p-3 text-gray-300">{m.average}</td>
                    <td className="p-3 text-gray-400">{m.submissions}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <Users size={18} className="text-purple-400" />
            Student Performance
          </h4>
          <button
            onClick={exportPerformance}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10"
          >
            <Download size={12} /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Practicals Done</th>
                <th className="p-3">Avg Marks</th>
                <th className="p-3">Total Marks</th>
                <th className="p-3">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {performance.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">No data</td></tr>
              ) : (
                performance.map((p, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-3">
                      <p className="text-white">{p.student.fullName}</p>
                      <p className="text-xs text-gray-500">{p.student.rollNumber}</p>
                    </td>
                    <td className="p-3 text-gray-300">{p.practicalsCompleted}/{p.totalPracticals}</td>
                    <td className="p-3 text-gray-300">{p.avgMarks}</td>
                    <td className="p-3 text-white font-medium">{p.totalMarks}</td>
                    <td className="p-3">
                      <span className={`${p.attendancePercent >= 75 ? "text-emerald-400" : "text-red-400"}`}>
                        {p.attendancePercent}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}