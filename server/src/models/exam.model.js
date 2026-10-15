import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, default: "", maxlength: 2000 },
    category: {
      type: String,
      enum: [
        "Railway",
        "SSC",
        "Banking",
        "Teaching",
        "State Exams",
        "Police",
        "Other",
      ],
      default: "Other",
      index: true,
    },
    pricePaise: { type: Number, min: 100, default: 45000, required: true },
    durationDays: {
      type: Number,
      min: 1,
      max: 3650,
      default: 180,
      required: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Exam = mongoose.model("Exam", examSchema);
