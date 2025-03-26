import React, { useState, useEffect } from 'react';
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
import ReactMarkdown from 'react-markdown';

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

  // Initialize API settings from user data
  useEffect(() => {
    if (user?.apiKey) {
      setApiKey(user.apiKey);
    }
    if (user?.aiProvider) {
      setAiProvider(user.aiProvider);
    }
  }, [user]);

  const { data: frameworks } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: () => getFrameworks(),
  });

  const { 
    data: conversations, 
    isLoading: conversationsLoading,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['/api/ai/conversations'],
    queryFn: () => getAiConversations(),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't keep data in cache
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gets focus
  });

  type AskQuestion = {
    question: string;
    frameworkId?: number;
  };

  const askAiMutation = useMutation({
    mutationFn: async ({ question, frameworkId }: AskQuestion) => {
      return askAi(question, frameworkId);
    },
    onSuccess: () => {
      // Clear the question input after successful query
      setQuestion('');
      
      // Manually refetch conversations to ensure we have the latest data
      refetchConversations();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const clearConversationsMutation = useMutation({
    mutationFn: clearAiConversations,
    onSuccess: () => {
      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
      toast({
        title: "Success",
        description: "Conversation history cleared",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to clear history: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmitQuestion = () => {
    if (!user?.apiKey) {
      setIsAiSettingsOpen(true);
      return;
    }

    if (!question.trim()) return;

    let frameworkId: number | undefined = undefined;
    if (activeTab === 'framework' && selectedFramework) {
      frameworkId = parseInt(selectedFramework, 10);
    }

    askAiMutation.mutate({ question, frameworkId });
  };

  const handleSaveApiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateAiSettingsMutation.mutate(
      { apiKey, aiProvider },
      {
        onSuccess: () => {
          setIsAiSettingsOpen(false);
          toast({
            title: "Success",
            description: "AI settings updated successfully",
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: `Failed to update AI settings: ${error.message}`,
            variant: "destructive",
          });
        }
      }
    );
  };

  const getFrameworkPrompt = (frameworkId: string) => {
    const framework = frameworks?.find(f => f.id.toString() === frameworkId);
    if (!framework) return "How to apply this framework to my business problem?";
    
    return `How to apply the ${framework.name} framework to my business problem?`;
  };

  return (
    <div className="space-y-6">
      {/* API Settings Dialog */}
      <Dialog open={isAiSettingsOpen} onOpenChange={setIsAiSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>AI Integration Settings</DialogTitle>
            <DialogDescription>
              Enter your API key to use the AI assistant. Your key is stored securely and used only for your requests.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveApiSettings} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiProvider">AI Provider</Label>
                <RadioGroup 
                  id="aiProvider" 
                  value={aiProvider} 
                  onValueChange={setAiProvider}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="openai" id="openai" />
                    <Label htmlFor="openai" className="font-normal">OpenAI (ChatGPT)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="google" id="google" />
                    <Label htmlFor="google" className="font-normal">Google (Gemini)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input 
                  id="apiKey" 
                  type="password" 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={`Enter your ${aiProvider === 'openai' ? 'OpenAI' : 'Google AI'} API key`}
                />
                <p className="text-xs text-gray-500">
                  {aiProvider === 'openai' 
                    ? 'Get your OpenAI API key from https://platform.openai.com/api-keys'
                    : 'Get your Google AI API key from https://ai.google.dev/'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAiSettingsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!apiKey || updateAiSettingsMutation.isPending}
              >
                {updateAiSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Question Input */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="custom">Custom Question</TabsTrigger>
              <TabsTrigger value="framework">Framework-Specific</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="custom" className="p-4 pt-2">
            <Textarea
              placeholder="Ask any question about business frameworks or problem-solving techniques..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="min-h-[100px] bg-gray-50 border-gray-200"
            />
          </TabsContent>
          
          <TabsContent value="framework" className="space-y-3 p-4 pt-2">
            <Select
              value={selectedFramework}
              onValueChange={setSelectedFramework}
            >
              <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                <SelectValue placeholder="Select a framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworks?.map(framework => (
                  <SelectItem key={framework.id} value={framework.id.toString()}>
                    {framework.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Textarea
              placeholder={
                selectedFramework 
                  ? "Ask how to apply this framework to your specific business challenge..." 
                  : "Select a framework first"
              }
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="min-h-[100px] bg-gray-50 border-gray-200"
              disabled={!selectedFramework}
            />
            
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

        <div className="flex justify-between items-center p-4 pt-0">
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
              onClick={() => clearConversationsMutation.mutate()}
              disabled={clearConversationsMutation.isPending}
              className="h-8 text-xs"
            >
              {clearConversationsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Clearing...
                </>
              ) : (
                "Clear History"
              )}
            </Button>
          )}
        </div>
        
        {conversationsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-secondary/70" />
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-4">
            {[...conversations].reverse().map((conversation) => (
              <Card key={conversation.id} className="native-card shadow-sm border-gray-200">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium text-gray-800">
                      {conversation.question}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    {new Date(conversation.createdAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <ReactMarkdown>{conversation.answer}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500">No conversation history yet. Ask a question to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAssistant;