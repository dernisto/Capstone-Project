import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, ArrowLeft, Copy, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { isDemoLoggedIn } from "@/_core/demoAuth";
import { saveDemoQuiz } from "@/_core/demoQuizzes";
import { toast } from "sonner";

/** True/False uses 4 fixed labels; multiple choice uses 5 custom options (server allows 4 or 5). */
const TRUE_FALSE_OPTIONS = [
  "True",
  "False",
  "Cannot be determined",
  "Both true and false",
];

const emptyMultipleChoice = () => ["", "", "", "", ""];

function QuizCreator() {
  const { user, loading } = useRequireAuth();
  const [, navigate] = useLocation();
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [savedPin, setSavedPin] = useState(null);
  const [copied, setCopied] = useState(false);
  const createQuizMutation = trpc.quiz.create.useMutation();

  if (loading || !user) return null;

  const copyPin = () => {
    if (!savedPin) return;
    navigator.clipboard.writeText(savedPin);
    setCopied(true);
    toast.success("PIN copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        questionType: "multiple_choice",
        text: "",
        options: emptyMultipleChoice(),
        correctOptionIndex: 0,
        timeLimit: 30,
      },
    ]);
  };

  const handleUpdateQuestion = (id, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const handleQuestionTypeChange = (id, questionType) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== id) return q;
        if (questionType === "true_false") {
          const prev = q.correctOptionIndex ?? 0;
          return {
            ...q,
            questionType: "true_false",
            options: [...TRUE_FALSE_OPTIONS],
            correctOptionIndex: prev <= 1 ? prev : 0,
          };
        }
        return {
          ...q,
          questionType: "multiple_choice",
          options: emptyMultipleChoice(),
          correctOptionIndex: Math.min(q.correctOptionIndex ?? 0, 4),
        };
      }),
    );
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }
    const title = quizTitle.trim();
    const description = quizDescription.trim();
    try {
      const result = await createQuizMutation.mutateAsync({ title, description });
      toast.success("Quiz saved! Taking you to the session…");
      try {
        navigator.clipboard.writeText(result.pin);
      } catch {
        /* ignore */
      }
      navigate(`/session/share-demo?pin=${encodeURIComponent(result.pin)}`);
      return;
    } catch {
      try {
        const { pin } = saveDemoQuiz({
          title,
          description,
          questions: questions.map((q) => ({
            id: q.id,
            text: q.text || "",
            options: q.options || emptyMultipleChoice(),
            correctOptionIndex: q.correctOptionIndex ?? 0,
            timeLimit: q.timeLimit ?? 30,
            questionType: q.questionType || "multiple_choice",
          })),
        });
        try {
          navigator.clipboard.writeText(pin);
        } catch {
          /* ignore */
        }
        toast.success(
          isDemoLoggedIn()
            ? "Quiz saved! Share the PIN and start when ready."
            : "Quiz saved locally! Share the PIN and start when ready.",
        );
        navigate(`/session/share-demo?pin=${encodeURIComponent(pin)}`);
        return;
      } catch {
        toast.error("Could not save quiz. Try again or sign in.");
      }
    }
  };

  const selectClass =
    "w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      <div className="glass-nav sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/sessions")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold gradient-text">Create Quiz</h1>
          </div>
          <Button
            onClick={handleSaveQuiz}
            className="btn-primary"
            disabled={createQuizMutation.isPending}
          >
            <Save className="w-5 h-5 mr-2" />
            {createQuizMutation.isPending ? "Saving..." : "Save Quiz"}
          </Button>
        </div>
      </div>

      <div className="container py-12 max-w-4xl">
        {savedPin && (
          <motion.div
            className="glass-panel p-8 mb-8 border-2 border-green-500/30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold mb-2 text-green-700 dark:text-green-400">
              Quiz saved
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Share this PIN so students can join. They can enter it on the Join
              Quiz page.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-3xl font-mono font-bold tracking-widest bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
                {savedPin}
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={copyPin}
                className="gap-2"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {copied ? "Copied!" : "Copy PIN"}
              </Button>
              <Button
                onClick={() => navigate("/sessions")}
                className="btn-primary"
              >
                Go to Sessions
              </Button>
            </div>
          </motion.div>
        )}

        <motion.div
          className="glass-panel p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold mb-6">Quiz Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                placeholder="Enter quiz title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter quiz description (optional)"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
            <Button
              onClick={handleAddQuestion}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Question
            </Button>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => {
              const qType =
                question.questionType === "true_false"
                  ? "true_false"
                  : "multiple_choice";
              return (
                <motion.div
                  key={question.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold">Question {index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Question format *
                      </label>
                      <select
                        className={selectClass}
                        value={qType}
                        onChange={(e) =>
                          handleQuestionTypeChange(
                            question.id,
                            e.target.value,
                          )
                        }
                      >
                        <option value="multiple_choice">
                          Multiple choice (5 custom options)
                        </option>
                        <option value="true_false">
                          True / False (standard options)
                        </option>
                      </select>
                      {qType === "true_false" && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Students see True, False, and two extra choices. Select
                          which of True or False is correct.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Question Text *
                      </label>
                      <textarea
                        placeholder="Enter question text"
                        value={question.text}
                        onChange={(e) =>
                          handleUpdateQuestion(
                            question.id,
                            "text",
                            e.target.value,
                          )
                        }
                        rows={2}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {qType === "true_false" ? (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Correct answer *
                        </label>
                        <div className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-600 p-4 bg-slate-50/80 dark:bg-slate-900/40">
                          {["True", "False"].map((label, idx) => (
                            <label
                              key={label}
                              className="flex items-center gap-3 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`tf-${question.id}`}
                                checked={question.correctOptionIndex === idx}
                                onChange={() =>
                                  handleUpdateQuestion(
                                    question.id,
                                    "correctOptionIndex",
                                    idx,
                                  )
                                }
                                className="w-4 h-4 accent-indigo-600"
                              />
                              <span className="text-slate-900 dark:text-white">
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Other choices shown to players: &quot;
                          {TRUE_FALSE_OPTIONS[2]}&quot;, &quot;
                          {TRUE_FALSE_OPTIONS[3]}&quot;.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Answer Options * (mark the correct one)
                        </label>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={
                                  question.correctOptionIndex === optIndex
                                }
                                onChange={() =>
                                  handleUpdateQuestion(
                                    question.id,
                                    "correctOptionIndex",
                                    optIndex,
                                  )
                                }
                                className="w-4 h-4"
                              />
                              <input
                                type="text"
                                placeholder={`Option ${optIndex + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optIndex] = e.target.value;
                                  handleUpdateQuestion(
                                    question.id,
                                    "options",
                                    newOptions,
                                  );
                                }}
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Time Limit (seconds)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={question.timeLimit}
                        onChange={(e) =>
                          handleUpdateQuestion(
                            question.id,
                            "timeLimit",
                            parseInt(e.target.value, 10) || 30,
                          )
                        }
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {questions.length === 0 && (
              <div className="glass-panel p-12 text-center border-2 border-dashed border-slate-300/50 dark:border-slate-600/50">
                <div className="text-5xl mb-4">❓</div>
                <h3 className="text-lg font-bold mb-2">No Questions Yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Add questions to your quiz to get started.
                </p>
                <Button onClick={handleAddQuestion} className="btn-primary">
                  <Plus className="w-5 h-5 mr-2" /> Add First Question
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default QuizCreator;
