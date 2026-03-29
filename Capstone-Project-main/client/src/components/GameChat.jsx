import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { quizBtnPrimary, quizFocusGlow } from "@/lib/quizTheme";
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES = 100;
function GameChat({
  socket,
  gamePin,
  playerName,
  className = ""
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const listRef = useRef(null);
  useEffect(() => {
    const s = socket.current;
    if (!s || !gamePin.trim()) return;
    const onMsg = (msg) => {
      setMessages((prev) => [...prev, msg].slice(-MAX_MESSAGES));
    };
    s.on("chat-message", onMsg);
    return () => {
      s.off("chat-message", onMsg);
    };
  }, [socket, gamePin]);
  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);
  const send = () => {
    const msg = input.trim();
    if (!msg || !socket.current || !gamePin.trim()) return;
    if (msg.length > MAX_MESSAGE_LENGTH) return;
    socket.current.emit("chat-message", {
      gamePin: gamePin.trim().toUpperCase(),
      message: msg
    });
    setInput("");
  };
  const len = input.length;
  const isSelf = (u) => u === playerName || u === "Host";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex flex-col rounded-2xl border border-[#E9E7FF] bg-white/80 backdrop-blur-[10px] shadow-[0_6px_20px_rgba(108,59,255,0.08)] h-[420px] overflow-hidden transition-shadow duration-250 hover:shadow-[0_8px_28px_rgba(108,59,255,0.1)] ${className}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-5 py-4 border-b border-[#E9E7FF] bg-white/50", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "w-5 h-5 text-[#6C3BFF]", strokeWidth: 1.75 }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-[#1A1A1A] text-sm tracking-[-0.01em]", children: "Chat" })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: listRef,
            className: "flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAFAFF]",
            children: messages.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-[#6B7280] text-sm text-center py-8", children: "No messages yet" }) : messages.map((m, i) => /* @__PURE__ */ jsx(
              "div",
              {
                className: `flex ${isSelf(m.username) ? "justify-end" : "justify-start"}`,
                children: /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: `max-w-[85%] rounded-2xl px-4 py-2.5 text-sm transition-transform duration-250 ${isSelf(m.username) ? "bg-[#6C3BFF] text-white rounded-br-md shadow-[0_4px_14px_rgba(108,59,255,0.35)]" : "bg-white border border-[#E9E7FF] text-[#1A1A1A] rounded-bl-md shadow-[0_2px_12px_rgba(108,59,255,0.06)]"}`,
                    children: [
                      !isSelf(m.username) && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-[#6C3BFF] mb-0.5", children: m.username }),
                      /* @__PURE__ */ jsx("p", { className: "break-words leading-relaxed", children: m.message })
                    ]
                  }
                )
              },
              `${m.timestamp}-${i}`
            ))
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-[#E9E7FF] bg-white/70 backdrop-blur-sm rounded-b-2xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Message\u2026",
                value: input,
                onChange: (e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH)),
                onKeyDown: (e) => e.key === "Enter" && send(),
                className: `flex-1 px-4 py-2.5 rounded-xl border border-[#E9E7FF] bg-white text-[#1A1A1A] text-sm placeholder:text-[#6B7280] transition-all duration-250 hover:border-[#6C3BFF]/40 focus:border-[#6C3BFF] ${quizFocusGlow}`
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                size: "sm",
                onClick: send,
                disabled: !input.trim(),
                className: `h-10 w-10 p-0 shrink-0 ${quizBtnPrimary}`,
                children: /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" })
              }
            )
          ] }),
          len > 400 && /* @__PURE__ */ jsxs(
            "p",
            {
              className: `text-xs mt-2 ${len >= MAX_MESSAGE_LENGTH ? "text-[#EF4444]" : "text-[#6B7280]"}`,
              children: [
                len,
                "/",
                MAX_MESSAGE_LENGTH
              ]
            }
          )
        ] })
      ]
    }
  );
}
export {
  GameChat
};
