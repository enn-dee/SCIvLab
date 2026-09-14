import {
  BrainCircuit,
  Code2,
  PlayCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  BarChart3,
  Binary,
  Cpu,
  Boxes,
  Orbit,
} from "lucide-react";

import { motion } from "motion/react";

import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";

function FloatingIcon({ icon, className, delay = 0 }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: [0, -12, 0],
      }}
      transition={{
        opacity: {
          duration: 0.5,
          delay,
        },
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
      }}
      className={className}
    >
      {icon}
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc, delay = 0 }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay,
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      className="
        relative overflow-hidden
        rounded-3xl
        border border-white/10
        bg-white/5
        backdrop-blur-xl
        p-6
      "
    >
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          -top-20
          -right-20
          w-40 h-40
          rounded-full
          border border-emerald-500/10
        "
      />

      <div
        className="
        absolute inset-0 opacity-0
        hover:opacity-100
        transition duration-500
        bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_40%)]
      "
      />

      <div className="relative">
        <motion.div
          whileHover={{
            rotate: 8,
            scale: 1.08,
          }}
          className="
            w-14 h-14 rounded-2xl
            flex items-center justify-center
            bg-emerald-500/10
            text-emerald-400
            border border-emerald-500/20
            mb-5
          "
        >
          {icon}
        </motion.div>

        <h3 className="text-xl font-semibold mb-3">{title}</h3>

        <p className="text-zinc-400 leading-7">{desc}</p>
      </div>
    </motion.div>
  );
}

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="
            absolute
            border border-emerald-500/20
          "
          style={{
            width: `${120 + i * 60}px`,
            height: `${120 + i * 60}px`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "24px",
          }}
        />
      ))}
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden relative">
      {/* BACKGROUND PARTICLES */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              delay: i * 0.4,
            }}
            className="
              absolute
              w-2 h-2
              rounded-full
              bg-emerald-400/30
            "
            style={{
              left: `${Math.random() * 100}%`,
              bottom: "-20px",
            }}
          />
        ))}
      </div>

      {/* HERO */}

      <section
        className="
          relative
          min-h-[100vh]
          flex
          items-center
          justify-center
          px-6
          py-24
        "
      >
        <AnimatedGrid />

        {/* GLOW */}

        <div
          className="
          absolute inset-0
          bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_35%)]
        "
        />

        <div
          className="
          absolute inset-0
          bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_30%)]
        "
        />

        {/* FLOATING ICONS */}

        <FloatingIcon
          delay={0.1}
          icon={<Binary size={38} />}
          className="
            absolute top-28 left-16
            text-emerald-400/30
            hidden lg:block
          "
        />

        <FloatingIcon
          delay={0.4}
          icon={<Cpu size={42} />}
          className="
            absolute top-40 right-24
            text-blue-400/30
            hidden lg:block
          "
        />

        <FloatingIcon
          delay={0.7}
          icon={<Boxes size={38} />}
          className="
            absolute bottom-32 left-28
            text-yellow-400/30
            hidden lg:block
          "
        />

        <FloatingIcon
          delay={1}
          icon={<Orbit size={44} />}
          className="
            absolute bottom-24 right-20
            text-purple-400/30
            hidden lg:block
          "
        />

        <div
          className="
          relative z-10
          max-w-6xl
          mx-auto
          text-center
        "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
          >
            <motion.div
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.5,
              }}
              className="
                inline-flex
                items-center
                gap-2
                px-4 py-2
                rounded-full
                border border-emerald-500/20
                bg-emerald-500/10
                text-emerald-300
                text-sm
                mb-8
              "
            >
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Sparkles size={16} />
              </motion.div>
              Interactive Algorithm Learning Platform
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15,
                duration: 0.7,
              }}
              className="
                text-5xl
                md:text-7xl
                font-black
                leading-tight
                tracking-tight
              "
            >
              Learn Algorithms
              <br />
              <motion.span
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                }}
                className="
                  bg-gradient-to-r
                  from-emerald-400
                  via-green-400
                  to-teal-400
                  bg-[length:200%_200%]
                  bg-clip-text
                  text-transparent
                "
              >
                Visually & Interactively
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
                duration: 0.7,
              }}
              className="
                mt-8
                text-lg
                md:text-xl
                text-zinc-400
                leading-8
                max-w-3xl
                mx-auto
              "
            >
              Master DSA through visual animations, real-time execution, coding
              challenges, progress tracking, and guided learning experiences.
            </motion.p>

            {/* CTA */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.45,
                duration: 0.7,
              }}
              className="
                flex flex-wrap
                items-center
                justify-center
                gap-4
                mt-10
              "
            >
              <motion.div
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.96,
                }}
              >
                <Button
                  onClick={() => navigate("/register")}
                  className="
                    h-12 px-7
                    rounded-2xl
                    bg-emerald-500
                    hover:bg-emerald-400
                    text-black
                    font-semibold
                    text-base
                    shadow-lg
                    shadow-emerald-500/30
                  "
                >
                  Get Started
                  <motion.div
                    animate={{
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                    }}
                  >
                    <ArrowRight size={18} />
                  </motion.div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.96,
                }}
              >
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="
                    h-12 px-7
                    rounded-2xl
                    border-white/10
                    bg-white/5
                    hover:bg-white/10
                    text-white
                    text-base
                  "
                >
                  Login
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}

      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="
              text-4xl
              font-bold
            "
            >
              Why Students Love It
            </h2>

            <p
              className="
              mt-4
              text-zinc-400
              text-lg
            "
            >
              Built for modern interactive learning
            </p>
          </motion.div>

          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-6
          "
          >
            <FeatureCard
              delay={0}
              icon={<BrainCircuit size={26} />}
              title="Visual Learning"
              desc="Understand algorithms step-by-step through animated visualizations."
            />

            <FeatureCard
              delay={0.1}
              icon={<Code2 size={26} />}
              title="Code & Execute"
              desc="Write solutions directly inside the platform with instant execution."
            />

            <FeatureCard
              delay={0.2}
              icon={<PlayCircle size={26} />}
              title="Interactive Simulations"
              desc="See how sorting, trees, graphs, and recursion work in real time."
            />

            <FeatureCard
              delay={0.3}
              icon={<BarChart3 size={26} />}
              title="Track Progress"
              desc="Monitor completion rates, solved problems, and learning growth."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="px-6 pb-28">
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          className="
            max-w-6xl
            mx-auto
            rounded-[2rem]
            border border-white/10
            bg-white/5
            backdrop-blur-xl
            p-8 md:p-12
            relative overflow-hidden
          "
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              -right-20
              -top-20
              w-60 h-60
              rounded-full
              border border-emerald-500/10
            "
          />

          <div className="text-center mb-14 relative z-10">
            <h2
              className="
              text-4xl
              font-bold
            "
            >
              How It Works
            </h2>

            <p
              className="
              mt-4
              text-zinc-400
              text-lg
            "
            >
              Learn → Visualize → Practice → Master
            </p>
          </div>

          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-8
            relative z-10
          "
          >
            {[
              {
                icon: <BookOpen size={28} />,
                title: "Learn Concepts",
                desc: "Read explanations and understand the logic behind every algorithm.",
                color: "blue",
              },
              {
                icon: <PlayCircle size={28} />,
                title: "Visualize Execution",
                desc: "Watch algorithms run visually with interactive animations.",
                color: "emerald",
              },
              {
                icon: <ShieldCheck size={28} />,
                title: "Solve Problems",
                desc: "Practice coding problems and improve through real submissions.",
                color: "yellow",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.15,
                }}
                whileHover={{
                  y: -6,
                }}
                className="text-center"
              >
                <motion.div
                  whileHover={{
                    scale: 1.08,
                    rotate: 6,
                  }}
                  className={`
                    mx-auto mb-5
                    w-16 h-16
                    rounded-2xl
                    flex items-center justify-center
                    bg-${item.color}-500/10
                    text-${item.color}-400
                  `}
                >
                  {item.icon}
                </motion.div>

                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>

                <p className="text-zinc-400 leading-7">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default LandingPage;
