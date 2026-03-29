import mongoose, { Schema } from "mongoose";
const quizAttemptSchema = new Schema(
  {
    userId: { type: Number, required: true, index: true },
    username: { type: String, required: true },
    quizId: { type: Number, required: true, index: true },
    quizTitle: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);
const QuizAttempt = mongoose.models.QuizAttempt ?? mongoose.model("QuizAttempt", quizAttemptSchema);
export {
  QuizAttempt
};
