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
  Edit2, 
  ChevronRight,
  LogOut,
  Settings
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isNativePlatform } from '@/lib/capacitor';

const ProfilePage: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isNative, setIsNative] = useState(false);
  
  // User form state
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    bio: ''
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
  
  const handlePersonalInfoSubmit = () => {
    updateProfileMutation.mutate(personalInfo);
  };

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
        
        {/* Profile Info Card */}
        <Card className="border border-[#e2e8f0] shadow-sm mb-6">
          <CardContent className="p-4">
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
                    <Mail className="h-5 w-5 text-[#3b82f6] mr-3" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Settings and Logout Section */}
        <Card className="border border-[#e2e8f0] shadow-sm mb-6">
          <CardContent className="p-0">
            <nav>
              <div 
                className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => window.location.href = "/settings"}
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Settings className="h-5 w-5 text-[#3b82f6]" />
                  </div>
                  <span className="ml-3 font-medium">Settings</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
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
        
        {/* App version */}
        <div className="text-center text-xs text-gray-400 py-4 mt-6">
          <p>QuestionPro AI {isNative ? 'Mobile' : 'Web'} v1.0</p>
          <p className="mt-1">© 2025 QuestionPro AI. All rights reserved.</p>
        </div>
      </div>
    </MobileAppLayout>
  );
};

export default ProfilePage;