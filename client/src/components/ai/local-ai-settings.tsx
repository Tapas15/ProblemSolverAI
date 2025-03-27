import React, { useState } from 'react';
import { useLocalAI } from '@/hooks/use-local-ai';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Cpu, Download, Check, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Recommended models for different use cases
const RECOMMENDED_MODELS = [
  {
    id: 'Xenova/distilgpt2',
    name: 'DistilGPT2',
    description: 'Small, fast general purpose model (good for limited resources)',
    size: 'small',
    category: 'general'
  },
  {
    id: 'Xenova/gpt2',
    name: 'GPT2',
    description: 'Medium size general purpose language model',
    size: 'medium',
    category: 'general'
  },
  {
    id: 'Xenova/mistral-7b-instruct-v0.1',
    name: 'Mistral 7B',
    description: 'High-quality instruction-tuned model',
    size: 'large',
    category: 'instruction'
  },
  {
    id: 'Xenova/phi-2',
    name: 'Phi-2',
    description: 'Microsoft\'s small but powerful language model',
    size: 'medium',
    category: 'instruction'
  },
];

export const LocalAISettings: React.FC = () => {
  const { currentModel, isLoading, switchModelMutation } = useLocalAI();
  const [selectedModel, setSelectedModel] = useState<string>(currentModel?.modelName || 'Xenova/distilgpt2');

  const handleSwitchModel = () => {
    if (selectedModel && selectedModel !== currentModel?.modelName) {
      switchModelMutation.mutate(selectedModel);
    }
  };

  // Determine if any model operations are in progress
  const operationInProgress = isLoading || switchModelMutation.isPending || currentModel?.isLoading;

  // Helper function to render loading state for model operations
  const renderLoadingState = () => {
    if (switchModelMutation.isPending) {
      return (
        <div className="flex items-center gap-2 text-amber-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Switching model...</span>
        </div>
      );
    }

    if (currentModel?.isLoading) {
      return (
        <div className="flex items-center gap-2 text-amber-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading model...</span>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-amber-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking model status...</span>
        </div>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          <CardTitle>Local AI Settings</CardTitle>
        </div>
        <CardDescription>
          Configure the AI model that runs directly on your device, no API keys required
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Model Status */}
        <div className="bg-muted/40 p-3 rounded-md mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Current Model</h3>
            {currentModel?.isLoaded && (
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
          
          {currentModel ? (
            <div className="text-sm text-muted-foreground">
              {currentModel.modelName && currentModel.modelName.includes('/') ? 
                currentModel.modelName.split('/')[1] : 
                currentModel.modelName || 'Unknown model'
              }
              <p className="text-xs mt-1 text-muted-foreground/80">
                {currentModel.isLoaded ? 
                  "Model loaded and ready to use" : 
                  "Model is being loaded..."
                }
              </p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground/80">
              Loading model information...
            </div>
          )}
          
          {renderLoadingState()}
        </div>
        
        {/* Model Selection */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="model-select">Select Model</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="end" className="w-80">
                  <p className="text-xs">
                    Smaller models load faster and use less memory but may have lower quality responses.
                    Larger models provide better quality but require more resources and may take longer to load.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Select 
            value={selectedModel} 
            onValueChange={setSelectedModel}
            disabled={operationInProgress}
          >
            <SelectTrigger id="model-select">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>General Purpose</SelectLabel>
                {RECOMMENDED_MODELS.filter(m => m.category === 'general').map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {model.size}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Instruction Tuned</SelectLabel>
                {RECOMMENDED_MODELS.filter(m => m.category === 'instruction').map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {model.size}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <p className="text-xs text-muted-foreground mt-1">
            {RECOMMENDED_MODELS.find(m => m.id === selectedModel)?.description || 
             "Select a model to get more information"}
          </p>
        </div>
        
        {/* Info Alert */}
        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertDescription className="text-xs">
            All AI processing is done directly on your device. No data is sent to external servers,
            ensuring your conversations remain private and secure.
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleSwitchModel}
          disabled={operationInProgress || (currentModel?.modelName === selectedModel)}
        >
          {switchModelMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Switching Model...
            </>
          ) : currentModel?.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Model Loading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Apply Model Change
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};