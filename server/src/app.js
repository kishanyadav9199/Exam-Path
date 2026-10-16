import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dns from "node:dns";

import { config } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import examRoutes from "./routes/exam.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import testRoutes from "./routes/test.routes.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

app.disable("x-powered-by");

app.use(helmet());

// CORS: configure once for both student and admin frontends.
const allowedOrigins = new Set([
  ...config.clientOrigins,
  ...(config.isProd
    ? []
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ]),
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(
  "/api/payments",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/", (_req, res) => {
  res.json({ message: "ExamPath API is running." });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(authRoutes);
app.use(examRoutes);
app.use(adminRoutes);
app.use(paymentRoutes);
app.use(testRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found.",
    path: req.originalUrl,
  });
});

app.use((err, _req, res, _next) => {
  if (err?.code === 11000) {
    return res.status(409).json({
      message: "A record with this value already exists.",
    });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed.",
    });
  }

  if (err?.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      message: "Origin not allowed by CORS.",
    });
  }

  console.error(err);

  return res.status(500).json({
    message: config.isProd ? "Something went wrong." : err.message,
  });
});

export default app;
