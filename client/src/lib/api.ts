import { Framework, Module, UserProgress, AiConversation, Quiz, QuizAttempt } from "@shared/schema";
import { apiRequest } from "./queryClient";
import learningTracking from "./learning-tracking";

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
  const res = await apiRequest("POST", "/api/ai/ask", {
    question,
    frameworkId,
  });
  return res.json();
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
  
  // Don't send completedAt - let the server handle it with defaultNow()
  const res = await apiRequest("POST", "/api/quiz-attempts", {
    quizId,
    answers,
    score,
    maxScore,
    passed,
    timeTaken
  });
  return res.json();
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

// Certificate functions
export async function downloadCertificate(frameworkId: number): Promise<void> {
  // Use window.open to directly download the PDF
  window.open(`/api/frameworks/${frameworkId}/certificate`, '_blank');
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
