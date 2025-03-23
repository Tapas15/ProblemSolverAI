import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Key, AlertTriangle, Settings, Bell, Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SettingsPage: React.FC = () => {
  const { user, updateAiSettingsMutation } = useAuth();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>(user?.apiKey || '');
  const [aiProvider, setAiProvider] = useState<string>(user?.aiProvider || 'openai');
  
  if (!user) {
    return null;
  }

  const handleAiSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateAiSettingsMutation.mutate(
      { apiKey, aiProvider },
      {
        onSuccess: () => {
          toast({
            title: "Settings updated",
            description: "Your AI settings have been saved successfully.",
          });
        }
      }
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-header text-primary">Account Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md bg-white sticky top-6">
              <CardContent className="pt-6">
                <nav className="space-y-1">
                  <a href="#security" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-50 text-primary">
                    <Shield className="mr-3 h-5 w-5 text-primary/70" />
                    <span>Security</span>
                  </a>
                  <a href="#api-keys" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-primary">
                    <Key className="mr-3 h-5 w-5 text-gray-400" />
                    <span>API Keys</span>
                  </a>
                  <a href="#advanced" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-primary">
                    <Settings className="mr-3 h-5 w-5 text-gray-400" />
                    <span>Advanced</span>
                  </a>
                  <a href="#privacy" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-primary">
                    <Fingerprint className="mr-3 h-5 w-5 text-gray-400" />
                    <span>Privacy</span>
                  </a>
                  <a href="#notifications" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-primary">
                    <Bell className="mr-3 h-5 w-5 text-gray-400" />
                    <span>Notifications</span>
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Security Settings */}
            <Card className="border-0 shadow-md bg-white" id="security">
              <CardHeader>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-primary mr-2" />
                  <CardTitle>Security Settings</CardTitle>
                </div>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            id="currentPassword" 
                            type="password" 
                            placeholder="Enter your current password" 
                            className="pl-10 border-gray-200"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            id="newPassword" 
                            type="password" 
                            placeholder="Enter new password" 
                            className="pl-10 border-gray-200"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Password must be at least 8 characters and include uppercase, lowercase, number and special character
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            id="confirmPassword" 
                            type="password" 
                            placeholder="Confirm new password" 
                            className="pl-10 border-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" className="mr-2">Cancel</Button>
                      <Button>Update Password</Button>
                    </div>
                  </div>
                </form>
                
                <Separator className="my-8" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Secure your account with 2FA</p>
                    </div>
                    <Button variant="outline">
                      Enable
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* API Key Settings */}
            <Card className="border-0 shadow-md bg-white" id="api-keys">
              <CardHeader>
                <div className="flex items-center">
                  <Key className="h-5 w-5 text-primary mr-2" />
                  <CardTitle>API Integrations</CardTitle>
                </div>
                <CardDescription>
                  Manage your API keys for AI integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleAiSettingsSubmit}>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 text-sm text-blue-700">
                          <p>
                            To use AI features, you'll need to provide your own API key from OpenAI or Google. 
                            Your API key is stored securely and used only for your requests.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="aiProvider">AI Provider</Label>
                      <select 
                        id="aiProvider"
                        value={aiProvider}
                        onChange={(e) => setAiProvider(e.target.value)}
                        className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      >
                        <option value="openai">OpenAI (ChatGPT)</option>
                        <option value="google">Google (Gemini)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input 
                        id="apiKey" 
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Enter your ${aiProvider === 'openai' ? 'OpenAI' : 'Google'} API key`}
                        className="border-gray-200"
                      />
                      <p className="text-xs text-gray-500">
                        Your API key is stored securely and never shared. All AI requests are made directly from your browser.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        disabled={updateAiSettingsMutation.isPending} 
                        type="submit"
                      >
                        {updateAiSettingsMutation.isPending ? 'Saving...' : 'Save API Settings'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Account Settings */}
            <Card className="border-0 shadow-md bg-white" id="advanced">
              <CardHeader>
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-primary mr-2" />
                  <CardTitle>Advanced Settings</CardTitle>
                </div>
                <CardDescription>
                  Manage advanced account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Data Management</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Export Your Data</h4>
                        <p className="text-sm text-gray-500">Download all your data including progress and quiz results</p>
                      </div>
                      <Button variant="outline">
                        Export
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-sm text-gray-500">Permanently delete your account and all associated data</p>
                      </div>
                      <Button variant="destructive">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Privacy Settings */}
            <Card className="border-0 shadow-md bg-white" id="privacy">
              <CardHeader>
                <div className="flex items-center">
                  <Fingerprint className="h-5 w-5 text-primary mr-2" />
                  <CardTitle>Privacy Settings</CardTitle>
                </div>
                <CardDescription>
                  Control how your data is used and shared
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Data Privacy Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Learning Analytics</h4>
                          <p className="text-sm text-gray-500">Allow us to collect data about your learning patterns to improve content</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Public Profile</h4>
                          <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Personalized Content</h4>
                          <p className="text-sm text-gray-500">Allow us to personalize your learning experience</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <h4 className="font-medium mb-2">Data Retention Policy</h4>
                      <p className="text-sm text-gray-600">Your data is stored securely and retained according to our privacy policy. You can request deletion of your data at any time from the Advanced Settings section.</p>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button>Save Privacy Settings</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Notification Settings */}
            <Card className="border-0 shadow-md bg-white" id="notifications">
              <CardHeader>
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-primary mr-2" />
                  <CardTitle>Notification Settings</CardTitle>
                </div>
                <CardDescription>
                  Control which notifications you receive and how
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Learning Reminders</h4>
                          <p className="text-sm text-gray-500">Receive reminders to continue your learning</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Framework Updates</h4>
                          <p className="text-sm text-gray-500">Notifications when new content is added</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Quiz Results</h4>
                          <p className="text-sm text-gray-500">Notifications about quiz scores and feedback</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Product Updates</h4>
                          <p className="text-sm text-gray-500">Stay informed about new features and improvements</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mt-8">Notification Frequency</h3>
                    
                    <div className="space-y-3 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Email Frequency</Label>
                        <select 
                          id="frequency" 
                          className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                        >
                          <option value="immediately">Immediately</option>
                          <option value="daily">Daily Digest</option>
                          <option value="weekly">Weekly Digest</option>
                          <option value="none">Don't send</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button>Save Notification Settings</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;