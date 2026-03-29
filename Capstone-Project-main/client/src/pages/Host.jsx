import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Copy, Check, Users, Play, Trophy, Circle } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGameSocket } from "@/hooks/useGameSocket";
import { GameChat } from "@/components/GameChat";
import { getDemoQuizByPin } from "@/_core/demoQuizzes";
import { toast } from "sonner";
import { persistHostSession, normalizeClientPin } from "@/lib/gameSessionStorage";
import {
  quizPageShell,
  quizPageGradient,
  quizPageRadialGlow,
  quizCard,
  quizBtnPrimary,
  quizFocusGlow,
  quizLeaderTop,
  quizSurfaceSoft,
  textSecondary
} from "@/lib/quizTheme";
function randomPin() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}
function Host() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const socketRef = useGameSocket();
  const [gamePin, setGamePin] = useState(() => {
    if (typeof window === "undefined") return randomPin();
    const params = new URLSearchParams(window.location.search);
    return params.get("gamePin")?.trim().toUpperCase() || randomPin();
  });
  const [players, setPlayers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [live, setLive] = useState(false);
  const [phase, setPhase] = useState("lobby");
  const [quizTitle, setQuizTitle] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [qCount, setQCount] = useState(0);
  const [hostQText, setHostQText] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  useEffect(() => {
    const params = new URLSearchParams(typeof search === "string" ? search : "");
    const pin2 = params.get("gamePin")?.trim().toUpperCase();
    if (pin2) setGamePin(pin2);
  }, [search]);
  useEffect(() => {
    const s = socketRef.current;
    const pin2 = normalizeClientPin(gamePin);
    if (!pin2) return;
    persistHostSession(pin2);
    const join = () => socketRef.current?.emit("join-game", pin2);
    if (s?.connected) join();
    else s?.on("connect", join);
    const onJoined = (payload) => {
      setPlayers((prev) => {
        const idx = prev.findIndex((p) => p.socketId === payload.socketId);
        if (idx >= 0) {
          const n = [...prev];
          n[idx] = payload;
          return n;
        }
        return [...prev, payload];
      });
    };
    const onLobby = (payload) => {
      if (payload?.players) setPlayers(payload.players);
    };
    const onSession = (p) => {
      if (p.quizTitle) setQuizTitle(p.quizTitle);
      if (typeof p.questionCount === "number") setQCount(p.questionCount);
      if (p.finished || p.phase === "finished") {
        setPhase("finished");
        setLive(true);
        if (p.leaderboard) setLeaderboard(p.leaderboard);
        return;
      }
      if (p.phase === "question") {
        setLive(true);
        setPhase("question");
        setQIndex(p.questionIndex ?? 0);
        if (p.question?.text) setHostQText(p.question.text);
      }
      if (p.phase === "leaderboard" && p.leaderboard) {
        setPhase("leaderboard");
        setLeaderboard(p.leaderboard);
      }
    };
    const onLB = (payload) => {
      if (payload.leaderboard) setLeaderboard(payload.leaderboard);
    };
    s?.on("student-joined", onJoined);
    s?.on("lobby-state", onLobby);
    s?.on("session-state", onSession);
    s?.on("leaderboard-update", onLB);
    socketRef.current?.emit("sync-game", { gamePin: pin2 });
    return () => {
      s?.off("student-joined", onJoined);
      s?.off("lobby-state", onLobby);
      s?.off("session-state", onSession);
      s?.off("leaderboard-update", onLB);
      s?.off("connect", join);
    };
  }, [socketRef, gamePin]);
  const startQuiz = () => {
    const pin2 = normalizeClientPin(gamePin);
    if (!pin2 || !socketRef.current) return;
    const quiz = getDemoQuizByPin(pin2);
    if (!quiz?.questions?.filter((q) => q.text?.trim())?.length) {
      toast.error("No quiz for this PIN. Create one in Teacher Dashboard.");
      return;
    }
    const questions = quiz.questions.filter((q) => q.text?.trim()).map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options?.length ? q.options : ["A", "B"],
      correctOptionIndex: q.correctOptionIndex ?? 0,
      timeLimit: q.timeLimit ?? 30
    }));
    socketRef.current.emit("host-start-quiz", {
      gamePin: pin2,
      quizTitle: quiz.title,
      questions
    });
    toast.success("Quiz started.");
  };
  const copyPin = () => {
    if (gamePin) {
      navigator.clipboard.writeText(normalizeClientPin(gamePin));
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    }
  };
  const sortedLB = [...leaderboard].sort((a, b) => a.rank - b.rank);
  const pin = normalizeClientPin(gamePin);
  return /* @__PURE__ */ jsxs("div", { className: quizPageShell, children: [
    /* @__PURE__ */ jsx("div", { className: quizPageGradient, "aria-hidden": true }),
    /* @__PURE__ */ jsx("div", { className: quizPageRadialGlow, "aria-hidden": true }),
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-20 border-b border-[#E9E7FF] bg-white/75 backdrop-blur-md shadow-[0_4px_24px_rgba(108,59,255,0.06)]", children: /* @__PURE__ */ jsxs("div", { className: "container max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 relative z-10", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          "p",
          {
            className: `text-xs font-medium ${textSecondary} uppercase tracking-wider mb-1`,
            children: "Game PIN"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-3xl font-semibold tracking-[0.18em] font-mono text-[#1A1A1A]", children: pin }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: copyPin,
              className: `rounded-xl border-[#E9E7FF] bg-white/90 text-[#1A1A1A] hover:bg-[#FAFAFF] hover:border-[#6C3BFF] transition-all duration-250 ${quizFocusGlow}`,
              children: copied ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        live && /* @__PURE__ */ jsxs("span", { className: `flex items-center gap-2 text-sm ${textSecondary}`, children: [
          /* @__PURE__ */ jsx(Circle, { className: "w-2 h-2 fill-[#22C55E] text-[#22C55E]" }),
          "Live"
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            className: `${textSecondary} rounded-xl hover:bg-[rgba(108,59,255,0.08)] transition-all duration-250 ${quizFocusGlow}`,
            onClick: () => navigate("/"),
            children: "Leave"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 container max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-12 gap-6 items-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 space-y-6", children: [
          !live && /* @__PURE__ */ jsxs(
            motion.div,
            {
              className: quizCard,
              initial: { opacity: 0, scale: 0.99 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.28, ease: "easeOut" },
              children: [
                /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[#1A1A1A] mb-2", children: "Ready to start" }),
                /* @__PURE__ */ jsx("p", { className: `text-sm ${textSecondary} mb-6 leading-relaxed`, children: "Share the PIN above. When players have joined, start the quiz." }),
                /* @__PURE__ */ jsxs(Button, { onClick: startQuiz, className: `h-11 px-6 ${quizBtnPrimary}`, children: [
                  /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 mr-2" }),
                  "Start quiz"
                ] })
              ]
            }
          ),
          live && phase !== "finished" && /* @__PURE__ */ jsxs(
            motion.div,
            {
              className: quizCard,
              initial: { opacity: 0, scale: 0.99 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.28, ease: "easeOut" },
              children: [
                /* @__PURE__ */ jsx("p", { className: `text-xs font-medium ${textSecondary} uppercase tracking-wide mb-2`, children: "Question status" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-[#6C3BFF] font-medium mb-3", children: phase === "question" ? `Question ${qIndex + 1} of ${qCount || "?"}` : phase === "leaderboard" ? "Leaderboard" : "\u2014" }),
                phase === "question" && hostQText && /* @__PURE__ */ jsx("p", { className: "text-base text-[#1A1A1A] leading-relaxed border-l-2 border-[#6C3BFF] pl-4", children: hostQText }),
                phase === "leaderboard" && /* @__PURE__ */ jsx("p", { className: `${textSecondary} text-sm`, children: "Players are viewing standings." })
              ]
            }
          ),
          live && phase === "finished" && /* @__PURE__ */ jsxs("div", { className: quizCard, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsx(Trophy, { className: "w-5 h-5 text-[#6C3BFF]", strokeWidth: 1.5 }),
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Session complete" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: `text-sm ${textSecondary} mb-6`, children: quizTitle }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-4", children: sortedLB.slice(0, 3).map((r, i) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: `flex-1 min-w-[140px] p-5 rounded-2xl ${quizLeaderTop} transition-all duration-250 hover:shadow-[0_8px_24px_rgba(108,59,255,0.1)]`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-base mr-2 opacity-90", "aria-hidden": true, children: i === 0 ? "\u{1F947}" : i === 1 ? "\u{1F948}" : "\u{1F949}" }),
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-[#1A1A1A]", children: r.name }),
                  /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-[#6C3BFF] mt-1 tabular-nums", children: r.score })
                ]
              },
              r.socketId
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: quizCard, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsx(Users, { className: `w-5 h-5 ${textSecondary}`, strokeWidth: 1.5 }),
              /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-[#1A1A1A]", children: [
                "Lobby \xB7 ",
                players.length,
                " joined"
              ] })
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: players.length === 0 ? /* @__PURE__ */ jsx("li", { className: `text-sm ${textSecondary} py-2`, children: "Waiting for players\u2026" }) : players.map((p) => /* @__PURE__ */ jsxs(
              "li",
              {
                className: `flex justify-between items-center py-3 px-4 rounded-xl ${quizSurfaceSoft} text-sm transition-all duration-250 hover:shadow-[0_4px_16px_rgba(108,59,255,0.06)]`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-[#1A1A1A]", children: p.playerName }),
                  /* @__PURE__ */ jsxs("span", { className: `text-xs ${textSecondary} font-mono`, children: [
                    p.socketId.slice(0, 8),
                    "\u2026"
                  ] })
                ]
              },
              p.socketId
            )) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("aside", { className: "lg:col-span-4 lg:sticky lg:top-24", children: /* @__PURE__ */ jsx(GameChat, { socket: socketRef, gamePin: pin, playerName: "Host" }) })
      ] }),
      live && sortedLB.length > 0 && /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: `${quizCard} mt-8`,
          initial: { opacity: 0, scale: 0.99 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.28, ease: "easeOut" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-5", children: [
              /* @__PURE__ */ jsx(Trophy, { className: "w-5 h-5 text-[#6C3BFF]", strokeWidth: 1.5 }),
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-[#1A1A1A]", children: "Leaderboard" })
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: sortedLB.map((row) => /* @__PURE__ */ jsxs(
              "li",
              {
                className: `flex items-center justify-between py-3.5 px-4 rounded-xl transition-all duration-250 ${row.rank <= 3 ? quizLeaderTop : "bg-white/60 border border-[#E9E7FF] hover:shadow-[0_4px_16px_rgba(108,59,255,0.05)]"}`,
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
                    /* @__PURE__ */ jsxs("span", { className: `text-sm ${textSecondary} w-8 shrink-0 tabular-nums`, children: [
                      "#",
                      row.rank
                    ] }),
                    row.rank <= 3 && /* @__PURE__ */ jsx("span", { className: "text-sm shrink-0 opacity-90", "aria-hidden": true, children: row.rank === 1 ? "\u{1F947}" : row.rank === 2 ? "\u{1F948}" : "\u{1F949}" }),
                    /* @__PURE__ */ jsx("span", { className: "font-medium text-[#1A1A1A] truncate", children: row.name }),
                    (row.streak ?? 0) >= 3 && /* @__PURE__ */ jsxs("span", { className: `text-xs ${textSecondary} shrink-0`, children: [
                      row.streak,
                      " streak"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-[#6C3BFF] tabular-nums shrink-0 ml-2", children: row.score })
                ]
              },
              row.socketId
            )) })
          ]
        }
      )
    ] })
  ] });
}
export {
  Host as default
};
