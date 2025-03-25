import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { MobileAppLayout } from '@/components/layout/mobile-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  BookOpen, 
  Award, 
  Clock, 
  Edit2, 
  CheckCircle,
  AlertCircle, 
  Camera, 
  Settings, 
  ChevronRight,
  Lightbulb,
  LogOut,
  History,
  Bell,
  Palette,
  HelpCircle
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getFrameworks, getUserProgress, getUserQuizAttempts } from '@/lib/api';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { isNativePlatform, takePhoto } from '@/lib/capacitor';

const ProfilePage: React.FC = () => {
  const { user, updateAiSettingsMutation, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isNative, setIsNative] = useState(false);
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        // Try POST first (new API)
        const res = await apiRequest("POST", "/api/user/profile", data);
        return await res.json();
      } catch (error) {
        console.error('Profile update error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile information",
        variant: "destructive"
      });
    }
  });

  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/user/notifications", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification settings saved",
        description: "Your notification settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving settings",
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
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    learningReminders: true,
    frameworkUpdates: true,
    quizResults: false
  });

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
    queryKey: ['/api/quiz-attempts/user'],
    queryFn: getUserQuizAttempts,
    staleTime: 60 * 1000,
  });
  
  // Calculate learning statistics
  const calculateStats = () => {
    if (!progressData || !frameworks || !quizAttempts) {
      return {
        totalFrameworks: 0,
        completedFrameworks: 0,
        completedModules: 0,
        totalModules: 0,
        learningTime: '0 hrs',
        quizzesTaken: 0,
        avgScore: 0,
        progressPercentage: 0
      };
    }

    const totalFrameworks = frameworks.length;
    const completedFrameworks = progressData.filter(p => p.status === 'completed').length;
    
    const totalModules = progressData.reduce((sum, p) => sum + p.totalModules, 0);
    const completedModules = progressData.reduce((sum, p) => sum + (p.completedModules || 0), 0);
    
    // Calculate overall progress percentage
    const progressPercentage = totalModules > 0 
      ? Math.round((completedModules / totalModules) * 100) 
      : 0;
    
    // Calculate average quiz score
    const totalQuizzes = quizAttempts.length;
    const avgScore = totalQuizzes > 0
      ? Math.round(quizAttempts.reduce((sum, q) => sum + q.score, 0) / totalQuizzes)
      : 0;
    
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
      learningTime,
      quizzesTaken: totalQuizzes,
      avgScore,
      progressPercentage
    };
  };
  
  // Handle personal info form submission
  const handlePersonalInfoSubmit = () => {
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

    // Check if running in native mode
    setIsNative(isNativePlatform());
  }, [user]);
  
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.id]: e.target.value
    });
  };
  
  const handleNotificationChange = (setting: string, value: boolean) => {
    const updatedNotifications = {
      ...notifications,
      [setting]: value
    };
    
    setNotifications(updatedNotifications);
    updateNotificationsMutation.mutate(updatedNotifications);
  };
  
  const handleTakePhoto = async () => {
    try {
      if (!isNative) {
        document.getElementById('avatar-upload')?.click();
        return;
      }
      
      const photoData = await takePhoto();
      if (!photoData) return;
      
      // Convert base64 to blob
      const response = await fetch(photoData);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.jpg');
      
      // Upload photo
      const uploadResponse = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) throw new Error('Upload failed');
      
      toast({
        title: "Avatar updated",
        description: "Your profile photo has been updated",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: "Photo upload failed",
        description: "Could not upload your photo. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const stats = calculateStats();
  const isLoading = isProgressLoading || isFrameworksLoading || isQuizAttemptsLoading;
  
  if (!user) {
    return null;
  }

  return (
    <MobileAppLayout>
      <div className="py-4 px-4">
        {/* Header with blue gradient background */}
        <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f2544] to-[#19355f] p-5">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[#3b82f6]/20 rounded-full -mt-10 -mr-10 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-[80px] h-[80px] bg-[#60a5fa]/10 rounded-full mb-[-40px] ml-[-20px] blur-xl"></div>
          
          {isEditing ? (
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">Edit Profile</h1>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/10"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-white/80 text-sm">Full Name</Label>
                  <Input 
                    id="name" 
                    value={personalInfo.name}
                    onChange={handlePersonalInfoChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="username" className="text-white/80 text-sm">Username</Label>
                  <Input 
                    id="username" 
                    value={personalInfo.username}
                    onChange={handlePersonalInfoChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white flex-1"
                  onClick={handlePersonalInfoSubmit}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center relative z-10">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-[#60a5fa]/30">
                  <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
                  <AvatarFallback className="bg-[#3b82f6] text-white text-lg">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                  onClick={handleTakePhoto}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                
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
                      
                      toast({
                        title: "Avatar updated",
                        description: "Your profile photo has been updated",
                      });
                      
                      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to upload avatar",
                        variant: "destructive"
                      });
                    }
                  }}
                />
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{user.name}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-white/70 text-sm">@{user.username}</p>
                <p className="text-white/70 text-sm mt-1">{user.email}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Learning Progress Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-[#3b82f6]" />
            Learning Progress
          </h2>
          
          <Card className="border border-[#e2e8f0] shadow-sm mb-3">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-bold">{stats.progressPercentage}%</span>
              </div>
              <Progress value={stats.progressPercentage} className="h-2 bg-gray-100" />
              
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <BookOpen className="h-4 w-4 mr-1.5 text-[#3b82f6]" />
                    Modules
                  </div>
                  <p className="font-bold">{stats.completedModules} <span className="text-sm font-normal text-gray-500">/ {stats.totalModules}</span></p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Award className="h-4 w-4 mr-1.5 text-amber-500" />
                    Frameworks
                  </div>
                  <p className="font-bold">{stats.completedFrameworks} <span className="text-sm font-normal text-gray-500">/ {stats.totalFrameworks}</span></p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <History className="h-4 w-4 mr-1.5 text-emerald-500" />
                    Quizzes Taken
                  </div>
                  <p className="font-bold">{stats.quizzesTaken}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1.5 text-violet-500" />
                    Learning Time
                  </div>
                  <p className="font-bold">{stats.learningTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {!isLoading && stats.quizzesTaken > 0 && (
            <Card className="border border-[#e2e8f0] shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Average Quiz Score</span>
                  <span className={`text-sm font-bold ${
                    stats.avgScore >= 80 ? 'text-emerald-500' : 
                    stats.avgScore >= 70 ? 'text-amber-500' : 'text-rose-500'
                  }`}>{stats.avgScore}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      stats.avgScore >= 80 ? 'bg-emerald-500' : 
                      stats.avgScore >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`} 
                    style={{ width: `${stats.avgScore}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Settings Menu */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-[#3b82f6]" />
            Settings
          </h2>
          
          <Card className="border border-[#e2e8f0] shadow-sm">
            <CardContent className="p-0">
              <nav className="divide-y divide-gray-100">
                {/* Account */}
                <div 
                  className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => window.location.href = "/settings"}
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-[#3b82f6]" />
                    </div>
                    <div className="ml-3">
                      <span className="font-medium">Account Settings</span>
                      <p className="text-sm text-gray-500">Security, password, 2FA</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                
                {/* AI Settings */}
                <div 
                  className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => window.location.href = "/settings?tab=ai"}
                >
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <Lightbulb className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="ml-3">
                      <span className="font-medium">AI Integration</span>
                      <p className="text-sm text-gray-500">Connect API keys and preferences</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                
                {/* Display Settings */}
                <div 
                  className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => window.location.href = "/settings?tab=appearance"}
                >
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Palette className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="ml-3">
                      <span className="font-medium">Appearance</span>
                      <p className="text-sm text-gray-500">Theme and display options</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Notifications */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-[#3b82f6]" />
            Notifications
          </h2>
          
          <Card className="border border-[#e2e8f0] shadow-sm">
            <CardContent className="py-2">
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between py-3 px-4">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch 
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between py-3 px-4">
                  <div>
                    <p className="font-medium">Learning Reminders</p>
                    <p className="text-sm text-gray-500">Get reminders to continue learning</p>
                  </div>
                  <Switch 
                    checked={notifications.learningReminders}
                    onCheckedChange={(checked) => handleNotificationChange('learningReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between py-3 px-4">
                  <div>
                    <p className="font-medium">Framework Updates</p>
                    <p className="text-sm text-gray-500">New or updated framework alerts</p>
                  </div>
                  <Switch 
                    checked={notifications.frameworkUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('frameworkUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between py-3 px-4">
                  <div>
                    <p className="font-medium">Quiz Results</p>
                    <p className="text-sm text-gray-500">Get notified about quiz results</p>
                  </div>
                  <Switch 
                    checked={notifications.quizResults}
                    onCheckedChange={(checked) => handleNotificationChange('quizResults', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Help and Support */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-[#3b82f6]" />
            Help & Support
          </h2>
          
          <Card className="border border-[#e2e8f0] shadow-sm mb-4">
            <CardContent className="p-0">
              <nav>
                <a 
                  href="#" 
                  className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Contact Support</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </a>
                <Separator />
                <a 
                  href="#" 
                  className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">User Guide</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </a>
                <Separator />
                <a 
                  href="#" 
                  className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Privacy Policy</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </a>
              </nav>
            </CardContent>
          </Card>
          
          <Button 
            variant="outline" 
            className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
        
        {/* App version */}
        <div className="text-center text-xs text-gray-400 py-4">
          <p>QuestionPro AI {isNative ? 'Mobile' : 'Web'} v1.0</p>
          <p className="mt-1">© 2025 QuestionPro AI. All rights reserved.</p>
        </div>
      </div>
    </MobileAppLayout>
  );
};

export default ProfilePage;