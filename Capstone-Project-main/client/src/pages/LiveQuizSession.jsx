import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Send, Trophy, MessageSquare } from "lucide-react";
import { useLocation, useRoute, useSearch } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { getDemoQuizzes } from "@/_core/demoQuizzes";
import { useGameSocket } from "@/hooks/useGameSocket";
import { toast } from "sonner";
import {
  readPlayerSession,
  persistPlayerSession,
  normalizeClientPin
} from "@/lib/gameSessionStorage";
function LiveQuizSession() {
  const { user, loading } = useRequireAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const [match, params] = useRoute("/session/:sessionId");
  const rawSessionId = params?.sessionId;
  const isDemoSession = rawSessionId === "demo";
  const sessionId = match && rawSessionId && !["join", "new", "demo"].includes(rawSessionId) ? parseInt(rawSessionId) : isDemoSession ? "demo" : null;
  const isJoinFlow = rawSessionId === "join";
  const isNewFlow = rawSessionId === "new";
  const pinFromUrl = typeof search === "string" ? new URLSearchParams(search).get("pin")?.toUpperCase() : "";
  useEffect(() => {
    if (!isJoinFlow || !pinFromUrl) return;
    const demoQuizzes = getDemoQuizzes();
    const found = demoQuizzes.some(
      (q2) => q2.pin.replace(/[\s-]+/g, "") === pinFromUrl.replace(/[\s-]+/g, "")
    );
    if (found) {
      navigate(`/play?gamePin=${encodeURIComponent(pinFromUrl.replace(/[\s-]+/g, ""))}`);
    }
  }, [isJoinFlow, pinFromUrl, navigate]);
  const searchParams = typeof search === "string" ? new URLSearchParams(search) : new URLSearchParams();
  const urlPin = normalizeClientPin(searchParams.get("pin") || "");
  const stored = typeof window !== "undefined" && isDemoSession ? readPlayerSession() : null;
  const pinForDemo = isDemoSession ? urlPin || stored?.pin || "" : "";
  const playerDisplayName = searchParams.get("playerName")?.trim() || (stored?.pin === pinForDemo ? stored.playerName : "") || (pinForDemo ? sessionStorage.getItem(`quizpulse_name_${pinForDemo}`)?.trim() ?? "" : "") || "";
  useEffect(() => {
    if (!isDemoSession || !pinForDemo || !playerDisplayName) return;
    persistPlayerSession(pinForDemo, playerDisplayName);
  }, [isDemoSession, pinForDemo, playerDisplayName]);
  useEffect(() => {
    if (!isDemoSession || loading || !user) return;
    const params2 = new URLSearchParams(typeof search === "string" ? search : "");
    const pin = normalizeClientPin(params2.get("pin") || readPlayerSession()?.pin || "");
    const name = params2.get("playerName")?.trim() || readPlayerSession()?.playerName || "Guest";
    if (pin) {
      navigate(
        `/play?gamePin=${encodeURIComponent(pin)}&playerName=${encodeURIComponent(name)}`,
        { replace: true }
      );
    }
  }, [isDemoSession, loading, user, search, navigate]);
  const socketRef = useGameSocket();
  const [mySocketId, setMySocketId] = useState("");
  const [gamePhase, setGamePhase] = useState("loading");
  const [quizTitle, setQuizTitle] = useState("Live Quiz");
  const [questionCount, setQuestionCount] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [questionEndsAt, setQuestionEndsAt] = useState(0);
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const submittedForQuestion = useRef(-1);
  const lastQuestionIdxRef = useRef(-1);
  const navigatedToResults = useRef(false);
  const showHelper = (isJoinFlow || isNewFlow || match && sessionId === null && rawSessionId !== void 0) && rawSessionId !== "demo";
  const applySessionState = useCallback(
    (payload) => {
      if (payload.quizTitle) setQuizTitle(payload.quizTitle);
      if (typeof payload.questionCount === "number") {
        setQuestionCount(payload.questionCount);
      }
      const phase = payload.phase;
      if (payload.finished || phase === "finished") {
        setGamePhase("finished");
        if (pinForDemo && !navigatedToResults.current) {
          navigatedToResults.current = true;
          navigate(
            `/results/demo?pin=${encodeURIComponent(pinForDemo)}&playerName=${encodeURIComponent(playerDisplayName || "player")}`
          );
        }
        return;
      }
      if (phase === "question" && payload.question) {
        const qIdx = payload.questionIndex ?? 0;
        if (lastQuestionIdxRef.current !== qIdx) {
          lastQuestionIdxRef.current = qIdx;
          submittedForQuestion.current = -1;
          setAnswered(false);
          setSelectedAnswer(null);
          setLastFeedback(null);
        }
        setGamePhase("question");
        setQuestionIndex(qIdx);
        setActiveQuestion(payload.question);
        const ends = payload.questionEndsAt ?? Date.now() + payload.question.timeLimit * 1e3;
        setQuestionEndsAt(ends);
        const sec = Math.max(0, Math.ceil((ends - Date.now()) / 1e3));
        setTimeLeftSec(sec);
        return;
      }
      if (phase === "leaderboard" && payload.leaderboard) {
        setGamePhase("leaderboard");
        setLiveLeaderboard(payload.leaderboard);
        return;
      }
      if (phase === "lobby" || !phase || payload.questionCount === 0 && !payload.question) {
        setGamePhase("lobby");
      }
    },
    [navigate, pinForDemo, playerDisplayName]
  );
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const onKicked = () => navigate("/join");
    s.on("you-were-kicked", onKicked);
    return () => s.off("you-were-kicked", onKicked);
  }, [socketRef, navigate]);
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !pinForDemo) return;
    const joinAsPlayer = () => {
      if (!socketRef.current) return;
      if ((playerDisplayName || "").trim().toLowerCase() === "host") return;
      setMySocketId(socketRef.current.id ?? "");
      socketRef.current.emit("student-join", {
        gamePin: pinForDemo,
        playerName: playerDisplayName || `Player-${socketRef.current.id?.slice(-4) ?? "?"}`
      });
    };
    if (s.connected) joinAsPlayer();
    else s.on("connect", joinAsPlayer);
    const onSessionState = (p) => {
      applySessionState(p);
    };
    const onQuizStarted = () => {
      setTimeout(() => {
        socketRef.current?.emit("sync-game", { gamePin: pinForDemo });
      }, 400);
    };
    const onLeaderboard = (payload) => {
      if (payload?.leaderboard) setLiveLeaderboard(payload.leaderboard);
    };
    const onAnswerRecorded = (p) => {
      setLastFeedback(p);
    };
    const onChat = (entry) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: entry.username,
          message: entry.message,
          timestamp: /* @__PURE__ */ new Date()
        }
      ]);
    };
    s.on("session-state", onSessionState);
    s.on("quiz-started", onQuizStarted);
    s.on("leaderboard-update", onLeaderboard);
    s.on("answer-recorded", onAnswerRecorded);
    s.on("chat-message", onChat);
    const onAnswerRejected = (p) => {
      toast.error(p?.reason ?? "Answer not accepted");
      setAnswered(false);
      submittedForQuestion.current = -1;
    };
    s.on("answer-rejected", onAnswerRejected);
    s.emit("sync-game", { gamePin: pinForDemo });
    return () => {
      s.off("session-state", onSessionState);
      s.off("quiz-started", onQuizStarted);
      s.off("leaderboard-update", onLeaderboard);
      s.off("answer-recorded", onAnswerRecorded);
      s.off("chat-message", onChat);
      s.off("answer-rejected", onAnswerRejected);
      s.off("connect", joinAsPlayer);
    };
  }, [socketRef, pinForDemo, playerDisplayName, applySessionState]);
  useEffect(() => {
    if (gamePhase !== "question" || !questionEndsAt || answered) return;
    const tick = () => {
      const sec = Math.max(0, Math.ceil((questionEndsAt - Date.now()) / 1e3));
      setTimeLeftSec(sec);
      if (sec <= 0 && socketRef.current && pinForDemo) {
        if (submittedForQuestion.current !== questionIndex) {
          submittedForQuestion.current = questionIndex;
          setAnswered(true);
          socketRef.current.emit("player-answer", {
            gamePin: pinForDemo,
            selectedIndex: -1
          });
        }
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [gamePhase, questionEndsAt, answered, questionIndex, pinForDemo, socketRef]);
  const submitAnswer = (index) => {
    if (!pinForDemo || !socketRef.current || answered) return;
    submittedForQuestion.current = questionIndex;
    setAnswered(true);
    socketRef.current.emit("player-answer", {
      gamePin: pinForDemo,
      selectedIndex: index
    });
  };
  const handleSendMessage = () => {
    if (!chatInput.trim() || !pinForDemo || !socketRef.current) return;
    socketRef.current.emit("chat-message", {
      gamePin: pinForDemo,
      message: chatInput.trim()
    });
    setChatInput("");
  };
  const competitionBoard = [...liveLeaderboard].sort((a, b) => a.rank - b.rank);
  if (loading || !user) return null;
  if (isDemoSession) {
    const params2 = new URLSearchParams(typeof search === "string" ? search : "");
    const pin = normalizeClientPin(params2.get("pin") || readPlayerSession()?.pin || "");
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-violet-200 p-8", children: pin ? /* @__PURE__ */ jsx("p", { className: "animate-pulse", children: "Entering game\u2026" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { children: "No game code. Join from your teacher's link." }),
      /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/join"), children: "Join" })
    ] }) });
  }
  if (showHelper) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "glass-panel p-8 max-w-md text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-2", children: isJoinFlow ? "Join a session" : isNewFlow ? "Start a session" : "Session" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mb-6", children: isJoinFlow ? "Enter your teacher's PIN in the Quiz Library to join a live quiz." : isNewFlow ? "Start a live session from the Teacher Dashboard by clicking Start on a quiz." : "Use Quiz Library to join with a PIN or Dashboard to start a session." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center", children: [
        /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/library"), className: "btn-primary", children: "Quiz Library" }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => navigate("/sessions"), children: "Sessions" }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => navigate("/"), children: "Home" })
      ] })
    ] }) });
  }
  if (!isDemoSession || !pinForDemo) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 max-w-md", children: "No game code found. Open the join link from your teacher, or return to the lobby so your session can be restored." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => navigate("/join"), children: "Join page" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => {
              const g = readPlayerSession();
              if (g?.pin) {
                navigate(
                  `/session/demo?pin=${encodeURIComponent(g.pin)}&playerName=${encodeURIComponent(g.playerName)}`
                );
              } else {
                navigate("/join");
              }
            },
            children: "Restore last game"
          }
        )
      ] })
    ] });
  }
  if (gamePhase === "lobby" || gamePhase === "loading") {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex flex-col items-center justify-center p-8", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "text-center max-w-md",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold gradient-text mb-2", children: quizTitle }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mb-6", children: gamePhase === "loading" ? "Syncing with game server\u2026" : "Waiting for the host to start the quiz. Stay on this page." }),
          /* @__PURE__ */ jsxs("div", { className: "glass-panel p-6 text-left", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mb-2", children: "PIN" }),
            /* @__PURE__ */ jsx("p", { className: "font-mono text-2xl font-bold text-indigo-600", children: pinForDemo }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-4", children: "Playing as" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: playerDisplayName || "Player" })
          ] })
        ]
      }
    ) });
  }
  if (gamePhase === "leaderboard") {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 p-8", children: /* @__PURE__ */ jsxs("div", { className: "container max-w-lg mx-auto", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-center mb-8 gradient-text", children: "Leaderboard" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: competitionBoard.map((row, i) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex items-center justify-between p-4 rounded-xl ${mySocketId && row.socketId === mySocketId ? "bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-500" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold text-slate-400 w-8", children: [
                "#",
                row.rank
              ] }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: row.name })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-indigo-600", children: row.score })
          ]
        },
        row.socketId
      )) }),
      /* @__PURE__ */ jsx("p", { className: "text-center text-slate-500 mt-8 text-sm", children: "Next question in a moment\u2026" })
    ] }) });
  }
  if (gamePhase === "finished") {
    return null;
  }
  const q = activeQuestion;
  if (!q) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Loading question\u2026" }) });
  }
  const progress = questionCount > 0 ? (questionIndex + 1) / questionCount * 100 : 0;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800", children: /* @__PURE__ */ jsxs("div", { className: "container py-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold gradient-text", children: quizTitle }) }),
      /* @__PURE__ */ jsx("div", { className: "w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2", children: /* @__PURE__ */ jsx(
        motion.div,
        {
          className: "bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full",
          animate: { width: `${progress}%` },
          transition: { duration: 0.4 }
        }
      ) }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-600 dark:text-slate-400 mt-2", children: [
        "Question ",
        questionIndex + 1,
        " of ",
        questionCount || "?"
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "container py-8", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold pr-4", children: q.text }),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: `text-4xl font-bold w-20 h-20 rounded-full flex items-center justify-center shrink-0 ${timeLeftSec <= 5 ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200"}`,
                  children: timeLeftSec
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-3 mb-8", children: q.options.map((option, index) => /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => !answered && setSelectedAnswer(index),
                disabled: answered,
                className: `w-full p-4 rounded-xl border-2 transition-all text-left font-semibold ${selectedAnswer === index ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700"} ${answered ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-indigo-400"}`,
                children: [
                  /* @__PURE__ */ jsxs("span", { className: "font-bold mr-2", children: [
                    String.fromCharCode(65 + index),
                    "."
                  ] }),
                  option
                ]
              },
              index
            )) }),
            !answered && /* @__PURE__ */ jsx(
              Button,
              {
                onClick: () => selectedAnswer !== null && submitAnswer(selectedAnswer),
                disabled: selectedAnswer === null || timeLeftSec <= 0,
                className: "w-full btn-primary",
                children: "Lock answer"
              }
            ),
            answered && lastFeedback && /* @__PURE__ */ jsx(
              "div",
              {
                className: `p-4 rounded-xl text-center font-bold ${lastFeedback.correct ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"}`,
                children: lastFeedback.correct ? `Correct! +${lastFeedback.points} pts` : lastFeedback.points === 0 ? "Time's up or wrong \u2014 0 pts" : `+${lastFeedback.points} pts`
              }
            ),
            answered && !lastFeedback && /* @__PURE__ */ jsx("p", { className: "text-center text-slate-500", children: "Answer recorded\u2026" })
          ]
        },
        questionIndex
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsx(Trophy, { className: "w-5 h-5 text-yellow-500" }),
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg", children: "Live scores" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: competitionBoard.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "No scores yet" }) : competitionBoard.map((player) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: `flex justify-between p-3 rounded-lg text-sm ${mySocketId && player.socketId === mySocketId ? "bg-indigo-50 dark:bg-indigo-900/30" : "bg-slate-50 dark:bg-slate-700"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium truncate mr-2", children: player.name }),
                /* @__PURE__ */ jsx("span", { className: "font-bold text-indigo-600", children: player.score })
              ]
            },
            player.socketId
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-2xl p-6 border flex flex-col h-72", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "w-5 h-5 text-indigo-600" }),
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg", children: "Chat" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto mb-4 space-y-2 text-sm", children: chatMessages.map((msg) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
              msg.name,
              ": "
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-slate-600 dark:text-slate-400", children: msg.message })
          ] }, msg.id)) }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                className: "flex-1 px-3 py-2 rounded-lg border dark:bg-slate-700 text-sm",
                value: chatInput,
                onChange: (e) => setChatInput(e.target.value),
                onKeyDown: (e) => e.key === "Enter" && handleSendMessage(),
                placeholder: "Message\u2026"
              }
            ),
            /* @__PURE__ */ jsx(Button, { size: "sm", onClick: handleSendMessage, children: /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }) })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  LiveQuizSession as default
};
