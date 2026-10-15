import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    part: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Part",
      required: true,
      index: true,
    },
    answers: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        selectedOption: Number,
      },
    ],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    submittedAt: { type: Date, default: null },
    startedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["in_progress", "submitted"],
      default: "in_progress",
    },
  },
  { timestamps: true },
);

export const Attempt = mongoose.model("Attempt", attemptSchema);
