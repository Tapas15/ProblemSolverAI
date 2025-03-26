import { Framework, Module, UserProgress, AiConversation, Quiz, QuizAttempt, Exercise, ExerciseSubmission, Certificate } from "@shared/schema";
import { apiRequest, queryClient } from "./queryClient";
import learningTracking from "./learning-tracking";

// Interface for User Preferences data
export interface UserPreferencesData {
  display?: {
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    theme?: 'light' | 'dark' | 'system';
    fontSize?: 'small' | 'medium' | 'large';
  };
  // Add other preference categories as needed
};

// Interface for SCORM package metadata
export interface ScormPackage {
  name: string;
  path: string;
  isValid: boolean;
  uploadedAt: string;
}

export async function getFrameworks(): Promise<Framework[]> {
  const res = await apiRequest("GET", "/api/frameworks");
  return res.json();
}

export async function getFramework(id: number): Promise<Framework> {
  const res = await apiRequest("GET", `/api/frameworks/${id}`);
  return res.json();
}

export async function getModules(frameworkId: number): Promise<Module[]> {
  const res = await apiRequest("GET", `/api/frameworks/${frameworkId}/modules`);
  return res.json();
}

export async function getAllModulesByFramework(): Promise<Record<number, Module[]>> {
  const res = await apiRequest("GET", "/api/all-modules-by-framework");
  return res.json();
}

export async function getUserProgress(): Promise<UserProgress[]> {
  const res = await apiRequest("GET", "/api/user/progress");
  return res.json();
}

export async function updateUserProgress(
  frameworkId: number,
  status: string,
  completedModules: number,
  totalModules: number
): Promise<UserProgress> {
  const res = await apiRequest("POST", "/api/user/progress", {
    frameworkId,
    status,
    completedModules,
    totalModules,
  });
  return res.json();
}

export async function updateModuleCompletion(
  moduleId: number,
  completed: boolean
): Promise<Module> {
  const res = await apiRequest("PATCH", `/api/modules/${moduleId}/complete`, {
    completed,
  });
  return res.json();
}

// Enhanced version with xAPI tracking
export async function updateModuleCompletionWithTracking(
  moduleId: number,
  completed: boolean
): Promise<Module> {
  return learningTracking.completeModuleWithTracking(moduleId, completed);
}

export async function askAi(
  question: string,
  frameworkId?: number
): Promise<AiConversation> {
  console.log('askAi called with:', { question, frameworkId });
  try {
    const res = await apiRequest("POST", "/api/ai/ask", {
      question,
      frameworkId,
    });
    console.log('askAi response status:', res.status);
    const data = await res.json();
    console.log('askAi response data:', data);
    return data;
  } catch (error) {
    console.error('Error in askAi API call:', error);
    throw error;
  }
}

export async function getAiConversations(): Promise<AiConversation[]> {
  const res = await apiRequest("GET", "/api/ai/conversations");
  return res.json();
}

export async function clearAiConversations(): Promise<void> {
  await apiRequest("DELETE", "/api/ai/conversations");
}

// Quiz APIs
export async function getQuizzesByFramework(frameworkId: number, level?: string): Promise<Quiz[]> {
  const url = level 
    ? `/api/quizzes/framework/${frameworkId}?level=${encodeURIComponent(level)}` 
    : `/api/quizzes/framework/${frameworkId}`;
  
  const res = await apiRequest("GET", url);
  return res.json();
}

export async function getQuiz(id: number): Promise<Quiz> {
  const res = await apiRequest("GET", `/api/quizzes/${id}`);
  return res.json();
}

export async function createQuiz(quiz: Omit<Quiz, "id">): Promise<Quiz> {
  const res = await apiRequest("POST", "/api/quizzes", quiz);
  return res.json();
}

export async function updateQuiz(id: number, quizData: Partial<Quiz>): Promise<Quiz> {
  const res = await apiRequest("PATCH", `/api/quizzes/${id}`, quizData);
  return res.json();
}

