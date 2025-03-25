import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { User, Mail, BookOpen, Award, Clock, Save, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getFrameworks, getUserProgress, getUserQuizAttempts } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const ProfilePage: React.FC = () => {
  const { user, updateAiSettingsMutation } = useAuth();
  const { toast } = useToast();
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile information",
        variant: "destructive"
      });
    }
  });

  // Update preferences mutation - deprecated, using updateDetailedPreferencesMutation instead
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update preferences');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // User form state
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    bio: ''
  });
  
  // Learning preferences state
  const [preferences, setPreferences] = useState({
    level: 'beginner',
    learningStyle: 'visual',
    theme: 'light',
    fontSize: 'medium'
  });
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    learningReminders: true,
    frameworkUpdates: true,
    quizResults: false
  });
  
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user progress data
  const { 
    data: progressData,
    isLoading: isProgressLoading 
  } = useQuery({
    queryKey: ['/api/user/progress'],
    queryFn: getUserProgress,
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch frameworks
  const {
    data: frameworks,
    isLoading: isFrameworksLoading
  } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: getFrameworks,
    staleTime: 60 * 1000,
  });

  // Fetch quiz attempts
  const {
    data: quizAttempts,
    isLoading: isQuizAttemptsLoading
  } = useQuery({
    queryKey: ['/api/quizzes/attempts/user'],
    queryFn: getUserQuizAttempts,
    staleTime: 60 * 1000,
  });
  
  // Update user preferences mutation (detailed)
  const updateDetailedPreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update preferences');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update notification settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification settings saved",
        description: "Your notification settings have been updated successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving notification settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Calculate learning statistics
  const calculateStats = () => {
    if (!progressData || !frameworks || !quizAttempts) {
      return {
        totalFrameworks: 0,
        completedFrameworks: 0,
        completedModules: 0,
        totalModules: 0,
        learningTime: '0 hrs'
      };
    }

    const totalFrameworks = frameworks.length;
    const completedFrameworks = progressData.filter(p => p.status === 'completed').length;
    
    const totalModules = progressData.reduce((sum, p) => sum + p.totalModules, 0);
    const completedModules = progressData.reduce((sum, p) => sum + (p.completedModules || 0), 0);
    
    // Estimate learning time based on completed modules (15 min per module) and quiz attempts (10 min per quiz)
    const moduleTime = completedModules * 15; // minutes
    const quizTime = quizAttempts.length * 10; // minutes
    const totalMinutes = moduleTime + quizTime;
    const learningTime = totalMinutes >= 60 
      ? `${Math.floor(totalMinutes / 60)} hrs ${totalMinutes % 60} min` 
      : `${totalMinutes} min`;
    
    return {
      totalFrameworks,
      completedFrameworks,
      completedModules,
      totalModules,
      learningTime
    };
  };
  
  // Handle personal info form submission
  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(personalInfo);
  };

  // Initialize form values when user data is available
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
      
      // Parse user preferences if they exist
      try {
        if (user.userPreferences) {
          const parsedPreferences = JSON.parse(user.userPreferences);
          setPreferences({
            level: parsedPreferences.level || 'beginner',
            learningStyle: parsedPreferences.learningStyle || 'visual',
            theme: parsedPreferences.theme || 'light',
            fontSize: parsedPreferences.fontSize || 'medium'
          });
          
          setNotifications({
            emailNotifications: parsedPreferences.emailNotifications !== false,
            learningReminders: parsedPreferences.learningReminders !== false,
            frameworkUpdates: parsedPreferences.frameworkUpdates !== false,
            quizResults: parsedPreferences.quizResults || false
          });
        }
      } catch (error) {
        console.error('Error parsing user preferences:', error);
      }
    }
  }, [user]);
  
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.id]: e.target.value
    });
  };
  
  const handlePreferencesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferences({
      ...preferences,
      [e.target.id]: e.target.value
    });
  };
  
  const handleNotificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked
    });
  };
  
  // This function will be removed as it's duplicated below
  
  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDetailedPreferencesMutation.mutate(preferences);
  };
  
  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationsMutation.mutate(notifications);
  };
  
  const stats = calculateStats();
  const isLoading = isProgressLoading || isFrameworksLoading || isQuizAttemptsLoading;
  
  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="mb-8 relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0A2540] via-[#0E3A5C] to-[#0078D7] p-6 lg:p-8 shadow-lg">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[#00A5E0]/30 to-[#C5F2FF]/10 rounded-full -mt-20 -mr-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-[200px] h-[200px] bg-gradient-to-tr from-[#00A5E0]/20 to-[#C5F2FF]/10 rounded-full mb-[-100px] ml-[-100px] blur-3xl"></div>
          
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-3xl font-bold font-header text-white mb-2">Profile</h1>
            <p className="text-white/80">
              Manage your personal information and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 border-4 border-secondary/20 mb-4">
                    <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
                    <AvatarFallback className="bg-secondary text-white text-lg">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-primary mb-1">{user.name}</h2>
                  <p className="text-sm text-gray-500 mb-4">{user.email}</p>
                  
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append('avatar', file);

                      try {
                        const response = await fetch('/api/user/avatar', {
                          method: 'POST',
                          body: formData,
                        });
                        
                        if (!response.ok) throw new Error('Upload failed');
                        
                        const data = await response.json();
                        // Refresh the page or update the avatar URL
                        window.location.reload();
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to upload avatar",
                          variant: "destructive"
                        });
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    className="mb-4 w-full"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    Change Avatar
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-3" />
                    <span className="text-sm text-gray-600">@{user.username}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-3" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 text-gray-500 mr-3" />
                    <span className="text-sm text-gray-600">Member since 2023</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-white mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Learning Stats</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-full"></div>
                    <div className="h-5 bg-gray-200 rounded w-full"></div>
                    <div className="h-5 bg-gray-200 rounded w-full"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-sm">Frameworks Mastered</span>
                      </div>
                      <span className="font-semibold">{stats.completedFrameworks}/{stats.totalFrameworks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-secondary mr-2" />
                        <span className="text-sm">Modules Completed</span>
                      </div>
                      <span className="font-semibold">{stats.completedModules}/{stats.totalModules}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Learning Time</span>
                      </div>
                      <span className="font-semibold">{stats.learningTime}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile main content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="w-full bg-gray-100/80 p-1 mb-6">
                <TabsTrigger value="personal" className="flex-1 py-2 rounded-md">
                  Personal Information
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex-1 py-2 rounded-md">
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex-1 py-2 rounded-md">
                  Notifications
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal">
                <Card className="border-0 shadow-md bg-white">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6" onSubmit={handlePersonalInfoSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={personalInfo.name} 
                            onChange={handlePersonalInfoChange}
                            className="border-gray-200" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            value={personalInfo.username} 
                            onChange={handlePersonalInfoChange}
                            className="border-gray-200" 
                            disabled
                          />
                          <p className="text-xs text-gray-500">Username cannot be changed</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={personalInfo.email} 
                            onChange={handlePersonalInfoChange}
                            className="border-gray-200" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone (optional)</Label>
                          <Input 
                            id="phone" 
                            value={personalInfo.phone} 
                            onChange={handlePersonalInfoChange}
                            placeholder="+1 (555) 123-4567" 
                            className="border-gray-200" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <textarea 
                          id="bio" 
                          value={personalInfo.bio}
                          onChange={handlePersonalInfoChange}
                          className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                          placeholder="Tell us about your professional background and interests..."
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button type="button" variant="outline" className="mr-2" onClick={() => {
                          setPersonalInfo({
                            name: user.name || '',
                            username: user.username || '',
                            email: user.email || '',
                            phone: '',
                            bio: ''
                          });
                        }}>Reset</Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <span className="mr-2">Saving...</span>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences">
                <Card className="border-0 shadow-md bg-white">
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                      Customize your learning experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6" onSubmit={handlePreferencesSubmit}>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Learning Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="level">Preferred Difficulty Level</Label>
                            <select 
                              id="level" 
                              value={preferences.level}
                              onChange={handlePreferencesChange}
                              className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="learningStyle">Learning Style</Label>
                            <select 
                              id="learningStyle" 
                              value={preferences.learningStyle}
                              onChange={handlePreferencesChange}
                              className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                            >
                              <option value="visual">Visual</option>
                              <option value="auditory">Auditory</option>
                              <option value="reading">Reading/Writing</option>
                              <option value="kinesthetic">Kinesthetic</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Display Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <select 
                              id="theme" 
                              value={preferences.theme}
                              onChange={handlePreferencesChange}
                              className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                            >
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="system">System</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fontSize">Font Size</Label>
                            <select 
                              id="fontSize" 
                              value={preferences.fontSize}
                              onChange={handlePreferencesChange}
                              className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                            >
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="mr-2"
                          onClick={() => {
                            setPreferences({
                              level: 'beginner',
                              learningStyle: 'visual',
                              theme: 'light',
                              fontSize: 'medium'
                            });
                          }}
                        >
                          Reset to Defaults
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={updatePreferencesMutation.isPending}
                        >
                          {updatePreferencesMutation.isPending ? (
                            <>
                              <span className="mr-2">Saving...</span>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Preferences
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card className="border-0 shadow-md bg-white">
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Manage how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6" onSubmit={handleNotificationsSubmit}>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Email Notifications</h3>
                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox"
                              name="emailNotifications"
                              checked={notifications.emailNotifications}
                              onChange={handleNotificationsChange}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                          </label>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Learning Reminders</h3>
                            <p className="text-sm text-gray-500">Receive reminders to continue your learning</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox"
                              name="learningReminders"
                              checked={notifications.learningReminders}
                              onChange={handleNotificationsChange}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                          </label>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Framework Updates</h3>
                            <p className="text-sm text-gray-500">Notifications when new content is added</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox"
                              name="frameworkUpdates"
                              checked={notifications.frameworkUpdates}
                              onChange={handleNotificationsChange}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                          </label>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Quiz Results</h3>
                            <p className="text-sm text-gray-500">Notifications about quiz scores and feedback</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox"
                              name="quizResults"
                              checked={notifications.quizResults || false}
                              onChange={handleNotificationsChange}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updateNotificationsMutation.isPending}
                        >
                          {updateNotificationsMutation.isPending ? (
                            <>
                              <span className="mr-2">Saving...</span>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Settings
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;