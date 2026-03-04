import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, quizzes, questions, quizSessions, sessionParticipants, participantAnswers, chatMessages, quizResults } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Quiz operations
export async function createQuiz(creatorId: number, title: string, description: string, pin: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(quizzes).values({
    creatorId,
    title,
    description,
    pin,
    isPublished: false,
  });

  return result;
}

export async function getQuizByPin(pin: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(quizzes).where(eq(quizzes.pin, pin)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getQuizById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getQuizzesByCreator(creatorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(quizzes).where(eq(quizzes.creatorId, creatorId));
}

export async function updateQuiz(id: number, data: { title?: string; description?: string; isPublished?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(quizzes).set(data).where(eq(quizzes.id, id));
}

// Question operations
export async function addQuestion(quizId: number, questionText: string, options: string[], correctOptionIndex: number, timeLimit: number, orderIndex: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(questions).values({
    quizId,
    questionText,
    options: JSON.stringify(options),
    correctOptionIndex,
    timeLimit,
    orderIndex,
  });
}

export async function getQuestionsByQuizId(quizId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db.select().from(questions).where(eq(questions.quizId, quizId));
  return results.map(q => ({
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
  }));
}

export async function updateQuestion(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (data.options && typeof data.options !== 'string') {
    data.options = JSON.stringify(data.options);
  }

  return db.update(questions).set(data).where(eq(questions.id, id));
}

export async function deleteQuestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(questions).where(eq(questions.id, id));
}

// Quiz Session operations
export async function createQuizSession(quizId: number, hostId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(quizSessions).values({
    quizId,
    hostId,
    status: 'waiting',
    currentQuestionIndex: 0,
  });
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(quizSessions).where(eq(quizSessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateSessionStatus(sessionId: number, status: 'waiting' | 'active' | 'finished', currentQuestionIndex?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const data: any = { status };
  if (currentQuestionIndex !== undefined) {
    data.currentQuestionIndex = currentQuestionIndex;
  }
  if (status === 'active' && !data.startedAt) {
    data.startedAt = new Date();
  }
  if (status === 'finished') {
    data.endedAt = new Date();
  }

  return db.update(quizSessions).set(data).where(eq(quizSessions.id, sessionId));
}

// Session Participant operations
export async function addParticipant(sessionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(sessionParticipants).values({
    sessionId,
    userId,
    score: 0,
    answerStreak: 0,
  });
}

export async function getSessionParticipants(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(sessionParticipants).where(eq(sessionParticipants.sessionId, sessionId));
}

export async function updateParticipantScore(participantId: number, scoreIncrement: number, streakIncrement: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const participant = await db.select().from(sessionParticipants).where(eq(sessionParticipants.id, participantId)).limit(1);
  if (participant.length === 0) return null;

  const p = participant[0];
  return db.update(sessionParticipants).set({
    score: p.score + scoreIncrement,
    answerStreak: p.answerStreak + streakIncrement,
  }).where(eq(sessionParticipants.id, participantId));
}

// Participant Answer operations
export async function recordAnswer(participantId: number, questionId: number, selectedOptionIndex: number, isCorrect: boolean, timeSpent: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(participantAnswers).values({
    participantId,
    questionId,
    selectedOptionIndex,
    isCorrect,
    timeSpent,
  });
}

// Chat operations
export async function addChatMessage(sessionId: number, userId: number, message: string, isAnnouncement: boolean = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(chatMessages).values({
    sessionId,
    userId,
    message,
    isAnnouncement,
  });
}

export async function getChatMessages(sessionId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.createdAt).limit(limit);
}

// Quiz Results operations
export async function createQuizResult(sessionId: number, participantId: number, totalScore: number, correctAnswers: number, totalQuestions: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  return db.insert(quizResults).values({
    sessionId,
    participantId,
    totalScore,
    correctAnswers,
    totalQuestions,
    accuracy,
  });
}

export async function getSessionResults(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(quizResults).where(eq(quizResults.sessionId, sessionId));
}
