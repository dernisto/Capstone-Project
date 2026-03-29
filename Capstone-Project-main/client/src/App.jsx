import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import TeacherDashboard from "@/pages/TeacherDashboard";
import QuizLibrary from "@/pages/QuizLibrary";
import QuizCreator from "@/pages/QuizCreator";
import LiveQuizSession from "@/pages/LiveQuizSession";
import QuizResults from "@/pages/QuizResults";
import ComponentsShowcase from "@/pages/ComponentShowcase";
import LiveChat from "@/pages/LiveChat";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Join from "@/pages/Join";
import Host from "@/pages/Host";
import Play from "@/pages/Play";
import Splash from "@/pages/Splash";
import Demo from "@/pages/Demo";
import ShareDemo from "@/pages/ShareDemo";
import HostLive from "@/pages/HostLive";
import Leaderboard from "@/pages/Leaderboard";
import TimedQuiz from "@/pages/TimedQuiz";
import Analytics from "@/pages/Analytics";
import { Route, Router, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import AppNavbar from "./components/AppNavbar";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
function AppRoutes() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(AppNavbar, {}),
    /* @__PURE__ */ jsxs(Switch, { children: [
      /* @__PURE__ */ jsx(Route, { path: "/", component: Home }),
      /* @__PURE__ */ jsx(Route, { path: "/join", component: Join }),
      /* @__PURE__ */ jsx(Route, { path: "/host", component: Host }),
      /* @__PURE__ */ jsx(Route, { path: "/play", component: Play }),
      /* @__PURE__ */ jsx(Route, { path: "/sessions", component: TeacherDashboard }),
      /* @__PURE__ */ jsx(Route, { path: "/library", component: QuizLibrary }),
      /* @__PURE__ */ jsx(Route, { path: "/quiz/create", component: QuizCreator }),
      /* @__PURE__ */ jsx(Route, { path: "/quiz/:quizId/edit", component: QuizCreator }),
      /* @__PURE__ */ jsx(Route, { path: "/session/share-demo", component: ShareDemo }),
      /* @__PURE__ */ jsx(Route, { path: "/session/host-live", component: HostLive }),
      /* @__PURE__ */ jsx(Route, { path: "/live-session", component: HostLive }),
      /* @__PURE__ */ jsx(Route, { path: "/leaderboard", component: Leaderboard }),
      /* @__PURE__ */ jsx(Route, { path: "/quiz/timed", component: TimedQuiz }),
      /* @__PURE__ */ jsx(Route, { path: "/session/:sessionId", component: LiveQuizSession }),
      /* @__PURE__ */ jsx(Route, { path: "/results/:sessionId", component: QuizResults }),
      /* @__PURE__ */ jsx(Route, { path: "/components", component: ComponentsShowcase }),
      /* @__PURE__ */ jsx(Route, { path: "/chat", component: LiveChat }),
      /* @__PURE__ */ jsx(Route, { path: "/analytics", component: Analytics }),
      /* @__PURE__ */ jsx(Route, { path: "/login", component: Login }),
      /* @__PURE__ */ jsx(Route, { path: "/register", component: Register }),
      /* @__PURE__ */ jsx(Route, { path: "/splash", component: Splash }),
      /* @__PURE__ */ jsx(Route, { path: "/demo", component: Demo }),
      /* @__PURE__ */ jsx(Route, { path: "/404", component: NotFound }),
      /* @__PURE__ */ jsx(Route, { component: NotFound })
    ] })
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(ThemeProvider, { defaultTheme: "dark", switchable: true, children: /* @__PURE__ */ jsxs(TooltipProvider, { children: [
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsx(Router, { children: /* @__PURE__ */ jsx(AppRoutes, {}) })
  ] }) }) }) });
}
var stdin_default = App;
export {
  stdin_default as default
};
