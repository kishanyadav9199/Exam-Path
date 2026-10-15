import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(254), password: z.string().min(8).max(128)
});
export const questionSchema = z.object({
  exam: z.string().min(1), part: z.string().min(1), testDate: z.string().optional().nullable(),
  text: z.string().trim().min(1).max(5000), options: z.array(z.string().trim().min(1).max(1000)).length(4),
  correctOption: z.coerce.number().int().min(0).max(3), explanation: z.string().max(5000).optional(),
  marks: z.coerce.number().min(0).max(100).default(1), negativeMarks: z.coerce.number().min(0).max(100).default(0), active: z.boolean().optional()
});
