import mongoose from "mongoose";
import { config } from "./config/env.js";
import app from "./app.js";

try {
  await mongoose.connect(config.mongoUri);
  app.listen(config.port, () =>
    console.log(`ExamPath API listening on port ${config.port}`),
  );
} catch (error) {
  console.error("Failed to start ExamPath API:", error.message);
  process.exit(1);
}
