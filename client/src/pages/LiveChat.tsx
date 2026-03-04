import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useRequireDemoAuth } from "@/_core/useRequireDemoAuth";

export default function LiveChat() {
  const { loggedIn } = useRequireDemoAuth();
  const [, navigate] = useLocation();

  if (!loggedIn) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      {/* Header */}
      <div className="glass-nav">
        <div className="container py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-slate-600 dark:text-slate-400"
          >
            ← Home
          </Button>
          <h1 className="text-xl font-bold gradient-text">Live Chat</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Main */}
      <div className="container py-16 max-w-2xl">
        <motion.div
          className="glass-panel p-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
            Chat during live sessions
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Live chat is available when you join or host a quiz session. Join a session with a PIN from your teacher, or start one from the Teacher Dashboard to use real-time chat with participants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/quiz-library")}
              className="btn-primary"
            >
              Join with PIN <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/teacher-dashboard")}
            >
              Teacher Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
