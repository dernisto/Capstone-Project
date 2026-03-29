import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Trophy, Users, ArrowLeft, UserMinus } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGameSocket } from "@/hooks/useGameSocket";
function HostLive() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(typeof search === "string" ? search : "");
  const pin = params.get("pin")?.trim().toUpperCase().replace(/[\s-]+/g, "") ?? "";
  const [participants, setParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const socketRef = useGameSocket();
  useEffect(() => {
    const s = socketRef.current;
    if (!pin || !s) return;
    const join = () => {
      if (socketRef.current) {
        socketRef.current.emit("join-game", pin);
        socketRef.current.emit("get-results", { gamePin: pin });
      }
    };
    if (s.connected) join();
    else s.on("connect", join);
    const onLobbyState = (payload) => {
      if (payload?.players != null) {
        setParticipants(payload.players.filter((p) => p.playerName !== "Host"));
      }
    };
    const onUpdate = (payload) => {
      if (payload?.leaderboard != null) setLeaderboard(payload.leaderboard);
    };
    const onResults = (payload) => {
      if (payload?.leaderboard != null) setLeaderboard(payload.leaderboard);
    };
    s.on("lobby-state", onLobbyState);
    s.on("leaderboard-update", onUpdate);
    s.on("results-data", onResults);
    return () => {
      s.off("lobby-state", onLobbyState);
      s.off("leaderboard-update", onUpdate);
      s.off("results-data", onResults);
      s.off("connect", join);
    };
  }, [socketRef, pin]);
  const kickPlayer = (socketId) => {
    if (!pin || !socketRef.current) return;
    socketRef.current.emit("kick-player", { gamePin: pin, socketId });
  };
  if (!pin) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "glass-panel p-8 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mb-4", children: "Missing game PIN." }),
      /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/"), children: "Go Home" })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950", children: /* @__PURE__ */ jsxs("div", { className: "container py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold gradient-text", children: "Live Leaderboard" }),
        /* @__PURE__ */ jsxs("p", { className: "text-slate-600 dark:text-slate-400 mt-1", children: [
          "PIN ",
          pin,
          " \xB7 Scores update as players answer"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "ghost", onClick: () => navigate("/sessions"), children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5 mr-2" }),
        "Sessions"
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "glass-panel p-8 mb-8",
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsx(Users, { className: "w-6 h-6 text-indigo-500" }),
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: "Participants" })
          ] }),
          participants.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 text-sm", children: "No players in the game yet." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: participants.map((p) => /* @__PURE__ */ jsxs(
            "li",
            {
              className: "flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600",
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-900 dark:text-white", children: p.playerName }),
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    className: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800",
                    onClick: () => kickPlayer(p.socketId),
                    children: [
                      /* @__PURE__ */ jsx(UserMinus, { className: "w-4 h-4 mr-1" }),
                      "Kick"
                    ]
                  }
                )
              ]
            },
            p.socketId
          )) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "glass-panel p-8",
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-6", children: [
            /* @__PURE__ */ jsx(Trophy, { className: "w-6 h-6 text-amber-500" }),
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: "Scores" })
          ] }),
          leaderboard.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
            /* @__PURE__ */ jsx(Users, { className: "w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 font-medium", children: "No scores yet" }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-500 text-sm mt-1", children: "Scores will appear here as players answer questions." })
          ] }) : /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: leaderboard.map((entry, i) => /* @__PURE__ */ jsxs(
            motion.li,
            {
              className: "flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600",
              initial: { opacity: 0, x: -10 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: i * 0.03 },
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: `w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white ${entry.rank === 1 ? "bg-amber-500" : entry.rank === 2 ? "bg-slate-400" : entry.rank === 3 ? "bg-amber-700" : "bg-slate-500"}`,
                      children: entry.rank
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-semibold text-slate-900 dark:text-white", children: entry.name }),
                    entry.totalQuestions != null && /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: [
                      entry.correctAnswers ?? 0,
                      "/",
                      entry.totalQuestions,
                      " correct"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-indigo-600 dark:text-indigo-400", children: entry.score })
              ]
            },
            `${entry.name}-${entry.rank}`
          )) })
        ]
      }
    )
  ] }) });
}
export {
  HostLive as default
};
