import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { askAi, getAiConversations, getFrameworks } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Lightbulb } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  
  const askAiMutation = useMutation({
    mutationFn: (question: string) => askAi(question),
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
  
  const handleSubmitQuestion = () => {
    if (!question.trim()) return;
    
    if (!user?.apiKey) {
      setIsAiSettingsOpen(true);
      return;
    }
    
    askAiMutation.mutate(question);
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold font-header text-primary mb-4">
          AI Business Framework Assistant
        </h2>
        
        <p className="text-gray-600 mb-4">
          Ask specific questions about applying business frameworks to your unique challenges.
          The AI assistant will provide tailored guidance to help you implement solutions.
        </p>
        
        <div className="mb-4">
          <Textarea
            rows={4}
            placeholder="Example: How can I apply the MECE framework to analyze customer satisfaction issues in our retail business?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <button
            className="text-sm text-secondary hover:underline flex items-center"
            onClick={() => setIsAiSettingsOpen(true)}
          >
            {user?.apiKey ? "Update AI Settings" : "Configure AI Integration"}
          </button>
          
          <Button
            onClick={handleSubmitQuestion}
            disabled={askAiMutation.isPending || !question.trim()}
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
        <h3 className="text-lg font-semibold font-header text-primary">Recent Conversations</h3>
        
        {conversationsLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-secondary" />
            <p className="text-gray-500 mt-2">Loading conversations...</p>
          </div>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conversation) => (
            <Card key={conversation.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 py-3 px-4">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {conversation.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 whitespace-pre-line">
                  {conversation.answer}
                </div>
              </CardContent>
            </Card>
          ))
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
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input 
                id="api-key"
                type="password"
                placeholder="Enter your API key"
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