export async function deleteQuiz(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/quizzes/${id}`);
}

// Quiz Attempts APIs
export async function getUserQuizAttempts(): Promise<QuizAttempt[]> {
  const res = await apiRequest("GET", "/api/quiz-attempts/user");
  return res.json();
}

export async function getQuizAttemptsByQuiz(quizId: number): Promise<QuizAttempt[]> {
  const res = await apiRequest("GET", `/api/quiz-attempts/quiz/${quizId}`);
  return res.json();
}

export async function submitQuizAttempt(
  quizId: number,
  answers: string,
  score: number,
  maxScore: number,
  timeTaken?: number
): Promise<QuizAttempt> {
  // Calculate if passed based on the quiz's passing score or default to 70%
  const passingThreshold = 0.7; // 70% by default
  const passed = score >= (maxScore * passingThreshold);
  
  try {
    // Get current user to ensure we have a valid user ID
    const userResponse = await apiRequest("GET", "/api/user");
    if (!userResponse.ok) {
      throw new Error("Not authenticated. Please log in again.");
    }
    
    const currentUser = await userResponse.json();
    
    // Don't send completedAt - let the server handle it with defaultNow()
    const res = await apiRequest("POST", "/api/quiz-attempts", {
      quizId,
      userId: currentUser.id, // Include user ID with the request
      answers,
      score,
      maxScore,
      passed,
      timeTaken
    });
    
    if (!res.ok) {
      throw new Error(`Failed to submit quiz attempt: ${res.statusText}`);
    }
    
    // Invalidate the quiz attempts cache to ensure dashboard shows latest data
    queryClient.invalidateQueries({ queryKey: ['/api/quiz-attempts/user'] });
    
    return await res.json();
  } catch (error) {
    console.error("Quiz submission error:", error);
    throw error;
  }
}

// xAPI Tracking functions
export async function trackModuleCompletion(
  moduleId: number,
  moduleName: string,
  frameworkId: number
): Promise<any> {
  return learningTracking.trackModuleCompletion(moduleId, moduleName, frameworkId);
}

export async function trackFrameworkCompletion(
  frameworkId: number,
  frameworkName: string,
  completedModules: number,
  totalModules: number
): Promise<any> {
  return learningTracking.trackFrameworkCompletion(frameworkId, frameworkName, completedModules, totalModules);
}

export async function trackQuizAttempt(
  quizId: number,
  quizTitle: string,
  frameworkId: number,
  score: number,
  maxScore: number,
  passed: boolean,
  timeTaken: number
): Promise<any> {
  return learningTracking.trackQuizAttempt(quizId, quizTitle, frameworkId, score, maxScore, passed, timeTaken);
}

// SCORM package management functions
export async function getScormPackages(): Promise<ScormPackage[]> {
  const res = await apiRequest("GET", "/api/scorm/packages");
  return res.json();
}

export async function uploadScormPackage(file: File, moduleId: number): Promise<{ message: string; module: Module }> {
  const formData = new FormData();
  formData.append('scormPackage', file);
  formData.append('moduleId', moduleId.toString());
  
  const res = await fetch('/api/scorm/upload', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header, let the browser set it with the boundary
    headers: {
      // Include auth credentials but don't set content-type
    },
    credentials: 'same-origin'
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to upload SCORM package');
  }
  
  return res.json();
}

export async function deleteScormPackage(name: string): Promise<void> {
  await apiRequest("DELETE", `/api/scorm/packages/${encodeURIComponent(name)}`);
}

// SCORM API functions
export const scormApi = {
  loadWrapper: learningTracking.loadScormApiWrapper,
  initialize: learningTracking.initializeScorm,
  terminate: learningTracking.terminateScorm,
  setValue: learningTracking.setScormValue,
  getValue: learningTracking.getScormValue,
  commit: learningTracking.commitScorm
};

// User settings API functions
export async function updateAiSettings(settings: { apiKey?: string; aiProvider?: string }): Promise<any> {
  try {
    // Try POST first (new API)
    const res = await apiRequest("POST", "/api/user/ai-settings", settings);
    return res.json();
  } catch (error) {
    // Fall back to PATCH (legacy API) if POST fails
    console.warn('Falling back to PATCH for AI settings');
    const res = await apiRequest("PATCH", "/api/user/ai-settings", settings);
    return res.json();
  }
}

export async function updatePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
  try {
    // Try POST first (new API)
    const res = await apiRequest("POST", "/api/user/password", data);
    return res.json();
  } catch (error) {
    // Fall back to PATCH (legacy API) if POST fails
    console.warn('Falling back to PATCH for password update');
    const res = await apiRequest("PATCH", "/api/user/password", data);
    return res.json();
  }
}

export async function updatePrivacySettings(settings: { 
  allowAnalytics?: boolean; 
  publicProfile?: boolean;
  allowPersonalization?: boolean;
}): Promise<{ message: string; user: any }> {
  try {
    // Try POST first (new API)
    const res = await apiRequest("POST", "/api/user/privacy", settings);
    return res.json();
  } catch (error) {
    // Fall back to PATCH (legacy API) if POST fails
    console.warn('Falling back to PATCH for privacy settings');
    const res = await apiRequest("PATCH", "/api/user/privacy", settings);
    return res.json();
  }
}

export async function updateNotificationSettings(settings: {
  learningReminders?: boolean;
  frameworkUpdates?: boolean;
  quizResults?: boolean;
  productUpdates?: boolean;
  emailFrequency?: 'immediately' | 'daily' | 'weekly' | 'none';
}): Promise<{ message: string; user: any }> {
  try {
    // Try POST first (new API)
    const res = await apiRequest("POST", "/api/user/notifications", settings);
    return res.json();
  } catch (error) {
    // Fall back to PATCH (legacy API) if POST fails
    console.warn('Falling back to PATCH for notification settings');
    const res = await apiRequest("PATCH", "/api/user/notifications", settings);
    return res.json();
  }
}

// 2FA API Functions
export async function setup2FA(): Promise<{ secret: string; qrCode: string }> {
  const res = await apiRequest('POST', '/api/user/2fa/setup');
  return await res.json();
}

export async function verify2FA(token: string): Promise<{ 
  message: string; 
  user: any;
  backupCodes: string[]; 
}> {
  const res = await apiRequest('POST', '/api/user/2fa/verify', { token });
  return await res.json();
}

export async function disable2FA(currentPassword: string, token: string): Promise<{ 
  message: string; 
  user: any;
}> {
  const res = await apiRequest('POST', '/api/user/2fa/disable', { currentPassword, token });
  return await res.json();
}

export async function use2FABackupCode(backupCode: string): Promise<{ 
  message: string; 
  user: any;
}> {
  const res = await apiRequest('POST', '/api/user/2fa/backup', { backupCode });
  return await res.json();
}

export async function clearQuizAttempts(): Promise<{ 
  success: boolean; 
  message: string; 
}> {
  const res = await apiRequest('DELETE', '/api/quiz-attempts/user/clear');
  return await res.json();
}

export async function generateNew2FABackupCodes(token: string): Promise<{ 
  message: string; 
  backupCodes: string[]; 
}> {
  const res = await apiRequest('POST', '/api/user/2fa/generate-backup-codes', { token });
  return await res.json();
}

// Export user data
export async function exportUserData(): Promise<Blob> {
  const res = await apiRequest('GET', '/api/user/export');
  return await res.blob();
}

// Exercise API functions
export async function getFrameworkExercises(frameworkId: number): Promise<Exercise[]> {
  const res = await apiRequest("GET", `/api/frameworks/${frameworkId}/exercises`);
  return res.json();
}

export async function getModuleExercises(moduleId: number): Promise<Exercise[]> {
  const res = await apiRequest("GET", `/api/modules/${moduleId}/exercises`);
  return res.json();
}

export async function getExercise(id: number): Promise<Exercise> {
  const res = await apiRequest("GET", `/api/exercises/${id}`);
  return res.json();
}

export async function createExercise(exerciseData: Omit<Exercise, "id" | "createdAt" | "updatedAt">): Promise<Exercise> {
  const res = await apiRequest("POST", "/api/exercises", exerciseData);
  return res.json();
}

export async function updateExercise(id: number, exerciseData: Partial<Exercise>): Promise<Exercise> {
  const res = await apiRequest("PATCH", `/api/exercises/${id}`, exerciseData);
  return res.json();
}

export async function deleteExercise(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/exercises/${id}`);
}

