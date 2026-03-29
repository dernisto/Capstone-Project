import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";
const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  pin: varchar("pin", { length: 10 }).notNull().unique(),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  questionText: text("questionText").notNull(),
  timeLimit: int("timeLimit").default(30).notNull(),
  // seconds
  options: json("options").notNull(),
  // Array of answer options
  correctOptionIndex: int("correctOptionIndex").notNull(),
  orderIndex: int("orderIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
const quizSessions = mysqlTable("quizSessions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  hostId: int("hostId").notNull(),
  status: mysqlEnum("status", ["waiting", "active", "finished"]).default("waiting").notNull(),
  currentQuestionIndex: int("currentQuestionIndex").default(0).notNull(),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
const sessionParticipants = mysqlTable("sessionParticipants", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId").notNull(),
  score: int("score").default(0).notNull(),
  answerStreak: int("answerStreak").default(0).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
const participantAnswers = mysqlTable("participantAnswers", {
  id: int("id").autoincrement().primaryKey(),
  participantId: int("participantId").notNull(),
  questionId: int("questionId").notNull(),
  selectedOptionIndex: int("selectedOptionIndex").notNull(),
  isCorrect: boolean("isCorrect").notNull(),
  timeSpent: int("timeSpent").notNull(),
  // milliseconds
  submittedAt: timestamp("submittedAt").defaultNow().notNull()
});
const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId").notNull(),
  message: text("message").notNull(),
  isAnnouncement: boolean("isAnnouncement").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
const quizResults = mysqlTable("quizResults", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  participantId: int("participantId").notNull(),
  totalScore: int("totalScore").notNull(),
  correctAnswers: int("correctAnswers").notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  accuracy: int("accuracy").notNull(),
  // percentage
  completedAt: timestamp("completedAt").defaultNow().notNull()
});
export {
  chatMessages,
  participantAnswers,
  questions,
  quizResults,
  quizSessions,
  quizzes,
  sessionParticipants,
  users
};
