import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import "../../app.css";

import {
  Axe,
  ShieldUser,
  Verified,
  LogOut,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import ThemeToggle from "../ui/ThemeToggle";
import { motion } from "motion/react";

import { Button } from "../ui/button";

import { useNavigate } from "react-router-dom";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

function Navbar() {
  const [role, setRole] = useState(null);

  const [token, setToken] = useState(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));

    setToken(localStorage.getItem("token"));
  }, []);

  const navigate = useNavigate();

  return (
    <nav
      className="
                sticky
                top-0
                z-50
                w-full

                border-b
                border-white/10

                bg-black/20
                backdrop-blur-2xl

                supports-[backdrop-filter]:bg-black/10

                shadow-[0_8px_30px_rgb(0,0,0,0.12)]
            "
    >
      <div
        className="
                    relative
                    flex
                    items-center
                    justify-between

                    px-4
                    md:px-8

                    py-4
                "
      >
        <div
          className="
                        absolute
                        inset-0

                        bg-gradient-to-r
                        from-purple-500/5
                        via-cyan-500/5
                        to-emerald-500/5

                        pointer-events-none
                    "
        />

        <div
          onClick={() => navigate("/")}
          className="
                        relative
                        flex
                        items-center
                        gap-3

                        cursor-pointer
                        group
                    "
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.6,
              rotate: -90,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              duration: 0.6,
              type: "spring",
            }}
            whileHover={{
              rotate: 12,
              scale: 1.08,
            }}
            className="
                            relative

                            flex
                            items-center
                            justify-center

                            w-11
                            h-11

                            rounded-2xl

                            bg-gradient-to-br
                            from-orange-400
                            via-orange-500
                            to-rose-500

                            shadow-lg
                            shadow-orange-500/30
                        "
          >
            <div
              className="
                                absolute
                                inset-0

                                rounded-2xl

                                bg-white/20

                                blur-xl
                            "
            />

            <Axe
              size={22}
              className="
                                relative
                                z-10
                                text-white
                            "
            />
          </motion.div>

          <div
            className="
                            flex
                            flex-col
                            leading-none
                        "
          >
            <h1
              className="
                                text-xl
                                md:text-2xl

                                font-black

                                tracking-tight
                            "
            >
              <span
                className="
                                    bg-gradient-to-r
                                    from-cyan-400
                                    via-blue-500
                                    to-purple-500

                                    bg-clip-text
                                    text-transparent
                                "
              >
                SCi
              </span>

              <span
                className="
                                    text-white
                                "
              >
                VLab
              </span>
            </h1>

            {/* <span
                            className="
                                hidden
                                md:flex

                                items-center
                                gap-1

                                text-[11px]
                                text-gray-400

                                font-medium

                                tracking-wide
                            "
                        >

                            Interactive Algorithm Laboratory

                            <ChevronRight
                                size={12}
                                className="
                                    text-cyan-400
                                "
                            />

                        </span> */}
          </div>

          <motion.div
            animate={{
              rotate: [0, 12, -12, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
            }}
          >
            <Sparkles
              className="
                                text-yellow-400
                                opacity-80
                            "
              size={16}
            />
          </motion.div>
        </div>

        <div
          className="
                        relative
                        flex
                        items-center
                        gap-3
                    "
        >
          {role === "student" && token && (
            <div
              className="
                                flex
                                items-center
                                gap-3
                            "
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{
                      scale: 1.08,
                    }}
                    className="
                                            flex
                                            items-center
                                            justify-center

                                            w-10
                                            h-10

                                            rounded-2xl

                                            bg-emerald-500/10

                                            border
                                            border-emerald-400/20

                                            shadow-lg
                                            shadow-emerald-500/10
                                        "
                  >
                    <Verified
                      className="
                                                text-emerald-400
                                            "
                      size={18}
                    />
                  </motion.div>
                </TooltipTrigger>

                <TooltipContent
                  className="
                                        border-white/10
                                        bg-zinc-900
                                        text-white
                                    "
                >
                  <p>Verified Student</p>
                </TooltipContent>
              </Tooltip>

              <div
                className="
                                    hidden
                                    md:flex

                                    flex-col
                                "
              >
                <span
                  className="
                                        text-xs
                                        text-gray-500
                                    "
                >
                  Logged in as
                </span>

                <span
                  className="
                                        text-sm
                                        text-white
                                        font-semibold
                                    "
                >
                  Student
                </span>
              </div>

              {/* <motion.div
                                whileHover={{ scale: 1.08 }}
                                className="cursor-pointer"
                            >
                                <Avatar className="ring-2 ring-white/10 hover:ring-emerald-400 transition">
                                    <AvatarImage
                                        src="https://avatars.githubusercontent.com/u/89350768?s=400"
                                        alt="user profile"
                                    />
                                    <AvatarFallback>ND</AvatarFallback>
                                </Avatar>
                            </motion.div> */}
            </div>
          )}

          {role !== "student" && token && (
            <motion.div
              whileHover={{
                scale: 1.04,
              }}
              className="
                                flex
                                items-center
                                gap-2

                                px-4
                                py-2

                                rounded-2xl

                                bg-gradient-to-r
                                from-orange-500/10
                                to-amber-500/10

                                border
                                border-orange-400/20

                                shadow-lg
                                shadow-orange-500/10
                            "
            >
              <ShieldUser
                className="
                                    text-orange-400
                                "
                size={18}
              />

              <span
                className="
                                    text-sm
                                    font-semibold

                                    text-orange-300

                                    hidden
                                    md:block
                                "
              >
                Teacher Panel
              </span>
            </motion.div>
          )}
          <ThemeToggle compact />

          {token && (
            <motion.div
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.96,
              }}
            >
              <Button
                onClick={() => {
                  localStorage.clear();

                  window.location.href = "/login";
                }}
                className="
                                    relative

                                    overflow-hidden

                                    flex
                                    items-center
                                    gap-2

                                    rounded-2xl

                                    px-4
                                    py-2

                                    border
                                    border-red-400/20

                                    bg-gradient-to-r
                                    from-red-500
                                    via-rose-500
                                    to-pink-500

                                    hover:opacity-95

                                    text-white

                                    shadow-lg
                                    shadow-red-500/20

                                    transition-all
                                    duration-300
                                "
              >
                <div
                  className="
                                        absolute
                                        inset-0

                                        bg-white/10

                                        opacity-0
                                        hover:opacity-100

                                        transition
                                    "
                />

                <LogOut size={16} className="relative z-10" />

                <span
                  className="
                                        relative
                                        z-10

                                        hidden
                                        md:inline

                                        font-medium
                                    "
                >
                  Logout
                </span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