export async function getExerciseSubmissions(exerciseId: number): Promise<ExerciseSubmission[]> {
  const res = await apiRequest("GET", `/api/exercises/${exerciseId}/submissions`);
  return res.json();
}

export async function getUserExerciseSubmissions(): Promise<ExerciseSubmission[]> {
  const res = await apiRequest("GET", "/api/user/exercise-submissions");
  return res.json();
}

export async function submitExerciseSolution(
  exerciseId: number,
  solution: string,
  status: string = "submitted"
): Promise<ExerciseSubmission> {
  const res = await apiRequest("POST", `/api/exercises/${exerciseId}/submit`, {
    solution,
    status
  });
  return res.json();
}

export async function updateExerciseSubmission(
  submissionId: number,
  updateData: {
    status?: string;
    score?: number | null;
    feedback?: string | null;
  }
): Promise<ExerciseSubmission> {
  const res = await apiRequest("PATCH", `/api/exercise-submissions/${submissionId}`, updateData);
  return res.json();
}

export async function deleteExerciseSubmission(submissionId: number): Promise<void> {
  await apiRequest("DELETE", `/api/exercise-submissions/${submissionId}`);
}

// User preferences API function
export async function updateUserPreferences(preferencesData: UserPreferencesData): Promise<{ message: string; user: any }> {
  const res = await apiRequest("POST", "/api/user/preferences", preferencesData);
  return res.json();
}

