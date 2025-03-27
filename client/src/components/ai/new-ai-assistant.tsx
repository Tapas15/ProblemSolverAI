import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { askAi, getAiConversations, getFrameworks, clearAiConversations } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLocalAI } from '@/hooks/use-local-ai';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Lightbulb, Cpu, Info, RefreshCw, Trash2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LocalAISettings } from '@/components/ai/local-ai-settings';
import ReactMarkdown from 'react-markdown';

const NewAiAssistant: React.FC = () => {
  const { user, updateAiSettingsMutation } = useAuth();
  const { currentModel } = useLocalAI();
  
  const [question, setQuestion] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('custom');
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(user?.apiKey || '');
  const [aiProvider, setAiProvider] = useState<string>(user?.aiProvider || 'local');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all available frameworks
  const { data: frameworks } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: () => getFrameworks(),
  });

  // Get conversation history
  const { 
    data: conversations, 
    isLoading: conversationsLoading,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['/api/ai/conversations'],
    queryFn: () => getAiConversations(),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't keep data in cache
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gets focus
    retryOnMount: true, // Retry if fetch fails on mount
    networkMode: 'always' // Always try to fetch from network
  });

  // Ask AI mutation
  const askAiMutation = useMutation({
    mutationFn: ({ question, frameworkId }: { question: string; frameworkId?: number }) => 
      askAi(question, frameworkId),
    onSuccess: () => {
      // Clear the question field and refetch conversations
      setQuestion('');
      refetchConversations();
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear conversations mutation
  const clearConversationsMutation = useMutation({
    mutationFn: () => clearAiConversations(),
    onSuccess: () => {
      // Invalidate and refetch conversations to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
      refetchConversations();
      
      toast({
        title: "Conversations cleared",
        description: "Your conversation history has been cleared.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error clearing conversations",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle asking a question
  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: "Empty question",
        description: "Please enter a question.",
        variant: "destructive",
      });
      return;
    }
    
    let frameworkId: number | undefined = undefined;
    if (activeTab === 'framework' && selectedFramework) {
      frameworkId = parseInt(selectedFramework);
    }
    
    askAiMutation.mutate({ question, frameworkId });
  };

  // Save AI settings
  const handleSaveAiSettings = () => {
    updateAiSettingsMutation.mutate(
      { apiKey, aiProvider },
      {
        onSuccess: () => {
          setIsAiSettingsOpen(false);
          toast({
            title: "Settings updated",
            description: "Your AI settings have been saved.",
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    );
  };

  // Helper to get framework name by ID
  const getFrameworkName = (frameworkId: number | null) => {
    if (!frameworkId || !frameworks) return null;
    const framework = frameworks.find((f: any) => f.id === frameworkId);
    return framework ? framework.name : null;
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* AI Status Indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Cpu className="h-4 w-4 text-primary" />
        <span>
          {aiProvider === 'local' ? (
            <>
              Using local AI model: {currentModel?.modelName ? (
                <Badge variant="outline" className="text-xs font-normal">
                  {currentModel.modelName.split('/')[1]}
                </Badge>
              ) : 'Loading...'}
            </>
          ) : (
            <>
              Using {aiProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} API
            </>
          )}
        </span>
      </div>
      
      {/* Question Form */}
      <Card className="border-0 shadow-sm mb-4">
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="custom">Custom Question</TabsTrigger>
              <TabsTrigger value="framework">Framework-specific</TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom">
              <form onSubmit={handleAskQuestion} className="space-y-3">
                <Textarea
                  placeholder="Ask any question about business frameworks, problem-solving techniques, or implementation challenges..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px] text-base leading-relaxed"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={askAiMutation.isPending || !question.trim()}
                    className="bg-[#0078D7] hover:bg-[#0063B1]"
                  >
                    {askAiMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Ask Question"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="framework">
              <form onSubmit={handleAskQuestion} className="space-y-3">
                <div className="mb-3">
                  <Label className="text-sm mb-1 block">Select Framework</Label>
                  <Select
                    value={selectedFramework}
                    onValueChange={setSelectedFramework}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks?.map((framework: any) => (
                        <SelectItem key={framework.id} value={framework.id.toString()}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  placeholder={`Ask a question about ${selectedFramework ? getFrameworkName(parseInt(selectedFramework)) : 'the selected framework'}...`}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px] text-base leading-relaxed"
                  disabled={!selectedFramework}
                />
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={askAiMutation.isPending || !question.trim() || !selectedFramework}
                    className="bg-[#0078D7] hover:bg-[#0063B1]"
                  >
                    {askAiMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Ask Question"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex justify-between mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetchConversations()}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        
        <div className="flex gap-2">
          {/* Clear Conversations Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => clearConversationsMutation.mutate()}
            disabled={clearConversationsMutation.isPending || conversationsLoading || !conversations?.length}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            {clearConversationsMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear History
              </>
            )}
          </Button>
          
          {/* AI Settings Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAiSettingsOpen(!isAiSettingsOpen)}
          >
            <Info className="h-4 w-4 mr-1" />
            AI Settings
          </Button>
        </div>
      </div>
      
      {/* AI Settings Panel (conditionally rendered) */}
      {isAiSettingsOpen && (
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="p-4 bg-gray-50 border-b">
            <CardTitle className="text-lg font-medium">AI Settings</CardTitle>
            <CardDescription>
              Configure your AI assistant preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiProvider">AI Provider</Label>
                <RadioGroup 
                  value={aiProvider} 
                  onValueChange={setAiProvider}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="local" id="local" />
                    <Label htmlFor="local" className="cursor-pointer">Local AI (No API key required)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="openai" id="openai" />
                    <Label htmlFor="openai" className="cursor-pointer">OpenAI (ChatGPT)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gemini" id="gemini" />
                    <Label htmlFor="gemini" className="cursor-pointer">Google (Gemini)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {aiProvider !== 'local' && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input 
                    id="apiKey" 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter your ${aiProvider === 'openai' ? 'OpenAI' : 'Google'} API key`}
                  />
                  <p className="text-xs text-gray-500">
                    Your API key is stored securely and never shared. All AI requests are made directly from your browser.
                  </p>
                </div>
              )}
              
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
          </CardContent>
        </Card>
      )}
      
      {/* Conversations List */}
      <div className="space-y-4">
        {conversationsLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0078D7]" />
          </div>
        ) : !conversations?.length ? (
          <Card className="border border-dashed border-gray-300 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Lightbulb className="h-12 w-12 text-[#0078D7]/30 mb-3" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No conversations yet</h3>
              <p className="text-gray-600 max-w-md">
                Ask a question to get started. You can ask about any business framework, problem-solving technique, or implementation challenge.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation: any) => (
              <Card key={conversation.id} className="overflow-hidden border-0 shadow-sm">
                <CardHeader className="p-4 bg-gray-50 border-b">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-medium text-gray-800">
                        Your Question
                      </CardTitle>
                      {conversation.frameworkId && (
                        <Badge variant="outline" className="text-xs">
                          {getFrameworkName(conversation.frameworkId)}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(conversation.timestamp).toLocaleString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <p className="text-gray-700">{conversation.question}</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-[#0078D7] mb-2">AI Response:</h4>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <ReactMarkdown>
                        {conversation.answer}
                      </ReactMarkdown>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewAiAssistant;