import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import dns from "dns";
import { users, quizzes, questions, quizSessions, sessionParticipants, participantAnswers, chatMessages, quizResults } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { ensureConnected } from "./config/db";
import { QuizAttempt } from "./models/QuizAttempt";
let _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      try {
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
        console.log("[db] \u2139\uFE0F  DNS servers set to Google DNS for resolution");
      } catch (dnsErr) {
        console.warn("[db] \u26A0\uFE0F  Failed to set custom DNS servers:", dnsErr);
      }
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createQuiz(creatorId, title, description, pin) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(quizzes).values({
    creatorId,
    title,
    description,
    pin,
    isPublished: false
  });
  return result;
}
async function getQuizByPin(pin) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(quizzes).where(eq(quizzes.pin, pin)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getQuizById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getQuizzesByCreator(creatorId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(quizzes).where(eq(quizzes.creatorId, creatorId));
}
async function updateQuiz(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(quizzes).set(data).where(eq(quizzes.id, id));
}
async function deleteQuizByCreator(quizId, creatorId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const quiz = await getQuizById(quizId);
  if (!quiz || quiz.creatorId !== creatorId) return false;
  const sessions = await db.select({ id: quizSessions.id }).from(quizSessions).where(eq(quizSessions.quizId, quizId));
  const sessionIds = sessions.map((s) => s.id);
  if (sessionIds.length > 0) {
    const participants = await db.select({ id: sessionParticipants.id }).from(sessionParticipants).where(inArray(sessionParticipants.sessionId, sessionIds));
    const participantIds = participants.map((p) => p.id);
    if (participantIds.length > 0) {
      await db.delete(participantAnswers).where(inArray(participantAnswers.participantId, participantIds));
    }
    await db.delete(quizResults).where(inArray(quizResults.sessionId, sessionIds));
    await db.delete(chatMessages).where(inArray(chatMessages.sessionId, sessionIds));
    await db.delete(sessionParticipants).where(inArray(sessionParticipants.sessionId, sessionIds));
    await db.delete(quizSessions).where(inArray(quizSessions.id, sessionIds));
  }
  await db.delete(questions).where(eq(questions.quizId, quizId));
  await db.delete(quizzes).where(eq(quizzes.id, quizId));
  return true;
}
async function addQuestion(quizId, questionText, options, correctOptionIndex, timeLimit, orderIndex) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(questions).values({
    quizId,
    questionText,
    options: JSON.stringify(options),
    correctOptionIndex,
    timeLimit,
    orderIndex
  });
}
async function getQuestionsByQuizId(quizId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const results = await db.select().from(questions).where(eq(questions.quizId, quizId));
  return results.map((q) => ({
    ...q,
    options: typeof q.options === "string" ? JSON.parse(q.options) : q.options
  }));
}
async function updateQuestion(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.options && typeof data.options !== "string") {
    data.options = JSON.stringify(data.options);
  }
  return db.update(questions).set(data).where(eq(questions.id, id));
}
async function deleteQuestion(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(questions).where(eq(questions.id, id));
}
async function createQuizSession(quizId, hostId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(quizSessions).values({
    quizId,
    hostId,
    status: "waiting",
    currentQuestionIndex: 0
  });
}
async function getSessionById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(quizSessions).where(eq(quizSessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function updateSessionStatus(sessionId, status, currentQuestionIndex) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const data = { status };
  if (currentQuestionIndex !== void 0) {
    data.currentQuestionIndex = currentQuestionIndex;
  }
  if (status === "active" && !data.startedAt) {
    data.startedAt = /* @__PURE__ */ new Date();
  }
  if (status === "finished") {
    data.endedAt = /* @__PURE__ */ new Date();
  }
  return db.update(quizSessions).set(data).where(eq(quizSessions.id, sessionId));
}
async function addParticipant(sessionId, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(sessionParticipants).values({
    sessionId,
    userId,
    score: 0,
    answerStreak: 0
  });
}
async function getSessionParticipants(sessionId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(sessionParticipants).where(eq(sessionParticipants.sessionId, sessionId));
}
async function updateParticipantScore(participantId, scoreIncrement, streakIncrement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const participant = await db.select().from(sessionParticipants).where(eq(sessionParticipants.id, participantId)).limit(1);
  if (participant.length === 0) return null;
  const p = participant[0];
  return db.update(sessionParticipants).set({
    score: p.score + scoreIncrement,
    answerStreak: p.answerStreak + streakIncrement
  }).where(eq(sessionParticipants.id, participantId));
}
async function recordAnswer(participantId, questionId, selectedOptionIndex, isCorrect, timeSpent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(participantAnswers).values({
    participantId,
    questionId,
    selectedOptionIndex,
    isCorrect,
    timeSpent
  });
}
async function addChatMessage(sessionId, userId, message, isAnnouncement = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(chatMessages).values({
    sessionId,
    userId,
    message,
    isAnnouncement
  });
}
async function getChatMessages(sessionId, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.createdAt).limit(limit);
}
async function createQuizResult(sessionId, participantId, totalScore, correctAnswers, totalQuestions) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const accuracy = Math.round(correctAnswers / totalQuestions * 100);
  const insertRes = await db.insert(quizResults).values({
    sessionId,
    participantId,
    totalScore,
    correctAnswers,
    totalQuestions,
    accuracy
  });
  try {
    const ok = await ensureConnected();
    if (ok) {
      const participant = await db.select().from(sessionParticipants).where(eq(sessionParticipants.id, participantId)).limit(1);
      const p = participant[0];
      if (p) {
        const session = await db.select().from(quizSessions).where(eq(quizSessions.id, sessionId)).limit(1);
        const s = session[0];
        const quiz = s ? await db.select().from(quizzes).where(eq(quizzes.id, s.quizId)).limit(1) : [];
        const userRow = await db.select().from(users).where(eq(users.id, p.userId)).limit(1);
        const username = userRow[0]?.name ?? `User ${p.userId}`;
        const quizTitle = quiz[0]?.title ?? `Quiz ${s?.quizId ?? ""}`;
        await QuizAttempt.create({
          userId: p.userId,
          username,
          quizId: s?.quizId ?? 0,
          quizTitle,
          score: correctAnswers,
          totalQuestions,
          percentage: accuracy,
          createdAt: /* @__PURE__ */ new Date()
        });
      }
    }
  } catch {
  }
  return insertRes;
}
async function getSessionResults(sessionId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(quizResults).where(eq(quizResults.sessionId, sessionId));
}
export {
  addChatMessage,
  addParticipant,
  addQuestion,
  createQuiz,
  createQuizResult,
  createQuizSession,
  deleteQuestion,
  deleteQuizByCreator,
  getChatMessages,
  getDb,
  getQuestionsByQuizId,
  getQuizById,
  getQuizByPin,
  getQuizzesByCreator,
  getSessionById,
  getSessionParticipants,
  getSessionResults,
  getUserByOpenId,
  recordAnswer,
  updateParticipantScore,
  updateQuestion,
  updateQuiz,
  updateSessionStatus,
  upsertUser
};
