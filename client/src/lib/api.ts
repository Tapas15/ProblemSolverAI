import { Framework, Module, UserProgress, AiConversation } from "@shared/schema";
import { apiRequest } from "./queryClient";

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
