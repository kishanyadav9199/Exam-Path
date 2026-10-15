import { Router } from "express";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import { config } from "../config/env.js";
import { Payment, Exam } from "../models/index.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { asyncRoute } from "../utils/asyncRoute.js";
const router = Router();

router.get("/api/payments/config", authenticate, (_req, res) =>
  res.json({ keyId: config.razorpayKeyId || null, currency: "INR" }),
);

router.get(
  "/api/purchases",
  authenticate,
  asyncRoute(async (req, res) => {
    const purchases = await Payment.find({
      user: req.user._id,
      status: "paid",
      accessUntil: { $gt: new Date() },
      exam: { $ne: null },
    })
      .populate(
        "exam",
        "title slug category description pricePaise durationDays",
      )
      .sort({ verifiedAt: -1 })
      .lean();
    res.json(
      purchases
        .filter((p) => p.exam)
        .map((p) => ({
          id: p._id,
          exam: p.exam,
          amount: p.amount,
          currency: p.currency,
          purchasedAt: p.verifiedAt,
          accessUntil: p.accessUntil,
          status: p.status,
        })),
    );
  }),
);

router.post(
  "/api/payments/order",
  authenticate,
  asyncRoute(async (req, res) => {
    const { examId } = req.body || {};
    if (!mongoose.isValidObjectId(examId))
      return res
        .status(400)
        .json({ message: "Select a valid test series before payment." });
    const exam = await Exam.findOne({ _id: examId, active: true });
    if (!exam)
      return res.status(404).json({ message: "Test series not found." });
    const existing = await Payment.findOne({
      user: req.user._id,
      exam: exam._id,
      status: "paid",
      accessUntil: { $gt: new Date() },
    });
    if (existing)
      return res
        .status(409)
        .json({ message: "You have already purchased this test series." });
    if (
      !config.razorpayKeyId ||
      !config.razorpayKeySecret ||
      config.razorpayKeyId.includes("replace")
    ) {
      return res
        .status(503)
        .json({
          message:
            "Payments are not configured yet. Add Razorpay test/live keys in server/.env.",
        });
    }
    const razorpay = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    });
    const order = await razorpay.orders.create({
      amount: exam.pricePaise || 45000,
      currency: "INR",
      receipt:
        `exam_${String(exam._id).slice(-8)}_${String(req.user._id).slice(-8)}_${Date.now()}`.slice(
          0,
          40,
        ),
    });
    await Payment.create({
      user: req.user._id,
      exam: exam._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.razorpayKeyId,
      exam: {
        id: exam._id,
        title: exam.title,
        durationDays: exam.durationDays || 180,
      },
      prefill: { name: req.user.name, email: req.user.email },
    });
  }),
);

router.post(
  "/api/payments/verify",
  authenticate,
  asyncRoute(async (req, res) => {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;
    if (
      ![orderId, paymentId, signature].every(
        (v) => typeof v === "string" && v.length > 0 && v.length < 256,
      )
    )
      return res
        .status(400)
        .json({ message: "Payment verification data is incomplete." });
    const payment = await Payment.findOne({
      orderId,
      user: req.user._id,
    }).populate("exam");
    if (!payment || !payment.exam)
      return res
        .status(404)
        .json({ message: "Payment order or test series not found." });
    if (payment.status === "paid" && payment.accessUntil > new Date())
      return res.json({
        message: "Payment already verified. Test series is unlocked.",
        examId: String(payment.exam._id),
      });
    const expected = crypto
      .createHmac("sha256", config.razorpayKeySecret || "")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    const a = Buffer.from(expected),
      b = Buffer.from(signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
      return res
        .status(400)
        .json({ message: "Payment signature verification failed." });
    if (payment.amount !== (payment.exam.pricePaise || 45000))
      return res
        .status(400)
        .json({
          message: "The payment amount does not match this test series price.",
        });
    const now = new Date();
    payment.status = "paid";
    payment.paymentId = paymentId;
    payment.verifiedAt = now;
    payment.accessUntil = new Date(
      now.getTime() + (payment.exam.durationDays || 180) * 86400000,
    );
    await payment.save();
    res.json({
      message: "Payment verified. This test series is now unlocked.",
      examId: String(payment.exam._id),
      accessUntil: payment.accessUntil,
    });
  }),
);

export default router;
