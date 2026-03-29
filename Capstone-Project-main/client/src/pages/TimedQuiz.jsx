import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
function TimedQuiz() {
  const [, navigate] = useLocation();
  return /* @__PURE__ */ jsx("div", { className: "min-h-[70vh] flex items-center justify-center px-4 py-16", children: /* @__PURE__ */ jsxs("div", { className: "glass-panel max-w-xl w-full p-8 text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-3 gradient-text", children: "Timed Questions" }),
    /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mb-8", children: "Coming Soon" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => navigate("/"), children: "Home" }),
      /* @__PURE__ */ jsx(Button, { className: "btn-primary", onClick: () => navigate("/library"), children: "Go to Library" })
    ] })
  ] }) });
}
export {
  TimedQuiz as default
};
