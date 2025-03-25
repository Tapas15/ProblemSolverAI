import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { updateUserPreferences } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

interface UserPreferences {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  learningStyle: 'visual',
  theme: 'light',
  fontSize: 'medium',
};

export function UserPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  
  // Extract preferences from user data on component mount
  useEffect(() => {
    if (user?.userPreferences) {
      try {
        const userPrefs = JSON.parse(user.userPreferences);
        
        if (userPrefs.display) {
          setPreferences({
            learningStyle: userPrefs.display.learningStyle || DEFAULT_PREFERENCES.learningStyle,
            theme: userPrefs.display.theme || DEFAULT_PREFERENCES.theme,
            fontSize: userPrefs.display.fontSize || DEFAULT_PREFERENCES.fontSize,
          });
        }
      } catch (e) {
        console.error('Failed to parse user preferences:', e);
      }
    }
  }, [user]);
  
  const preferenceMutation = useMutation({
    mutationFn: (data: UserPreferences) => 
      updateUserPreferences({ display: data }),
    onSuccess: () => {
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handlePreferenceChange = (key: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleResetDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };
  
  const handleSavePreferences = () => {
    preferenceMutation.mutate(preferences);
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-medium">Learning Style</h3>
          
          <div className="space-y-2">
            <Label htmlFor="learningStyle">Learning Style</Label>
            <Select 
              value={preferences.learningStyle}
              onValueChange={(value) => handlePreferenceChange('learningStyle', value)}
            >
              <SelectTrigger id="learningStyle" className="w-full">
                <SelectValue placeholder="Select learning style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">Visual</SelectItem>
                <SelectItem value="auditory">Auditory</SelectItem>
                <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                <SelectItem value="reading">Reading/Writing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-medium">Display Settings</h3>
          
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select 
              value={preferences.theme}
              onValueChange={(value) => handlePreferenceChange('theme', value)}
            >
              <SelectTrigger id="theme" className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fontSize">Font Size</Label>
            <Select 
              value={preferences.fontSize}
              onValueChange={(value) => handlePreferenceChange('fontSize', value)}
            >
              <SelectTrigger id="fontSize" className="w-full">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-3 mt-6 w-full">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleResetDefaults}
            className="w-full sm:w-auto"
          >
            Reset to Defaults
          </Button>
          <Button 
            type="button"
            onClick={handleSavePreferences}
            disabled={preferenceMutation.isPending}
            className="bg-[#0A2540] hover:bg-[#1a4482] w-full sm:w-auto"
          >
            {preferenceMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}