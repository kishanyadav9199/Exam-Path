import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
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
    testDate: { type: Date, default: null, index: true },
    text: { type: String, required: true, trim: true, maxlength: 5000 },
    options: {
      type: [String],
      validate: (v) => v.length === 5,
      required: true,
    },
    correctOption: { type: Number, required: true, min: 0, max: 4 },
    explanation: { type: String, default: "", maxlength: 5000 },
    marks: { type: Number, default: 1, min: 0, max: 100 },
    negativeMarks: { type: Number, default: 0, min: 0, max: 100 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Question = mongoose.model("Question", questionSchema);
