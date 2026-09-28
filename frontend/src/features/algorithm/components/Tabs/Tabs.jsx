import { Button } from "@/components/ui/button";

import {
  ChartSpline,
  Code,
  Text,
  SquarePlay
} from "lucide-react";

import React from "react";

function Tabs({
  activeTab,
  setActiveTab,
  markAsRead
}) {

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const tabs = [
    {
      id: "info",
      label: "Info",
      icon: Text
    },
    {
      id: "flow",
      label: "FlowChart",
      icon: ChartSpline
    },
    {
      id: "visual",
      label: "Visualization",
      icon: SquarePlay
    },
    {
      id: "code",
      label: "Code Editor",
      icon: Code
    }
  ];

  return (

    <div className="w-full flex gap-2 overflow-x-auto scrollbar-hide">

      {tabs.map((tab) => {

        const Icon = tab.icon;

        const active =
          activeTab === tab.id;

        return (

          <Button
            key={tab.id}

            onClick={() =>
              handleTabChange(tab.id)
            }

            className={`
              relative
              flex items-center gap-2
              px-4 py-2
              rounded-xl
              border
              text-sm font-medium
              whitespace-nowrap
              transition-all duration-300

              ${active
                ? `
                  bg-gradient-to-r
                  from-emerald-500/20
                  to-cyan-500/20
                  border-emerald-400/40
                  text-white
                  shadow-lg shadow-emerald-500/10
                  backdrop-blur-xl
                `
                : `
                  bg-white/[0.03]
                  border-white/10
                  text-gray-400
                  hover:bg-white/[0.06]
                  hover:text-white
                  hover:border-white/20
                `
              }
            `}
          >

            {active && (
              <div
                className="
                  absolute inset-0
                  rounded-xl
                  bg-gradient-to-r
                  from-emerald-500/5
                  to-cyan-500/5
                  pointer-events-none
                "
              />
            )}

            <Icon
              size={16}
              className={`
                transition-transform duration-300
                ${active
                  ? "scale-110 text-emerald-300"
                  : ""
                }
              `}
            />

            <span>
              {tab.label}
            </span>

          </Button>
        );
      })}

    </div>
  );
}

export default Tabs;