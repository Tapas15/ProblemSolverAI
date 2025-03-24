import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import FrameworkPage from "@/pages/framework-page";
import AiAssistantPage from "@/pages/ai-assistant-page";
import QuizPage from "@/pages/quiz-page";
import TakeQuizPage from "@/pages/take-quiz-page";
import DashboardPage from "@/pages/dashboard-page";
import ProfilePage from "@/pages/profile-page";
import SettingsPage from "@/pages/settings-page";
import ScormAdminPage from "@/pages/scorm-admin-page";
import LearningPathPage from "@/pages/learning-path-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/frameworks/:id" component={FrameworkPage} />
      <ProtectedRoute path="/ai-assistant" component={AiAssistantPage} />
      <ProtectedRoute path="/quizzes/:frameworkId" component={QuizPage} />
      <ProtectedRoute path="/quiz/:frameworkId/:quizId" component={TakeQuizPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/scorm-admin" component={ScormAdminPage} />
      {/* Temporarily reroute /learning-path to home page until full implementation */}
      <ProtectedRoute path="/learning-path" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
