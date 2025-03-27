import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export type ModelInfo = {
  modelName: string;
  isLoaded: boolean;
  isLoading: boolean;
};

export function useLocalAI() {
  const { toast } = useToast();
  const [isSwitchingModel, setIsSwitchingModel] = useState(false);

  // Query to get model information
  const {
    data: modelData,
    isLoading: isLoadingModelInfo,
    error: modelInfoError,
    refetch: refetchModelInfo
  } = useQuery({
    queryKey: ['/api/ai/model-info'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/ai/model-info');
      return await response.json();
    },
    // Don't refetch too often to avoid unnecessary requests
    gcTime: 60 * 1000, // 1 minute
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation to switch the AI model
  const switchModelMutation = useMutation({
    mutationFn: async (modelName: string) => {
      setIsSwitchingModel(true);
      const res = await apiRequest('POST', '/api/ai/switch-model', { modelName });
      return await res.json();
    },
    onSuccess: () => {
      setIsSwitchingModel(false);
      // Invalidate the model info query to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/ai/model-info'] });
      toast({
        title: 'Model switched successfully',
        description: 'The AI model has been updated',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      setIsSwitchingModel(false);
      toast({
        title: 'Failed to switch model',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Display toast for model info errors
  useEffect(() => {
    if (modelInfoError) {
      toast({
        title: 'Error loading AI model information',
        description: (modelInfoError as Error).message,
        variant: 'destructive',
      });
    }
  }, [modelInfoError, toast]);

  return {
    currentModel: modelData?.currentModel as ModelInfo | undefined,
    recommendedModels: modelData?.recommendedModels as Record<string, string> | undefined,
    switchModel: switchModelMutation.mutate,
    isLoadingModelInfo,
    isSwitchingModel,
    refetchModelInfo,
  };
}