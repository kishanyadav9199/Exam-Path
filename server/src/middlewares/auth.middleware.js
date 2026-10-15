import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { User, Payment } from "../models/index.js";

export async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.[config.cookieName];
    if (!token)
      return res.status(401).json({ message: "Please log in to continue." });
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: ["HS256"],
    });
    const user = await User.findById(payload.sub);
    if (!user)
      return res.status(401).json({ message: "Session is no longer valid." });
    req.user = user;
    next();
  } catch {
    res.clearCookie(config.cookieName);
    return res
      .status(401)
      .json({ message: "Session expired. Please log in again." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Administrator access required." });
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

// Kept for compatibility with any older endpoints. New test routes check access
// against the specific exam rather than a global subscription.
export async function requireActiveAccess(req, res, next) {
  if (req.user?.role === "admin") return next();
  if (!req.user?.accessUntil || req.user.accessUntil <= new Date()) {
    return res
      .status(402)
      .json({ message: "Purchase this test series to unlock its tests." });
  }
  next();
}
