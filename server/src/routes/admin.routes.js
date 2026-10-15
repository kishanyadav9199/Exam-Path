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
    )
      return res
        .status(400)
        .json({
          message:
            "Provide a title and a slug using lowercase letters, numbers and hyphens.",
        });
    if (
      !Number.isFinite(priceRupees) ||
      priceRupees < 1 ||
      priceRupees > 100000
    )
      return res
        .status(400)
        .json({ message: "Enter a valid series price in rupees." });
    res.status(201).json(
      await Exam.create({
        title,
        slug,
        category,
        pricePaise: Math.round(priceRupees * 100),
        durationDays: Math.min(
          Math.max(Number(req.body.durationDays) || 180, 1),
          3650,
        ),
        description: String(req.body.description || "").slice(0, 2000),
      }),
    );
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
    )
      return res
        .status(400)
        .json({ message: "Valid exam and part title required." });
    res
      .status(201)
      .json(
        await Part.create({
          exam,
          title: title.trim(),
          order: Number(req.body.order || 0),
        }),
      );
  }),
);
router.get(
  "/api/admin/questions",
  authenticate,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const filter = {};
    if (req.query.exam && mongoose.isValidObjectId(req.query.exam))
      filter.exam = req.query.exam;
    if (req.query.part && mongoose.isValidObjectId(req.query.part))
      filter.part = req.query.part;
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 5000)
      : 500;
    res.json(
      await Question.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
    );
  }),
);
router.post(
  "/api/admin/questions",
  authenticate,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const parsed = questionSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({
          message:
            "Invalid question data. Provide question text, four options and a correct option.",
        });
    if (
      !(await Exam.exists({ _id: parsed.data.exam })) ||
      !(await Part.exists({ _id: parsed.data.part, exam: parsed.data.exam }))
    )
      return res
        .status(400)
        .json({ message: "Part must belong to the selected exam." });
    const data = { ...parsed.data };
    if (data.testDate) data.testDate = new Date(data.testDate);
    else data.testDate = null;
    res.status(201).json(await Question.create(data));
  }),
);
router.put(
  "/api/admin/questions/:id",
  authenticate,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const parsed = questionSchema.safeParse(req.body);
    if (!mongoose.isValidObjectId(req.params.id) || !parsed.success)
      return res.status(400).json({ message: "Invalid question ID or data." });
    if (!(await Part.exists({ _id: parsed.data.part, exam: parsed.data.exam })))
      return res
        .status(400)
        .json({ message: "Part must belong to the selected exam." });
    const data = {
      ...parsed.data,
      testDate: parsed.data.testDate ? new Date(parsed.data.testDate) : null,
    };
    const q = await Question.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!q) return res.status(404).json({ message: "Question not found." });
    res.json(q);
  }),
);
router.delete(
  "/api/admin/questions/:id",
  authenticate,
  requireAdmin,
  asyncRoute(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid question ID." });
    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ message: "Question not found." });
    res.json({ message: "Question deleted." });
  }),
);
router.post(
  "/api/admin/questions/bulk",
  authenticate,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const items = req.body.questions;
    if (!Array.isArray(items) || items.length < 1 || items.length > 150)
      return res
        .status(400)
        .json({ message: "Upload between 1 and 150 questions per batch." });
    const docs = [];
    for (const item of items) {
      const parsed = questionSchema.safeParse(item);
      if (
        !parsed.success ||
        !(await Part.exists({ _id: item.part, exam: item.exam }))
      )
        return res
          .status(400)
          .json({
            message:
              "A question is invalid or its part does not belong to the exam. No questions imported.",
          });
      docs.push({
        ...parsed.data,
        testDate: parsed.data.testDate ? new Date(parsed.data.testDate) : null,
      });
    }
    res
      .status(201)
      .json({
        inserted: (await Question.insertMany(docs, { ordered: true })).length,
      });
  }),
);

export default router;
