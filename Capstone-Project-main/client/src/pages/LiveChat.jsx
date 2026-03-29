import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/contexts/AuthContext";
function LiveChat() {
  const { user, loading } = useRequireAuth();
  const [, navigate] = useLocation();
  if (loading || !user) return null;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950", children: [
    /* @__PURE__ */ jsx("div", { className: "glass-nav", children: /* @__PURE__ */ jsxs("div", { className: "container py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => navigate("/"),
          className: "text-slate-600 dark:text-slate-400",
          children: "\u2190 Home"
        }
      ),
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold gradient-text", children: "Live Chat" }),
      /* @__PURE__ */ jsx("div", { className: "w-20" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "container py-16 max-w-2xl", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "glass-panel p-10 text-center",
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6", children: /* @__PURE__ */ jsx(MessageSquare, { className: "w-8 h-8 text-white" }) }),
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-3 text-slate-900 dark:text-white", children: "Chat during live sessions" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mb-8", children: "Live chat is available when you join or host a quiz session. Join a session with a PIN from your teacher, or start one from the Teacher Dashboard to use real-time chat with participants." }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => navigate("/library"),
                className: "btn-primary",
                children: [
                  "Join with PIN ",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-2" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                onClick: () => navigate("/sessions"),
                children: "Sessions"
              }
            )
          ] })
        ]
      }
    ) })
  ] });
}
export {
  LiveChat as default
};
