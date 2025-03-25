import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUser, updateUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningProgress } from '@/components/framework/learning-progress';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { MobileAppLayout } from '@/components/layout/mobile-app-layout';
import {LogOut} from 'lucide-react';


export default function ProfilePage() {
  const { logoutMutation } = useAuth();
  const queryClient = useQueryClient();
  const { data: user } = useQuery(['user'], getUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });

  const updateUserMutation = useMutation(updateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate(formData);
  };

  if (!user) return null;

  return (
    <MobileAppLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                    <Input
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Name"
                    />
                    <Input
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                      type="email"
                    />
                    <Textarea
                      value={formData.bio}
                      onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      className="h-32"
                    />
                    <div className="flex gap-2">
                      <Button type="submit">Save Changes</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="font-medium">Name</h3>
                      <p>{user.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p>{user.email}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Bio</h3>
                      <p className="text-sm text-gray-200">{user.bio || 'No bio added yet'}</p>
                    </div>
                    <Button onClick={() => {
                      setFormData({ name: user.name, email: user.email, bio: user.bio || '' });
                      setIsEditing(true);
                    }}>
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <LearningProgress />
            </CardContent>
          </Card>


          <div className="mb-6">
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
            <p>QuestionPro AI Web v1.0</p>
            <p className="mt-1">© 2025 QuestionPro AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </MobileAppLayout>
  );
}