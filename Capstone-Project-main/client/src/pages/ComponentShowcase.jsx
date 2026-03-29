import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useLocation } from "wouter";
function ComponentsShowcase() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme, switchable } = useTheme();
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950", children: /* @__PURE__ */ jsxs("div", { className: "container py-12 max-w-2xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 mb-10", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold gradient-text", children: "Appearance" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mt-2", children: "Toggle light/dark mode. This applies globally across backgrounds, text, and components." })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => navigate("/"), children: "Home" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass-panel p-8 flex items-center justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "Theme" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-600 dark:text-slate-400 mt-1", children: [
          "Current: ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: theme })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          onClick: () => toggleTheme?.(),
          disabled: !switchable || !toggleTheme,
          className: "flex items-center gap-2",
          "aria-label": `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
          children: [
            theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Moon, { className: "w-4 h-4" }),
            theme === "dark" ? "Light mode" : "Dark mode"
          ]
        }
      )
    ] })
  ] }) });
}
export {
  ComponentsShowcase as default
};
