import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { askAi, getAiConversations, getFrameworks, clearAiConversations } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Lightbulb } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AiAssistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('custom');
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState('openai');
  
  const { user, updateAiSettingsMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: frameworks } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: () => getFrameworks(),
  });
  
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/ai/conversations'],
    queryFn: () => getAiConversations(),
  });
  
  type AskQuestion = {
    question: string;
    frameworkId?: number;
  };
  
  const askAiMutation = useMutation({
    mutationFn: ({ question, frameworkId }: AskQuestion) => askAi(question, frameworkId),
    onSuccess: () => {
      setQuestion('');
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to get AI response",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Framework-specific prompt templates
  const getFrameworkPrompt = (frameworkId: string): string => {
    const framework = frameworks?.find(f => f.id.toString() === frameworkId);
    if (!framework) return '';
    
    switch (framework.name) {
      case 'MECE Framework':
        return `How can I apply the MECE (Mutually Exclusive, Collectively Exhaustive) framework to break down this problem: ${question}`;
      case 'SWOT Analysis':
        return `Help me conduct a SWOT Analysis for the following situation: ${question}`;
      case 'First Principles Thinking':
        return `Using First Principles Thinking, how would you approach this challenge: ${question}`;
      case 'Porter\'s Five Forces':
        return `Analyze the following industry using Porter's Five Forces framework: ${question}`;
      case 'Design Thinking':
        return `How can I apply Design Thinking to solve this problem: ${question}`;
      case 'Jobs To Be Done':
        return `Using the Jobs To Be Done framework, analyze this customer need: ${question}`;
      case 'Blue Ocean Strategy':
        return `How can I create a Blue Ocean Strategy for this market opportunity: ${question}`;
      case 'SCAMPER':
        return `Apply the SCAMPER technique to innovate on this product/service: ${question}`;
      case 'Problem-Tree Analysis':
        return `Help me build a Problem-Tree Analysis for this issue: ${question}`;
      case 'Pareto Principle':
        return `Apply the Pareto Principle (80/20 rule) to optimize this situation: ${question}`;
      default:
        return question;
    }
  };
  
  const handleSubmitQuestion = () => {
    if (!question.trim()) return;
    
    if (!user?.apiKey) {
      setIsAiSettingsOpen(true);
      return;
    }
    
    if (activeTab === 'framework' && selectedFramework) {
      // For framework-guided mode, send the formatted prompt and the framework ID
      const frameworkIdNumber = parseInt(selectedFramework, 10);
      const finalQuestion = getFrameworkPrompt(selectedFramework);
      
      askAiMutation.mutate({
        question: finalQuestion,
        frameworkId: frameworkIdNumber
      });
    } else {
      // For custom questions, just send the question without a framework ID
      askAiMutation.mutate({
        question: question
      });
    }
  };
  
  const handleSaveAiSettings = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
      return;
    }
    
    updateAiSettingsMutation.mutate(
      { apiKey, aiProvider },
      {
        onSuccess: () => {
          setIsAiSettingsOpen(false);
          toast({
            title: "AI Settings Saved",
            description: "Your AI integration has been configured successfully.",
          });
        }
      }
    );
  };
  
  return (
    <div>
      <div className="native-card mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="mobile-h3 text-[#0f172a]">
            Ask a Question
          </h3>
          
          <Button 
            variant="outline" 
            className="h-8 px-3 text-xs"
            onClick={() => setIsAiSettingsOpen(true)}
          >
            Configure API
          </Button>
        </div>
        
        <p className="text-[#64748b] text-sm mb-4">
          Get tailored guidance for applying business frameworks to your unique challenges.
        </p>
        
        <Tabs defaultValue="custom" value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom">Custom Question</TabsTrigger>
            <TabsTrigger value="framework">Framework-Guided</TabsTrigger>
          </TabsList>
          
          <TabsContent value="custom" className="pt-4">
            <Textarea
              rows={4}
              placeholder="Example: How can I apply the MECE framework to analyze customer satisfaction issues in our retail business?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full"
            />
          </TabsContent>
          
          <TabsContent value="framework" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="framework-select" className="text-sm font-medium">
                Select a framework
              </Label>
              <Select
                value={selectedFramework}
                onValueChange={setSelectedFramework}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Choose a business framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworks?.map((framework) => (
                    <SelectItem key={framework.id} value={framework.id.toString()}>
                      {framework.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="question-input" className="text-sm font-medium">
                Your specific challenge or situation
              </Label>
              <Textarea
                id="question-input"
                rows={3}
                placeholder="Describe your business challenge or situation"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full mt-1"
              />
            </div>
            
            {selectedFramework && (
              <Card className="bg-secondary/5 border-secondary/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <CardDescription className="text-xs text-secondary font-medium mb-1">
                      AI will adapt your question to this format:
                    </CardDescription>
                    <p className="text-sm text-gray-700">
                      {getFrameworkPrompt(selectedFramework)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center">
          <button
            className="text-sm text-secondary hover:underline flex items-center"
            onClick={() => setIsAiSettingsOpen(true)}
          >
            {user?.apiKey ? "Update AI Settings" : "Configure AI Integration"}
          </button>
          
          <Button
            onClick={handleSubmitQuestion}
            disabled={
              askAiMutation.isPending || 
              !question.trim() || 
              (activeTab === 'framework' && !selectedFramework)
            }
            className="bg-secondary hover:bg-secondary/90"
          >
            {askAiMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Ask AI Assistant"
            )}
          </Button>
        </div>
      </div>
      
      {/* AI Conversations History */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="mobile-h3 text-[#0f172a]">Recent Conversations</h3>
          
          {conversations && conversations.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => {
                clearAiConversations();
                queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
                toast({
                  title: "Conversations cleared",
                  description: "Your conversation history has been cleared.",
                });
              }}
            >
              Clear History
            </Button>
          )}
        </div>
        
        {conversationsLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-secondary" />
            <p className="text-gray-500 mt-2">Loading conversations...</p>
          </div>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conversation) => {
            // Find the framework name if the conversation has a frameworkId
            const framework = conversation.frameworkId && frameworks ? 
              frameworks.find(f => f.id === conversation.frameworkId) : null;
              
            return (
              <Card key={conversation.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 py-3 px-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {conversation.question}
                    </CardTitle>
                    {framework && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                        {framework.name}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {conversation.answer}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No conversations yet. Start by asking a question above.</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* AI Settings Dialog */}
      <Dialog open={isAiSettingsOpen} onOpenChange={setIsAiSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure AI Integration</DialogTitle>
            <DialogDescription>
              Enter your API key to connect with your preferred AI service
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai-provider">AI Provider</Label>
              <RadioGroup 
                value={aiProvider} 
                onValueChange={setAiProvider}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="openai" id="openai" />
                  <Label htmlFor="openai">OpenAI (GPT-4o)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="google" id="google" />
                  <Label htmlFor="google">Google (Gemini Pro)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input 
                id="api-key"
                type="password"
                placeholder={`Enter your ${aiProvider === 'openai' ? 'OpenAI' : 'Google AI'} API key`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Your API key is stored securely and used only for your AI requests.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAiSettingsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAiSettings}
                disabled={updateAiSettingsMutation.isPending}
                className="bg-secondary hover:bg-secondary/90"
              >
                {updateAiSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AiAssistant;
