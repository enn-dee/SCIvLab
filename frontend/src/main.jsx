import "@fontsource/inter";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
import { registerServiceWorker } from "./offline/registerServiceWorker";
import { cleanOfflineCache } from "./api/client.js";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

registerServiceWorker();
cleanOfflineCache();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TooltipProvider>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </StrictMode>,
);
