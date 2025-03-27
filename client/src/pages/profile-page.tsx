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
  Star
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
        
        {/* Achievements Dashboard Section */}
        <Card className="border border-[#e2e8f0] shadow-sm mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] p-4">
            <CardTitle className="text-lg flex items-center text-white">
              <Award className="h-5 w-5 text-white mr-2" />
              Achievement Dashboard
            </CardTitle>
            <p className="text-blue-100 text-sm mt-1">Track your learning progress</p>
          </div>
          
          <CardContent className="p-4">
            {achievements.length > 0 ? (
              <>
                {/* Achievement Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-blue-600 text-xl font-bold">
                      {Array.isArray(userProgress) ? userProgress.filter((p: any) => p.status === 'completed').length : 0}
                    </div>
                    <div className="text-blue-700 text-xs">
                      Frameworks
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-blue-600 text-xl font-bold">
                      {Array.isArray(userProgress) ? userProgress.reduce((sum: number, p: any) => sum + (p.completedModules || 0), 0) : 0}
                    </div>
                    <div className="text-blue-700 text-xs">
                      Modules
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-blue-600 text-xl font-bold">
                      {Array.isArray(quizAttempts) ? quizAttempts.filter((a: any) => a.passed).length : 0}
                    </div>
                    <div className="text-blue-700 text-xs">
                      Quizzes
                    </div>
                  </div>
                </div>
                
                {/* Achievement Badges */}
                <div className="space-y-3 mb-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="bg-gradient-to-r from-white to-blue-50 border border-blue-100 rounded-lg p-3 flex items-center">
                      <div className="bg-blue-500 p-2 rounded-full mr-3">
                        {achievement.title === 'Quiz Master' && (
                          <Award className="h-5 w-5 text-white" />
                        )}
                        {achievement.title === 'Framework Expert' && (
                          <Briefcase className="h-5 w-5 text-white" />
                        )}
                        {achievement.title === 'Perfect Score' && (
                          <Star className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-blue-800">{achievement.title}</h3>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Level {index + 1}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Overall Progress */}
                <div className="mt-4">
                  <div className="flex justify-between mb-1 items-center">
                    <span className="text-sm font-medium text-blue-800">Overall Progress</span>
                    <span className="text-sm font-medium text-blue-800">
                      {Math.round(
                        ((Array.isArray(userProgress) ? userProgress.reduce((sum: number, p: any) => sum + (p.completedModules || 0), 0) : 0) || 0) / 
                        ((Array.isArray(userProgress) ? userProgress.reduce((sum: number, p: any) => sum + p.totalModules, 0) : 1) || 1) * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2.5 rounded-full" 
                      style={{ 
                        width: `${Math.round(
                          ((Array.isArray(userProgress) ? userProgress.reduce((sum: number, p: any) => sum + (p.completedModules || 0), 0) : 0) || 0) / 
                          ((Array.isArray(userProgress) ? userProgress.reduce((sum: number, p: any) => sum + p.totalModules, 0) : 1) || 1) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Coming Soon Achievements */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Coming Soon</h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex-1 min-w-[130px] opacity-70">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 mb-2">
                        Master Thinker
                      </Badge>
                      <p className="text-sm text-gray-500">Complete all frameworks</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="bg-blue-50 inline-flex rounded-full p-4 mb-4">
                  <Award className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">No Achievements Yet</h3>
                <p className="text-gray-500 text-sm mt-2">Complete quizzes and modules to earn achievements</p>
                <Button 
                  variant="outline" 
                  className="mt-4 text-blue-500 border-blue-200"
                  onClick={() => window.location.href = "/frameworks"}
                >
                  Explore Frameworks
                </Button>
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
          <p>Framework Pro {isNative ? 'Mobile' : 'Web'} v1.0</p>
          <p className="mt-1">© 2025 Framework Pro. All rights reserved.</p>
        </div>
      </div>
    );
};

// Missing Globe icon from lucide-react, adding import
const Globe = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default ProfilePage;