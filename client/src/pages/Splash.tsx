import { Flame } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { isDemoLoggedIn } from "@/_core/demoAuth";

const SPLASH_DURATION_MS = 2500;

export default function Splash() {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isDemoLoggedIn()) {
      navigate("/login");
      return;
    }
    const t = setTimeout(() => {
      navigate("/teacher-dashboard");
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#e9e0f5] dark:bg-gradient-to-br dark:from-indigo-950/80 dark:via-purple-950/80 dark:to-slate-950">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo icon: purple squircle with white flame */}
        <div
          className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-6 shadow-lg"
          style={{
            background: "linear-gradient(180deg, #7c5cbf 0%, #9b7dd4 100%)",
            boxShadow: "0 8px 24px rgba(124, 92, 191, 0.35)",
          }}
        >
          <Flame className="w-10 h-10 text-white" strokeWidth={2} />
        </div>

        {/* QuizPulse59 text: gradient on QuizPulse + pink 59 */}
        <div className="flex items-baseline gap-0">
          <span
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            QuizPulse
          </span>
          <span
            className="text-4xl md:text-5xl font-bold tracking-tight ml-0.5"
            style={{ color: "#e11d8b" }}
          >
            59
          </span>
        </div>
      </motion.div>

      <motion.p
        className="mt-8 text-sm text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Loading your experience...
      </motion.p>
    </div>
  );
}
