import { describe, expect, it, beforeEach, vi } from "vitest";
import * as db from "./db";
vi.mock("./db", () => ({
  getDb: vi.fn(),
  createQuiz: vi.fn(),
  getQuizByPin: vi.fn(),
  getQuizById: vi.fn(),
  getQuizzesByCreator: vi.fn(),
  updateQuiz: vi.fn(),
  addQuestion: vi.fn(),
  getQuestionsByQuizId: vi.fn(),
  createQuizSession: vi.fn(),
  getSessionById: vi.fn(),
  updateSessionStatus: vi.fn(),
  addParticipant: vi.fn(),
  getSessionParticipants: vi.fn(),
  recordAnswer: vi.fn(),
  createQuizResult: vi.fn(),
  getSessionResults: vi.fn()
}));
describe("Quiz Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should create a quiz with title and description", async () => {
    const mockResult = { insertId: 1 };
    vi.mocked(db.createQuiz).mockResolvedValueOnce(mockResult);
    const result = await db.createQuiz(1, "Test Quiz", "Test Description", "ABC123");
    expect(db.createQuiz).toHaveBeenCalledWith(1, "Test Quiz", "Test Description", "ABC123");
    expect(result).toEqual(mockResult);
  });
  it("should retrieve a quiz by PIN code", async () => {
    const mockQuiz = {
      id: 1,
      creatorId: 1,
      title: "Test Quiz",
      description: "Test Description",
      pin: "ABC123",
      isPublished: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    vi.mocked(db.getQuizByPin).mockResolvedValueOnce(mockQuiz);
    const result = await db.getQuizByPin("ABC123");
    expect(db.getQuizByPin).toHaveBeenCalledWith("ABC123");
    expect(result).toEqual(mockQuiz);
  });
  it("should get all quizzes created by a user", async () => {
    const mockQuizzes = [
      {
        id: 1,
        creatorId: 1,
        title: "Quiz 1",
        pin: "ABC123",
        isPublished: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      },
      {
        id: 2,
        creatorId: 1,
        title: "Quiz 2",
        pin: "DEF456",
        isPublished: false,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }
    ];
    vi.mocked(db.getQuizzesByCreator).mockResolvedValueOnce(mockQuizzes);
    const result = await db.getQuizzesByCreator(1);
    expect(db.getQuizzesByCreator).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockQuizzes);
    expect(result).toHaveLength(2);
  });
  it("should update quiz details", async () => {
    const mockResult = { affectedRows: 1 };
    vi.mocked(db.updateQuiz).mockResolvedValueOnce(mockResult);
    const result = await db.updateQuiz(1, {
      title: "Updated Title",
      isPublished: true
    });
    expect(db.updateQuiz).toHaveBeenCalledWith(1, {
      title: "Updated Title",
      isPublished: true
    });
    expect(result).toEqual(mockResult);
  });
});
describe("Question Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should add a question to a quiz", async () => {
    const mockResult = { insertId: 1 };
    vi.mocked(db.addQuestion).mockResolvedValueOnce(mockResult);
    const options = ["Option A", "Option B", "Option C", "Option D"];
    const result = await db.addQuestion(1, "What is 2+2?", options, 1, 30, 0);
    expect(db.addQuestion).toHaveBeenCalledWith(1, "What is 2+2?", options, 1, 30, 0);
    expect(result).toEqual(mockResult);
  });
  it("should retrieve questions for a quiz", async () => {
    const mockQuestions = [
      {
        id: 1,
        quizId: 1,
        questionText: "What is 2+2?",
        options: ["3", "4", "5", "6"],
        correctOptionIndex: 1,
        timeLimit: 30,
        orderIndex: 0,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }
    ];
    vi.mocked(db.getQuestionsByQuizId).mockResolvedValueOnce(mockQuestions);
    const result = await db.getQuestionsByQuizId(1);
    expect(db.getQuestionsByQuizId).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockQuestions);
    expect(result).toHaveLength(1);
  });
});
describe("Quiz Session Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should create a quiz session", async () => {
    const mockResult = { insertId: 1 };
    vi.mocked(db.createQuizSession).mockResolvedValueOnce(mockResult);
    const result = await db.createQuizSession(1, 1);
    expect(db.createQuizSession).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual(mockResult);
  });
  it("should retrieve a session by ID", async () => {
    const mockSession = {
      id: 1,
      quizId: 1,
      hostId: 1,
      status: "active",
      currentQuestionIndex: 0,
      startedAt: /* @__PURE__ */ new Date(),
      endedAt: null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    vi.mocked(db.getSessionById).mockResolvedValueOnce(mockSession);
    const result = await db.getSessionById(1);
    expect(db.getSessionById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockSession);
  });
  it("should update session status", async () => {
    const mockResult = { affectedRows: 1 };
    vi.mocked(db.updateSessionStatus).mockResolvedValueOnce(mockResult);
    const result = await db.updateSessionStatus(1, "active", 0);
    expect(db.updateSessionStatus).toHaveBeenCalledWith(1, "active", 0);
    expect(result).toEqual(mockResult);
  });
  it("should add a participant to a session", async () => {
    const mockResult = { insertId: 1 };
    vi.mocked(db.addParticipant).mockResolvedValueOnce(mockResult);
    const result = await db.addParticipant(1, 2);
    expect(db.addParticipant).toHaveBeenCalledWith(1, 2);
    expect(result).toEqual(mockResult);
  });
  it("should retrieve session participants", async () => {
    const mockParticipants = [
      {
        id: 1,
        sessionId: 1,
        userId: 2,
        score: 100,
        answerStreak: 5,
        joinedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      },
      {
        id: 2,
        sessionId: 1,
        userId: 3,
        score: 80,
        answerStreak: 3,
        joinedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }
    ];
    vi.mocked(db.getSessionParticipants).mockResolvedValueOnce(mockParticipants);
    const result = await db.getSessionParticipants(1);
    expect(db.getSessionParticipants).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockParticipants);
    expect(result).toHaveLength(2);
  });
});
describe("Answer and Results Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should record a participant answer", async () => {
    const mockResult = { insertId: 1 };
    vi.mocked(db.recordAnswer).mockResolvedValueOnce(mockResult);
    const result = await db.recordAnswer(1, 1, 1, true, 15e3);
    expect(db.recordAnswer).toHaveBeenCalledWith(1, 1, 1, true, 15e3);
    expect(result).toEqual(mockResult);
  });
  it("should create a quiz result", async () => {
    const mockResult = { insertId: 1 };
    vi.mocked(db.createQuizResult).mockResolvedValueOnce(mockResult);
    const result = await db.createQuizResult(1, 1, 85, 8, 10);
    expect(db.createQuizResult).toHaveBeenCalledWith(1, 1, 85, 8, 10);
    expect(result).toEqual(mockResult);
  });
  it("should retrieve session results", async () => {
    const mockResults = [
      {
        id: 1,
        sessionId: 1,
        participantId: 1,
        totalScore: 85,
        correctAnswers: 8,
        totalQuestions: 10,
        accuracy: 80,
        completedAt: /* @__PURE__ */ new Date()
      }
    ];
    vi.mocked(db.getSessionResults).mockResolvedValueOnce(mockResults);
    const result = await db.getSessionResults(1);
    expect(db.getSessionResults).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockResults);
    expect(result).toHaveLength(1);
  });
});
