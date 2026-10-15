import dotenv from "dotenv";

dotenv.config();

const required = ["MONGO_URI", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

const clientOrigins = (
  process.env.CLIENT_ORIGINS ||
  process.env.CLIENT_ORIGIN ||
  "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientOrigins,
  cookieName: "exampath_token",
  cookieSameSite: process.env.COOKIE_SAME_SITE || "lax",
  pricePaise: Number(process.env.ACCESS_PRICE_PAISE || 45000),
  durationDays: Number(process.env.ACCESS_DURATION_DAYS || 180),
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  isProd: process.env.NODE_ENV === "production",
};
