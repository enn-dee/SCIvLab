import { Sun, Moon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext.jsx";

export default function ThemeToggle({ compact = false }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        relative flex items-center justify-center
        ${compact ? "h-10 w-10" : "h-10 px-3 gap-2"}
        rounded-xl
        border border-white/10
        bg-white/5 hover:bg-white/10
        backdrop-blur-xl
        text-gray-300 hover:text-white
        transition-all
        theme-toggle
      `}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </motion.div>
      {!compact && (
        <span className="text-xs font-medium">{isDark ? "Light" : "Dark"}</span>
      )}
    </motion.button>
  );
}
