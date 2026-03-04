import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Plus, Play, Edit2, Copy, Check, Home } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useRequireDemoAuth } from "@/_core/useRequireDemoAuth";
import { getDemoQuizzes } from "@/_core/demoQuizzes";
import { toast } from "sonner";

type QuizItem = {
  id: number | string;
  title: string;
  description: string;
  pin: string;
  isPublished: boolean;
  isDemo?: boolean;
};

export default function TeacherDashboard() {
  const { loggedIn } = useRequireDemoAuth();
  const user = { name: "Demo Teacher" };
  const [, navigate] = useLocation();
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const { data: quizzes, isLoading, isError, refetch } = trpc.quiz.getMyQuizzes.useQuery(
    undefined,
    { retry: false }
  );

  // Recompute every render so new demo quizzes appear when returning from create page
  const serverList: QuizItem[] = (quizzes || []).map((q: { id: number; title: string; description: string; pin: string; isPublished: boolean }) => ({
    id: q.id,
    title: q.title,
    description: q.description || "",
    pin: q.pin,
    isPublished: q.isPublished,
    isDemo: false,
  }));
  const demoList: QuizItem[] = getDemoQuizzes().map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description || "",
    pin: q.pin,
    isPublished: q.isPublished,
    isDemo: true,
  }));
  const displayList = [...serverList, ...demoList];

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    toast.success("PIN copied to clipboard");
    setTimeout(() => setCopiedPin(null), 2000);
  };

  if (!loggedIn) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      {/* Header */}
      <div className="glass-nav">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Teacher Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400">Welcome back, {user?.name}! Manage your quizzes and track student performance.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <Home className="w-5 h-5" /> Home
              </Button>
              <Button
                onClick={() => navigate("/quiz/create")}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Create Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Quizzes", value: displayList.length, icon: "📊" },
            { label: "Active Sessions", value: "0", icon: "🔴" },
            { label: "Total Students", value: "0", icon: "👥" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="glass-panel p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quizzes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">Your Quizzes</h2>

          {isLoading && displayList.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
              </div>
            </div>
          ) : (
            <>
              {isError && (
                <div className="glass-panel p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold mb-1">Demo mode</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Server quizzes aren&apos;t loaded. Your saved demo quizzes are below.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      Try again
                    </Button>
                    <Button size="sm" onClick={() => navigate("/quiz/create")} className="btn-primary">
                      <Plus className="w-4 h-4 mr-1" /> Create Quiz
                    </Button>
                  </div>
                </div>
              )}
              {displayList.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayList.map((quiz, i) => (
                    <motion.div
                      key={String(quiz.id)}
                      className="glass-card p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -5 }}
                    >
                      {quiz.isDemo && (
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 inline-block">Demo</span>
                      )}
                      <h3 className="text-lg font-bold mb-2 line-clamp-2">{quiz.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {quiz.description || "No description"}
                      </p>

                      <div className="flex items-center justify-between mb-4 text-sm flex-wrap gap-2">
                        <span className="text-slate-500 font-mono">PIN: {quiz.pin}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() => copyPin(quiz.pin)}
                        >
                          {copiedPin === quiz.pin ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          quiz.isPublished
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}>
                          {quiz.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {!quiz.isDemo && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(`/quiz/${quiz.id}/edit`)}
                          >
                            <Edit2 className="w-4 h-4 mr-1" /> Edit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() =>
                            quiz.isDemo
                              ? navigate(`/session/share-demo?pin=${encodeURIComponent(quiz.pin)}`)
                              : navigate(`/session/new?quizId=${quiz.id}`)
                          }
                        >
                          <Play className="w-4 h-4 mr-1" /> {quiz.isDemo ? "Share PIN" : "Start"}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="glass-panel p-12 text-center">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-xl font-bold mb-2">No Quizzes Yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first quiz to get started!</p>
                  <Button
                    onClick={() => navigate("/quiz/create")}
                    className="btn-primary"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Create Quiz
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
