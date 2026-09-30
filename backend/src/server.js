import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import { DEFAULT_PORT } from "./config/constants.js";
import { verifyEmailConnection } from "./utils/emailService.js";

connectDB();
verifyEmailConnection();

const port = Number(process.env.PORT) || DEFAULT_PORT;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
