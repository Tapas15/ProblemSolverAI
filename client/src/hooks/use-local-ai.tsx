import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getModelInfo, switchModel } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type LocalAIContextType = {
  currentModel: {
    modelName: string;
    isLoaded: boolean;
    isLoading: boolean;
  } | null;
  isLoading: boolean;
  switchModelMutation: ReturnType<typeof useMutation<any, Error, string>>;
};

export const LocalAIContext = createContext<LocalAIContextType | null>(null);

export function LocalAIProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const { 
    data: currentModel, 
    isLoading,
    refetch 
  } = useQuery<{
    modelName: string;
    isLoaded: boolean;
    isLoading: boolean;
  }>({
    queryKey: ['/api/ai/model-info'],
    queryFn: getModelInfo,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const switchModelMutation = useMutation({
    mutationFn: (modelName: string) => switchModel(modelName),
    onSuccess: () => {
      toast({
        title: "Model switched",
        description: "The AI model has been changed successfully.",
      });
      // Refetch model info after switching
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error switching model",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <LocalAIContext.Provider
      value={{
        currentModel: currentModel || null,
        isLoading,
        switchModelMutation,
      }}
    >
      {children}
    </LocalAIContext.Provider>
  );
}

export function useLocalAI() {
  const context = useContext(LocalAIContext);
  if (!context) {
    throw new Error("useLocalAI must be used within a LocalAIProvider");
  }
  return context;
}