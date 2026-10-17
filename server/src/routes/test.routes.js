import { Router } from "express";
import mongoose from "mongoose";
import { Part, Question, Attempt } from "../models/index.js";
import { authenticate, hasExamAccess } from "../middlewares/auth.middleware.js";
import { asyncRoute } from "../utils/asyncRoute.js";
const router = Router();

router.post(
  "/api/tests/start",
  authenticate,
  asyncRoute(async (req, res) => {
    const { examId, partId, limit = 50 } = req.body;
    if (!mongoose.isValidObjectId(examId) || !mongoose.isValidObjectId(partId))
      return res.status(400).json({ message: "Select a valid exam and part." });
    if (!(await Part.exists({ _id: partId, exam: examId, active: true })))
      return res
        .status(400)
        .json({ message: "Part must belong to the selected exam." });
    if (!(await hasExamAccess(req.user, examId)))
      return res
        .status(402)
        .json({ message: "Purchase this test series before starting a test." });
    const count = Math.min(Math.max(Number(limit) || 50, 1), 150);
    const filter = { exam: new mongoose.Types.ObjectId(examId), active: true };
    filter.part = new mongoose.Types.ObjectId(partId);
    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: count } },
      {
        $project: { text: 1, options: 1, marks: 1, negativeMarks: 1, part: 1 },
      },
    ]);
    if (!questions.length)
      return res
        .status(404)
        .json({ message: "No questions are available for this test yet." });
    const attempt = await Attempt.create({
      user: req.user._id,
      exam: examId,
      part: partId,
    });
    res.status(201).json({ attemptId: attempt._id, questions });
  }),
);
router.post(
  "/api/tests/:attemptId/submit",
  authenticate,
  asyncRoute(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.attemptId))
      return res.status(400).json({ message: "Invalid attempt." });
    const attempt = await Attempt.findOne({
      _id: req.params.attemptId,
      user: req.user._id,
      status: "in_progress",
    });
    if (!attempt)
      return res.status(404).json({ message: "Active attempt not found." });
    if (!(await hasExamAccess(req.user, attempt.exam)))
      return res.status(402).json({
        message:
          "Your access to this test series has expired. Purchase it again to continue.",
      });
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const ids = answers
      .filter((a) => mongoose.isValidObjectId(a.question))
      .map((a) => a.question);
    const questions = await Question.find({
      _id: { $in: ids },
      active: true,
      exam: attempt.exam,
      part: attempt.part,
    }).select("correctOption marks negativeMarks explanation text options");
    const byId = new Map(questions.map((q) => [q._id.toString(), q]));
    let score = 0,
      correctCount = 0,
      totalMarks = 0;
    const normalized = [];
    for (const ans of answers) {
      const q = byId.get(String(ans.question));
      if (!q) continue;
      // Total marks include every question shown in this test, including unanswered ones.
      totalMarks += q.marks;
      if (
        ans.selectedOption === null ||
        ans.selectedOption === undefined ||
        ans.selectedOption === ""
      )
        continue;
      const selected = Number(ans.selectedOption);
      if (
        !Number.isInteger(selected) ||
        selected < 0 ||
        selected >= q.options.length
      ) {
        continue;
      }
      if (selected === q.correctOption) {
        score += q.marks;
        correctCount++;
      } else score -= q.negativeMarks;
      normalized.push({ question: q._id, selectedOption: selected });
    }
    attempt.answers = normalized;
    attempt.score = Math.max(-totalMarks, score);
    attempt.totalMarks = totalMarks;
    attempt.correctCount = correctCount;
    attempt.status = "submitted";
    attempt.submittedAt = new Date();
    await attempt.save();
    res.json({
      score: attempt.score,
      totalMarks,
      correctCount,
      attempted: normalized.length,
      review: questions.map((q) => ({
        id: q._id,
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        selectedOption:
          normalized.find((a) => a.question.toString() === q._id.toString())
            ?.selectedOption ?? null,
      })),
    });
  }),
);
router.get(
  "/api/tests/attempts",
  authenticate,
  asyncRoute(async (req, res) => {
    res.json(
      await Attempt.find({ user: req.user._id, status: "submitted" })
        .populate("exam", "title")
        .sort({ submittedAt: -1 })
        .limit(100)
        .lean(),
    );
  }),
);

export default router;
