import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Share2, Home, RotateCcw } from "lucide-react";
import { useLocation, useRoute, useSearch } from "wouter";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGameSocket } from "@/hooks/useGameSocket";
function QuizResults() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const [match, params] = useRoute("/results/:sessionId");
  const rawSessionId = params?.sessionId;
  const isDemo = rawSessionId === "demo";
  const searchParams = typeof search === "string" ? new URLSearchParams(search) : new URLSearchParams();
  const demoPin = isDemo ? searchParams.get("pin")?.trim().toUpperCase().replace(/[\s-]+/g, "") ?? "" : "";
  const [liveLeaderboard, setLiveLeaderboard] = useState(null);
  const [liveUserResult, setLiveUserResult] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(isDemo && !!demoPin);
  const [fetchError, setFetchError] = useState(null);
  const socketRef = useGameSocket();
  const requestResults = useCallback(() => {
    if (!demoPin || !socketRef.current) return;
    setResultsLoading(true);
    setFetchError(null);
    socketRef.current.emit("get-results", { gamePin: demoPin });
  }, [demoPin, socketRef]);
  useEffect(() => {
    if (loading || isDemo) return;
    if (!user) navigate("/login");
  }, [loading, user, isDemo, navigate]);
  useEffect(() => {
    if (!isDemo || !demoPin || !socketRef.current) {
      if (isDemo && !demoPin) setResultsLoading(false);
      return;
    }
    const s = socketRef.current;
    requestResults();
    const onResults = (payload) => {
      if (payload?.leaderboard != null) setLiveLeaderboard(payload.leaderboard);
      if (payload?.userResult !== void 0) setLiveUserResult(payload.userResult ?? null);
      setResultsLoading(false);
      if (payload?.leaderboard && payload.leaderboard.length === 0 && !payload?.userResult) {
        setFetchError("No quiz results for this session yet. Finish a live game first.");
      }
    };
    s.on("results-data", onResults);
    const onConnect = () => s.emit("get-results", { gamePin: demoPin });
    s.on("connect", onConnect);
    return () => {
      s.off("results-data", onResults);
      s.off("connect", onConnect);
    };
  }, [isDemo, demoPin, socketRef, requestResults]);
  const hasLeaderboard = (liveLeaderboard?.length ?? 0) > 0;
  const hasPersonal = liveUserResult != null;
  const hasData = isDemo && !resultsLoading && (hasLeaderboard || hasPersonal);
  const userResult = liveUserResult ? {
    ...liveUserResult,
    rank: liveUserResult.rank ?? 0,
    totalParticipants: liveUserResult.totalParticipants ?? liveLeaderboard?.length ?? 1,
    timeSpent: liveUserResult.questionResults?.reduce((s, q) => s + q.timeSpent, 0) ?? 0
  } : null;
  const leaderboardData = liveLeaderboard?.map((p) => ({ name: p.name, score: p.score })) ?? [];
  const questionResults = liveUserResult?.questionResults?.map((r, i) => ({
    question: `Q${i + 1}`,
    correct: r.correct,
    timeSpent: r.timeSpent,
    points: r.points ?? 0
  })) ?? [];
  const accuracyData = userResult && userResult.totalQuestions > 0 ? [
    { name: "Correct", value: userResult.correctAnswers, fill: "#10b981" },
    {
      name: "Incorrect",
      value: userResult.totalQuestions - userResult.correctAnswers,
      fill: "#ef4444"
    }
  ] : [
    { name: "Correct", value: 0, fill: "#10b981" },
    { name: "Incorrect", value: 1, fill: "#e5e7eb" }
  ];
  if (!isDemo && (loading || !user)) return null;
  if (!isDemo) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center gap-4 p-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-slate-600", children: "Results for saved sessions use the live game flow. Join a game with a PIN." }),
      /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/library"), children: "Quiz Library" })
    ] });
  }
  if (isDemo && !demoPin) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center gap-4 p-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400", children: "Missing game PIN." }),
      /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/join"), children: "Join a game" })
    ] });
  }
  if (isDemo && resultsLoading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 flex items-center justify-center", children: /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400", children: "Loading results\u2026" }) });
  }
  if (isDemo && !hasData) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center gap-6 p-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 text-center max-w-md", children: fetchError ?? "No results available. Complete a live quiz session, then open this page again." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => requestResults(), children: "Refresh" }),
        /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/library"), children: "Quiz Library" })
      ] })
    ] });
  }
  if (!userResult && hasLeaderboard) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950 p-8", children: /* @__PURE__ */ jsxs("div", { className: "container max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "Session results" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mb-8", children: "You weren\u2019t part of this game run, or joined after it started. Final standings:" }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-2 mb-10", children: liveLeaderboard.map((row) => /* @__PURE__ */ jsxs(
        "li",
        {
          className: "flex justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
          children: [
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsxs("span", { className: "font-bold text-slate-400 mr-2", children: [
                "#",
                row.rank
              ] }),
              row.name
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-bold text-indigo-600", children: [
              row.score,
              " pts"
            ] })
          ]
        },
        row.socketId ?? row.name + row.rank
      )) }),
      /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/library"), children: "Join next game" })
    ] }) });
  }
  if (!userResult) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex items-center justify-center p-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Could not load your results for this session." }),
      /* @__PURE__ */ jsx(Button, { className: "ml-4", onClick: () => navigate("/"), children: "Home" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800", children: /* @__PURE__ */ jsx("div", { className: "container py-12", children: /* @__PURE__ */ jsxs(motion.div, { className: "text-center", initial: { opacity: 0 }, animate: { opacity: 1 }, children: [
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold mb-2", children: "Quiz complete" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400", children: "Your performance from the live game (server data)." })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "container py-12", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-12 text-white mb-12 text-center",
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg opacity-90 mb-2", children: "Your score" }),
            /* @__PURE__ */ jsxs("h2", { className: "text-7xl font-bold mb-4", children: [
              userResult.score,
              /* @__PURE__ */ jsxs("span", { className: "text-3xl opacity-80", children: [
                " ",
                "/ ",
                userResult.totalScore,
                " max"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-2xl opacity-90 mb-6", children: [
              "Rank ",
              /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
                "#",
                userResult.rank
              ] }),
              " of",
              " ",
              userResult.totalParticipants
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-4 justify-center flex-wrap", children: [
              /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "outline",
                  className: "bg-white/20 border-white text-white hover:bg-white/30",
                  onClick: () => navigate("/library"),
                  children: [
                    /* @__PURE__ */ jsx(RotateCcw, { className: "w-5 h-5 mr-2" }),
                    " Another quiz"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "outline",
                  className: "bg-white/20 border-white text-white hover:bg-white/30",
                  children: [
                    /* @__PURE__ */ jsx(Share2, { className: "w-5 h-5 mr-2" }),
                    " Share"
                  ]
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-4 gap-6 mb-12", children: [
        { label: "Correct", value: userResult.correctAnswers, icon: "\u2713" },
        { label: "Accuracy", value: `${userResult.accuracy}%`, icon: "\u{1F4CA}" },
        {
          label: "Time (answered)",
          value: `${userResult.timeSpent}s`,
          icon: "\u23F1\uFE0F"
        },
        { label: "Rank", value: `#${userResult.rank}`, icon: "\u{1F3C6}" }
      ].map((stat, i) => /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.05 },
          children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl mb-2", children: stat.icon }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 text-sm mb-1", children: stat.label }),
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold", children: stat.value })
          ]
        },
        stat.label
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-8 mb-12", children: [
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            className: "bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700",
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold mb-6", children: "Answer breakdown" }),
              /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxs(PieChart, { children: [
                /* @__PURE__ */ jsx(
                  Pie,
                  {
                    data: accuracyData,
                    cx: "50%",
                    cy: "50%",
                    labelLine: false,
                    label: ({ name, value }) => `${name}: ${value}`,
                    outerRadius: 100,
                    dataKey: "value",
                    children: accuracyData.map((entry, index) => /* @__PURE__ */ jsx(Cell, { fill: entry.fill }, index))
                  }
                ),
                /* @__PURE__ */ jsx(Tooltip, {})
              ] }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            className: "bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700",
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { delay: 0.1 },
            children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold mb-6", children: "Session leaderboard" }),
              leaderboardData.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxs(BarChart, { data: leaderboardData, children: [
                /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(100,100,100,0.1)" }),
                /* @__PURE__ */ jsx(XAxis, { dataKey: "name", tick: { fontSize: 11 } }),
                /* @__PURE__ */ jsx(YAxis, {}),
                /* @__PURE__ */ jsx(Tooltip, {}),
                /* @__PURE__ */ jsx(Bar, { dataKey: "score", fill: "#6366f1", radius: [8, 8, 0, 0] })
              ] }) }) : /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-sm", children: "No other players in results." })
            ]
          }
        )
      ] }),
      questionResults.length > 0 && /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 mb-12",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold mb-6", children: "Question review" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-3", children: questionResults.map((result, i) => /* @__PURE__ */ jsx(
              "div",
              {
                className: `p-4 rounded-lg border-l-4 ${result.correct ? "bg-green-50 dark:bg-green-900/20 border-green-500" : "bg-red-50 dark:bg-red-900/20 border-red-500"}`,
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: `w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${result.correct ? "bg-green-500" : "bg-red-500"}`,
                        children: result.correct ? "\u2713" : "\u2717"
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "font-semibold", children: result.question })
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-sm text-slate-600 dark:text-slate-400", children: [
                    result.timeSpent,
                    "s \xB7 ",
                    result.points,
                    " pts"
                  ] })
                ] })
              },
              i
            )) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4 justify-center", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "lg", onClick: () => navigate("/"), children: [
          /* @__PURE__ */ jsx(Home, { className: "w-5 h-5 mr-2" }),
          " Home"
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "lg", className: "btn-primary", onClick: () => navigate("/library"), children: [
          /* @__PURE__ */ jsx(RotateCcw, { className: "w-5 h-5 mr-2" }),
          " Try another"
        ] })
      ] })
    ] })
  ] });
}
export {
  QuizResults as default
};
