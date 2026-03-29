import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGameSocket } from "@/hooks/useGameSocket";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RadioTower, Trophy, ArrowLeft, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
function normalizePin(pin) {
  return (pin || "").trim().toUpperCase().replace(/[\s-]+/g, "");
}
function medalClass(rank) {
  if (rank === 1) return "bg-amber-500";
  if (rank === 2) return "bg-slate-400";
  if (rank === 3) return "bg-amber-700";
  return "bg-slate-500";
}
function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}
function rankSuffix(rank) {
  if (rank % 100 >= 11 && rank % 100 <= 13) return `${rank}th`;
  const last = rank % 10;
  if (last === 1) return `${rank}st`;
  if (last === 2) return `${rank}nd`;
  if (last === 3) return `${rank}rd`;
  return `${rank}th`;
}
function Leaderboard() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(typeof search === "string" ? search : "");
  const initialPin = normalizePin(params.get("pin") ?? "");
  const socketRef = useGameSocket();
  const [pin, setPin] = useState(initialPin);
  const [pinInput, setPinInput] = useState(initialPin);
  const [rows, setRows] = useState([]);
  const prevRankByUser = useRef(/* @__PURE__ */ new Map());
  const [status, setStatus] = useState(
    initialPin ? "connecting" : "idle"
  );
  const isLive = useMemo(() => {
    const s = socketRef.current;
    return !!s?.connected && !!pin;
  }, [socketRef, pin]);
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !pin) return;
    const roomPin = normalizePin(pin);
    setStatus(s.connected ? "connecting" : "connecting");
    const join = () => {
      s.emit("student-join", { gamePin: roomPin, playerName: "Viewer" });
      s.emit("get-results", { gamePin: roomPin });
    };
    if (s.connected) join();
    else s.on("connect", join);
    const onUpdate = (payload) => {
      if (!payload?.leaderboard) return;
      const next = payload.leaderboard;
      const map = new Map(prevRankByUser.current);
      next.forEach((r) => {
        map.set(r.userId ?? r.socketId, r.rank);
      });
      prevRankByUser.current = map;
      setRows(next);
      setStatus("live");
    };
    s.on("leaderboard-update", onUpdate);
    s.on("results-data", onUpdate);
    return () => {
      s.off("connect", join);
      s.off("leaderboard-update", onUpdate);
      s.off("results-data", onUpdate);
    };
  }, [socketRef, pin]);
  const submitPin = () => {
    const p = normalizePin(pinInput);
    setPin(p);
    setRows([]);
    const nextUrl = p ? `/leaderboard?pin=${encodeURIComponent(p)}` : "/leaderboard";
    navigate(nextUrl);
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950", children: /* @__PURE__ */ jsxs("div", { className: "container py-8 max-w-3xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold gradient-text", children: "Live Leaderboard" }),
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full border border-rose-300/70 dark:border-rose-800/70 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-200", children: [
            /* @__PURE__ */ jsx(RadioTower, { className: "w-3.5 h-3.5" }),
            "Live"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mt-1", children: pin ? /* @__PURE__ */ jsxs(Fragment, { children: [
          "PIN ",
          /* @__PURE__ */ jsx("span", { className: "font-mono font-semibold", children: pin }),
          " \xB7 Updates instantly as players answer"
        ] }) : "Enter a game PIN to view the live standings." })
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "ghost", onClick: () => navigate("/sessions"), children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5 mr-2" }),
        "Sessions"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass-panel p-6 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-[1fr_auto] gap-3 items-end", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "pin", children: "Game PIN" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "pin",
              value: pinInput,
              onChange: (e) => setPinInput(e.target.value),
              placeholder: "e.g., ABC123",
              onKeyDown: (e) => {
                if (e.key === "Enter") submitPin();
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "btn-primary", onClick: submitPin, disabled: !normalizePin(pinInput), children: "View" })
      ] }),
      pin && /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-3", children: [
        "Status:",
        " ",
        /* @__PURE__ */ jsx("span", { className: isLive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500", children: isLive ? "connected" : "connecting\u2026" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass-panel p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-6", children: [
        /* @__PURE__ */ jsx(Trophy, { className: "w-6 h-6 text-amber-500" }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "Standings" })
      ] }),
      rows.length === 0 && pin && status !== "idle" ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "w-10 h-10 text-slate-400 animate-spin mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-700 dark:text-slate-300 font-medium", children: "Fetching live scores\u2026" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-500 text-sm mt-1", children: "This updates automatically during the game." })
      ] }) : rows.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
        /* @__PURE__ */ jsx(Users, { className: "w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-700 dark:text-slate-300 font-medium", children: pin ? "Waiting for live scores\u2026" : "No game selected" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-500 text-sm mt-1", children: "Scores will appear here as players join and answer questions." })
      ] }) : /* @__PURE__ */ jsx(motion.ul, { layout: true, className: "space-y-3", children: /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: rows.map((r) => {
        const displayName = r.username ?? r.name;
        const key = r.userId ?? r.socketId;
        const badge = r.rank === 1 ? "Champion" : r.rank === 2 ? "Runner-up" : r.rank === 3 ? "Top 3" : null;
        return /* @__PURE__ */ jsxs(
          motion.li,
          {
            layout: true,
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: { type: "spring", stiffness: 520, damping: 40 },
            className: [
              "flex items-center justify-between p-4 rounded-xl border",
              r.rank <= 3 ? "bg-gradient-to-r from-amber-50/80 to-white/60 dark:from-amber-950/30 dark:to-slate-900/40 border-amber-200/70 dark:border-amber-900/60" : "bg-white/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
            ].join(" "),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white ${medalClass(
                      r.rank
                    )}`,
                    children: r.rank
                  }
                ),
                /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 flex items-center justify-center font-bold", children: initials(displayName) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-semibold text-slate-900 dark:text-white", children: displayName }),
                    /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: [
                      rankSuffix(r.rank),
                      badge ? ` \xB7 ${badge}` : ""
                    ] })
                  ] })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-indigo-600 dark:text-indigo-400", children: r.score }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: "points" })
              ] })
            ]
          },
          key
        );
      }) }) })
    ] })
  ] }) });
}
export {
  Leaderboard as default
};
