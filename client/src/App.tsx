
import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { LocalAIProvider } from "@/hooks/use-local-ai";
import { ProtectedRoute } from "@/lib/protected-route";
import { MobileAppLayout } from "@/components/layout/mobile-app-layout";
import { isNativePlatform, initializeApp } from "@/lib/capacitor";

// Optimized imports with lazy loading for faster initial load
const NotFound = lazy(() => import("@/pages/not-found"));
const HomePage = lazy(() => import("@/pages/home-page"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const FrameworkPage = lazy(() => import("@/pages/framework-page"));
const FrameworksPage = lazy(() => import("@/pages/frameworks-page"));
const AiAssistantPage = lazy(() => import("@/pages/ai-assistant-page"));
const QuizPage = lazy(() => import("@/pages/quiz-page"));
const TakeQuizPage = lazy(() => import("@/pages/take-quiz-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
const ScormAdminPage = lazy(() => import("@/pages/scorm-admin-page"));
const LearningPathPage = lazy(() => import("@/pages/learning-path-page"));
const ExercisePage = lazy(() => import("@/pages/exercise-page"));
const ExerciseDetailPage = lazy(() => import("@/pages/exercise-detail-page"));
const ExerciseFrameworksPage = lazy(() => import("@/pages/exercise-frameworks-page"));
const MobileFeaturesPage = lazy(() => import("@/pages/mobile-features-page"));
const CertificatesPage = lazy(() => import("@/pages/certificates-page"));
const FounderPage = lazy(() => import("@/pages/founder-page"));
const AboutPage = lazy(() => import("@/pages/about-page"));
const ContactPage = lazy(() => import("@/pages/contact-page"));
const PrivacyPage = lazy(() => import("@/pages/privacy-page"));
const TermsPage = lazy(() => import("@/pages/terms-page"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-12 h-12 animate-spin text-primary" />
  </div>
);

// Prefetch critical routes
const prefetchRoutes = () => {
  // Prefetch main pages that are likely to be visited soon
  import("@/pages/home-page");
  import("@/pages/frameworks-page");
  import("@/pages/dashboard-page");
};

function Router() {
  // Prefetch important routes after initial load
  useEffect(() => {
    // Delay prefetching to prioritize current route rendering
    const timer = setTimeout(() => {
      prefetchRoutes();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/frameworks" component={FrameworksPage} />
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
        <ProtectedRoute path="/mobile-features" component={MobileFeaturesPage} />
        <ProtectedRoute path="/certificates" component={CertificatesPage} />
        <Route path="/founder" component={FounderPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Initialize the Capacitor app when the component mounts
  useEffect(() => {
    // Initialize mobile app features with better error handling
    try {
      initializeApp().then(() => {
        console.log('Capacitor initialized successfully');
      }).catch(error => {
        console.error('Failed to initialize mobile app:', error);
      });
    } catch (error) {
      // Catch any synchronous errors that might occur
      console.error('Error during Capacitor initialization:', error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocalAIProvider>
          <MobileAppLayout>
            <Router />
            <Toaster />
          </MobileAppLayout>
        </LocalAIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
