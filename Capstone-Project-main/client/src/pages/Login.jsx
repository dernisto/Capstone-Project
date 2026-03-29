import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Flame } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
function Login() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (user) navigate("/splash");
  }, [user, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed. Please try again.";
      if (msg.includes("MongoDB") || msg.includes("unavailable") || msg.includes("503")) {
        setError("Server or database is not ready. Make sure you ran pnpm run dev and that MongoDB is connected (see MONGODB_SETUP.md).");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };
  if (authLoading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4", children: /* @__PURE__ */ jsx("div", { className: "glass-panel p-8 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400", children: "Loading\u2026" }) }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      className: "glass-panel w-full max-w-md p-8",
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center mb-8", children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(Flame, { className: "w-8 h-8 text-white" }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold gradient-text", children: "QuizPulse59" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600 dark:text-slate-400 mt-1", children: "Sign in to continue" })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
          error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md", children: error }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "email",
                type: "email",
                placeholder: "you@example.com",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
            /* @__PURE__ */ jsx(
              PasswordInput,
              {
                id: "password",
                placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                autoComplete: "current-password",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              className: "btn-primary w-full py-6 text-base",
              disabled: loading,
              children: loading ? "Signing in\u2026" : "Sign in"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            className: "w-full mt-4",
            onClick: () => navigate("/register"),
            children: "Don't have an account? Sign up"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            className: "w-full mt-2 text-slate-600 dark:text-slate-400",
            onClick: () => navigate("/"),
            children: "\u2190 Back to home"
          }
        )
      ]
    }
  ) });
}
export {
  Login as default
};
