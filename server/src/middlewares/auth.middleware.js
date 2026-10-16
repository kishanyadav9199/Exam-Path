import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { User, Payment } from "../models/index.js";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1]?.trim();

    if (!token) {
      return res.status(401).json({
        message: "Please log in to continue.",
      });
    }

    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: ["HS256"],
    });

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        message: "Session is no longer valid.",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    if (
      error?.name === "JsonWebTokenError" ||
      error?.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Invalid session. Please log in again.",
      });
    }

    return next(error);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Administrator access required.",
    });
  }

  next();
}

export async function hasExamAccess(user, examId) {
  if (user?.role === "admin") return true;
  if (!user?._id || !examId) return false;

  return Boolean(
    await Payment.exists({
      user: user._id,
      exam: examId,
      status: "paid",
      accessUntil: { $gt: new Date() },
    }),
  );
}

export async function requireActiveAccess(req, res, next) {
  if (req.user?.role === "admin") return next();

  if (!req.user?.accessUntil || req.user.accessUntil <= new Date()) {
    return res.status(402).json({
      message: "Purchase this test series to unlock its tests.",
    });
  }

  next();
}
