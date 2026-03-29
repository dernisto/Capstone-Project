import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { FileQuestion, Share2, Play, BarChart3, ArrowRight, Flame } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
const FLOW_STEPS = [
  {
    number: 1,
    title: "Create Quiz",
    description: "Teachers build quizzes with multiple-choice questions, set time limits, and add as many questions as they need.",
    icon: FileQuestion,
    tryPath: "/quiz/create",
    tryLabel: "Create a quiz"
  },
  {
    number: 2,
    title: "Share PIN",
    description: "Start a live session and get a unique PIN. Students enter this PIN to join from the Quiz Library or join screen.",
    icon: Share2,
    tryPath: "/sessions",
    tryLabel: "Go to sessions"
  },
  {
    number: 3,
    title: "Play Live",
    description: "Questions appear for everyone at once. Students answer in real time with instant feedback and a live leaderboard.",
    icon: Play,
    tryPath: "/library",
    tryLabel: "Join with PIN"
  },
  {
    number: 4,
    title: "View Results",
    description: "See scores, accuracy, and rankings. Review question-by-question results and track progress over time.",
    icon: BarChart3,
    tryPath: "/analytics",
    tryLabel: "See results"
  }
];
function Demo() {
  const [, navigate] = useLocation();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950", children: [
    /* @__PURE__ */ jsx("div", { className: "glass-nav", children: /* @__PURE__ */ jsxs("div", { className: "container py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate("/"), className: "text-slate-600 dark:text-slate-400", children: "\u2190 Home" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center", children: /* @__PURE__ */ jsx(Flame, { className: "w-5 h-5 text-white" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-lg font-bold gradient-text", children: "Quiz flow demo" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-16" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "container py-12 max-w-3xl text-center", children: [
      /* @__PURE__ */ jsx(
        motion.h1,
        {
          className: "text-4xl md:text-5xl font-bold gradient-text mb-4",
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          children: "How QuizPulse59 works"
        }
      ),
      /* @__PURE__ */ jsx(
        motion.p,
        {
          className: "text-lg text-slate-600 dark:text-slate-400",
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.1 },
          children: "Four simple steps from creating a quiz to viewing results. Try each step yourself."
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "container pb-20 max-w-4xl space-y-8", children: FLOW_STEPS.map((step, i) => {
      const Icon = step.icon;
      return /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "glass-panel p-8 flex flex-col md:flex-row gap-6 items-start",
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.4, delay: 0.15 * i },
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white", children: /* @__PURE__ */ jsx(Icon, { className: "w-7 h-7" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold text-indigo-600 dark:text-indigo-400", children: [
                  "Step ",
                  step.number
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-slate-400 dark:text-slate-500", children: "/ 4" })
              ] }),
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-slate-900 dark:text-white mb-2", children: step.title }),
              /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mb-4", children: step.description }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => navigate(step.tryPath),
                  className: "w-fit",
                  children: [
                    step.tryLabel,
                    /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-1" })
                  ]
                }
              )
            ] })
          ]
        },
        step.number
      );
    }) }),
    /* @__PURE__ */ jsx("div", { className: "container pb-16", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "glass-panel p-8 text-center max-w-2xl mx-auto",
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay: 0.7 },
        children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold mb-2", children: "Ready to run your own quiz?" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mb-6", children: "Sign in and create your first quiz in minutes." }),
          /* @__PURE__ */ jsxs(Button, { onClick: () => navigate("/login"), className: "btn-primary", children: [
            "Get started",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-2" })
          ] })
        ]
      }
    ) })
  ] });
}
export {
  Demo as default
};
