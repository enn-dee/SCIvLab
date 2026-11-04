import { createContext, useContext, useEffect, useState } from "react";
import { loader } from "@monaco-editor/react";

const ThemeContext = createContext(null);

const lightTheme = {
  base: "vs",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#f8fafc",
    "editor.foreground": "#0f172a",
    "editorLineNumber.foreground": "#94a3b8",
    "editorLineNumber.activeForeground": "#0f172a",
    "editorIndentGuide.background1": "#e2e8f0",
    "editorIndentGuide.background2": "#e2e8f0",
    "editorIndentGuide.activeBackground1": "#cbd5e1",
    "editorIndentGuide.activeBackground2": "#cbd5e1",
    "editor.lineHighlightBackground": "#f1f5f9",
    "editor.lineHighlightBorder": "#e2e8f0",
    "editor.selectionBackground": "#bfdbfe",
    "editorCursor.foreground": "#0f172a",
    "editorWhitespace.foreground": "#e2e8f0",
  },
};

loader.init().then((monaco) => {
  monaco.editor.defineTheme("scivlab-light", lightTheme);
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("scivlab:theme");
    if (stored === "light" || stored === "dark") return stored;
    // default → dark (matches current app)
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("scivlab:theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
