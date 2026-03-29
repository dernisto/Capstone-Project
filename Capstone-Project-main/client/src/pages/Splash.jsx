import { jsx, jsxs } from "react/jsx-runtime";
import { Flame } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { isDemoLoggedIn } from "@/_core/demoAuth";
import { TOKEN_KEY, getStoredUser } from "@/lib/authStorage";
import { useAuth } from "@/contexts/AuthContext";
const SPLASH_DURATION_MS = 2500;
function Splash() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  useEffect(() => {
    if (authLoading) return;
    const hasDemo = isDemoLoggedIn();
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    const stored = getStoredUser();
    const hasSession = !!user || hasDemo || !!(token && stored);
    if (!hasSession) {
      navigate("/login");
      return;
    }
    const t = setTimeout(() => {
      navigate("/sessions");
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [authLoading, user, navigate]);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#e9e0f5] dark:bg-gradient-to-br dark:from-indigo-950/80 dark:via-purple-950/80 dark:to-slate-950", children: [
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "flex flex-col items-center",
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.6, ease: "easeOut" },
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-20 h-20 rounded-[22px] flex items-center justify-center mb-6 shadow-lg",
              style: {
                background: "linear-gradient(180deg, #7c5cbf 0%, #9b7dd4 100%)",
                boxShadow: "0 8px 24px rgba(124, 92, 191, 0.35)"
              },
              children: /* @__PURE__ */ jsx(Flame, { className: "w-10 h-10 text-white", strokeWidth: 2 })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-0", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "text-4xl md:text-5xl font-bold tracking-tight",
                style: {
                  background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                },
                children: "QuizPulse"
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "text-4xl md:text-5xl font-bold tracking-tight ml-0.5",
                style: { color: "#e11d8b" },
                children: "59"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      motion.p,
      {
        className: "mt-8 text-sm text-slate-500",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 0.8, duration: 0.5 },
        children: "Loading your experience..."
      }
    )
  ] });
}
export {
  Splash as default
};
