import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserProgress, getUserQuizAttempts, getFrameworks, getAllModulesByFramework, getQuizzesByFramework } from '@/lib/api';
import { Framework, UserProgress, QuizAttempt, Module } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, Clock, Award, BookOpen, ChevronRight, BarChart2, 
  Target, BookCheck, Brain, TrendingUp, LineChart, Flame, Zap, 
  Trophy, Lightbulb, ArrowRightCircle, Medal, ArrowLeft, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LearningProgressMap } from '@/components/dashboard/learning-progress-map';
import { QuizModuleInsights } from '@/components/dashboard/quiz-module-insights';
import { QuizPerformanceChart } from '@/components/dashboard/quiz-performance-chart';

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('progress');
  
  // Fetch user progress
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

  // Fetch all quizzes for all frameworks - needed for "Try Again" button to work properly
  const {
    data: quizzes,
    isLoading: isQuizzesLoading,
  } = useQuery({
    queryKey: ['/api/quizzes/framework/0'],
    queryFn: () => getQuizzesByFramework(0), // 0 means all frameworks
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch quiz attempts with shorter stale time and refetching enabled
  const {
    data: quizAttempts,
    isLoading: isQuizAttemptsLoading,
    refetch: refetchQuizAttempts
  } = useQuery({
    queryKey: ['/api/quiz-attempts/user'],
    queryFn: getUserQuizAttempts,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gets focus
  });
  
  // Refetch quiz attempts on tab change to ensure data is fresh
  useEffect(() => {
    if (activeTab === 'quizzes') {
      refetchQuizAttempts();
    }
  }, [activeTab, refetchQuizAttempts]);
  
  // Fetch all modules by framework
  const {
    data: allModulesByFramework,
    isLoading: isAllModulesLoading
  } = useQuery({
    queryKey: ['/api/all-modules-by-framework'],
    queryFn: getAllModulesByFramework,
    staleTime: 60 * 1000,
  });
  
  // Fetch all quizzes (for quiz attempt navigation)
  const {
    data: quizzes,
    isLoading: isQuizzesLoading
  } = useQuery({
    queryKey: ['/api/quizzes'],
    queryFn: () => getQuizzesByFramework(0), // 0 means fetch all quizzes
    staleTime: 60 * 1000,
  });

  // Calculate statistics
  const calculateStats = () => {
    if (!progressData || !frameworks || !quizAttempts) return null;

    const totalFrameworks = frameworks.length;
    const completedFrameworks = progressData.filter(p => p.status === 'completed').length;
    
    const totalModules = progressData.reduce((sum, p) => sum + p.totalModules, 0);
    const completedModules = progressData.reduce((sum, p) => sum + (p.completedModules || 0), 0);
    
    const totalQuizzes = quizAttempts.length;
    const passedQuizzes = quizAttempts.filter(a => a.passed).length;
    
    const averageScore = totalQuizzes > 0 
      ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.score / a.maxScore * 100), 0) / totalQuizzes) 
      : 0;

    return {
      totalFrameworks,
      completedFrameworks,
      frameworkProgress: totalFrameworks > 0 ? Math.round((completedFrameworks / totalFrameworks) * 100) : 0,
      
      totalModules,
      completedModules,
      moduleProgress: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
      
      totalQuizzes,
      passedQuizzes,
      quizProgress: totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0,
      
      averageScore
    };
  };

  const stats = calculateStats();
  const isLoading = isProgressLoading || isFrameworksLoading || isQuizAttemptsLoading || isAllModulesLoading || isQuizzesLoading;

  // Get framework details for a progress item
  const getFrameworkDetails = (frameworkId: number) => {
    return frameworks?.find(f => f.id === frameworkId);
  };

  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Performance optimization
  useEffect(() => {
    // Prefetch frameworks data for faster framework detail access
    queryClient.prefetchQuery({
      queryKey: ['/api/frameworks'],
      queryFn: getFrameworks,
    });
    
    // Preload common images
    const preloadImages = [
      // Default framework images
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=500&auto=format&fit=crop"
    ];
    
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
    
    // Add priority to the main content
    document.body.style.contain = 'content';
    
    return () => {
      document.body.style.contain = '';
    };
  }, [queryClient]);
  
  return (
    <div className="native-scroll pb-16">
      {/* Mobile App Header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-4">
        <div className="flex items-center">
          {/* Back button removed as requested */}
          <h1 className="mobile-h1 text-[#0f172a]">Dashboard</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="native-empty-state">
          <div className="native-spinner" />
          <p className="text-sm text-[#64748b] mt-2">Loading your stats...</p>
        </div>
      ) : (
        <div className="space-y-6 px-4">
          {/* User Profile Card */}
          <Card className="native-card overflow-hidden bg-gradient-to-r from-[#0057B8] to-[#0096F6] text-white shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-white/30">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-[#0078D7] to-[#00A5E0] text-white text-xl font-medium">
                    {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-lg">{user?.name || 'User'}</h2>
                  <p className="text-[#C5F2FF]/90 text-xs">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <div className="flex mt-1 space-x-2">
                    <Badge className="bg-white/20 text-white border-none text-xs hover:bg-white/30">
                      {stats?.frameworkProgress || 0}% Complete
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span>Overall Progress</span>
                  <span>{stats?.frameworkProgress || 0}%</span>
                </div>
                <Progress value={stats?.frameworkProgress} className="h-1.5 bg-white/20" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white/10 rounded-lg p-2 text-center transition touch-feedback">
                  <div className="text-lg font-medium">{stats?.completedFrameworks || 0}/{stats?.totalFrameworks || 0}</div>
                  <div className="text-xs text-white/80">Frameworks</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center transition touch-feedback">
                  <div className="text-lg font-medium">{stats?.completedModules || 0}/{stats?.totalModules || 0}</div>
                  <div className="text-xs text-white/80">Modules</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center transition touch-feedback">
                  <div className="text-lg font-medium">{stats?.passedQuizzes || 0}/{stats?.totalQuizzes || 0}</div>
                  <div className="text-xs text-white/80">Quizzes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Controls */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="segmented-control w-full">
              <TabsTrigger value="progress" className="segmented-control-option text-xs">
                <BookCheck className="h-3.5 w-3.5 mr-1.5" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="segmented-control-option text-xs">
                <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
                Quizzes
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="segmented-control-option text-xs">
                <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                For You
              </TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="space-y-4">
              {isLoading ? (
                <>
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="shadow-sm">
                      <CardHeader className="pb-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-64" />
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-28" />
                        </div>
                        <Skeleton className="h-2 w-full mt-3" />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <>
                  {/* Learning Progress Map - Single source of truth for courses */}
                  {allModulesByFramework && progressData && progressData.length > 0 && (
                    <Card className="native-card shadow-sm overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-base text-[#0f172a]">Learning Journey</CardTitle>
                            <CardDescription className="text-xs text-[#64748b]">
                              Track your progress across all frameworks
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {frameworks?.length || 0} Frameworks
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <LearningProgressMap 
                          allModules={allModulesByFramework || {}}
                          userProgress={progressData} 
                          frameworks={frameworks || []}
                          onFrameworkClick={(frameworkId: number) => setLocation(`/frameworks/${frameworkId}`)}
                        />
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Show this only if there's no progress data */}
                  {(!progressData || progressData.length === 0) && (
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle>No Progress Yet</CardTitle>
                        <CardDescription>
                          You haven't started learning any frameworks yet.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link to="/">
                          <Button>
                            Browse Frameworks
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="quizzes" className="space-y-4">
              {isLoading ? (
                <>
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-6 w-40" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                        <Skeleton className="h-4 w-64 mt-2" />
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <>
                  {quizAttempts && quizAttempts.length > 0 ? (
                    quizAttempts.map((attempt: QuizAttempt) => {
                      return (
                        <Card key={attempt.id} className="native-card touch-feedback overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="flex items-center text-base text-[#0f172a]">
                                  Quiz #{attempt.quizId}
                                  {attempt.passed ? (
                                    <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                                  ) : null}
                                </CardTitle>
                                <CardDescription className="text-xs text-[#64748b]">
                                  <span>Framework Quiz</span>
                                </CardDescription>
                              </div>
                              <Badge className={attempt.passed ? 'badge-green' : 'badge-red'}>
                                {attempt.passed ? 'Passed' : 'Failed'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Award className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                                  <span className="text-xs font-medium text-[#334155]">
                                    Score: {Math.round((attempt.score / attempt.maxScore) * 100)}%
                                  </span>
                                </div>
                                {attempt.completedAt && (
                                  <span className="text-xs flex items-center text-[#64748b]">
                                    <Clock className="mr-1 h-3 w-3" /> 
                                    {new Date(attempt.completedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="native-button-secondary mt-1 text-xs py-2 h-8"
                                onClick={() => {
                                  // Locate the framework id for this quiz using related data
                                  const quiz = quizzes?.find(q => q.id === attempt.quizId);
                                  if (quiz) {
                                    setLocation(`/quizzes/${quiz.frameworkId}/${attempt.quizId}`);
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: "Could not find quiz details. Please try again.",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                Try Again <ChevronRight className="ml-1 h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle>No Quiz Attempts</CardTitle>
                        <CardDescription>
                          You haven't taken any quizzes yet.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link to="/quizzes">
                          <Button>
                            Browse Quizzes
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-4">
                <Card className="native-card touch-feedback overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center text-white flex-shrink-0">
                        <Lightbulb className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[#0f172a] font-medium text-base">Design Thinking</h3>
                        <p className="text-xs text-[#64748b] mt-0.5 mb-2">Perfect next step for your learning journey</p>
                        
                        <Button 
                          className="native-button text-xs h-8 py-2 w-full flex items-center justify-center"
                          onClick={() => setLocation('/')}
                        >
                          Start Learning <ArrowRightCircle className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="native-card touch-feedback overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center text-white flex-shrink-0">
                        <Target className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[#0f172a] font-medium text-base">Take Your First Quiz</h3>
                        <p className="text-xs text-[#64748b] mt-0.5 mb-2">Test your knowledge with a beginner quiz</p>
                        
                        <Button 
                          className="native-button text-xs h-8 py-2 w-full flex items-center justify-center"
                          onClick={() => setLocation('/quizzes')}
                        >
                          Start Quiz <ArrowRightCircle className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="native-card touch-feedback overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center text-white flex-shrink-0">
                        <Brain className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[#0f172a] font-medium text-base">Try AI Assistant</h3>
                        <p className="text-xs text-[#64748b] mt-0.5 mb-2">Get personalized guidance on applying frameworks</p>
                        
                        <Button 
                          className="native-button text-xs h-8 py-2 w-full flex items-center justify-center"
                          onClick={() => setLocation('/ai-assistant')}
                        >
                          Start Chat <ArrowRightCircle className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;