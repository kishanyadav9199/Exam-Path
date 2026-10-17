import { Router } from "express";
import mongoose from "mongoose";
import { Exam, Part, Question } from "../models/index.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";
import { asyncRoute } from "../utils/asyncRoute.js";
import { questionSchema } from "../validators/schemas.js";

const router = Router();

router.post(
  "/api/admin/exams",
  authenticate,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const title = String(req.body.title || "").trim();
    const slug = String(req.body.slug || "")
      .trim()
      .toLowerCase();

    const allowedCategories = [
      "Railway",
      "SSC",
      "Banking",
      "Teaching",
      "State Exams",
      "Police",
      "Other",
    ];

    const category = allowedCategories.includes(req.body.category)
      ? req.body.category
      : "Other";

    const priceRupees = Number(req.body.priceRupees ?? 450);

    if (
      title.length < 2 ||
      title.length > 160 ||
      !/^[a-z0-9-]{2,160}$/.test(slug)
    ) {
      return res.status(400).json({
        message:
          "Provide a title and a slug using lowercase letters, numbers and hyphens.",
      });
    }

    if (
      !Number.isFinite(priceRupees) ||
      priceRupees < 1 ||
      priceRupees > 100000
    ) {
      return res.status(400).json({
        message: "Enter a valid series price in rupees.",
      });
    }

    const exam = await Exam.create({
      title,
      slug,
      category,
      pricePaise: Math.round(priceRupees * 100),
      durationDays: Math.min(
        Math.max(Number(req.body.durationDays) || 180, 1),
        3650,
      ),
      description: String(req.body.description || "").slice(0, 2000),
    });

    return res.status(201).json(exam);
  }),
);

router.post(
  "/api/admin/parts",
  authenticate,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const { exam, title } = req.body;

    if (
      !mongoose.isValidObjectId(exam) ||
      typeof title !== "string" ||
      title.trim().length < 2 ||
      title.length > 120
    ) {
      return res.status(400).json({
        message: "Valid exam and part title required.",
      });
    }

    if (!(await Exam.exists({ _id: exam }))) {
      return res.status(400).json({
        message: "The selected exam does not exist.",
      });
    }

    const part = await Part.create({
      exam,
      title: title.trim(),
      order: Number(req.body.order || 0),
    });

    return res.status(201).json(part);
  }),
);

router.get(
  "/api/admin/questions",
  authenticate,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const filter = {};

    if (req.query.exam) {
      if (!mongoose.isValidObjectId(req.query.exam)) {
        return res.status(400).json({
          message: "Invalid exam ID.",
        });
      }
      filter.exam = req.query.exam;
    }

    if (req.query.part) {
      if (!mongoose.isValidObjectId(req.query.part)) {
        return res.status(400).json({
          message: "Invalid part ID.",
        });
      }
      filter.part = req.query.part;
    }

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 5000)
      : 500;

    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json(questions);
  }),
);

router.post(
  "/api/admin/questions",
  authenticate,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const item = req.body;
    const parsed = questionSchema.safeParse(item);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid question data.",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (
      !mongoose.isValidObjectId(item.exam) ||
      !mongoose.isValidObjectId(item.part)
    ) {
      return res.status(400).json({
        message: "Invalid exam or part ID.",
      });
    }

    if (!(await Exam.exists({ _id: item.exam }))) {
      return res.status(400).json({
        message: "The selected exam does not exist.",
      });
    }

    if (!(await Part.exists({ _id: item.part, exam: item.exam }))) {
      return res.status(400).json({
        message: "Part does not belong to the selected exam.",
      });
    }

    const options = parsed.data.options;

    if (
      !Array.isArray(options) ||
      ![4, 5].includes(options.length) ||
      !Number.isInteger(parsed.data.correctOption) ||
      parsed.data.correctOption < 0 ||
      parsed.data.correctOption >= options.length
    ) {
      return res.status(400).json({
        message:
          "A question must have 4 or 5 options and a valid correctOption index.",
      });
    }

    const data = {
      ...parsed.data,
      options: options.map((option) => option.trim()),
      testDate: parsed.data.testDate ? new Date(parsed.data.testDate) : null,
    };

    const question = await Question.create(data);

    return res.status(201).json(question);
  }),
);

