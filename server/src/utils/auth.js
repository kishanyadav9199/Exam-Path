import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const cookieOptions = () => ({
  httpOnly: true,
  secure: config.isProd,
  sameSite: config.cookieSameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});
export const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  accessUntil: user.accessUntil,
  hasAccess:
    user.role === "admin" ||
    Boolean(user.accessUntil && user.accessUntil > new Date()),
});
export const signIn = (user, res) => {
  const token = jwt.sign({ sub: user._id.toString() }, config.jwtSecret, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
  res.cookie(config.cookieName, token, cookieOptions());
};
