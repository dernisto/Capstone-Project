import { z } from "zod";
import { assertApiAuthenticated } from "./httpAuth";
import { QuizAttempt } from "../models/QuizAttempt";
const AttemptQuerySchema = z.object({
  studentId: z.string().optional(),
  quizId: z.string().optional(),
  from: z.string().optional(),
  // ISO date
  to: z.string().optional(),
  // ISO date
  limit: z.coerce.number().int().min(1).max(2e3).optional().default(500)
});
function safePct(score, total) {
  if (!total || total <= 0) return 0;
  return Math.round(score / total * 100);
}
function registerAnalyticsRoutes(app) {
  app.get("/api/analytics/attempts", async (req, res) => {
    try {
      await assertApiAuthenticated(req);
      const parsed = AttemptQuerySchema.parse(req.query);
      const filter = {};
      if (parsed.studentId) filter.userId = Number(parsed.studentId);
      if (parsed.quizId) filter.quizId = Number(parsed.quizId);
      if (parsed.from || parsed.to) {
        filter.createdAt = {};
        if (parsed.from) filter.createdAt.$gte = new Date(parsed.from);
        if (parsed.to) filter.createdAt.$lte = new Date(parsed.to);
      }
      const docs = await QuizAttempt.find(filter).sort({ createdAt: 1 }).limit(parsed.limit).lean();
      const totalAttempts = docs.length;
      const students = new Set(docs.map((a) => a.userId));
      const totalStudents = students.size;
      const percentages = docs.map((a) => safePct(a.score, a.totalQuestions));
      const avgScore = totalAttempts ? Math.round(percentages.reduce((s, v) => s + v, 0) / totalAttempts) : 0;
      const highestScore = totalAttempts ? Math.max(...percentages) : 0;
      const lowestScore = totalAttempts ? Math.min(...percentages) : 0;
      const usersMap = /* @__PURE__ */ new Map();
      const quizzesMap = /* @__PURE__ */ new Map();
      for (const a of docs) {
        usersMap.set(String(a.userId), a.username ?? `User ${a.userId}`);
        quizzesMap.set(String(a.quizId), a.quizTitle ?? `Quiz ${a.quizId}`);
      }
      res.json({
        ok: true,
        summary: {
          averageScorePct: avgScore,
          highestScorePct: highestScore,
          lowestScorePct: lowestScore,
          totalAttempts,
          totalStudents
        },
        filters: {
          students: Array.from(usersMap.entries()).map(([id, username]) => ({ id, username })),
          quizzes: Array.from(quizzesMap.entries()).map(([id, title]) => ({ id, title }))
        },
        attempts: docs.map((a) => ({
          id: String(a._id),
          studentId: String(a.userId),
          studentName: a.username ?? `User ${a.userId}`,
          quizId: String(a.quizId),
          quizTitle: a.quizTitle ?? `Quiz ${a.quizId}`,
          score: a.score,
          totalQuestions: a.totalQuestions,
          percentage: safePct(a.score, a.totalQuestions),
          createdAt: new Date(a.createdAt).toISOString()
        }))
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Internal server error";
      const status = msg.toLowerCase().includes("forbidden") || msg.toLowerCase().includes("cookie") ? 401 : 500;
      res.status(status).json({ ok: false, error: msg });
    }
  });
}
export {
  registerAnalyticsRoutes
};
