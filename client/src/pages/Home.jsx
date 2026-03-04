import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame, Users, BarChart3, Clock, MessageSquare, Sparkles, Trophy, BookOpen, Lightbulb, ArrowRight, Play } from "lucide-react";
import { useLocation } from "wouter";
import { demoLogout } from "@/_core/demoAuth";
import { useDemoAuth } from "@/_core/useDemoAuth";

export default function Home() {
  const [, navigate] = useLocation();
  const { loggedIn } = useDemoAuth();

  const handleGetStarted = () => {
    navigate(loggedIn ? "/teacher-dashboard" : "/login");
  };

  const features = [
    { icon: Flame, title: "Real-time Engagement", description: "Live quiz sessions with instant feedback and scoring", path: "/teacher-dashboard" },
    { icon: Users, title: "Multiplayer Sessions", description: "Teachers host, students join with PIN codes", path: "/quiz-library" },
    { icon: BarChart3, title: "Live Leaderboard", description: "Real-time rankings and performance tracking", path: "/teacher-dashboard" },
    { icon: Clock, title: "Timed Questions", description: "Configurable timers for each question", path: "/quiz/create" },
    { icon: MessageSquare, title: "Live Chat", description: "Participants interact during sessions", path: "/live-chat" },
    { icon: Sparkles, title: "Question Generator", description: "AI-powered question creation from materials", path: "/quiz/create" },
    { icon: Trophy, title: "Performance Analytics", description: "Detailed results and student insights", path: "/teacher-dashboard" },
    { icon: BookOpen, title: "Quiz Library", description: "Browse and join available quizzes", path: "/quiz-library" },
    { icon: Lightbulb, title: "Theme Switching", description: "Dark and light mode support", path: "/components" }
  ];

  const steps = [
    { number: 1, title: "Create Quiz", description: "Teachers build quizzes with multiple-choice questions" },
    { number: 2, title: "Share PIN", description: "Students join sessions using a unique PIN code" },
    { number: 3, title: "Play Live", description: "Answer questions in real-time with instant feedback" },
    { number: 4, title: "View Results", description: "See scores, analytics, and performance metrics" }
  ];

  const teacherBenefits = [
    "Increase student engagement and participation",
    "Get real-time insights into student understanding",
    "Make learning fun and interactive",
    "Save time with AI question generation",
    "Track progress over multiple sessions",
    "Create a competitive, motivating environment"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      <nav className="glass-nav">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">QuizPulse59</span>
          </div>
          <div className="flex items-center gap-4">
            {loggedIn ? (
              <>
                <Button variant="outline" onClick={() => navigate("/teacher-dashboard")}>Dashboard</Button>
                <Button variant="ghost" onClick={() => { demoLogout(); navigate("/"); }}>Logout</Button>
              </>
            ) : (
              <Button onClick={handleGetStarted} className="btn-primary">Get Started</Button>
            )}
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 md:py-32">
        <motion.div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" animate={{ y: [0, 30, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" animate={{ y: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity }} />
        <motion.div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" animate={{ x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity }} />
        <div className="container relative z-10">
          <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">Make Learning Interactive</h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              QuizPulse59 brings real-time engagement to classrooms. Teachers create, students compete, everyone learns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button onClick={handleGetStarted} className="btn-primary text-lg px-8 py-6">
                {loggedIn ? "Go to Dashboard" : "Start Now"} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={() => navigate("/demo")}>
                <Play className="mr-2 w-5 h-5" /> Watch Demo
              </Button>
            </div>
            <motion.div className="glass-panel flex justify-center gap-8 md:gap-16 mt-12 py-8 px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
              {[{ label: "Active Sessions", value: "1,234+" }, { label: "Students Learning", value: "50K+" }, { label: "Quizzes Created", value: "10K+" }].map((stat, i) => (
                <motion.div key={i} className="text-center" whileHover={{ scale: 1.05 }}>
                  <div className="text-3xl md:text-4xl font-bold gradient-accent">{stat.value}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-32 glass-section">
        <div className="container">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Powerful Features</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Everything you need for engaging interactive learning</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  className="glass-card p-8 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  onClick={() => feature.path && navigate(feature.path)}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/95 dark:to-purple-950/95">
        <div className="container">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">How It Works</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Simple steps to interactive learning</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div key={i} className="relative" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="glass-panel p-8 text-center">
                  <motion.div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white" whileHover={{ scale: 1.1, rotate: 360 }} transition={{ duration: 0.6 }}>
                    {step.number}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <motion.div className="hidden md:block absolute top-1/2 -right-4 w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} transition={{ duration: 0.6, delay: i * 0.1 + 0.3 }} viewport={{ once: true }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 glass-section">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">For Teachers</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Transform your classroom with interactive quizzes that boost engagement and provide instant insights into student understanding.
              </p>
              <div className="space-y-4">
                {teacherBenefits.map((benefit, i) => (
                  <motion.div key={i} className="flex items-start gap-3" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }} viewport={{ once: true }}>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div className="relative" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <div className="glass-panel bg-indigo-50/50 dark:bg-indigo-900/30 rounded-3xl p-8 border-indigo-200/50 dark:border-indigo-700/40">
                <div className="glass bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div key={i} className="h-12 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-60"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -100, 0], x: [0, Math.random() * 50 - 25, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
        <div className="container relative z-10">
          <motion.div className="glass-cta-inner text-center text-white max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Classroom?</h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">Join thousands of teachers making learning interactive and fun.</p>
            <Button onClick={handleGetStarted} size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 font-bold text-lg px-8 py-6">
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="glass-footer text-slate-300 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">QuizPulse59</span>
              </div>
              <p className="text-sm">Interactive learning for modern classrooms</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button type="button" onClick={() => navigate("/demo")} className="hover:text-white transition text-left">Features</button></li>
                <li><button type="button" onClick={() => navigate("/")} className="hover:text-white transition text-left">Pricing</button></li>
                <li><button type="button" onClick={() => navigate("/")} className="hover:text-white transition text-left">Security</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><button type="button" onClick={() => navigate("/")} className="hover:text-white transition text-left">About</button></li>
                <li><button type="button" onClick={() => navigate("/")} className="hover:text-white transition text-left">Blog</button></li>
                <li><button type="button" onClick={() => navigate("/")} className="hover:text-white transition text-left">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><button type="button" onClick={() => navigate("/")} className="hover:text-white transition text-left">Privacy</button></li>
                <li><button type="button" onClick={() => navigate("/")} className="hover:text-white transition text-left">Terms</button></li>
                <li><button type="button" onClick={() => navigate("/")} className="hover:text-white transition text-left">Cookies</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 QuizPulse59. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
