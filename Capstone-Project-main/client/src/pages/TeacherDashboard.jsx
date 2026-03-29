import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Plus, Play, Edit2, Copy, Check, Home, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getStoredUser } from "@/lib/authStorage";
import { getDemoQuizzes, removeDemoQuiz } from "@/_core/demoQuizzes";
import { toast } from "sonner";
function TeacherDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [copiedPin, setCopiedPin] = useState(null);
  const [demoRefresh, setDemoRefresh] = useState(0);
  const storedUser = getStoredUser();
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("quizpulse_token");
  const displayUser = user ?? (hasToken && storedUser ? storedUser : null);
  useEffect(() => {
    if (loading) return;
    if (displayUser) return;
    navigate("/login");
  }, [loading, displayUser, navigate]);
  const { data: quizzes, isLoading, isError, refetch } = trpc.quiz.getMyQuizzes.useQuery(
    void 0,
    { retry: false }
  );
  const deleteQuizMutation = trpc.quiz.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Quiz deleted");
    },
    onError: (e) => toast.error(e.message || "Could not delete quiz")
  });
  const serverList = (quizzes || []).map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description || "",
    pin: q.pin,
    isPublished: q.isPublished,
    isDemo: false
  }));
  const demoList = getDemoQuizzes().map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description || "",
    pin: q.pin,
    isPublished: q.isPublished,
    isDemo: true
  }));
  const displayList = [...serverList, ...demoList];
  const copyPin = (pin) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    toast.success("PIN copied to clipboard");
    setTimeout(() => setCopiedPin(null), 2e3);
  };
  const handleDeleteQuiz = (quiz) => {
    if (!window.confirm(`Delete "${quiz.title}"? This cannot be undone.`)) return;
    if (quiz.isDemo) {
      removeDemoQuiz(String(quiz.id));
      setDemoRefresh((n) => n + 1);
      toast.success("Quiz removed from this device");
      return;
    }
    deleteQuizMutation.mutate({ id: Number(quiz.id) });
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-block w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400", children: "Loading dashboard\u2026" })
    ] }) });
  }
  if (!displayUser) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-center max-w-sm space-y-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400", children: "You need to sign in to view the teacher dashboard." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: () => navigate("/login"), children: "Go to Sign in" }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", onClick: () => navigate("/register"), children: "Create an account" })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950", children: [
    /* @__PURE__ */ jsx("div", { className: "glass-nav", children: /* @__PURE__ */ jsx("div", { className: "container py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold gradient-text mb-2", children: "Teacher Dashboard" }),
        /* @__PURE__ */ jsxs("p", { className: "text-slate-600 dark:text-slate-400", children: [
          "Hi, ",
          displayUser.name,
          "! Welcome back. Manage your quizzes and track student performance."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            onClick: () => navigate("/"),
            className: "flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx(Home, { className: "w-5 h-5" }),
              " Home"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: () => navigate("/quiz/create"),
            className: "btn-primary flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5" }),
              " Create Quiz"
            ]
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "container py-12", children: [
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-6 mb-12", children: [
        { label: "Total Quizzes", value: displayList.length, icon: "\u{1F4CA}" },
        { label: "Active Sessions", value: "0", icon: "\u{1F534}" },
        { label: "Total Students", value: "0", icon: "\u{1F465}" }
      ].map((stat, i) => /* @__PURE__ */ jsx(
        motion.div,
        {
          className: "glass-panel p-6",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.1 },
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 text-sm", children: stat.label }),
              /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold mt-2", children: stat.value })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-4xl", children: stat.icon })
          ] })
        },
        i
      )) }),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.3 },
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-6", children: "Your Quizzes" }),
            isLoading && displayList.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-12", children: /* @__PURE__ */ jsx("div", { className: "inline-block animate-spin", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" }) }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              isError && /* @__PURE__ */ jsxs("div", { className: "glass-panel p-6 mb-6 flex flex-wrap items-center justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-bold mb-1", children: "Demo mode" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600 dark:text-slate-400", children: "Server quizzes aren't loaded. Your saved demo quizzes are below." })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => refetch(), children: "Try again" }),
                  /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => navigate("/quiz/create"), className: "btn-primary", children: [
                    /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-1" }),
                    " Create Quiz"
                  ] })
                ] })
              ] }),
              displayList.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: displayList.map((quiz, i) => /* @__PURE__ */ jsxs(
                motion.div,
                {
                  className: "glass-card p-6",
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: i * 0.05 },
                  whileHover: { y: -5 },
                  children: [
                    quiz.isDemo && /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 inline-block", children: "Demo" }),
                    /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold mb-2 line-clamp-2", children: quiz.title }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2", children: quiz.description || "No description" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 text-sm flex-wrap gap-2", children: [
                      /* @__PURE__ */ jsxs("span", { className: "text-slate-500 font-mono", children: [
                        "PIN: ",
                        quiz.pin
                      ] }),
                      /* @__PURE__ */ jsx(
                        Button,
                        {
                          size: "sm",
                          variant: "ghost",
                          className: "h-8 px-2",
                          onClick: () => copyPin(quiz.pin),
                          children: copiedPin === quiz.pin ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4" })
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded-full text-xs font-semibold ${quiz.isPublished ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"}`, children: quiz.isPublished ? "Published" : "Draft" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                      !quiz.isDemo && /* @__PURE__ */ jsxs(
                        Button,
                        {
                          size: "sm",
                          variant: "outline",
                          className: "flex-1 min-w-[100px]",
                          onClick: () => navigate(`/quiz/${quiz.id}/edit`),
                          children: [
                            /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4 mr-1" }),
                            " Edit"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        Button,
                        {
                          size: "sm",
                          className: "flex-1 min-w-[100px] bg-indigo-600 hover:bg-indigo-700 text-white",
                          onClick: () => quiz.isDemo ? navigate(`/session/share-demo?pin=${encodeURIComponent(quiz.pin)}`) : navigate(`/host?quizId=${quiz.id}`),
                          children: [
                            /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 mr-1" }),
                            " ",
                            quiz.isDemo ? "Share PIN" : "Start"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        Button,
                        {
                          size: "sm",
                          variant: "outline",
                          className: "text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30",
                          disabled: deleteQuizMutation.isPending && !quiz.isDemo,
                          onClick: () => handleDeleteQuiz(quiz),
                          "aria-label": "Delete quiz",
                          children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                        }
                      )
                    ] })
                  ]
                },
                String(quiz.id)
              )) }) : /* @__PURE__ */ jsxs("div", { className: "glass-panel p-12 text-center", children: [
                /* @__PURE__ */ jsx("div", { className: "text-5xl mb-4", children: "\u{1F4DD}" }),
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold mb-2", children: "No Quizzes Yet" }),
                /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mb-6", children: "Create your first quiz to get started!" }),
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    onClick: () => navigate("/quiz/create"),
                    className: "btn-primary",
                    children: [
                      /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5 mr-2" }),
                      " Create Quiz"
                    ]
                  }
                )
              ] })
            ] })
          ]
        }
      )
    ] })
  ] });
}
export {
  TeacherDashboard as default
};
