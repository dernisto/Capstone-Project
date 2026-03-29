import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, Users, Play } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGameSocket } from "@/hooks/useGameSocket";
function ShareDemo() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(typeof search === "string" ? search : "");
  const pin = params.get("pin")?.toUpperCase() || "";
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState([]);
  const socketRef = useGameSocket();
  useEffect(() => {
    if (pin && copied) {
      const t = setTimeout(() => setCopied(false), 2e3);
      return () => clearTimeout(t);
    }
  }, [copied, pin]);
  useEffect(() => {
    const s = socketRef.current;
    if (!pin || !s) return;
    const join = () => {
      if (socketRef.current) socketRef.current.emit("join-game", pin);
    };
    if (s.connected) join();
    else s.on("connect", join);
    const onLobbyState = (payload) => {
      if (payload?.players?.length !== void 0) setPlayers(payload.players);
    };
    s.on("lobby-state", onLobbyState);
    return () => {
      s.off("lobby-state", onLobbyState);
      s.off("connect", join);
    };
  }, [socketRef, pin]);
  const copyPin = () => {
    if (!pin) return;
    navigator.clipboard.writeText(pin);
    setCopied(true);
    toast.success("PIN copied to clipboard");
  };
  const joinUrl = pin ? `${typeof window !== "undefined" ? window.location.origin : ""}/library?pin=${pin}` : "";
  const goToHost = () => {
    if (!pin) return;
    navigate(`/host?gamePin=${encodeURIComponent(pin)}`);
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "glass-panel p-8 max-w-md w-full text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-2", children: "Session ready" }),
    /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mb-6", children: "Share the PIN so players can join. When you\u2019re ready, start the game from the host view." }),
    pin ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl font-mono font-bold tracking-widest mb-6 bg-slate-100 dark:bg-slate-800 py-4 px-6 rounded-xl", children: pin }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center mb-4", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: copyPin, variant: "outline", size: "lg", className: "gap-2", children: [
          copied ? /* @__PURE__ */ jsx(Check, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Copy, { className: "w-5 h-5" }),
          copied ? "Copied!" : "Copy PIN"
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: () => window.open(joinUrl, "_blank"),
            variant: "outline",
            size: "lg",
            className: "gap-2",
            children: [
              /* @__PURE__ */ jsx(ExternalLink, { className: "w-5 h-5" }),
              " Open Join page"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-left mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx(Users, { className: "w-5 h-5 text-indigo-600 shrink-0" }),
          /* @__PURE__ */ jsxs("h2", { className: "font-semibold", children: [
            "Players in lobby (",
            players.length,
            ")"
          ] })
        ] }),
        players.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 text-sm", children: "No players yet. Share the PIN so they can join." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: players.map((p) => /* @__PURE__ */ jsx(
          "li",
          {
            className: "flex items-center gap-2 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-sm",
            children: /* @__PURE__ */ jsx("span", { className: "font-medium", children: p.playerName })
          },
          p.socketId
        )) })
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: goToHost,
          size: "lg",
          className: "w-full btn-primary gap-2 mb-6",
          children: [
            /* @__PURE__ */ jsx(Play, { className: "w-5 h-5" }),
            "Start"
          ]
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mb-4", children: "Or share this link so the PIN is pre-filled:" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-mono text-indigo-600 dark:text-indigo-400 break-all mb-6", children: joinUrl })
    ] }) : /* @__PURE__ */ jsx("p", { className: "text-slate-500 mb-6", children: "No PIN in URL. Create a quiz or open from the dashboard." }),
    /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => navigate("/sessions"), children: "Back to Sessions" })
  ] }) });
}
export {
  ShareDemo as default
};
