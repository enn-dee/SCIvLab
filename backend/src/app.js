import "./config/env.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const currentDir = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(currentDir, "../../frontend/dist")));
app.use("/api", routes);

app.get(["/health", "/api/health"], (req, res) => res.status(200).send("ok"));

app.use(errorHandler);
app.use((req, res) => {
  res.sendFile(path.resolve(currentDir, "../../frontend/dist/index.html"));
});

export default app;
