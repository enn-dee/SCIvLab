import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, ArrowRight } from "lucide-react";
import InfoTab from "../components/Tabs/InfoTab";
import VisualTab from "../components/Tabs/VisualTab";
import VisualiztionTab from "../components/Tabs/VisualizationTab";
import CodeTab from "../components/Tabs/CodeTab";
import Tabs from "../components/Tabs/Tabs";
import { motion, AnimatePresence } from "motion/react";
import { apiFetch } from "@/api/client.js";

function AlgoWorkspace() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [algo, setAlgo] = useState(null);

  const [activeTab, setActiveTab] =
    useState("info");

  const tabOrder = [
    "info",
    "flow",
    "visual",
    "code"
  ];

  const index =
    tabOrder.indexOf(activeTab);

  const isLastTab =
    index === tabOrder.length - 1;

  const handleBack = () => {

    if (index > 0) {

      setActiveTab(
        tabOrder[index - 1]
      );

    } else {

      navigate("/algo-dashboard");
    }
  };

  const handleNext = () => {

    if (index < tabOrder.length - 1) {

      setActiveTab(
        tabOrder[index + 1]
      );
    }
  };

  useEffect(() => {

    const fetchAlgo = async () => {

      try {

        const res =
          await apiFetch(
            `algorithms/${id}`
          );

        const data =
          await res.json();

        setAlgo(data);

      } catch (err) {

        console.error(err);
      }
    };

    fetchAlgo();

  }, [id]);

  if (!algo) {

    return (

      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="flex flex-col items-center gap-3">

          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />

          <p className="text-sm text-gray-400 animate-pulse">
            Loading workspace...
          </p>

        </div>

      </div>
    );
  }

  return (

    <div className="flex flex-col gap-5 px-3 sm:px-4 md:px-6 py-5">

      {/* HEADER */}

      <motion.div
        initial={{
          opacity: 0,
          y: 14
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          duration: 0.35
        }}

        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-xl"
      >

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_30%)]" />

        <div className="relative flex flex-col gap-5 p-4 md:p-5">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <Button
                onClick={handleBack}
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
              >
                <ChevronLeft size={18} />
              </Button>

              <div>

                <span className="text-[11px] uppercase tracking-[0.22em] text-emerald-400 font-semibold">
                  Algorithm Workspace
                </span>

                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  {algo.title}
                </h1>

              </div>

            </div>

            <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400">

              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

              Step {index + 1} / {tabOrder.length}

            </div>

          </div>

          {/* PROGRESS */}

          <div className="flex flex-col gap-2">

            <div className="flex items-center justify-between text-xs text-gray-400">

              <span>
                Learning Progress
              </span>

              <span className="text-emerald-400 font-medium">
                {Math.round(((index + 1) / tabOrder.length) * 100)}%
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/5 border border-white/10">

              <motion.div
                initial={{ width: 0 }}

                animate={{
                  width: `${((index + 1) / tabOrder.length) * 100}%`
                }}

                transition={{
                  duration: 0.45
                }}

                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              />

            </div>

          </div>

        </div>

      </motion.div>

      {/* CONTENT */}

      <motion.div
        initial={{
          opacity: 0,
          y: 14
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          duration: 0.4,
          delay: 0.05
        }}

        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-xl"
      >

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05),transparent_35%)]" />

        <div className="relative p-4 md:p-5">

          <div className="mb-5 border-b border-white/10 pb-3">
            <Tabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          <div className="min-h-[560px]">

            <AnimatePresence mode="wait">

              {activeTab === "info" && (
                <motion.div
                  key="info"

                  initial={{
                    opacity: 0,
                    y: 12
                  }}

                  animate={{
                    opacity: 1,
                    y: 0
                  }}

                  exit={{
                    opacity: 0,
                    y: -8
                  }}

                  transition={{
                    duration: 0.25
                  }}
                >
                  <InfoTab algo={algo} />
                </motion.div>
              )}

              {activeTab === "flow" && (
                <motion.div
                  key="flow"

                  initial={{
                    opacity: 0,
                    y: 12
                  }}

                  animate={{
                    opacity: 1,
                    y: 0
                  }}

                  exit={{
                    opacity: 0,
                    y: -8
                  }}

                  transition={{
                    duration: 0.25
                  }}
                >
                  <VisualTab algo={algo} />
                </motion.div>
              )}

              {activeTab === "visual" && (
                <motion.div
                  key="visual"

                  initial={{
                    opacity: 0,
                    y: 12
                  }}

                  animate={{
                    opacity: 1,
                    y: 0
                  }}

                  exit={{
                    opacity: 0,
                    y: -8
                  }}

                  transition={{
                    duration: 0.25
                  }}
                >
                  <VisualiztionTab algo={algo} />
                </motion.div>
              )}

              {activeTab === "code" && (
                <motion.div
                  key="code"

                  initial={{
                    opacity: 0,
                    y: 12
                  }}

                  animate={{
                    opacity: 1,
                    y: 0
                  }}

                  exit={{
                    opacity: 0,
                    y: -8
                  }}

                  transition={{
                    duration: 0.25
                  }}
                >
                  <CodeTab algo={algo} />
                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>

      </motion.div>

      {/* FOOTER */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          duration: 0.35,
          delay: 0.1
        }}

        className="flex items-center justify-between"
      >

        <Button
          onClick={handleBack}
          className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 hover:bg-white/10 transition-all"
        >

          <ChevronLeft size={16} />

          Back

        </Button>

        {!isLastTab && (

          <Button
            onClick={handleNext}
            className="h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 text-white shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
          >

            Next

            <ArrowRight size={16} />

          </Button>

        )}

      </motion.div>

    </div>
  );
}

export default AlgoWorkspace;