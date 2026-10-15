import { Router } from "express";
import bcrypt from "bcryptjs";

import { config } from "../config/env.js";
import { User } from "../models/index.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { asyncRoute } from "../utils/asyncRoute.js";
import { cookieOptions, publicUser, signIn } from "../utils/auth.js";
import { registerSchema } from "../validators/schemas.js";

const router = Router();

// Register
router.post(
  "/api/auth/register",
  asyncRoute(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message:
          "Enter a valid name, email and password (at least 8 characters).",
      });
    }

    const email = parsed.data.email.trim().toLowerCase();

    const existingUser = await User.exists({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await User.create({
      name: parsed.data.name.trim(),
      email,
      passwordHash,
    });

    signIn(user, res);

    return res.status(201).json({
      user: publicUser(user),
    });
  }),
);

// Login
router.post(
  "/api/auth/login",
  asyncRoute(async (req, res) => {
    try {
      const email = String(req.body?.email || "")
        .trim()
        .toLowerCase();

      const password = String(req.body?.password || "");

      if (!email || !password || email.length > 254 || password.length > 128) {
        return res.status(400).json({
          message: "Email and password are required.",
        });
      }

      const user = await User.findOne({ email }).select("+passwordHash");

      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password.",
        });
      }

      if (typeof user.passwordHash !== "string") {
        console.error("Login failed: passwordHash is missing or invalid.");

        return res.status(500).json({
          message: "Login configuration error. Contact support.",
        });
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);

      if (!passwordMatches) {
        return res.status(401).json({
          message: "Invalid email or password.",
        });
      }

      signIn(user, res);

      return res.json({
        user: publicUser(user),
      });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }),
);

// Logout

router.post("/api/auth/logout", (_req, res) => {
  res.clearCookie(config.cookieName, {
    ...cookieOptions(),
    maxAge: undefined,
  });

  return res.json({ message: "Logged out." });
});

// Current authenticated user
router.get("/api/auth/me", authenticate, (req, res) => {
  return res.json({
    user: publicUser(req.user),
  });
});

// Update profile
router.patch(
  "/api/auth/profile",
  authenticate,
  asyncRoute(async (req, res) => {
    const name = String(req.body?.name || "").trim();

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({
        message: "Name must be between 2 and 80 characters.",
      });
    }

    req.user.name = name;

    await req.user.save();

    return res.json({
      user: publicUser(req.user),
    });
  }),
);

export default router;
