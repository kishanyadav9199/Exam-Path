import { Router } from "express";
import mongoose from "mongoose";
import { Exam, Part, Attempt, Payment } from "../models/index.js";
import { authenticate, hasExamAccess } from "../middlewares/auth.middleware.js";
import { asyncRoute } from "../utils/asyncRoute.js";
const router = Router();

router.get(
  "/api/exams",
  authenticate,
  asyncRoute(async (req, res) => {
    const exams = await Exam.find({ active: true })
      .sort({ category: 1, title: 1 })
      .lean();
    const paid = await Payment.find({
      user: req.user._id,
      status: "paid",
      accessUntil: { $gt: new Date() },
      exam: { $ne: null },
    })
      .select("exam")
      .lean();
    const purchasedIds = new Set(paid.map((p) => String(p.exam)));
    const rows = await Promise.all(
      exams.map(async (exam) => ({
        ...exam,
        category: exam.category || "Other",
        pricePaise: Number.isFinite(exam.pricePaise) ? exam.pricePaise : 45000,
        durationDays: exam.durationDays || 180,
        purchased: purchasedIds.has(String(exam._id)),
        partsCount: await Part.countDocuments({ exam: exam._id, active: true }),
      })),
    );
    res.json(rows);
  }),
);

router.get(
  "/api/exams/:examId/parts",
  authenticate,
  asyncRoute(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.examId))
      return res.status(400).json({ message: "Invalid exam." });
    res.json(
      await Part.find({ exam: req.params.examId, active: true })
        .sort({ order: 1, title: 1 })
        .lean(),
    );
  }),
);

router.get(
  "/api/exams/:examId/parts/:partId/leaderboard",
  authenticate,
  asyncRoute(async (req, res) => {
    const { examId, partId } = req.params;
    if (!mongoose.isValidObjectId(examId) || !mongoose.isValidObjectId(partId))
      return res.status(400).json({ message: "Invalid exam or part." });
    if (!(await hasExamAccess(req.user, examId)))
      return res
        .status(402)
        .json({
          message: "Purchase this test series to view its leaderboard.",
        });
    if (!(await Part.exists({ _id: partId, exam: examId, active: true })))
      return res.status(404).json({ message: "Exam part not found." });
    const rows = await Attempt.aggregate([
      {
        $match: {
          exam: new mongoose.Types.ObjectId(examId),
          part: new mongoose.Types.ObjectId(partId),
          status: "submitted",
          totalMarks: { $gt: 0 },
        },
      },
      {
        $addFields: {
          percentage: {
            $multiply: [{ $divide: ["$score", "$totalMarks"] }, 100],
          },
        },
      },
      { $sort: { percentage: -1, submittedAt: 1 } },
      {
        $group: {
          _id: "$user",
          score: { $first: "$score" },
          totalMarks: { $first: "$totalMarks" },
          percentage: { $first: "$percentage" },
          submittedAt: { $first: "$submittedAt" },
        },
      },
      { $sort: { percentage: -1, submittedAt: 1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$student.name",
          score: 1,
          totalMarks: 1,
          percentage: { $round: ["$percentage", 2] },
          submittedAt: 1,
        },
      },
    ]);
    res.json(rows.map((row, index) => ({ rank: index + 1, ...row })));
  }),
);

export default router;
