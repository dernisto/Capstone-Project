import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
function Join() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const [step, setStep] = useState("pin");
  const [gamePin, setGamePin] = useState("");
  const [playerName, setPlayerName] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(typeof search === "string" ? search : "");
    const pin = params.get("pin")?.trim().toUpperCase();
    if (pin) {
      setGamePin(pin);
      setStep("name");
    }
  }, [search]);
  const handlePinSubmit = (e) => {
    e.preventDefault();
    const pin = gamePin.trim().toUpperCase();
    if (pin) setStep("name");
  };
  const handleNameSubmit = (e) => {
    e.preventDefault();
    const pin = gamePin.trim().toUpperCase();
    const name = playerName.trim();
    if (pin && name) {
      navigate(
        `/play?gamePin=${encodeURIComponent(pin)}&playerName=${encodeURIComponent(name)}`
      );
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      className: "glass-panel w-full max-w-md p-8",
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold gradient-text mb-2 text-center", children: "Join game" }),
        step === "pin" ? /* @__PURE__ */ jsxs("form", { onSubmit: handlePinSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "gamePin", children: "Game PIN" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "gamePin",
                value: gamePin,
                onChange: (e) => setGamePin(e.target.value.toUpperCase()),
                placeholder: "e.g. ABC123",
                className: "font-mono text-lg",
                maxLength: 10,
                autoFocus: true
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full btn-primary", disabled: !gamePin.trim(), children: "Continue" })
        ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleNameSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-600 dark:text-slate-400 mb-2", children: [
            "PIN: ",
            /* @__PURE__ */ jsx("span", { className: "font-mono font-semibold", children: gamePin })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "playerName", children: "Your name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "playerName",
                value: playerName,
                onChange: (e) => setPlayerName(e.target.value),
                placeholder: "Nickname",
                maxLength: 50,
                autoFocus: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                className: "flex-1",
                onClick: () => setStep("pin"),
                children: "Back"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                className: "flex-1 btn-primary",
                disabled: !playerName.trim(),
                children: "Join"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            className: "w-full mt-4 text-slate-600 dark:text-slate-400",
            onClick: () => navigate("/"),
            children: "\u2190 Back to home"
          }
        )
      ]
    }
  ) });
}
export {
  Join as default
};
