import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { MobileAppLayout } from '@/components/layout/mobile-app-layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, LogOut } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const ProfilePage: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/user/profile", data);
      return await res.json();
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

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handlePersonalInfoSubmit = () => {
    updateProfileMutation.mutate(personalInfo);
  };

  return (
    <MobileAppLayout>
      <div className="py-4 px-4">
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
                  <Label htmlFor="email" className="text-white/80 text-sm">Email</Label>
                  <Input 
                    id="email" 
                    value={personalInfo.email}
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
                  <AvatarImage src={user?.avatarUrl || ''} alt={user?.name} />
                  <AvatarFallback className="bg-[#3b82f6] text-white text-lg">
                    {user?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-white/60 text-sm">{user?.email}</p>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-500"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </MobileAppLayout>
  );
};

export default ProfilePage;