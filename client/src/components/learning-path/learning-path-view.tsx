import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFrameworks, getUserProgress } from '@/lib/api';
import { Framework, UserProgress } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ArrowRight, CheckCircle, BookOpen, BookCheck, Target, 
         Trophy, Map, Sparkles, Shield, Lock, Star, Zap, BarChart } from 'lucide-react';
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
  
  // Function to get icon for a framework based on index or name
  const getFrameworkIcon = (index: number, name?: string) => {
    const icons = [
      <Target className="h-8 w-8" />,
      <Sparkles className="h-8 w-8" />,
      <BarChart className="h-8 w-8" />,
      <Shield className="h-8 w-8" />,
      <BookCheck className="h-8 w-8" />,
      <Map className="h-8 w-8" />,
      <Zap className="h-8 w-8" />,
      <Star className="h-8 w-8" />,
      <Trophy className="h-8 w-8" />,
      <BookOpen className="h-8 w-8" />
    ];
    return icons[index % icons.length];
  };

  // Function to get a color class for each step based on index
  const getStepColorClass = (index: number, status: string) => {
    if (status === 'completed') return 'bg-gradient-to-br from-green-400 to-green-600 text-white';
    if (status === 'in_progress') return 'bg-gradient-to-br from-blue-400 to-blue-600 text-white';
    
    const colors = [
      'bg-gradient-to-br from-[#0078D7] to-[#00A5E0] text-white', // Blue
      'bg-gradient-to-br from-[#6a5ff9] to-[#9387fd] text-white', // Purple
      'bg-gradient-to-br from-[#4385f5] to-[#71a7ff] text-white', // Light Blue
      'bg-gradient-to-br from-[#6877ff] to-[#a47cf4] text-white', // Indigo to Purple
      'bg-gradient-to-br from-[#0E3A5C] to-[#1867ab] text-white', // Deep Blue
    ];
    return colors[index % colors.length];
  };
  
  // Function to get text color for skills
  const getSkillBadgeColor = (skill: string) => {
    const colors = {
      'analysis': 'bg-blue-100 text-blue-800',
      'strategy': 'bg-purple-100 text-purple-800',
      'innovation': 'bg-indigo-100 text-indigo-800',
      'planning': 'bg-emerald-100 text-emerald-800',
      'problem-solving': 'bg-amber-100 text-amber-800',
      'critical-thinking': 'bg-cyan-100 text-cyan-800',
      'creativity': 'bg-pink-100 text-pink-800',
      'design': 'bg-violet-100 text-violet-800',
      'business': 'bg-teal-100 text-teal-800',
      'leadership': 'bg-orange-100 text-orange-800',
    };
    
    const key = Object.keys(colors).find(k => skill.toLowerCase().includes(k));
    return key ? colors[key as keyof typeof colors] : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-12">
      {/* Learning Journey Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#0A2540] to-[#0078D7] text-white col-span-2">
          <CardContent className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mt-10 -mr-10"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full -mb-20 -ml-20"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 mr-2" />
                <h3 className="text-xl font-bold">Mastery Level: {level}</h3>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <p className="text-white/80 mb-1">
                    {level === 'Beginner' ? 'Master the fundamentals of business frameworks.' :
                     level === 'Intermediate' ? 'Applying frameworks to complex business problems.' :
                     level === 'Advanced' ? 'Integrating multiple frameworks for optimal solutions.' :
                     'Creating and adapting frameworks for unique challenges.'}
                  </p>
                  {nextLevel && (
                    <p className="text-white/70 text-sm flex items-center">
                      <Zap className="mr-1 h-3 w-3" />
                      Next Achievement: {nextLevel} Level
                    </p>
                  )}
                </div>
                
                {nextFocusFramework && (
                  <Link to={`/frameworks/${nextFocusFramework.id}`}>
                    <Button className="bg-white/10 hover:bg-white/20 border-white/20 flex items-center px-4 py-2">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Continue Learning
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Progress to {nextLevel || 'Mastery'}</span>
                  <span className="text-sm">
                    {level === 'Beginner' ? '25%' :
                     level === 'Intermediate' ? '50%' :
                     level === 'Advanced' ? '75%' : '100%'}
                  </span>
                </div>
                <div className="bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00A5E0] to-[#C5F2FF] transition-all duration-500" 
                    style={{ 
                      width: `${level === 'Beginner' ? 25 : 
                              level === 'Intermediate' ? 50 : 
                              level === 'Advanced' ? 75 : 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center text-primary">
              <BarChart className="h-5 w-5 mr-2" />
              Learning Stats
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-600">Frameworks Mastered</span>
                  <span className="font-medium">
                    {userProgress?.filter(p => p.status === 'completed').length || 0} / {frameworks?.length || 0}
                  </span>
                </div>
                <Progress 
                  value={
                    frameworks?.length ? 
                      ((userProgress?.filter(p => p.status === 'completed').length || 0) / frameworks.length) * 100 
                      : 0
                  } 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium">
                    {userProgress?.filter(p => p.status === 'in_progress').length || 0} Frameworks
                  </span>
                </div>
                <Progress 
                  value={
                    frameworks?.length ? 
                      ((userProgress?.filter(p => p.status === 'in_progress').length || 0) / frameworks.length) * 100 
                      : 0
                  } 
                  className="h-2"
                />
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-primary font-medium">Skill Development</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge className={getSkillBadgeColor('analysis')}>Analysis</Badge>
                  <Badge className={getSkillBadgeColor('problem-solving')}>Problem Solving</Badge>
                  <Badge className={getSkillBadgeColor('strategy')}>Strategy</Badge>
                  <Badge className={getSkillBadgeColor('critical-thinking')}>Critical Thinking</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Visual Learning Path */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary flex items-center">
            <Map className="mr-2 h-6 w-6" />
            Your Personalized Learning Path
          </h2>
        </div>
        
        <div className="relative">
          {/* Connecting line for path visualization */}
          <div className="absolute left-[40px] top-[55px] bottom-[40px] w-1 bg-gradient-to-b from-[#0078D7] to-[#6a5ff9]/30 rounded-full z-0 hidden md:block"></div>
          
          {/* Path Items */}
          <div className="space-y-6 relative z-10">
            {recommendedFrameworks.map((framework, index) => {
              const progress = userProgress?.find(p => p.frameworkId === framework.id);
              const status = progress?.status || 'not_started';
              const progressPercentage = getProgressPercentage(framework.id);
              const isLocked = index > 0 && 
                recommendedFrameworks[index-1] && 
                (userProgress?.find(p => p.frameworkId === recommendedFrameworks[index-1].id)?.status !== 'completed');
              
              return (
                <div key={framework.id} className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {/* Step Number/Icon */}
                  <div className={`flex-shrink-0 w-[80px] h-[80px] rounded-2xl flex items-center justify-center shadow-lg ${getStepColorClass(index, status)}`}>
                    {getFrameworkIcon(index, framework.name)}
                  </div>
                  
                  {/* Framework Content */}
                  <Card className={`flex-grow border-0 shadow-md transition-all duration-300 ${
                    status === 'completed' ? 'bg-white' : 
                    status === 'in_progress' ? 'shadow-blue-100/50 border-blue-100/50' : 
                    isLocked ? 'opacity-60' : ''
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center flex-wrap gap-2 mb-1.5">
                            <h3 className="text-xl font-semibold">{framework.name}</h3>
                            {getStatusBadge(status)}
                            {isLocked && (
                              <Badge className="bg-gray-100 text-gray-500">
                                <Lock className="h-3 w-3 mr-1" />
                                Unlock by completing previous
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-2 line-clamp-2 md:max-w-xl">{framework.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              {status === 'in_progress' ? (
                                <>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1.5 animate-pulse"></div>
                                  {progressPercentage}% complete
                                </>
                              ) : status === 'completed' ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mr-1.5" />
                                  Completed
                                </>
                              ) : (
                                <>Estimated time: 1-2 hours</>
                              )}
                            </span>
                            
                            {framework.level && (
                              <span className="flex items-center">
                                <Star className="w-3.5 h-3.5 mr-1.5" />
                                Level: {framework.level}
                              </span>
                            )}
                          </div>
                          
                          {status === 'in_progress' && (
                            <Progress value={progressPercentage} className="h-1.5 mt-3 w-full md:w-60 bg-blue-100" />
                          )}
                        </div>
                        
                        <div className="flex-shrink-0">
                          <Link to={`/frameworks/${framework.id}`}>
                            <Button 
                              variant={status === 'in_progress' ? "default" : 
                                      status === 'completed' ? "outline" : "secondary"}
                              disabled={isLocked}
                              className={isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                              {status === 'completed' ? (
                                <>
                                  <CheckCircle className="mr-1.5 h-4 w-4" />
                                  Review
                                </>
                              ) : status === 'in_progress' ? (
                                <>
                                  <BookOpen className="mr-1.5 h-4 w-4" />
                                  Continue
                                </>
                              ) : (
                                <>
                                  <Zap className="mr-1.5 h-4 w-4" />
                                  Start Learning
                                </>
                              )}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Next Recommendations */}
      {nextFocusFramework && (
        <Card className="bg-gradient-to-br from-[#EEF6FF] to-white border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2.5 rounded-full bg-primary/10 mr-4">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary">Recommended Next Steps</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-grow flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm">
                  {getFrameworkIcon(0, nextFocusFramework.name)}
                </div>
                <div>
                  <h4 className="font-medium mb-1">{nextFocusFramework.name}</h4>
                  <p className="text-gray-600 text-sm line-clamp-2">{nextFocusFramework.description}</p>
                </div>
              </div>
              
              <div className="flex-shrink-0 flex items-center">
                <Link to={`/frameworks/${nextFocusFramework.id}`}>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Begin Framework
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningPathView;