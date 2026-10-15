import mongoose from "mongoose";
import { config } from "./config/env.js";
import app from "./app.js";

try {
  if (!config.mongoUri) {
    throw new Error("MONGO_URI is missing.");
  }

  await mongoose.connect(config.mongoUri);
  console.log("MongoDB connected successfully.");

  const port = process.env.PORT || config.port;

  app.listen(port, "0.0.0.0", () => {
    console.log(`ExamPath API listening on port ${port}`);
  });
} catch (error) {
  console.error("Failed to start ExamPath API:", error);
  process.exit(1);
}
