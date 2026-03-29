import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/lib/utils";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
const EMPTY_UI_MESSAGES = [];
function isToolLoading(state) {
  return state === "input-streaming" || state === "input-available";
}
function isToolError(state) {
  return state === "output-error";
}
function isToolComplete(state) {
  return state === "output-available";
}
function DefaultToolPartRenderer({ toolName, state, output, errorText }) {
  if (isToolLoading(state)) {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 bg-muted/50 rounded-lg my-2", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
        "Running ",
        toolName,
        "..."
      ] })
    ] });
  }
  if (isToolError(state)) {
    return /* @__PURE__ */ jsxs("div", { className: "p-3 bg-destructive/10 rounded-lg my-2 text-sm text-destructive", children: [
      "Error: ",
      errorText || "Tool execution failed"
    ] });
  }
  if (isToolComplete(state) && output) {
    return /* @__PURE__ */ jsx("div", { className: "p-3 bg-muted rounded-lg my-2", children: /* @__PURE__ */ jsx("pre", { className: "text-xs overflow-auto max-h-40", children: JSON.stringify(output, null, 2) }) });
  }
  return null;
}
function MessageBubble({
  message,
  renderToolPart,
  isStreaming
}) {
  const isUser = message.role === "user";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex gap-3",
        isUser ? "justify-end items-start" : "justify-start items-start"
      ),
      children: [
        !isUser && /* @__PURE__ */ jsx("div", { className: "size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "size-4 text-primary" }) }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "max-w-[80%] rounded-lg px-4 py-2.5",
              isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            ),
            children: message.parts.map((part, i) => {
              if (part.type === "text") {
                if (isStreaming && !part.text) {
                  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Thinking..." })
                  ] }, i);
                }
                return /* @__PURE__ */ jsx("div", { className: "prose prose-sm dark:prose-invert max-w-none", children: /* @__PURE__ */ jsx(Markdown, { mode: isStreaming ? "typewriter" : "static", typewriterSpeed: 50, children: part.text }) }, i);
              }
              if (part.type.startsWith("tool-")) {
                const toolName = part.type.replace("tool-", "");
                const toolPart = part;
                const rendererProps = {
                  part: toolPart,
                  toolName,
                  state: toolPart.state,
                  input: toolPart.input,
                  output: toolPart.output,
                  errorText: toolPart.errorText
                };
                const customRender = renderToolPart(rendererProps);
                if (customRender !== null) {
                  return /* @__PURE__ */ jsx("div", { children: customRender }, i);
                }
                return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(DefaultToolPartRenderer, { ...rendererProps }) }, i);
              }
              if (part.type === "reasoning") {
                return /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground italic border-l-2 pl-2 my-2", children: part.text }, i);
              }
              return null;
            })
          }
        )
      ]
    }
  );
}
function ThinkingIndicator() {
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-start items-start", children: [
    /* @__PURE__ */ jsx("div", { className: "size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "size-4 text-primary" }) }),
    /* @__PURE__ */ jsx("div", { className: "bg-muted rounded-lg px-4 py-2.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Thinking..." })
    ] }) })
  ] });
}
function AIChatBox({
  api = "/api/chat",
  chatId = "default",
  userId,
  initialMessages,
  onFinish,
  renderToolPart = () => null,
  // Default returns null to use DefaultToolPartRenderer
  placeholder = "Type your message...",
  className,
  emptyStateMessage = "Start a conversation with AI",
  suggestedPrompts
}) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesList = useMemo(() => {
    return Array.isArray(initialMessages) ? initialMessages : EMPTY_UI_MESSAGES;
  }, [initialMessages]);
  const { messages, sendMessage, setMessages, status, error } = useChat({
    // Chat ID helps AI SDK track different conversations
    id: chatId,
    // Initial messages from your data layer (React Query, etc.)
    // Note: This makes it "controlled" - we sync via setMessages on changes
    messages: messagesList,
    // Transport configuration - how messages are sent to the server
    transport: new DefaultChatTransport({
      api,
      // Customize the request body sent to your server
      prepareSendMessagesRequest({ messages: messages2, id }) {
        return {
          body: {
            message: messages2[messages2.length - 1],
            chatId: chatId || id,
            userId
          }
        };
      }
    }),
    // Called when streaming completes
    onFinish: ({ messages: finalMessages, isError, isAbort, isDisconnect }) => {
      if (!isError && !isAbort && !isDisconnect) {
        onFinish?.(finalMessages);
      }
    }
  });
  useEffect(() => {
    setMessages(messagesList);
  }, [chatId, messagesList, setMessages]);
  const canSend = status === "ready";
  const isStreaming = status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const isWaitingForContent = status === "submitted" || isStreaming && lastMessage?.role === "assistant" && lastMessage?.parts.length === 0;
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      });
    }
  }, [messages, status]);
  const submitMessage = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || !canSend) return;
    sendMessage({ text: trimmedInput });
    setInput("");
    textareaRef.current?.focus();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    submitMessage();
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col flex-1 min-h-0", className), children: [
    /* @__PURE__ */ jsx("div", { ref: scrollAreaRef, className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsx(ScrollArea, { className: "h-full", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl space-y-4 p-4", children: [
      messages.length === 0 && !isWaitingForContent ? /* @__PURE__ */ jsxs("div", { className: "flex h-[60vh] flex-col items-center justify-center gap-6 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "size-12 opacity-20" }),
        /* @__PURE__ */ jsx("p", { className: "text-center max-w-md", children: emptyStateMessage }),
        suggestedPrompts && suggestedPrompts.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-2 max-w-lg", children: suggestedPrompts.map((prompt, i) => /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "text-xs",
            onClick: () => {
              setInput(prompt);
              textareaRef.current?.focus();
            },
            children: prompt
          },
          i
        )) })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        messages.map((message, index) => {
          const isLastAssistant = index === messages.length - 1 && message.role === "assistant";
          const hasContent = message.parts.length > 0;
          if (isLastAssistant && !hasContent) return null;
          return /* @__PURE__ */ jsx(
            MessageBubble,
            {
              message,
              renderToolPart,
              isStreaming: isStreaming && isLastAssistant && hasContent
            },
            message.id
          );
        }),
        isWaitingForContent && /* @__PURE__ */ jsx(ThinkingIndicator, {})
      ] }),
      error && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-destructive/10 p-4 text-destructive", children: [
        "Error: ",
        error.message
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, className: "border-t bg-background/50 p-4", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-3xl", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        Textarea,
        {
          ref: textareaRef,
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyDown: handleKeyDown,
          placeholder,
          className: "min-h-[44px] max-h-32 resize-none",
          rows: 1,
          disabled: !canSend
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          size: "icon",
          disabled: !canSend || !input.trim(),
          className: "shrink-0 h-[44px] w-[44px]",
          children: status === "submitted" ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "size-4" })
        }
      )
    ] }) }) })
  ] });
}
var stdin_default = AIChatBox;
export {
  AIChatBox,
  stdin_default as default,
  isToolComplete,
  isToolError,
  isToolLoading
};
