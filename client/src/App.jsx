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
import Splash from "@/pages/Splash";
import Demo from "@/pages/Demo";
import ShareDemo from "@/pages/ShareDemo";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/teacher-dashboard"} component={TeacherDashboard} />
      <Route path={"/quiz-library"} component={QuizLibrary} />
      <Route path={"/quiz/create"} component={QuizCreator} />
      <Route path={"/quiz/:quizId/edit"} component={QuizCreator} />
      <Route path={"/session/share-demo"} component={ShareDemo} />
      <Route path={"/session/:sessionId"} component={LiveQuizSession} />
      <Route path={"/results/:sessionId"} component={QuizResults} />
      <Route path={"/components"} component={ComponentsShowcase} />
      <Route path={"/live-chat"} component={LiveChat} />
      <Route path={"/login"} component={Login} />
      <Route path={"/splash"} component={Splash} />
      <Route path={"/demo"} component={Demo} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