router.put(
  "/api/admin/questions/:id",
  authenticate,
  requireAdmin,
  asyncRoute(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid question ID.",
      });
    }

    const parsed = questionSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid question data.",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { exam, part, options, correctOption } = parsed.data;

    if (!mongoose.isValidObjectId(exam) || !mongoose.isValidObjectId(part)) {
      return res.status(400).json({
        message: "Invalid exam or part ID.",
      });
    }

    if (!(await Part.exists({ _id: part, exam }))) {
      return res.status(400).json({
        message: "Part does not belong to the selected exam.",
      });
    }

    if (
      ![4, 5].includes(options.length) ||
      !Number.isInteger(correctOption) ||
      correctOption < 0 ||
      correctOption >= options.length
    ) {
      return res.status(400).json({
        message: "Invalid options or correctOption index.",
      });
    }

    const data = {
      ...parsed.data,
      options: options.map((option) => option.trim()),
      testDate: parsed.data.testDate ? new Date(parsed.data.testDate) : null,
    };

    const question = await Question.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    return res.json(question);
  }),
);

router.delete(
  "/api/admin/questions/:id",
  authenticate,
  requireAdmin,
  asyncRoute(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid question ID.",
      });
    }

    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    return res.json({
      message: "Question deleted.",
    });
  }),
);

router.post(
  "/api/admin/questions/bulk",
  authenticate,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const items = req.body?.questions;

    if (!Array.isArray(items) || items.length < 1 || items.length > 150) {
      return res.status(400).json({
        message: "Upload between 1 and 150 questions per batch.",
      });
    }

    const docs = [];

    // Validate the entire batch before inserting anything.
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const questionNumber = i + 1;

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return res.status(400).json({
          message: `Question ${questionNumber} must be an object. No questions imported.`,
        });
      }

      if (
        !mongoose.isValidObjectId(item.exam) ||
        !mongoose.isValidObjectId(item.part)
      ) {
        return res.status(400).json({
          message: `Question ${questionNumber} has an invalid exam or part ID. No questions imported.`,
          questionNumber,
        });
      }

      if (!(await Exam.exists({ _id: item.exam }))) {
        return res.status(400).json({
          message: `Question ${questionNumber}: exam not found. No questions imported.`,
          questionNumber,
          exam: item.exam,
        });
      }

      if (!(await Part.exists({ _id: item.part, exam: item.exam }))) {
        return res.status(400).json({
          message: `Question ${questionNumber}: part does not belong to this exam. No questions imported.`,
          questionNumber,
          exam: item.exam,
          part: item.part,
        });
      }

      if (
        !Array.isArray(item.options) ||
        ![4, 5].includes(item.options.length) ||
        item.options.some(
          (option) => typeof option !== "string" || option.trim().length === 0,
        )
      ) {
        return res.status(400).json({
          message: `Question ${questionNumber} must have 4 or 5 non-empty options. No questions imported.`,
          questionNumber,
        });
      }

      if (
        !Number.isInteger(item.correctOption) ||
        item.correctOption < 0 ||
        item.correctOption >= item.options.length
      ) {
        return res.status(400).json({
          message: `Question ${questionNumber} has an invalid correctOption. No questions imported.`,
          questionNumber,
        });
      }

      const parsed = questionSchema.safeParse(item);

      if (!parsed.success) {
        return res.status(400).json({
          message: `Question ${questionNumber} failed schema validation. No questions imported.`,
          questionNumber,
          errors: parsed.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      docs.push({
        ...parsed.data,
        options: parsed.data.options.map((option) => option.trim()),
        testDate: parsed.data.testDate ? new Date(parsed.data.testDate) : null,
      });
    }

    const inserted = await Question.insertMany(docs, {
      ordered: true,
    });

    return res.status(201).json({
      message: "Questions imported successfully.",
      inserted: inserted.length,
    });
  }),
);

export default router;
