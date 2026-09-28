import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import { DEFAULT_PORT } from "./config/constants.js";

connectDB();

const port = Number(process.env.PORT) || DEFAULT_PORT;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
