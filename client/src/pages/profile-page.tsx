import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { User, Mail, BookOpen, Award, Clock } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-header text-primary">Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 border-4 border-secondary/20 mb-4">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback className="bg-secondary text-white text-lg">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-primary mb-1">{user.name}</h2>
                  <p className="text-sm text-gray-500 mb-4">{user.email}</p>
                  
                  <Button variant="outline" className="mb-4 w-full">
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-sm">Frameworks Mastered</span>
                    </div>
                    <span className="font-semibold">3/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-secondary mr-2" />
                      <span className="text-sm">Modules Completed</span>
                    </div>
                    <span className="font-semibold">23/61</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">Learning Time</span>
                    </div>
                    <span className="font-semibold">12 hrs</span>
                  </div>
                </div>
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
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" defaultValue={user.name} className="border-gray-200" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" defaultValue={user.username} className="border-gray-200" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" defaultValue={user.email} className="border-gray-200" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone (optional)</Label>
                          <Input id="phone" placeholder="+1 (555) 123-4567" className="border-gray-200" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <textarea 
                          id="bio" 
                          className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                          placeholder="Tell us about your professional background and interests..."
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button variant="outline" className="mr-2">Cancel</Button>
                        <Button>Save Changes</Button>
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
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Learning Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="level">Preferred Difficulty Level</Label>
                            <select 
                              id="level" 
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
                        <Button variant="outline" className="mr-2">Reset to Defaults</Button>
                        <Button>Save Preferences</Button>
                      </div>
                    </div>
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
                    <div className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Email Notifications</h3>
                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
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
                            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
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
                            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
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
                            <input type="checkbox" value="" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>Save Settings</Button>
                      </div>
                    </div>
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