// Certificate API functions
export async function getUserCertificates(): Promise<Certificate[]> {
  const res = await apiRequest("GET", "/api/certificates");
  return res.json();
}

export async function getFrameworkCertificates(frameworkId: number): Promise<Certificate[]> {
  const res = await apiRequest("GET", `/api/certificates/framework/${frameworkId}`);
  return res.json();
}

export async function getCertificate(id: number): Promise<Certificate> {
  const res = await apiRequest("GET", `/api/certificates/${id}`);
  return res.json();
}

export async function issueFrameworkCertificate(frameworkId: number): Promise<Certificate> {
  const res = await apiRequest("POST", `/api/certificates/issue/${frameworkId}`);
  return res.json();
}

// Achievement and reward system
export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  earnedDate?: Date;
  progress?: number;
  requiredProgress?: number;
  isEarned: boolean;
}

export async function getUserAchievements(): Promise<Achievement[]> {
  // This would typically come from the server, but for now we'll generate achievements
  // based on the user's progress data
  try {
    const progress = await getUserProgress();
    const frameworks = await getFrameworks();
    const quizAttempts = await getUserQuizAttempts();
    const certificates = await getUserCertificates();
    
    // Base achievements that everyone starts with
    const achievements: Achievement[] = [
      {
        id: 'first_login',
        title: 'First Steps',
        description: 'Logged into the platform for the first time',
        iconUrl: 'https://img.icons8.com/ios-glyphs/100/000000/login-rounded.png',
        earnedDate: new Date(),
        isEarned: true
      }
    ];
    
    // Framework-based achievements
    if (frameworks && frameworks.length > 0) {
      // Started frameworks
      const startedFrameworks = progress.filter(p => p.status !== 'not_started');
      if (startedFrameworks.length > 0) {
        achievements.push({
          id: 'framework_starter',
          title: 'Framework Explorer',
          description: 'Started learning your first framework',
          iconUrl: 'https://img.icons8.com/ios-glyphs/100/000000/compass.png',
          earnedDate: new Date(),
          isEarned: true
        });
      }
      
      // Completed frameworks achievements
      const completedFrameworks = progress.filter(p => p.status === 'completed');
      const completedCount = completedFrameworks.length;
      
      if (completedCount > 0) {
        achievements.push({
          id: 'first_framework',
          title: 'Framework Master',
          description: 'Completed your first framework',
          iconUrl: 'https://img.icons8.com/ios-glyphs/100/000000/diploma.png',
          earnedDate: new Date(),
          isEarned: true
        });
      }
      
      if (completedCount >= 3) {
        achievements.push({
          id: 'framework_enthusiast',
          title: 'Framework Enthusiast',
          description: 'Completed at least 3 frameworks',
          iconUrl: 'https://img.icons8.com/ios-glyphs/100/000000/prize.png',
          earnedDate: new Date(),
          isEarned: true
        });
      }
      
      if (completedCount >= 5) {
        achievements.push({
          id: 'framework_expert',
          title: 'Framework Expert',
          description: 'Completed at least 5 frameworks',
          iconUrl: 'https://img.icons8.com/ios-glyphs/100/000000/medal.png',
          earnedDate: new Date(),
          isEarned: true
        });
      }
      
      if (completedCount >= frameworks.length) {
        achievements.push({
          id: 'framework_guru',
          title: 'Framework Guru',
          description: 'Completed all available frameworks',
          iconUrl: 'https://img.icons8.com/ios-glyphs/100/000000/trophy.png',
          earnedDate: new Date(),
          isEarned: true
        });
      }
      
      // Progress achievement
      achievements.push({
        id: 'learning_progress',
        title: 'Learning Journey',
        description: 'Track your overall learning progress',
        iconUrl: 'https://img.icons8.com/ios-glyphs/100/000000/graduation-cap.png',
        progress: completedCount,
        requiredProgress: frameworks.length,
        isEarned: completedCount > 0
      });
    }
    
    // Quiz-based achievements
    if (quizAttempts && quizAttempts.length > 0) {
      achievements.push({
        id: 'quiz_taker',
        title: 'Quiz Enthusiast',
        description: 'Completed your first quiz',
        iconUrl: 'https://img.icons8.com/ios-glyphs/100/000000/inspect-code.png',
        earnedDate: new Date(),
        isEarned: true
      });
      
      const passedQuizzes = quizAttempts.filter(a => a.passed);
      if (passedQuizzes.length >= 5) {
        achievements.push({
          id: 'quiz_master',
          title: 'Quiz Master',
          description: 'Passed at least 5 quizzes',
          iconUrl: 'https://img.icons8.com/ios-glyphs/100/000000/test-passed.png',
          earnedDate: new Date(),
          isEarned: true
        });
      }
      
      const perfectScores = quizAttempts.filter(a => a.score === a.maxScore);
      if (perfectScores.length > 0) {
        achievements.push({
          id: 'perfect_score',
          title: 'Perfect Score',
          description: 'Achieved a perfect score on a quiz',
          iconUrl: 'https://img.icons8.com/ios-glyphs/100/000000/good-quality.png',
          earnedDate: new Date(),
          isEarned: true
        });
      }
    }
    
    // Certificate-based achievements
    if (certificates && certificates.length > 0) {
      achievements.push({
        id: 'first_certificate',
        title: 'Certified Professional',
        description: 'Earned your first certificate',
        iconUrl: 'https://img.icons8.com/ios-glyphs/100/000000/certificate.png',
        earnedDate: new Date(),
        isEarned: true
      });
      
      if (certificates.length >= 3) {
        achievements.push({
          id: 'certified_expert',
          title: 'Certified Expert',
          description: 'Earned at least 3 certificates',
          iconUrl: 'https://img.icons8.com/ios-glyphs/100/000000/diploma.png',
          earnedDate: new Date(),
          isEarned: true
        });
      }
    }
    
    return achievements;
  } catch (error) {
    console.error("Error generating achievements:", error);
    return [];
  }
}
