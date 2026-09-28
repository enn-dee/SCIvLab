import React, { useEffect } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Clock3,
  Database,
  CheckCircle2,
  XCircle,
  Binary,
} from "lucide-react";

import ComplexityGraph from "../../components/Tabs/ComplexityGraph";

function InfoTab({ algo }) {
  useEffect(() => {
    // console.log("algo in info tab: ", algo)
  }, []);

  if (!algo) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w mx-auto px-4 md:px-5 py-5">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-7"
      >

        

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-300 via-green-400 to-cyan-400 bg-clip-text text-transparent">
          {algo.title}
        </h1>

      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* OVERVIEW */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
          >

            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-cyan-500/[0.03]" />

            <div className="relative">

              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-400/20">
                  <Binary size={15} className="text-emerald-300" />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Overview
                </h2>
              </div>

              <p className="text-sm md:text-[15px] leading-7 text-gray-300">
                {algo.theory?.description || "No description available"}
              </p>

            </div>

          </motion.section>

          {/* KEY POINTS */}
          {algo.keyPoints?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-wrap gap-2"
            >

              {algo.keyPoints.map((point, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="px-3 py-2 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-white/10 text-sm text-gray-200 shadow-lg"
                >
                  {point}
                </motion.div>
              ))}

            </motion.section>
          )}

          {/* COMPLEXITY */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden"
          >

            <div className="flex items-center justify-between px-5 pt-5 mb-3">

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-400/20">
                  <Clock3 size={15} className="text-cyan-300" />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Complexity Analysis
                </h2>
              </div>

            </div>

            <div className="px-5 pb-5 max-w-xl mx-auto">
              <div className="rounded-2xl bg-black/20 border border-white/5 p-4">
                <ComplexityGraph complexity={algo.theory?.timeComplexity} />
              </div>
            </div>

          </motion.section>

        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">

          {/* PROS / CONS */}
          <motion.section
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
          >

            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-400/20">
                <Sparkles size={15} className="text-purple-300" />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Insights
              </h2>
            </div>

            <div className="flex flex-col gap-3">

              {algo.pros?.map((p, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.05] p-3"
                >
                  <CheckCircle2
                    size={18}
                    className="text-emerald-400 shrink-0 mt-0.5"
                  />

                  <p className="text-sm text-gray-200 leading-6">
                    {p}
                  </p>
                </motion.div>
              ))}

              {algo.cons?.map((c, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 rounded-2xl border border-red-400/10 bg-red-500/[0.05] p-3"
                >
                  <XCircle
                    size={18}
                    className="text-red-400 shrink-0 mt-0.5"
                  />

                  <p className="text-sm text-gray-200 leading-6">
                    {c}
                  </p>
                </motion.div>
              ))}

            </div>

          </motion.section>

          {/* PSEUDOCODE */}
          <motion.section
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden"
          >

            <div className="flex items-center gap-2 px-5 pt-5 mb-4">

              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-400/20">
                <Database size={15} className="text-amber-300" />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Pseudocode
              </h2>

            </div>

            <div className="px-5 pb-5">

              <div className="rounded-2xl border border-white/5 bg-[#050505]/80 overflow-hidden">

                {algo?.pseudocode?.lines?.map((line, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 2 }}
                    className={`flex gap-3 px-4 py-2.5 text-sm font-mono transition-all ${
                      i === algo?.pseudocode?.activeLine
                        ? "bg-amber-500/10 text-amber-300 border-l-2 border-amber-400"
                        : "text-gray-400 hover:bg-white/[0.03]"
                    }`}
                  >

                    <span className="opacity-40 select-none w-5">
                      {i + 1}
                    </span>

                    <span className="leading-6">
                      {line}
                    </span>

                  </motion.div>
                ))}

              </div>

            </div>

          </motion.section>

        </div>

      </div>

    </div>
  );
}

export default InfoTab;