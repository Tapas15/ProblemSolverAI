import React, { useState, useEffect } from 'react';
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
import { useMutation } from '@tanstack/react-query';
import { updatePassword, updatePrivacySettings, updateNotificationSettings } from '@/lib/api';
import { TwoFactorAuth } from '@/components/settings/two-factor-auth';
import { DataExport } from '@/components/settings/data-export';

const SettingsPage: React.FC = () => {
  const { user, updateAiSettingsMutation } = useAuth();
  const { toast } = useToast();
  
  // AI Settings state
  const [apiKey, setApiKey] = useState<string>(user?.apiKey || '');
  const [aiProvider, setAiProvider] = useState<string>(user?.aiProvider || 'openai');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    allowAnalytics: true,
    publicProfile: false,
    allowPersonalization: true,
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    learningReminders: true,
    frameworkUpdates: true,
    quizResults: true,
    productUpdates: false,
    emailFrequency: 'weekly' as 'immediately' | 'daily' | 'weekly' | 'none',
  });
  
  // Extract preferences from user data on component mount
  useEffect(() => {
    if (user?.userPreferences) {
      try {
        const preferences = JSON.parse(user.userPreferences);
        
        // Initialize privacy settings from user preferences
        if (preferences.privacy) {
          setPrivacySettings({
            allowAnalytics: preferences.privacy.allowAnalytics ?? true,
            publicProfile: preferences.privacy.publicProfile ?? false,
            allowPersonalization: preferences.privacy.allowPersonalization ?? true,
          });
        }
        
        // Initialize notification settings from user preferences
        if (preferences.notifications) {
          setNotificationSettings({
            learningReminders: preferences.notifications.learningReminders ?? true,
            frameworkUpdates: preferences.notifications.frameworkUpdates ?? true,
            quizResults: preferences.notifications.quizResults ?? true,
            productUpdates: preferences.notifications.productUpdates ?? false,
            emailFrequency: preferences.notifications.emailFrequency ?? 'weekly',
          });
        }
      } catch (e) {
        console.error('Failed to parse user preferences:', e);
      }
    }
  }, [user]);
  
  // Mutations for different settings
  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      updatePassword(data),
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: Error) => {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const privacyMutation = useMutation({
    mutationFn: (data: typeof privacySettings) => 
      updatePrivacySettings(data),
    onSuccess: () => {
      toast({
        title: "Privacy settings updated",
        description: "Your privacy settings have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const notificationMutation = useMutation({
    mutationFn: (data: typeof notificationSettings) => 
      updateNotificationSettings(data),
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  if (!user) {
    return null;
  }

  // Form handlers
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
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    passwordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };
  
  const handlePrivacySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    privacyMutation.mutate(privacySettings);
  };
  
  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    notificationMutation.mutate(notificationSettings);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 sm:py-8 md:py-10 px-2 sm:px-4 max-w-5xl">
        <div className="mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-header text-primary">Account Settings</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Settings sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md bg-white sticky top-6">
              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4">
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
              <CardHeader className="px-4 sm:px-6">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-base sm:text-lg">Security Settings</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <form className="space-y-4 sm:space-y-6" onSubmit={handlePasswordSubmit}>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-medium">Change Password</h3>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm">Current Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                          <Input 
                            id="currentPassword" 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password" 
                            className="pl-8 sm:pl-10 border-gray-200 text-sm h-9 sm:h-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                          <Input 
                            id="newPassword" 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password" 
                            className="pl-8 sm:pl-10 border-gray-200 text-sm h-9 sm:h-10"
                            required
                            minLength={6}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Password must be at least 6 characters long
                        </p>
                      </div>
                      
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                          <Input 
                            id="confirmPassword" 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password" 
                            className="pl-8 sm:pl-10 border-gray-200 text-sm h-9 sm:h-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="mr-2 h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
                        onClick={() => {
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={passwordMutation.isPending}
                        className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
                      >
                        {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </div>
                </form>
                
                <Separator className="my-8" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <TwoFactorAuth />
                </div>
              </CardContent>
            </Card>
            
            {/* API Key Settings */}
            <Card className="border-0 shadow-md bg-white" id="api-keys">
              <CardHeader className="px-4 sm:px-6">
                <div className="flex items-center">
                  <Key className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-base sm:text-lg">API Integrations</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Manage your API keys for AI integration
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <form className="space-y-4 sm:space-y-6" onSubmit={handleAiSettingsSubmit}>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4 mb-4 sm:mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 text-xs sm:text-sm text-blue-700">
                          <p>
                            To use AI features, you'll need to provide your own API key from OpenAI or Google. 
                            Your API key is stored securely and used only for your requests.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="aiProvider" className="text-sm">AI Provider</Label>
                      <select 
                        id="aiProvider"
                        value={aiProvider}
                        onChange={(e) => setAiProvider(e.target.value)}
                        className="w-full h-9 sm:h-10 px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      >
                        <option value="openai">OpenAI (ChatGPT)</option>
                        <option value="google">Google (Gemini)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="apiKey" className="text-sm">API Key</Label>
                      <Input 
                        id="apiKey" 
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Enter your ${aiProvider === 'openai' ? 'OpenAI' : 'Google'} API key`}
                        className="border-gray-200 text-sm h-9 sm:h-10"
                      />
                      <p className="text-xs text-gray-500">
                        Your API key is stored securely and never shared. All AI requests are made directly from your browser.
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button 
                        disabled={updateAiSettingsMutation.isPending} 
                        type="submit"
                        className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
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
              <CardHeader className="px-4 sm:px-6">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-base sm:text-lg">Advanced Settings</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Manage advanced account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-medium">Data Management</h3>
                    
                    <DataExport />
                    
                    <Separator />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                      <div>
                        <h4 className="font-medium text-sm sm:text-base">Delete Account</h4>
                        <p className="text-xs sm:text-sm text-gray-500">Permanently delete your account and all associated data</p>
                      </div>
                      <Button variant="destructive" className="h-8 sm:h-10 text-xs sm:text-sm">
                        <AlertTriangle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
                <form className="space-y-6" onSubmit={handlePrivacySubmit}>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Data Privacy Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Learning Analytics</h4>
                          <p className="text-sm text-gray-500">Allow us to collect data about your learning patterns to improve content</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={privacySettings.allowAnalytics}
                            onChange={(e) => setPrivacySettings({
                              ...privacySettings,
                              allowAnalytics: e.target.checked
                            })}
                          />
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
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={privacySettings.publicProfile}
                            onChange={(e) => setPrivacySettings({
                              ...privacySettings,
                              publicProfile: e.target.checked
                            })}
                          />
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
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={privacySettings.allowPersonalization}
                            onChange={(e) => setPrivacySettings({
                              ...privacySettings,
                              allowPersonalization: e.target.checked
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <h4 className="font-medium mb-2">Data Retention Policy</h4>
                      <p className="text-sm text-gray-600">Your data is stored securely and retained according to our privacy policy. You can request deletion of your data at any time from the Advanced Settings section.</p>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        type="submit"
                        disabled={privacyMutation.isPending}
                      >
                        {privacyMutation.isPending ? 'Saving...' : 'Save Privacy Settings'}
                      </Button>
                    </div>
                  </div>
                </form>
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
                <form className="space-y-6" onSubmit={handleNotificationSubmit}>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Learning Reminders</h4>
                          <p className="text-sm text-gray-500">Receive reminders to continue your learning</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={notificationSettings.learningReminders}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              learningReminders: e.target.checked
                            })}
                          />
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
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={notificationSettings.frameworkUpdates}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              frameworkUpdates: e.target.checked
                            })}
                          />
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
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={notificationSettings.quizResults}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              quizResults: e.target.checked
                            })}
                          />
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
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={notificationSettings.productUpdates}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              productUpdates: e.target.checked
                            })}
                          />
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
                          value={notificationSettings.emailFrequency}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            emailFrequency: e.target.value as 'immediately' | 'daily' | 'weekly' | 'none'
                          })}
                        >
                          <option value="immediately">Immediately</option>
                          <option value="daily">Daily Digest</option>
                          <option value="weekly">Weekly Digest</option>
                          <option value="none">Don't send</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        type="submit"
                        disabled={notificationMutation.isPending}
                      >
                        {notificationMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;