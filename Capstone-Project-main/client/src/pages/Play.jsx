import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Volume2, VolumeX } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSocket } from "@/hooks/useGameSocket";
import { GameChat } from "@/components/GameChat";
import {
  normalizeClientPin,
  persistPlayerSession,
  readPlayerSession,
  clearPlayerSession,
  getOrCreatePlayerId,
  readGamePin
} from "@/lib/gameSessionStorage";
import {
  playTick,
  playCorrect,
  playWrong,
  playLeaderboardReveal,
  unlockAudio
} from "@/lib/quizSounds";
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
const SOUND_KEY = "quizpulse_sound";
function soundOn() {
  try {
    return localStorage.getItem(SOUND_KEY) === "1";
  } catch {
    return false;
  }
}
function QuizAtmosphere({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: quizPageShell, children: [
    /* @__PURE__ */ jsx("div", { className: quizPageGradient, "aria-hidden": true }),
    /* @__PURE__ */ jsx("div", { className: quizPageRadialGlow, "aria-hidden": true }),
    /* @__PURE__ */ jsx("div", { className: "relative z-10", children })
  ] });
}
function Play() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const socketRef = useGameSocket();
  const [gamePin, setGamePin] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerId] = useState(() => getOrCreatePlayerId());
  const [joined, setJoined] = useState(false);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [screen, setScreen] = useState("lobby");
  const [quizTitle, setQuizTitle] = useState("");
  const [qCount, setQCount] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [activeQ, setActiveQ] = useState(null);
  const [endsAt, setEndsAt] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [mySocketId, setMySocketId] = useState("");
  const [streak, setStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const lastQRef = useRef(-1);
  const submittedRef = useRef(-1);
  useEffect(() => {
    setSoundEnabled(soundOn());
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(typeof search === "string" ? search : "");
    let pin = normalizeClientPin(params.get("gamePin") || "");
    if (!pin) pin = readGamePin() || readPlayerSession()?.pin || "";
    const name = params.get("playerName")?.trim() || readPlayerSession()?.playerName || (pin ? sessionStorage.getItem(`quizpulse_name_${pin}`)?.trim() : "") || "";
    setGamePin(pin);
    setPlayerName(name || "Guest");
    if (pin && name) {
      sessionStorage.setItem(`quizpulse_name_${pin}`, name);
      persistPlayerSession(pin, name, playerId);
    }
  }, [search, playerId]);
  useEffect(() => {
    const s = socketRef.current;
    const pin = normalizeClientPin(gamePin);
    const name = playerName.trim() || "Guest";
    if (!s || !pin) return;
    const go = () => {
      setMySocketId(socketRef.current?.id ?? "");
      socketRef.current?.emit("student-join", { gamePin: pin, playerName: name });
      setJoined(true);
    };
    if (s.connected) go();
    else s.once("connect", go);
  }, [socketRef, gamePin, playerName]);
  const applyState = useCallback(
    (p) => {
      if (p.quizTitle) setQuizTitle(p.quizTitle);
      if (typeof p.questionCount === "number") setQCount(p.questionCount);
      if (p.finished || p.phase === "finished") {
        if (soundOn()) playLeaderboardReveal();
        setScreen("podium");
        if (p.leaderboard) setLeaderboard(p.leaderboard);
        return;
      }
      if (p.phase === "question" && p.question) {
        const qi = p.questionIndex ?? 0;
        if (lastQRef.current !== qi) {
          lastQRef.current = qi;
          submittedRef.current = -1;
          setLocked(false);
          setSelected(null);
          setFeedback(null);
        }
        setQIndex(qi);
        setActiveQ(p.question);
        const e = p.questionEndsAt ?? Date.now() + p.question.timeLimit * 1e3;
        setEndsAt(e);
        setTimeLeft(Math.max(0, Math.ceil((e - Date.now()) / 1e3)));
        setScreen("question");
        return;
      }
      if (p.phase === "leaderboard" && p.leaderboard) {
        if (soundOn()) playLeaderboardReveal();
        setLeaderboard(p.leaderboard);
        setScreen("leaderboard");
      }
    },
    []
  );
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !gamePin) return;
    const pin = normalizeClientPin(gamePin);
    const onLobby = (payload) => {
      if (payload?.players) setLobbyPlayers(payload.players);
    };
    const onSession = (payload) => applyState(payload);
    const onGameStarted = () => {
      s.emit("sync-game", { gamePin: pin });
    };
    const onLB = (payload) => {
      if (payload.leaderboard) setLeaderboard(payload.leaderboard);
    };
    const onAns = (r) => {
      if (soundOn()) {
        unlockAudio();
        if (r.correct) playCorrect();
        else playWrong();
      }
      setStreak(r.streak);
      const tier = r.speedTier || "ok";
      const msgs = {
        lightning: "Fast answer",
        fast: "Quick response",
        ok: "Correct",
        slow: "Correct (slower)",
        timeout: "Time's up"
      };
      setFeedback({
        ok: r.correct,
        pts: r.points,
        msg: r.correct ? msgs[tier] || "Correct" : "Incorrect",
        sub: r.correct ? `+${r.points} pts \xB7 streak bonus ${r.streakBonus || 0}` : "Streak reset"
      });
    };
    const onReject = () => {
      setLocked(false);
      submittedRef.current = -1;
    };
    const onKicked = () => {
      clearPlayerSession();
      navigate("/join");
    };
    s.on("lobby-state", onLobby);
    s.on("session-state", onSession);
    s.on("gameStarted", onGameStarted);
    s.on("leaderboard-update", onLB);
    s.on("answer-recorded", onAns);
    s.on("answer-rejected", onReject);
    s.on("you-were-kicked", onKicked);
    s.emit("sync-game", { gamePin: pin });
    return () => {
      s.off("lobby-state", onLobby);
      s.off("session-state", onSession);
      s.off("gameStarted", onGameStarted);
      s.off("leaderboard-update", onLB);
      s.off("answer-recorded", onAns);
      s.off("answer-rejected", onReject);
      s.off("you-were-kicked", onKicked);
    };
  }, [socketRef, gamePin, applyState, navigate]);
  const lastTickSec = useRef(-1);
  useEffect(() => {
    if (screen !== "question" || !endsAt || locked) return;
    const t = setInterval(() => {
      const sec = Math.max(0, Math.ceil((endsAt - Date.now()) / 1e3));
      setTimeLeft(sec);
      if (soundOn() && sec <= 10 && sec > 0 && sec !== lastTickSec.current) {
        lastTickSec.current = sec;
        playTick();
      }
      if (sec <= 0 && socketRef.current && gamePin) {
        if (submittedRef.current !== qIndex) {
          submittedRef.current = qIndex;
          setLocked(true);
          socketRef.current.emit("player-answer", {
            gamePin: normalizeClientPin(gamePin),
            selectedIndex: -1
          });
        }
      }
    }, 200);
    return () => clearInterval(t);
  }, [screen, endsAt, locked, gamePin, qIndex, socketRef]);
  const submit = (idx) => {
    if (!socketRef.current || locked || !gamePin) return;
    if (soundOn()) unlockAudio();
    submittedRef.current = qIndex;
    setLocked(true);
    socketRef.current.emit("player-answer", {
      gamePin: normalizeClientPin(gamePin),
      selectedIndex: idx
    });
  };
  const timeLimit = activeQ?.timeLimit ?? 30;
  const timerPct = timeLimit > 0 ? Math.min(100, Math.max(0, timeLeft / timeLimit * 100)) : 0;
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      if (next) {
        localStorage.setItem(SOUND_KEY, "1");
        unlockAudio();
      } else localStorage.removeItem(SOUND_KEY);
    } catch {
    }
  };
  const optionBase = "w-full text-left rounded-xl px-4 py-4 text-[#1A1A1A] font-medium transition-all duration-250 ease-out hover:-translate-y-px hover:bg-[#F3F0FF] hover:border-[#6C3BFF] hover:shadow-[0_4px_16px_rgba(108,59,255,0.08)]";
  if (!gamePin) {
    return /* @__PURE__ */ jsx(QuizAtmosphere, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center gap-6 p-8", children: [
      /* @__PURE__ */ jsx("p", { className: textSecondary, children: "Join with a game code first." }),
      /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/join"), className: `h-11 px-6 ${quizBtnPrimary}`, children: "Go to Join" })
    ] }) });
  }
  if (screen === "podium") {
    const top = [...leaderboard].sort((a, b) => a.rank - b.rank).slice(0, 3);
    const me = leaderboard.find((r) => r.socketId === mySocketId);
    return /* @__PURE__ */ jsx(QuizAtmosphere, { children: /* @__PURE__ */ jsxs("div", { className: "container max-w-2xl mx-auto px-4 sm:px-6 py-12", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.98 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.28, ease: "easeOut" },
          className: "text-center mb-10",
          children: [
            /* @__PURE__ */ jsx(Trophy, { className: "w-10 h-10 text-[#6C3BFF] mx-auto mb-3 drop-shadow-[0_4px_12px_rgba(108,59,255,0.25)]", strokeWidth: 1.5 }),
            /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-semibold text-[#1A1A1A]", children: "Session complete" }),
            /* @__PURE__ */ jsx("p", { className: `${textSecondary} mt-2`, children: quizTitle })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-5 mb-10", children: top.map((row, i) => /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.98 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.28, delay: i * 0.05, ease: "easeOut" },
          className: `w-full sm:w-[calc(33.333%-0.85rem)] min-w-[160px] max-w-[210px] p-6 rounded-2xl ${quizLeaderTop} shadow-[0_6px_20px_rgba(108,59,255,0.1)] border border-[#E9E7FF]/80 bg-white/70 backdrop-blur-sm`,
          children: [
            /* @__PURE__ */ jsx("p", { className: "text-base mb-2 opacity-90", "aria-hidden": true, children: i === 0 ? "\u{1F947}" : i === 1 ? "\u{1F948}" : "\u{1F949}" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-[#1A1A1A] truncate", children: row.name }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-[#6C3BFF] mt-1 tabular-nums", children: row.score })
          ]
        },
        row.socketId
      )) }),
      me && /* @__PURE__ */ jsxs("p", { className: `text-center text-sm ${textSecondary} mb-8`, children: [
        "You \xB7 #",
        me.rank,
        " \xB7 ",
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-[#1A1A1A]", children: me.score }),
        " pts"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(
        Button,
        {
          className: `h-11 px-6 ${quizBtnPrimary}`,
          onClick: () => navigate(
            `/results/demo?pin=${encodeURIComponent(gamePin)}&playerName=${encodeURIComponent(playerName)}`
          ),
          children: "Full results"
        }
      ) })
    ] }) });
  }
  if (screen === "leaderboard") {
    const sorted = [...leaderboard].sort((a, b) => a.rank - b.rank);
    return /* @__PURE__ */ jsx(QuizAtmosphere, { children: /* @__PURE__ */ jsxs("div", { className: "container max-w-lg mx-auto px-4 sm:px-6 py-8", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: `${quizCard} mb-6`,
          initial: { opacity: 0, scale: 0.99 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.28, ease: "easeOut" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx(Trophy, { className: "w-5 h-5 text-[#6C3BFF]", strokeWidth: 1.5 }),
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Leaderboard" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: `text-sm ${textSecondary}`, children: "Next question soon" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: sorted.map((row, i) => /* @__PURE__ */ jsxs(
        motion.li,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.22, delay: Math.min(i * 0.03, 0.28) },
          className: `flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-250 ${row.rank <= 3 ? quizLeaderTop : row.socketId === mySocketId ? "bg-[#EDE9FF]/80 border-2 border-[#6C3BFF] shadow-[0_0_0_3px_rgba(108,59,255,0.12)]" : "bg-white/70 border border-[#E9E7FF] backdrop-blur-sm shadow-[0_4px_16px_rgba(108,59,255,0.05)]"}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
              /* @__PURE__ */ jsxs("span", { className: `text-sm ${textSecondary} w-7 shrink-0 tabular-nums`, children: [
                "#",
                row.rank
              ] }),
              row.rank <= 3 && /* @__PURE__ */ jsx("span", { className: "text-sm shrink-0 opacity-90", "aria-hidden": true, children: row.rank === 1 ? "\u{1F947}" : row.rank === 2 ? "\u{1F948}" : "\u{1F949}" }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-[#1A1A1A] truncate", children: row.name }),
                (row.streak ?? 0) >= 2 && /* @__PURE__ */ jsxs("p", { className: `text-xs ${textSecondary}`, children: [
                  row.streak,
                  " streak"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-[#6C3BFF] tabular-nums shrink-0 ml-2", children: row.score })
          ]
        },
        row.socketId
      )) })
    ] }) });
  }
  if (screen === "question" && activeQ) {
    return /* @__PURE__ */ jsx(QuizAtmosphere, { children: /* @__PURE__ */ jsxs("div", { className: "container py-6 sm:py-8 max-w-2xl mx-auto px-4 sm:px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-5", children: [
        /* @__PURE__ */ jsxs("span", { className: `text-sm font-medium ${textSecondary}`, children: [
          "Question ",
          qIndex + 1,
          " of ",
          qCount || "?"
        ] }),
        streak >= 2 && /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-[#6C3BFF] px-2 py-0.5 rounded-lg bg-[rgba(108,59,255,0.1)]", children: [
          streak,
          " streak"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("div", { className: "h-2.5 rounded-full bg-[#E9E7FF] overflow-hidden shadow-inner", children: /* @__PURE__ */ jsx(
          motion.div,
          {
            className: "h-full rounded-full bg-gradient-to-r from-[#6C3BFF] to-[#8A63FF] shadow-[0_0_12px_rgba(108,59,255,0.35)]",
            initial: false,
            animate: { width: `${timerPct}%` },
            transition: { duration: 0.2, ease: "linear" }
          }
        ) }),
        /* @__PURE__ */ jsxs("p", { className: `text-center text-sm ${textSecondary} mt-3 tabular-nums`, children: [
          timeLeft,
          "s"
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        motion.div,
        {
          className: `${quizCard} mb-8`,
          initial: { opacity: 0, scale: 0.99 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.28, ease: "easeOut" },
          children: /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-semibold text-center leading-snug text-[#1A1A1A]", children: activeQ.text })
        },
        qIndex
      ),
      /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: activeQ.options.map((opt, i) => {
        const isSel = selected === i;
        const showResult = locked && feedback && isSel;
        const correctStyle = showResult && feedback.ok;
        const wrongStyle = showResult && !feedback.ok;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            disabled: locked,
            onClick: () => !locked && setSelected(i),
            className: [
              optionBase,
              "bg-white border",
              correctStyle ? "border-2 border-[#22C55E] bg-[#F0FDF4] shadow-[0_0_0_3px_rgba(34,197,94,0.12)]" : wrongStyle ? "border-2 border-[#EF4444] bg-[#FEF2F2] shadow-[0_0_0_3px_rgba(239,68,68,0.1)]" : isSel ? "border-2 border-[#6C3BFF] bg-[#EDE9FF] shadow-[0_0_0_3px_rgba(108,59,255,0.15)]" : "border-[#E9E7FF]",
              locked && !isSel ? "opacity-65 pointer-events-none" : ""
            ].join(" "),
            children: [
              /* @__PURE__ */ jsx("span", { className: "inline-flex w-8 h-8 rounded-lg bg-[#FAFAFF] border border-[#E9E7FF] items-center justify-center text-sm text-[#6B7280] mr-3 align-middle", children: String.fromCharCode(65 + i) }),
              opt
            ]
          },
          i
        );
      }) }),
      !locked && /* @__PURE__ */ jsx(
        Button,
        {
          className: `w-full mt-6 h-12 text-base font-medium ${quizBtnPrimary}`,
          disabled: selected === null,
          onClick: () => selected !== null && submit(selected),
          children: "Submit answer"
        }
      ),
      /* @__PURE__ */ jsx(AnimatePresence, { children: feedback && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.99 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.25, ease: "easeOut" },
          className: `mt-6 p-6 rounded-2xl border text-center backdrop-blur-sm ${feedback.ok ? "border-[#22C55E]/25 bg-[#F0FDF4]/90 text-[#166534] shadow-[0_6px_20px_rgba(34,197,94,0.08)]" : "border-[#EF4444]/25 bg-[#FEF2F2]/90 text-[#991B1B] shadow-[0_6px_20px_rgba(239,68,68,0.06)]"}`,
          children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold mb-1", children: feedback.msg }),
            /* @__PURE__ */ jsx("p", { className: "text-sm opacity-90", children: feedback.sub }),
            feedback.ok && /* @__PURE__ */ jsxs("p", { className: "text-xl font-semibold text-[#6C3BFF] mt-2", children: [
              "+",
              feedback.pts,
              " pts"
            ] })
          ]
        }
      ) })
    ] }) });
  }
  return /* @__PURE__ */ jsx(QuizAtmosphere, { children: /* @__PURE__ */ jsxs("div", { className: "container max-w-5xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-between items-start gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[#1A1A1A]", children: "Lobby" }),
        /* @__PURE__ */ jsxs("p", { className: `text-sm ${textSecondary} mt-1`, children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-[#1A1A1A]", children: playerName }),
          /* @__PURE__ */ jsx("span", { className: "mx-2", children: "\xB7" }),
          /* @__PURE__ */ jsx("span", { className: "font-mono tracking-widest text-[#6C3BFF]", children: gamePin })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: `rounded-xl border-[#E9E7FF] bg-white/90 text-[#6B7280] hover:bg-[#FAFAFF] hover:border-[#6C3BFF]/50 transition-all duration-250 ${quizFocusGlow}`,
            onClick: toggleSound,
            "aria-pressed": soundEnabled,
            children: [
              soundEnabled ? /* @__PURE__ */ jsx(Volume2, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(VolumeX, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { className: "ml-2 hidden sm:inline", children: soundEnabled ? "Sound on" : "Sound off" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            className: `${textSecondary} rounded-xl hover:bg-[rgba(108,59,255,0.08)] ${quizFocusGlow}`,
            onClick: () => {
              clearPlayerSession();
              navigate("/");
            },
            children: "Leave"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-12 gap-6 items-start", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-7 space-y-6", children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            className: `${quizCard} text-center py-10`,
            initial: { opacity: 0, scale: 0.99 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.28, ease: "easeOut" },
            children: joined ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-[#1A1A1A] mb-2", children: "You're in" }),
              /* @__PURE__ */ jsx("p", { className: `text-sm ${textSecondary} max-w-md mx-auto leading-relaxed`, children: "Wait for the host to start. The quiz will appear here." })
            ] }) : /* @__PURE__ */ jsx("p", { className: textSecondary, children: "Connecting\u2026" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: quizCard, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsx(Users, { className: `w-5 h-5 ${textSecondary}`, strokeWidth: 1.5 }),
            /* @__PURE__ */ jsxs("h2", { className: "font-semibold text-[#1A1A1A]", children: [
              "Players (",
              lobbyPlayers.length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: lobbyPlayers.map((p) => /* @__PURE__ */ jsxs(
            "li",
            {
              className: `flex items-center gap-2 py-3 px-4 rounded-xl ${quizSurfaceSoft} text-sm transition-all duration-250 hover:shadow-[0_4px_16px_rgba(108,59,255,0.06)]`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium text-[#1A1A1A]", children: p.playerName }),
                p.socketId === mySocketId && /* @__PURE__ */ jsx("span", { className: "text-xs text-[#6C3BFF] font-medium px-2 py-0.5 rounded-md bg-[rgba(108,59,255,0.1)]", children: "You" })
              ]
            },
            p.socketId
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-5 lg:sticky lg:top-4", children: /* @__PURE__ */ jsx(
        GameChat,
        {
          socket: socketRef,
          gamePin,
          playerName,
          className: "w-full"
        }
      ) })
    ] })
  ] }) });
}
export {
  Play as default
};
