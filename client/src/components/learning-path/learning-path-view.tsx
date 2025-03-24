import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFrameworks, getUserProgress } from '@/lib/api';
import { Framework, UserProgress } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ArrowRight, CheckCircle, BookOpen, BookCheck, Target } from 'lucide-react';
import { Link } from 'wouter';

const LearningPathView: React.FC = () => {
  const { data: frameworks, isLoading: frameworksLoading } = useQuery<Framework[]>({
    queryKey: ['/api/frameworks'],
    queryFn: () => getFrameworks(),
  });
  
  const { data: userProgress, isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ['/api/user/progress'],
    queryFn: () => getUserProgress(),
  });
  
  const isLoading = frameworksLoading || progressLoading;
  
  // Get user's learning status
  const getLearningStatus = () => {
    if (!frameworks || !userProgress) return { level: 'Beginner', nextLevel: 'Intermediate' };
    
    const completedFrameworks = userProgress.filter(p => p.status === 'completed').length;
    const totalFrameworks = frameworks.length;
    
    if (completedFrameworks === 0) return { level: 'Beginner', nextLevel: 'Intermediate' };
    if (completedFrameworks < totalFrameworks / 3) return { level: 'Beginner', nextLevel: 'Intermediate' };
    if (completedFrameworks < totalFrameworks * 2 / 3) return { level: 'Intermediate', nextLevel: 'Advanced' };
    if (completedFrameworks < totalFrameworks) return { level: 'Advanced', nextLevel: 'Expert' };
    return { level: 'Expert', nextLevel: null };
  };
  
  // Order frameworks by recommended learning path
  const getRecommendedPath = () => {
    if (!frameworks || !userProgress) return [];
    
    // First, add in-progress frameworks
    let recommended = [...frameworks].sort((a, b) => {
      const progressA = userProgress.find(p => p.frameworkId === a.id);
      const progressB = userProgress.find(p => p.frameworkId === b.id);
      
      // Sort in-progress first
      if (progressA?.status === 'in_progress' && progressB?.status !== 'in_progress') return -1;
      if (progressA?.status !== 'in_progress' && progressB?.status === 'in_progress') return 1;
      
      // Then sort not started
      if ((!progressA || progressA.status === 'not_started') && 
          (progressB && progressB.status !== 'not_started')) return -1;
      if ((progressA && progressA.status !== 'not_started') && 
          (!progressB || progressB.status === 'not_started')) return 1;
      
      // Sort completed last
      if (progressA?.status === 'completed' && progressB?.status !== 'completed') return 1;
      if (progressA?.status !== 'completed' && progressB?.status === 'completed') return -1;
      
      // Sort by difficulty level (if defined)
      const difficultyMap: Record<string, number> = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
      const diffA = difficultyMap[a.level?.toLowerCase() || ''] || 2;
      const diffB = difficultyMap[b.level?.toLowerCase() || ''] || 2;
      return diffA - diffB;
    });
    
    return recommended;
  };
  
  const getProgressPercentage = (frameworkId: number) => {
    if (!userProgress) return 0;
    const progress = userProgress.find(p => p.frameworkId === frameworkId);
    if (!progress) return 0;
    if (progress.status === 'completed') return 100;
    if (progress.status === 'not_started') return 0;
    
    // Calculate based on completed modules
    return progress.totalModules > 0 
      ? Math.round(((progress.completedModules || 0) / progress.totalModules) * 100) 
      : 0;
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">In Progress</Badge>;
      case 'not_started':
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Not Started</Badge>;
    }
  };
  
  const { level, nextLevel } = getLearningStatus();
  const recommendedFrameworks = getRecommendedPath();
  
  // Get the next framework that should be focused on
  const getNextFocusFramework = () => {
    if (!recommendedFrameworks.length) return null;
    return recommendedFrameworks[0];
  };
  
  const nextFocusFramework = getNextFocusFramework();
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-64 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Current learning level and status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Target className="mr-2 h-6 w-6 text-secondary" />
            Your Learning Journey
          </CardTitle>
          <CardDescription>
            Track your progress through the frameworks and advance your problem-solving expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Level: {level}</span>
              {nextLevel && (
                <span className="text-sm text-gray-500 flex items-center">
                  Next level: {nextLevel}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </span>
              )}
            </div>
            <Progress 
              value={
                level === 'Beginner' ? 25 :
                level === 'Intermediate' ? 50 :
                level === 'Advanced' ? 75 : 100
              } 
              className="h-2"
            />
          </div>
          
          {nextFocusFramework && (
            <Link to={`/frameworks/${nextFocusFramework.id}`}>
              <Button className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Continue Learning
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
      
      {/* Recommended path listing */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-primary flex items-center">
          <BookCheck className="mr-2 h-6 w-6" />
          Your Personalized Learning Path
        </h2>
        
        <div className="space-y-4">
          {recommendedFrameworks.map((framework, index) => {
            const progress = userProgress?.find(p => p.frameworkId === framework.id);
            const status = progress?.status || 'not_started';
            const progressPercentage = getProgressPercentage(framework.id);
            
            return (
              <Card key={framework.id} className={status === 'completed' ? 'opacity-80' : ''}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-xl font-semibold mb-1">{framework.name}</h3>
                        <span className="ml-3">{getStatusBadge(status)}</span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{framework.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-4">
                          {status === 'in_progress' ? `${progressPercentage}% complete` : 
                           status === 'completed' ? 'Completed' : 'Not started'}
                        </span>
                        {framework.level && (
                          <span>Level: {framework.level}</span>
                        )}
                      </div>
                      
                      {status === 'in_progress' && (
                        <Progress value={progressPercentage} className="h-1 mt-3 w-48" />
                      )}
                    </div>
                    
                    <Link to={`/frameworks/${framework.id}`}>
                      <Button variant={status === 'in_progress' ? "default" : 
                                      status === 'completed' ? "outline" : "secondary"}>
                        {status === 'completed' ? (
                          <>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Review
                          </>
                        ) : status === 'in_progress' ? (
                          <>Continue</>
                        ) : (
                          <>Start</>
                        )}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningPathView;