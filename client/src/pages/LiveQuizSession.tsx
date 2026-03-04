import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Send, Users, Trophy, MessageSquare } from "lucide-react";
import { useLocation, useRoute, useSearch } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useRequireDemoAuth } from "@/_core/useRequireDemoAuth";
import { getDemoQuizzes, getDemoQuizByPin } from "@/_core/demoQuizzes";

export default function LiveQuizSession() {
  const { loggedIn } = useRequireDemoAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const [match, params] = useRoute("/session/:sessionId");
  const rawSessionId = params?.sessionId;
  const isDemoSession = rawSessionId === "demo";
  const sessionId = match && rawSessionId && !["join", "new", "demo"].includes(rawSessionId)
    ? parseInt(rawSessionId)
    : isDemoSession
      ? "demo"
      : null;
  const isJoinFlow = rawSessionId === "join";
  const isNewFlow = rawSessionId === "new";

  // When joining with a PIN, if it's a demo quiz PIN then go straight into the demo quiz
  const pinFromUrl = typeof search === "string" ? new URLSearchParams(search).get("pin")?.toUpperCase() : "";
  useEffect(() => {
    if (!isJoinFlow || !pinFromUrl) return;
    const demoQuizzes = getDemoQuizzes();
    const found = demoQuizzes.some((q) => q.pin === pinFromUrl);
    if (found) {
      navigate(`/session/demo?pin=${encodeURIComponent(pinFromUrl)}`);
    }
  }, [isJoinFlow, pinFromUrl, navigate]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const showHelper = (isJoinFlow || isNewFlow || (match && sessionId === null && rawSessionId !== undefined)) && rawSessionId !== "demo";
  const pinForDemo = isDemoSession && typeof search === "string" ? new URLSearchParams(search).get("pin")?.toUpperCase() : "";
  const demoQuiz = pinForDemo ? getDemoQuizByPin(pinForDemo) : null;
  const questionsFromQuiz =
    demoQuiz?.questions?.filter((q) => q.text?.trim())?.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options?.length ? q.options : ["Option 1", "Option 2"],
      correctIndex: q.correctOptionIndex ?? 0,
      timeLimit: q.timeLimit ?? 30,
    })) ?? null;
  const defaultQuestions = [
    { id: 1, text: "What is the capital of France?", options: ["London", "Paris", "Berlin", "Madrid"], correctIndex: 1, timeLimit: 30 },
    { id: 2, text: "What is 2 + 2?", options: ["3", "4", "5", "6"], correctIndex: 1, timeLimit: 30 },
  ];
  const questions =
    questionsFromQuiz && questionsFromQuiz.length > 0 ? questionsFromQuiz : defaultQuestions;
  const quizTitle = demoQuiz?.title ?? "Live Quiz Session";

  const initialTimeSet = useRef(false);
  useEffect(() => {
    if (!showHelper && !initialTimeSet.current && questions.length > 0) {
      setTimeRemaining(questions[0].timeLimit ?? 30);
      initialTimeSet.current = true;
    }
  }, [showHelper, questions]);

  const handleSubmitAnswer = () => {
    setAnswered(true);
    const nextIndex = currentQuestion + 1;
    const nextTimeLimit = questions[nextIndex]?.timeLimit ?? 30;
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(nextIndex);
        setTimeRemaining(nextTimeLimit);
        setSelectedAnswer(null);
        setAnswered(false);
      } else {
        navigate(`/results/${sessionId ?? "demo"}`);
      }
    }, 2000);
  };

  useEffect(() => {
    if (showHelper) return;
    if (timeRemaining <= 0) {
      handleSubmitAnswer();
      return;
    }
    const t = setTimeout(() => setTimeRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [showHelper, timeRemaining]);

  if (!loggedIn) return null;

  if (showHelper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">
            {isJoinFlow ? "Join a session" : isNewFlow ? "Start a session" : "Session"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {isJoinFlow
              ? "Enter your teacher's PIN in the Quiz Library to join a live quiz."
              : isNewFlow
                ? "Start a live session from the Teacher Dashboard by clicking Start on a quiz."
                : "Use Quiz Library to join with a PIN or Dashboard to start a session."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/quiz-library")} className="btn-primary">
              Quiz Library
            </Button>
            <Button variant="outline" onClick={() => navigate("/teacher-dashboard")}>
              Teacher Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate("/")}>
              Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const leaderboard = [
    { rank: 1, name: "Alice Johnson", score: 450, streak: 5 },
    { rank: 2, name: "Bob Smith", score: 380, streak: 3 },
    { rank: 3, name: "Charlie Brown", score: 320, streak: 2 },
    { rank: 4, name: "Diana Prince", score: 290, streak: 1 },
  ];

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, {
        id: Date.now(),
        name: "You",
        message: chatInput,
        timestamp: new Date(),
      }]);
      setChatInput("");
    }
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold gradient-text">{quizTitle}</h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" /> Leaderboard
              </Button>
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Question Section */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={currentQuestion}
            >
              {/* Timer */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{question.text}</h2>
                <motion.div
                  className={`text-4xl font-bold w-20 h-20 rounded-full flex items-center justify-center ${
                    timeRemaining <= 10
                      ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200"
                      : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200"
                  }`}
                  animate={{ scale: timeRemaining <= 10 ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: timeRemaining <= 10 ? Infinity : 0 }}
                >
                  {timeRemaining}
                </motion.div>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-8">
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      if (!answered) {
                        setSelectedAnswer(index);
                      }
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left font-semibold ${
                      selectedAnswer === index
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white hover:border-indigo-400"
                    } ${answered ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    whileHover={!answered ? { scale: 1.02 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    disabled={answered}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                        selectedAnswer === index
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      {option}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Submit Button */}
              {!answered && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full btn-primary"
                >
                  Submit Answer
                </Button>
              )}

              {answered && (
                <motion.div
                  className={`p-4 rounded-xl text-center font-bold ${
                    selectedAnswer === question.correctIndex
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {selectedAnswer === question.correctIndex
                    ? "✓ Correct! +10 points"
                    : "✗ Incorrect. Correct answer: " + question.options[question.correctIndex]}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar: Leaderboard & Chat */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-lg">Leaderboard</h3>
              </div>

              <div className="space-y-2">
                {leaderboard.map((player, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-orange-600" : "bg-slate-400"
                      }`}>
                        {player.rank}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{player.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Streak: {player.streak}</p>
                      </div>
                    </div>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">{player.score}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Chat */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col h-96"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg">Chat</h3>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No messages yet</p>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <p className="font-semibold text-slate-900 dark:text-white">{msg.name}</p>
                      <p className="text-slate-600 dark:text-slate-400">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Send a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
