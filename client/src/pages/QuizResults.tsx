import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Share2, Download, Home, RotateCcw } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useRequireDemoAuth } from "@/_core/useRequireDemoAuth";

export default function QuizResults() {
  const { loggedIn } = useRequireDemoAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/results/:sessionId");
  const sessionId = match ? parseInt(params?.sessionId) : null;

  if (!loggedIn) return null;

  // Mock result data
  const userResult = {
    score: 85,
    totalScore: 100,
    correctAnswers: 8,
    totalQuestions: 10,
    accuracy: 80,
    timeSpent: 245, // seconds
    rank: 2,
    totalParticipants: 24,
  };

  const questionResults = [
    { question: "Q1", correct: true, timeSpent: 15 },
    { question: "Q2", correct: true, timeSpent: 22 },
    { question: "Q3", correct: false, timeSpent: 30 },
    { question: "Q4", correct: true, timeSpent: 18 },
    { question: "Q5", correct: true, timeSpent: 25 },
    { question: "Q6", correct: false, timeSpent: 30 },
    { question: "Q7", correct: true, timeSpent: 20 },
    { question: "Q8", correct: true, timeSpent: 19 },
    { question: "Q9", correct: false, timeSpent: 30 },
    { question: "Q10", correct: true, timeSpent: 16 },
  ];

  const leaderboardData = [
    { name: "Alice", score: 95 },
    { name: "You", score: 85 },
    { name: "Bob", score: 75 },
    { name: "Charlie", score: 65 },
    { name: "Diana", score: 55 },
  ];

  const accuracyData = [
    { name: "Correct", value: userResult.correctAnswers, fill: "#10b981" },
    { name: "Incorrect", value: userResult.totalQuestions - userResult.correctAnswers, fill: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container py-12">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">Quiz Complete! 🎉</h1>
            <p className="text-slate-600 dark:text-slate-400">Here's your detailed performance breakdown.</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {/* Score Card */}
        <motion.div
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-12 text-white mb-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-lg opacity-90 mb-2">Your Score</p>
          <motion.h2
            className="text-7xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {userResult.score}/{userResult.totalScore}
          </motion.h2>
          <p className="text-2xl opacity-90 mb-6">
            Rank: <span className="font-bold">#{userResult.rank}</span> out of {userResult.totalParticipants}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              className="bg-white/20 border-white text-white hover:bg-white/30"
              onClick={() => navigate("/quiz-library")}
            >
              <RotateCcw className="w-5 h-5 mr-2" /> Try Another Quiz
            </Button>
            <Button
              variant="outline"
              className="bg-white/20 border-white text-white hover:bg-white/30"
            >
              <Share2 className="w-5 h-5 mr-2" /> Share Results
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Correct Answers", value: userResult.correctAnswers, icon: "✓", color: "green" },
            { label: "Accuracy", value: `${userResult.accuracy}%`, icon: "📊", color: "blue" },
            { label: "Time Spent", value: `${Math.floor(userResult.timeSpent / 60)}m ${userResult.timeSpent % 60}s`, icon: "⏱️", color: "purple" },
            { label: "Rank", value: `#${userResult.rank}`, icon: "🏆", color: "yellow" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Accuracy Pie Chart */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-6">Answer Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={accuracyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {accuracyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Leaderboard Bar Chart */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-6">Top Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leaderboardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Question-by-Question Breakdown */}
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold mb-6">Question-by-Question Review</h3>

          <div className="space-y-3">
            {questionResults.map((result, i) => (
              <motion.div
                key={i}
                className={`p-4 rounded-lg border-l-4 ${
                  result.correct
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                    : "bg-red-50 dark:bg-red-900/20 border-red-500"
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      result.correct ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {result.correct ? "✓" : "✗"}
                    </div>
                    <span className="font-semibold">{result.question}</span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {result.timeSpent}s
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-12">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Home className="w-5 h-5" /> Home
          </Button>
          <Button
            onClick={() => navigate("/quiz-library")}
            className="btn-primary flex items-center gap-2"
            size="lg"
          >
            <RotateCcw className="w-5 h-5" /> Try Another Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}
