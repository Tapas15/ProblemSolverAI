import React, { useState } from 'react';
import AiAssistant from '@/components/ai/ai-assistant';
import { LocalAISettings } from '@/components/ai/local-ai-settings';
import { 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  MessageSquare,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AiAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  // Determine which tab should be active by default
  // If user has an API key, show the chat; otherwise show the settings
  const defaultTab = user?.apiKey ? 'chat' : 'settings';

  return (
    <div className="native-scroll pb-16">
      {/* Mobile App Header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-4">
        <div className="flex items-center">
          <h1 className="mobile-h1 text-[#0f172a]">AI Assistant</h1>
        </div>
      </div>
      
      <div className="px-4">
        <div className="mb-5 relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0A2540] via-[#0E3A5C] to-[#0078D7] p-4 shadow-lg">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[#00A5E0]/30 to-[#C5F2FF]/10 rounded-full -mt-20 -mr-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-[200px] h-[200px] bg-gradient-to-tr from-[#00A5E0]/20 to-[#C5F2FF]/10 rounded-full mb-[-100px] ml-[-100px] blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-2">
              Business Framework Assistant
            </h2>
            <p className="text-white/80 text-sm">
              Get personalized guidance on applying business frameworks to your specific challenges.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="space-y-4">
            <AiAssistant />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <LocalAISettings />
            
            {/* AI API Key Settings Card (shown only if user wants to use external providers) */}
            <div className="mt-8">
              <Button
                variant="ghost"
                className="flex items-center justify-between w-full p-2 mb-2 text-left"
                onClick={() => setShowSettings(!showSettings)}
              >
                <div className="flex items-center">
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  <span>External API Settings</span>
                </div>
                {showSettings ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
              
              {showSettings && (
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <p className="text-sm text-muted-foreground mb-4">
                    The AI Assistant can also work with external AI providers if you want to use more
                    advanced models. This is optional - the local model works without any setup.
                  </p>
                  
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-sm font-medium">OpenAI API Key (Optional)</h3>
                      <p className="text-xs text-muted-foreground">To use GPT-4o for more advanced capabilities</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium">Google Gemini API Key (Optional)</h3>
                      <p className="text-xs text-muted-foreground">To use Google's Gemini Pro models</p>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      External API keys can be configured in your profile settings page.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AiAssistantPage;
