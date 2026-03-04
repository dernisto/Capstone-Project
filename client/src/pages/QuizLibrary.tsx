import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, Play, Lock } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { useRequireDemoAuth } from "@/_core/useRequireDemoAuth";

export default function QuizLibrary() {
  const { loggedIn } = useRequireDemoAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const [pinInput, setPinInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pre-fill PIN when teacher shares link e.g. /quiz-library?pin=ABC123
  useEffect(() => {
    const params = new URLSearchParams(search);
    const pin = params.get("pin");
    if (pin) setPinInput(pin.toUpperCase());
  }, [search]);

  if (!loggedIn) return null;

  const handleJoinByPin = () => {
    if (pinInput.trim()) {
      navigate(`/session/join?pin=${pinInput.toUpperCase()}`);
    }
  };

  // Mock quiz data for display
  const featuredQuizzes = [
    {
      id: 1,
      title: "Biology 101: Cell Structure",
      creator: "Dr. Smith",
      participants: 45,
      difficulty: "Intermediate",
    },
    {
      id: 2,
      title: "Mathematics: Algebra Basics",
      creator: "Prof. Johnson",
      participants: 62,
      difficulty: "Beginner",
    },
    {
      id: 3,
      title: "History: World War II",
      creator: "Ms. Davis",
      participants: 38,
      difficulty: "Advanced",
    },
    {
      id: 4,
      title: "Chemistry: Periodic Table",
      creator: "Dr. Wilson",
      participants: 51,
      difficulty: "Intermediate",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      {/* Header */}
      <div className="glass-nav">
        <div className="container py-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Quiz Library</h1>
          <p className="text-slate-600 dark:text-slate-400">Browse available quizzes or join a session using a PIN code.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {/* Join by PIN Section */}
        <motion.div
          className="glass-panel bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl p-8 mb-12 border-indigo-200/50 dark:border-indigo-700/40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-4">Join a Live Session</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-6">Enter the PIN code provided by your teacher to join a live quiz session.</p>

          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter PIN code (e.g., ABC123)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && handleJoinByPin()}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={10}
              />
            </div>
            <Button
              onClick={handleJoinByPin}
              className="btn-primary px-8"
            >
              <Play className="w-5 h-5 mr-2" /> Join
            </Button>
          </div>
        </motion.div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Featured Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Featured Quizzes</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredQuizzes.map((quiz, i) => (
              <motion.div
                key={quiz.id}
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div className="mb-4">
                  <h3 className="font-bold text-lg line-clamp-2 mb-2">{quiz.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">by {quiz.creator}</p>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Participants</span>
                    <span className="font-semibold">{quiz.participants}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Difficulty</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      quiz.difficulty === "Beginner"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                        : quiz.difficulty === "Intermediate"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => navigate(`/session/join?quizId=${quiz.id}`)}
                >
                  <Play className="w-4 h-4 mr-2" /> Join Quiz
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
