import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, ArrowLeft, Copy, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useRequireDemoAuth } from "@/_core/useRequireDemoAuth";
import { isDemoLoggedIn } from "@/_core/demoAuth";
import { saveDemoQuiz } from "@/_core/demoQuizzes";
import { toast } from "sonner";

export default function QuizCreator() {
  const { loggedIn } = useRequireDemoAuth();
  const [, navigate] = useLocation();

  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createQuizMutation = trpc.quiz.create.useMutation();
  if (!loggedIn) return null;

  const copyPin = () => {
    if (!savedPin) return;
    navigator.clipboard.writeText(savedPin);
    setCopied(true);
    toast.success("PIN copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      timeLimit: 30,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleRemoveQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
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
      toast.success("Quiz saved!");
      setSavedPin(result.pin);
      try {
        navigator.clipboard.writeText(result.pin);
      } catch {}
      setTimeout(() => navigate("/teacher-dashboard"), 2000);
      return;
    } catch {
      // Demo mode or server unavailable: save locally and show PIN
      if (isDemoLoggedIn()) {
        const { pin } = saveDemoQuiz({
          title,
          description,
          questions: questions.map((q) => ({
            id: q.id,
            text: q.text || "",
            options: q.options || [],
            correctOptionIndex: q.correctOptionIndex ?? 0,
            timeLimit: q.timeLimit ?? 30,
          })),
        });
        setSavedPin(pin);
        try {
          navigator.clipboard.writeText(pin);
          toast.success("Quiz saved! PIN copied to clipboard — share it so others can join.");
        } catch {
          toast.success("Quiz saved! Share the PIN below so others can join.");
        }
        return;
      }
      toast.error("Could not save quiz. Try again or sign in.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      {/* Header */}
      <div className="glass-nav sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/teacher-dashboard")}
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

      {/* Main Content */}
      <div className="container py-12 max-w-4xl">
        {/* Success: Share PIN */}
        {savedPin && (
          <motion.div
            className="glass-panel p-8 mb-8 border-2 border-green-500/30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold mb-2 text-green-700 dark:text-green-400">Quiz saved</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Share this PIN so students can join. They can enter it on the Join Quiz page.</p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-3xl font-mono font-bold tracking-widest bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
                {savedPin}
              </div>
              <Button variant="outline" size="lg" onClick={copyPin} className="gap-2">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? "Copied!" : "Copy PIN"}
              </Button>
              <Button onClick={() => navigate("/teacher-dashboard")} className="btn-primary">
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        )}

        {/* Quiz Details */}
        <motion.div
          className="glass-panel p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold mb-6">Quiz Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Quiz Title *</label>
              <input
                type="text"
                placeholder="Enter quiz title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
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

        {/* Questions Section */}
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
            {questions.map((question, index) => (
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
                    <label className="block text-sm font-semibold mb-2">Question Text *</label>
                    <textarea
                      placeholder="Enter question text"
                      value={question.text}
                      onChange={(e) => handleUpdateQuestion(question.id, "text", e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Answer Options *</label>
                    <div className="space-y-2">
                      {question.options.map((option: string, optIndex: number) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctOptionIndex === optIndex}
                            onChange={() => handleUpdateQuestion(question.id, "correctOptionIndex", optIndex)}
                            className="w-4 h-4"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[optIndex] = e.target.value;
                              handleUpdateQuestion(question.id, "options", newOptions);
                            }}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Time Limit (seconds)</label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={question.timeLimit}
                      onChange={(e) => handleUpdateQuestion(question.id, "timeLimit", parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </motion.div>
            ))}

            {questions.length === 0 && (
              <div className="glass-panel p-12 text-center border-2 border-dashed border-slate-300/50 dark:border-slate-600/50">
                <div className="text-5xl mb-4">❓</div>
                <h3 className="text-lg font-bold mb-2">No Questions Yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Add questions to your quiz to get started.</p>
                <Button
                  onClick={handleAddQuestion}
                  className="btn-primary"
                >
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
