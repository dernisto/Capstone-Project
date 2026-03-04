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
    tryLabel: "Create a quiz",
  },
  {
    number: 2,
    title: "Share PIN",
    description: "Start a live session and get a unique PIN. Students enter this PIN to join from the Quiz Library or join screen.",
    icon: Share2,
    tryPath: "/teacher-dashboard",
    tryLabel: "Go to dashboard",
  },
  {
    number: 3,
    title: "Play Live",
    description: "Questions appear for everyone at once. Students answer in real time with instant feedback and a live leaderboard.",
    icon: Play,
    tryPath: "/quiz-library",
    tryLabel: "Join with PIN",
  },
  {
    number: 4,
    title: "View Results",
    description: "See scores, accuracy, and rankings. Review question-by-question results and track progress over time.",
    icon: BarChart3,
    tryPath: "/teacher-dashboard",
    tryLabel: "See results",
  },
];

export default function Demo() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      {/* Header */}
      <div className="glass-nav">
        <div className="container py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-600 dark:text-slate-400">
            ← Home
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Quiz flow demo</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      {/* Intro */}
      <div className="container py-12 max-w-3xl text-center">
        <motion.h1
          className="text-4xl md:text-5xl font-bold gradient-text mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          How QuizPulse59 works
        </motion.h1>
        <motion.p
          className="text-lg text-slate-600 dark:text-slate-400"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Four simple steps from creating a quiz to viewing results. Try each step yourself.
        </motion.p>
      </div>

      {/* Step-by-step flow */}
      <div className="container pb-20 max-w-4xl space-y-8">
        {FLOW_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              className="glass-panel p-8 flex flex-col md:flex-row gap-6 items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 * i }}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                <Icon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Step {step.number}</span>
                  <span className="text-slate-400 dark:text-slate-500">/ 4</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{step.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(step.tryPath)}
                  className="w-fit"
                >
                  {step.tryLabel}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="container pb-16">
        <motion.div
          className="glass-panel p-8 text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <h3 className="text-xl font-bold mb-2">Ready to run your own quiz?</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Sign in and create your first quiz in minutes.</p>
          <Button onClick={() => navigate("/login")} className="btn-primary">
            Get started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
