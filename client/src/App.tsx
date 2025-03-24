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
import ExercisePage from "@/pages/exercise-page";
import ExerciseDetailPage from "@/pages/exercise-detail-page";
import ExerciseFrameworksPage from "@/pages/exercise-frameworks-page";
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
      <ProtectedRoute path="/exercises" component={ExerciseFrameworksPage} />
      <ProtectedRoute path="/exercises/:frameworkId" component={ExercisePage} />
      <ProtectedRoute path="/exercise/:exerciseId" component={ExerciseDetailPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/scorm-admin" component={ScormAdminPage} />
      <ProtectedRoute path="/learning-path" component={LearningPathPage} />
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
