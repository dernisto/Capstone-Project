import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Flame,
  Users,
  Clock,
  MessageSquare,
  ArrowRight,
  Play,
  Trophy,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

const HERO_IMAGE = "/images/hero-home.png";

export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const features = [
    {
      icon: Flame,
      title: "Real-time Engagement",
      purpose: "Host live quizzes with real-time questions and scoring.",
      path: "/live-session",
      implemented: true,
    },
    {
      icon: Users,
      title: "Multiplayer Sessions",
      purpose: "Manage hosted sessions and share join PINs with students.",
      path: "/sessions",
      implemented: true,
    },
    {
      icon: Trophy,
      title: "Live Leaderboard",
      purpose: "View rankings updating during a live game.",
      path: "/leaderboard",
      implemented: true,
    },
    {
      icon: Clock,
      title: "Timed Questions",
      purpose: "Run quizzes with per-question timers and auto-advance.",
      path: "/quiz/timed",
      implemented: false,
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      purpose: "Chat with participants during a live session.",
      path: "/chat",
      implemented: true,
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      purpose: "Review results, trends, and student performance over time.",
      path: "/analytics",
      implemented: true,
    },
    {
      icon: BookOpen,
      title: "Quiz Library",
      purpose: "Browse quizzes and join a live game with a PIN.",
      path: "/library",
      implemented: true,
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Create Quiz",
      description: "Teachers build quizzes with multiple-choice questions",
    },
    {
      number: 2,
      title: "Share PIN",
      description: "Students join sessions using a unique PIN code",
    },
    {
      number: 3,
      title: "Play Live",
      description: "Answer questions in real-time with instant feedback",
    },
    {
      number: 4,
      title: "View Results",
      description: "See scores, analytics, and performance metrics",
    },
  ];

  const teacherBenefits = [
    "Increase student engagement and participation",
    "Get real-time insights into student understanding",
    "Make learning fun and interactive",
    "Build reusable question banks for your classes",
    "Track progress over multiple sessions",
    "Create a competitive, motivating environment",
  ];

  const handleGetStarted = () => {
    if (user) navigate("/sessions");
    else navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      {/* Hero: photo card with rounded border + overlays for contrast */}
      <div className="px-4 md:px-6 lg:px-8 pt-4 md:pt-6">
        <section
          className="relative min-h-[min(88vh,920px)] flex items-center overflow-hidden rounded-3xl border border-white/20 dark:border-white/[0.09] shadow-[0_4px_28px_-6px_rgba(15,23,42,0.07),inset_0_1px_0_0_rgba(255,255,255,0.12)] dark:shadow-[0_8px_36px_-10px_rgba(0,0,0,0.22),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
          aria-labelledby="home-hero-heading"
        >
        {/* Photo */}
        <div
          className="absolute inset-0 bg-slate-900 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-hidden
        />
        {/* Base dim — keeps busy areas (yellows, lamps) from blowing out text */}
        <div
          className="absolute inset-0 bg-slate-950/55"
          aria-hidden
        />
        {/* Stronger read zone on the left where copy lives (HCI: anchor primary content) */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/78 to-slate-950/35 md:to-transparent"
          aria-hidden
        />
        {/* Bottom blend into page body */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none"
          aria-hidden
        />

        <div className="container relative z-10 py-20 md:py-28 px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl md:mr-auto md:text-left text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75 }}
            >
              <p className="text-sm font-semibold tracking-wide text-indigo-200/95 uppercase mb-3 drop-shadow-sm">
                QuizPulse59 · Interactive learning
              </p>
              <h1
                id="home-hero-heading"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]"
              >
                Make learning interactive
              </h1>
              <p className="text-lg md:text-xl text-slate-100/95 mb-10 max-w-xl md:max-w-none mx-auto md:mx-0 leading-relaxed [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
                Real-time quizzes for classrooms and teams. Teachers create,
                students compete, everyone stays engaged—with clear feedback
                every step of the way.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center md:justify-start mb-12">
                <Button
                  onClick={handleGetStarted}
                  className="text-base md:text-lg px-8 py-6 bg-white text-slate-900 hover:bg-slate-100 font-semibold border-0 shadow-lg shadow-black/25"
                >
                  {user ? "Go to Dashboard" : "Start now"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                {!user && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base md:text-lg px-8 py-6 border-2 border-white/90 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm font-semibold"
                    onClick={() => navigate("/register")}
                  >
                    Create account
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base md:text-lg px-8 py-6 border-2 border-white/50 text-white hover:bg-white/15 hover:border-white/80 backdrop-blur-sm"
                  onClick={() => navigate("/demo")}
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch demo
                </Button>
              </div>

              {/* Stats: frosted panel, high edge contrast */}
              <motion.div
                className="inline-flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-6 md:gap-10 py-6 px-6 md:px-8 rounded-2xl border border-white/20 bg-white/12 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.35)] max-w-full"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.7 }}
              >
                {[
                  { label: "Active sessions", value: "32+" },
                  { label: "Students learning", value: "189+" },
                  { label: "Quizzes created", value: "43+" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="text-center md:text-left min-w-[120px]"
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="text-3xl md:text-4xl font-bold text-white tabular-nums [text-shadow:0_2px_16px_rgba(0,0,0,0.4)]">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-slate-200/90 mt-1">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
        </section>
      </div>

      <section className="py-24 md:py-28 glass-section rounded-3xl mx-4 md:mx-6 lg:mx-8 mt-2">
        <div className="container">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Powerful features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need for engaging interactive learning
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const isEnabled = !!feature.implemented && !!feature.path;
              return (
                <motion.div
                  key={feature.title}
                  className={[
                    "glass-card p-6 md:p-8 relative",
                    isEnabled ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                  ].join(" ")}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={isEnabled ? { y: -5 } : undefined}
                  onClick={() => {
                    if (!isEnabled) return;
                    navigate(feature.path);
                  }}
                  role="button"
                  aria-disabled={!isEnabled}
                  tabIndex={isEnabled ? 0 : -1}
                  onKeyDown={(e) => {
                    if (!isEnabled) return;
                    if (e.key === "Enter" || e.key === " ")
                      navigate(feature.path);
                  }}
                >
                  {!isEnabled && (
                    <div className="absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 border border-slate-300/60 dark:border-slate-700/60">
                      Coming soon
                    </div>
                  )}
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.purpose}
                  </p>
                  {isEnabled && (
                    <div className="mt-4 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                      Open →
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28 rounded-3xl mx-4 md:mx-6 lg:mx-8 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/95 dark:to-purple-950/95">
        <div className="container">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              How it works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Simple steps to interactive learning
            </p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="glass-panel p-6 md:p-8 text-center">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {step.number}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute top-1/2 -right-4 w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: i * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28 glass-section rounded-3xl mx-4 md:mx-6 lg:mx-8">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                For teachers
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Transform your classroom with interactive quizzes that boost
                engagement and provide instant insights into student
                understanding.
              </p>
              <div className="space-y-4">
                {teacherBenefits.map((benefit, i) => (
                  <motion.div
                    key={benefit}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="glass-panel bg-indigo-50/50 dark:bg-indigo-900/30 rounded-3xl p-6 md:p-8 border-indigo-200/50 dark:border-indigo-700/40">
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
                  Dashboard preview
                </p>
                <div className="glass rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Live session
                    </span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm space-y-1">
                    <p>Quiz: Geography 101</p>
                    <p>12 students · Question 3 of 10</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Leaderboard
                    </p>
                    <div className="flex gap-2 text-xs flex-wrap">
                      <span className="text-amber-600 dark:text-amber-400">
                        1. Alex 24pts
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        2. Sam 22pts
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        3. Jo 20pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-24 md:py-28 overflow-hidden px-4 md:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
        {[...Array(55)].map((_, i) => {
          const size =
            i % 3 === 0 ? "w-1 h-1" : i % 3 === 1 ? "w-2 h-2" : "w-1.5 h-1.5";
          const duration = 2.5 + (i % 5) * 0.8;
          const delay = (i * 0.15) % 4;
          return (
            <motion.div
              key={i}
              className={`absolute ${size} bg-white rounded-full`}
              style={{
                left: `${(i * 17 + 5) % 100}%`,
                top: `${(i * 23 + 10) % 100}%`,
                opacity: 0.4 + (i % 4) * 0.15,
              }}
              animate={{
                y: [0, -80 - (i % 3) * 40, 0],
                x: [0, (i % 2 === 0 ? 1 : -1) * (15 + (i % 4) * 10), 0],
                opacity: [0.15, 0.7, 0.15],
              }}
              transition={{ duration, repeat: Infinity, delay }}
            />
          );
        })}
        <div className="container relative z-10">
          <motion.div
            className="glass-cta-inner text-center text-white max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 [text-shadow:0_2px_20px_rgba(0,0,0,0.2)]">
              Ready to transform your classroom?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-white/95">
              Join teachers making learning interactive and measurable.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-slate-100 font-bold text-lg px-8 py-6 shadow-lg"
            >
              Get started free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="glass-footer text-slate-300 py-12 md:py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  QuizPulse59
                </span>
              </div>
              <p className="text-sm">
                Interactive learning for modern classrooms
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/demo")}
                    className="hover:text-white transition text-left"
                  >
                    Demo
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/library")}
                    className="hover:text-white transition text-left"
                  >
                    Quiz library
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/chat")}
                    className="hover:text-white transition text-left"
                  >
                    Live chat
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/sessions")}
                    className="hover:text-white transition text-left"
                  >
                    Sessions
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/components")}
                    className="hover:text-white transition text-left"
                  >
                    Themes
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/join")}
                    className="hover:text-white transition text-left"
                  >
                    Join game
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© 2026 QuizPulse59. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
