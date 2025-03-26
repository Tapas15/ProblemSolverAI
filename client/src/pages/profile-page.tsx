import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { MobileAppLayout } from '@/components/layout/mobile-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
// Rewards system removed as requested
import { Link } from 'wouter';
import { 
  User, 
  Mail, 
  Edit2,
  LogOut,
  Phone,
  Award,
  Save,
  Briefcase,
  MapPin,
  Calendar,
  Star,
  Globe,
  Flame
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isNativePlatform } from '@/lib/capacitor';

const ProfilePage: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  // User form state
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    company: '',
    location: '',
    website: '',
    joinDate: new Date().toISOString().split('T')[0]
  });
  
  // Fetch quiz achievements
  const { data: quizAttempts } = useQuery({
    queryKey: ['/api/quiz-attempts/user'],
    enabled: !!user
  });

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ['/api/user/progress'],
    enabled: !!user
  });

  // Fetch frameworks
  const { data: frameworks } = useQuery({
    queryKey: ['/api/frameworks'],
    enabled: !!user
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
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
      setEditingSection(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile information",
        variant: "destructive"
      });
    }
  });

  // Initialize form values when user data is available
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        company: user.company || '',
        location: user.location || '',
        website: user.website || '',
        joinDate: user.joinDate || new Date().toISOString().split('T')[0]
      });
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
  
  const handleSaveSection = (section: string) => {
    updateProfileMutation.mutate(personalInfo);
  };

  // Calculate achievements
  const getAchievements = () => {
    if (!quizAttempts || !userProgress || !frameworks) return [];
    
    const achievements = [];
    
    // Count passed quizzes
    const passedQuizzes = Array.isArray(quizAttempts) 
      ? quizAttempts.filter((attempt: any) => attempt.passed)
      : [];
      
    if (passedQuizzes.length >= 1) {
      achievements.push({ title: 'Quiz Master', description: `Passed ${passedQuizzes.length} quizzes` });
    }
    
    // Count completed frameworks
    const completedFrameworks = Array.isArray(userProgress)
      ? userProgress.filter((progress: any) => 
          progress.status === 'completed' && progress.completedModules === progress.totalModules
        )
      : [];
    
    if (completedFrameworks.length >= 1) {
      achievements.push({ 
        title: 'Framework Expert', 
        description: `Completed ${completedFrameworks.length} framework${completedFrameworks.length > 1 ? 's' : ''}` 
      });
    }
    
    // Check for perfect score
    const perfectScores = Array.isArray(quizAttempts)
      ? quizAttempts.filter((attempt: any) => attempt.score === attempt.maxScore)
      : [];
      
    if (perfectScores.length >= 1) {
      achievements.push({ title: 'Perfect Score', description: 'Achieved 100% on a quiz' });
    }
    
    return achievements;
  };

  if (!user) {
    return null;
  }

  const achievements = getAchievements();

  return (
    <div className="py-4 pb-24">
        {/* Profile Avatar/Upload Section */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-[#60a5fa]/30 shadow-lg">
              <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white text-xl">
                {user.name?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-[#3b82f6] text-white p-1.5 rounded-full border-2 border-white cursor-pointer shadow-md">
              <Edit2 className="h-4 w-4" />
            </label>
            
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
        </div>
        
        {/* Profile summary */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-500">@{user.username}</p>
          <p className="text-gray-500 mt-1">{user.email}</p>
        </div>
        
        {/* Editable Profile Section */}
        <Card className="border border-[#e2e8f0] shadow-sm mb-6">
          <CardHeader className="p-4 pb-0 flex justify-between items-center">
            <CardTitle className="text-lg">Profile Information</CardTitle>
            {editingSection !== 'profile' ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#3b82f6] hover:bg-blue-50"
                onClick={() => setEditingSection('profile')}
              >
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                className="bg-[#3b82f6]"
                onClick={() => handleSaveSection('profile')}
                disabled={updateProfileMutation.isPending}
              >
                <Save className="h-4 w-4 mr-1" /> 
                {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {editingSection === 'profile' ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={personalInfo.name}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={personalInfo.username}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={personalInfo.email}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={personalInfo.phone || ''}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={personalInfo.bio || ''}
                    onChange={handlePersonalInfoChange}
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-[#3b82f6] mr-3" />
                  <div>
                    <p className="font-medium">Username</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-[#3b82f6] mr-3" />
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <>
                    <Separator />
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-[#3b82f6] mr-3" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      </div>
                    </div>
                  </>
                )}
                
                {user.bio && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium mb-1">Bio</p>
                      <p className="text-sm text-gray-600">{user.bio}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Business Information */}
        <Card className="border border-[#e2e8f0] shadow-sm mb-6">
          <CardHeader className="p-4 pb-0 flex justify-between items-center">
            <CardTitle className="text-lg">Business Information</CardTitle>
            {editingSection !== 'business' ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#3b82f6] hover:bg-blue-50"
                onClick={() => setEditingSection('business')}
              >
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                className="bg-[#3b82f6]" 
                onClick={() => handleSaveSection('business')}
                disabled={updateProfileMutation.isPending}
              >
                <Save className="h-4 w-4 mr-1" /> 
                {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {editingSection === 'business' ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    value={personalInfo.company || ''}
                    onChange={handlePersonalInfoChange}
                    placeholder="Your company or organization"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={personalInfo.location || ''}
                    onChange={handlePersonalInfoChange}
                    placeholder="City, Country"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    value={personalInfo.website || ''}
                    onChange={handlePersonalInfoChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {user.company ? (
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-[#3b82f6] mr-3" />
                    <div>
                      <p className="font-medium">Company</p>
                      <p className="text-sm text-gray-500">{user.company}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <Briefcase className="h-5 w-5 mr-3" />
                    <p className="text-sm">No company info added</p>
                  </div>
                )}
                
                <Separator />
                
                {user.location ? (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-[#3b82f6] mr-3" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-gray-500">{user.location}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <MapPin className="h-5 w-5 mr-3" />
                    <p className="text-sm">No location added</p>
                  </div>
                )}
                
                <Separator />
                
                {user.website ? (
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-[#3b82f6] mr-3" />
                    <div>
                      <p className="font-medium">Website</p>
                      <p className="text-sm text-gray-500 truncate">{user.website}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <Globe className="h-5 w-5 mr-3" />
                    <p className="text-sm">No website added</p>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-[#3b82f6] mr-3" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-gray-500">
                      {new Date(user.joinDate || Date.now()).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Achievements Section - Replaced rewards with direct achievements display */}
        <Card className="border border-[#e2e8f0] shadow-sm mb-6">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-yellow-500" />
              Your Achievements
            </CardTitle>
            <CardDescription>
              Recognitions you've earned through your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {achievements && achievements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <Card key={index} className="border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Star className="h-5 w-5 text-yellow-500 mr-2" />
                        <h3 className="font-semibold">{achievement.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                <h3 className="mt-2 text-lg font-semibold">No achievements yet</h3>
                <p className="text-muted-foreground">
                  Complete modules and quizzes to earn achievements!
                </p>
              </div>
            )}
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
        
        {/* App version */}
        <div className="text-center text-xs text-gray-400 py-4 mt-6">
          <p>QuestionPro AI {isNative ? 'Mobile' : 'Web'} v1.0</p>
          <p className="mt-1">© 2025 QuestionPro AI. All rights reserved.</p>
        </div>
      </div>
    );
};

// Globe icon is already imported from lucide-react

export default ProfilePage;