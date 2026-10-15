import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      default: null,
      index: true,
    },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String, default: null, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },
    verifiedAt: { type: Date, default: null },
    accessUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Payment = mongoose.model("Payment", paymentSchema);
