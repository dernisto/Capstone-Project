import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";

/** 4 options for true/false-style presets; 5 for full multiple choice. */
const createQuestionSchema = z
  .object({
    text: z.string().min(1),
    options: z.array(z.string()),
    correctOptionIndex: z.number().int(),
    timeLimit: z.number().int().min(5).max(300).default(30),
  })
  .refine(
    (q) => q.options.length === 4 || q.options.length === 5,
    { message: "Each question must have 4 or 5 options", path: ["options"] },
  )
  .refine(
    (q) =>
      q.correctOptionIndex >= 0 && q.correctOptionIndex < q.options.length,
    { message: "correctOptionIndex out of range", path: ["correctOptionIndex"] },
  );
const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // Quiz operations
  quiz: router({
    create: protectedProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const pin = nanoid(6).toUpperCase();
      await db.createQuiz(ctx.user.id, input.title, input.description || "", pin);
      return { pin };
    }),
    createWithQuestions: protectedProcedure.input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        questions: z.array(createQuestionSchema).min(1).max(20),
      })
    ).mutation(async ({ ctx, input }) => {
      const pin = nanoid(6).toUpperCase();
      const created = await db.createQuiz(ctx.user.id, input.title, input.description || "", pin);
      const quiz = await db.getQuizByPin(pin);
      if (!quiz) throw new Error("Failed to create quiz");
      for (let i = 0; i < input.questions.length; i++) {
        const q = input.questions[i];
        await db.addQuestion(quiz.id, q.text, q.options, q.correctOptionIndex, q.timeLimit ?? 30, i);
      }
      return { pin, quizId: quiz.id };
    }),
    getByPin: publicProcedure.input(z.object({ pin: z.string() })).query(async ({ input }) => {
      return db.getQuizByPin(input.pin);
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const quiz = await db.getQuizById(input.id);
      if (!quiz) return null;
      const questionsList = await db.getQuestionsByQuizId(input.id);
      return { ...quiz, questions: questionsList };
    }),
    getMyQuizzes: protectedProcedure.query(async ({ ctx }) => {
      return db.getQuizzesByCreator(ctx.user.id);
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      isPublished: z.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const quiz = await db.getQuizById(input.id);
      if (!quiz || quiz.creatorId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return db.updateQuiz(input.id, {
        title: input.title,
        description: input.description,
        isPublished: input.isPublished
      });
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const ok = await db.deleteQuizByCreator(input.id, ctx.user.id);
      if (!ok) throw new Error("Quiz not found or unauthorized");
      return { success: true };
    })
  }),
  // Question operations
  question: router({
    add: protectedProcedure.input(z.object({
      quizId: z.number(),
      questionText: z.string(),
      options: z.array(z.string()),
      correctOptionIndex: z.number(),
      timeLimit: z.number().default(30),
      orderIndex: z.number()
    })).mutation(async ({ ctx, input }) => {
      const quiz = await db.getQuizById(input.quizId);
      if (!quiz || quiz.creatorId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return db.addQuestion(
        input.quizId,
        input.questionText,
        input.options,
        input.correctOptionIndex,
        input.timeLimit,
        input.orderIndex
      );
    }),
    getByQuizId: publicProcedure.input(z.object({ quizId: z.number() })).query(async ({ input }) => {
      return db.getQuestionsByQuizId(input.quizId);
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      questionText: z.string().optional(),
      options: z.array(z.string()).optional(),
      correctOptionIndex: z.number().optional(),
      timeLimit: z.number().optional()
    })).mutation(async ({ ctx, input }) => {
      return db.updateQuestion(input.id, input);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      return db.deleteQuestion(input.id);
    })
  }),
  // Session operations
  session: router({
    create: protectedProcedure.input(z.object({ quizId: z.number() })).mutation(async ({ ctx, input }) => {
      const quiz = await db.getQuizById(input.quizId);
      if (!quiz || quiz.creatorId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return db.createQuizSession(input.quizId, ctx.user.id);
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getSessionById(input.id);
    }),
    updateStatus: protectedProcedure.input(z.object({
      sessionId: z.number(),
      status: z.enum(["waiting", "active", "finished"]),
      currentQuestionIndex: z.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const session = await db.getSessionById(input.sessionId);
      if (!session || session.hostId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return db.updateSessionStatus(input.sessionId, input.status, input.currentQuestionIndex);
    }),
    join: protectedProcedure.input(z.object({ sessionId: z.number() })).mutation(async ({ ctx, input }) => {
      const session = await db.getSessionById(input.sessionId);
      if (!session) throw new Error("Session not found");
      return db.addParticipant(input.sessionId, ctx.user.id);
    }),
    getParticipants: publicProcedure.input(z.object({ sessionId: z.number() })).query(async ({ input }) => {
      return db.getSessionParticipants(input.sessionId);
    })
  }),
  // Answer operations
  answer: router({
    submit: protectedProcedure.input(z.object({
      participantId: z.number(),
      questionId: z.number(),
      selectedOptionIndex: z.number(),
      isCorrect: z.boolean(),
      timeSpent: z.number()
    })).mutation(async ({ ctx, input }) => {
      return db.recordAnswer(
        input.participantId,
        input.questionId,
        input.selectedOptionIndex,
        input.isCorrect,
        input.timeSpent
      );
    })
  }),
  // Chat operations
  chat: router({
    send: protectedProcedure.input(z.object({
      sessionId: z.number(),
      message: z.string(),
      isAnnouncement: z.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      return db.addChatMessage(input.sessionId, ctx.user.id, input.message, input.isAnnouncement);
    }),
    getMessages: publicProcedure.input(z.object({
      sessionId: z.number(),
      limit: z.number().default(50)
    })).query(async ({ input }) => {
      return db.getChatMessages(input.sessionId, input.limit);
    })
  }),
  // Results operations
  results: router({
    create: protectedProcedure.input(z.object({
      sessionId: z.number(),
      participantId: z.number(),
      totalScore: z.number(),
      correctAnswers: z.number(),
      totalQuestions: z.number()
    })).mutation(async ({ ctx, input }) => {
      return db.createQuizResult(
        input.sessionId,
        input.participantId,
        input.totalScore,
        input.correctAnswers,
        input.totalQuestions
      );
    }),
    getSessionResults: publicProcedure.input(z.object({ sessionId: z.number() })).query(async ({ input }) => {
      return db.getSessionResults(input.sessionId);
    })
  })
});
export {
  appRouter
};
