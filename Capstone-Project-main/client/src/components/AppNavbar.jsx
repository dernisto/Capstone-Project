import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Flame, Moon, Sun } from "lucide-react";
import { useLocation } from "wouter";
import { usePathname } from "wouter/use-browser-location";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
const navActionClass = "border-slate-400/50 bg-slate-200/40 text-slate-800 shadow-sm backdrop-blur-md hover:bg-indigo-100 hover:border-indigo-500/60 hover:text-indigo-950 dark:border-slate-600/55 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-indigo-950/65 dark:hover:border-indigo-400/50 dark:hover:text-indigo-50";
const PATH_TO_LABEL = {
  "/": "Home",
  "/join": "Join Game",
  "/host": "Host Session",
  "/play": "Play",
  "/sessions": "Sessions",
  "/library": "Quiz Library",
  "/quiz/create": "Create Quiz",
  "/chat": "Live Chat",
  "/live-session": "Live Session",
  "/leaderboard": "Leaderboard",
  "/quiz/timed": "Timed Questions",
  "/analytics": "Analytics",
  "/login": "Sign In",
  "/register": "Create Account",
  "/splash": "Splash",
  "/demo": "Demo",
  "/components": "Appearance",
  "/404": "Not Found"
};
function getPageLabel(path) {
  const normalized = path?.replace(/#.*$/, "").replace(/\?.*$/, "") || "/";
  if (PATH_TO_LABEL[normalized]) return PATH_TO_LABEL[normalized];
  if (normalized.startsWith("/quiz/") && normalized.includes("/edit")) return "Edit Quiz";
  if (normalized.startsWith("/session/share-demo")) return "Share Demo";
  if (normalized.startsWith("/session/")) return "Live Session";
  if (normalized.startsWith("/results/")) return "Results";
  return normalized.slice(1) || "Home";
}
function AppNavbar() {
  const [, navigate] = useLocation();
  const pathname = usePathname() ?? "/";
  const normalizedPath = pathname.replace(/#.*$/, "").replace(/\?.*$/, "") || "/";
  const isHome = normalizedPath === "/";
  const pageLabel = getPageLabel(pathname ?? "/");
  const { theme, toggleTheme, switchable } = useTheme();
  const { user, logout } = useAuth();
  return /* @__PURE__ */ jsx("nav", { className: "glass-nav sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-700/50", children: /* @__PURE__ */ jsxs("div", { className: "container flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-2 sm:gap-3", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => navigate("/"),
          className: "flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-indigo-50/90 dark:hover:bg-slate-800/60",
          "aria-label": "QuizPulse59 home",
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600", children: /* @__PURE__ */ jsx(Flame, { className: "h-4 w-4 text-white" }) }),
            /* @__PURE__ */ jsx("span", { className: "truncate text-lg font-bold gradient-text", children: "QuizPulse59" })
          ]
        }
      ),
      !isHome && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "shrink-0 text-slate-300 dark:text-slate-600", "aria-hidden": true, children: "/" }),
        /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-medium text-slate-600 dark:text-slate-300", children: pageLabel })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: cn("shrink-0", navActionClass),
          onClick: () => navigate("/join"),
          children: "Join game"
        }
      ),
      user ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: cn("shrink-0", navActionClass),
            onClick: () => navigate("/sessions"),
            children: "Dashboard"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: cn("shrink-0", navActionClass),
            onClick: () => {
              logout();
              navigate("/");
            },
            children: "Logout"
          }
        )
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: cn("shrink-0", navActionClass),
            onClick: () => navigate("/login"),
            children: "Login"
          }
        ),
        /* @__PURE__ */ jsxs(Button, { size: "sm", className: "btn-primary shrink-0", onClick: () => navigate("/register"), children: [
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Create account" }),
          /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "Sign up" })
        ] })
      ] }),
      switchable && toggleTheme && /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: cn("shrink-0", navActionClass),
          onClick: toggleTheme,
          "aria-label": `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
          children: [
            theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: theme === "dark" ? "Light" : "Dark" })
          ]
        }
      )
    ] })
  ] }) });
}
export {
  AppNavbar as default
};
