import { useLocalAI } from '@/hooks/use-local-ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Server, Cpu, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function LocalAISettings() {
  const { currentModel, recommendedModels, switchModel, isLoadingModelInfo, isSwitchingModel, refetchModelInfo } = useLocalAI();
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Handle model switch
  const handleModelSwitch = () => {
    if (selectedModel && selectedModel !== currentModel?.modelName) {
      switchModel(selectedModel);
    }
  };

  // Reset selected model when current model changes
  if (currentModel && !selectedModel) {
    setSelectedModel(currentModel.modelName);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" /> Local AI Model Settings
        </CardTitle>
        <CardDescription>
          Manage the AI model used for generating responses without requiring an API key
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingModelInfo ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Current Model</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={currentModel?.isLoaded ? "default" : "outline"}>
                    {currentModel?.isLoaded ? "Loaded" : "Not Loaded"}
                  </Badge>
                  <span className="text-sm font-mono">{currentModel?.modelName || "Unknown"}</span>
                  {currentModel?.isLoading && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                      Loading...
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Switch Model</h3>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                    disabled={isSwitchingModel}
                  >
                    <SelectTrigger className="w-[270px]">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {recommendedModels && Object.entries(recommendedModels).map(([size, modelName]) => (
                        <SelectItem key={modelName} value={modelName}>
                          {size.charAt(0).toUpperCase() + size.slice(1)} - {modelName.split('/')[1]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={handleModelSwitch}
                    disabled={!selectedModel || selectedModel === currentModel?.modelName || isSwitchingModel}
                  >
                    {isSwitchingModel ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Switching...
                      </>
                    ) : (
                      <>Switch</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1">Size Guide</h3>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Small: Faster responses, less memory usage, simpler outputs</li>
                <li>• Medium: Balance between speed and quality</li>
                <li>• Large: Higher quality responses, slower, uses more memory</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground flex items-center">
          <Cpu className="h-3 w-3 mr-1" /> 
          Local processing: No API keys required
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refetchModelInfo()}
          disabled={isLoadingModelInfo}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingModelInfo ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
}