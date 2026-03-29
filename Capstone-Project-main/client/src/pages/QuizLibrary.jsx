import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, LayoutDashboard } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
function QuizLibrary() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const [pinInput, setPinInput] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(typeof search === "string" ? search : "");
    const pin = params.get("pin");
    if (pin) setPinInput(pin.toUpperCase());
  }, [search]);
  const handleJoinByPin = () => {
    if (pinInput.trim()) {
      navigate(`/join?pin=${pinInput.toUpperCase()}`);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950", children: [
    /* @__PURE__ */ jsx("div", { className: "glass-nav", children: /* @__PURE__ */ jsx("div", { className: "container py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold gradient-text mb-2", children: "Quiz Library" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400", children: "Join a live quiz session using a PIN code." })
      ] }),
      user && /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => navigate("/sessions"), className: "shrink-0", children: [
        /* @__PURE__ */ jsx(LayoutDashboard, { className: "w-5 h-5 mr-2" }),
        "Back to Sessions"
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "container py-12", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "glass-panel bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl p-8 mb-12 border-indigo-200/50 dark:border-indigo-700/40",
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4", children: "Join a Live Session" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-700 dark:text-slate-300 mb-6", children: "Enter the PIN code provided by your teacher to join a live quiz session." }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Enter PIN code (e.g., ABC123)",
                value: pinInput,
                onChange: (e) => setPinInput(e.target.value.toUpperCase()),
                onKeyPress: (e) => e.key === "Enter" && handleJoinByPin(),
                className: "w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                maxLength: 10
              }
            ) }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: handleJoinByPin,
                className: "btn-primary px-8",
                children: [
                  /* @__PURE__ */ jsx(Play, { className: "w-5 h-5 mr-2" }),
                  " Join"
                ]
              }
            )
          ] })
        ]
      }
    ) })
  ] });
}
export {
  QuizLibrary as default
};
