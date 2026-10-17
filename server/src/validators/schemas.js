
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export const questionSchema = z
  .object({
    exam: z.string().trim().min(1, "Exam ID is required"),

    part: z.string().trim().min(1, "Part ID is required"),

    testDate: z.string().optional().nullable(),

    text: z.string().trim().min(1).max(5000),

    // Supports 4 or 5 options
    options: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Option cannot be empty")
          .max(1000, "Option cannot exceed 1000 characters")
      )
      .min(4, "At least 4 options are required")
      .max(5, "Maximum 5 options are allowed"),

    // A = 0, B = 1, C = 2, D = 3, E = 4
    correctOption: z.coerce.number().int().min(0).max(4),

    explanation: z.string().max(5000).optional(),

    marks: z.coerce.number().min(0).max(100).default(1),

    negativeMarks: z.coerce.number().min(0).max(100).default(0),

    active: z.boolean().optional(),
  })
  .superRefine((question, ctx) => {
    if (question.correctOption >= question.options.length) {
      ctx.addIssue({
        code: "custom",
        path: ["correctOption"],
        message:
          "Correct option index must match an existing option",
      });
    }
  });
