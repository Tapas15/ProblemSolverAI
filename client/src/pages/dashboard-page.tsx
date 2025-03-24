import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserProgress, getUserQuizAttempts, getFrameworks } from '@/lib/api';
import { Framework, UserProgress, QuizAttempt } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, Clock, Award, BookOpen, ChevronRight, BarChart2, 
  Target, BookCheck, Brain, TrendingUp, LineChart, Flame, Zap, 
  Trophy, Lightbulb, ArrowRightCircle, Medal
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MainLayout from '@/components/layout/main-layout';

const DashboardPage = () => {
  const { user } = useAuth();
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

  // Fetch quiz attempts
  const {
    data: quizAttempts,
    isLoading: isQuizAttemptsLoading
  } = useQuery({
    queryKey: ['/api/quizzes/attempts/user'],
    queryFn: getUserQuizAttempts,
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
  const isLoading = isProgressLoading || isFrameworksLoading || isQuizAttemptsLoading;

  // Get framework details for a progress item
  const getFrameworkDetails = (frameworkId: number) => {
    return frameworks?.find(f => f.id === frameworkId);
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        {isLoading ? (
          <div className="flex flex-col space-y-8 animate-pulse">
            <div className="h-20 bg-slate-100 rounded-lg"></div>
            <div className="h-64 bg-slate-100 rounded-lg"></div>
            <div className="h-40 bg-slate-100 rounded-lg"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-8">
            {/* Learner Profile Header */}
          <div className="bg-gradient-to-r from-[#0057B8] via-[#0078D7] to-[#0096F6] rounded-xl overflow-hidden shadow-lg">
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0096F6] via-[#00A5E0] to-[#C5F2FF] rounded-full opacity-75 blur-sm"></div>
                <Avatar className="h-20 w-20 md:h-24 md:w-24 ring-4 ring-[#00A5E0]/60 shadow-xl">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-[#0078D7] to-[#00A5E0] text-white text-xl font-medium">
                    {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold font-header text-white">{user?.name || 'User'}'s Learning Journey</h1>
                <p className="text-[#C5F2FF]/90 mt-1 text-sm md:text-base">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-[#0078D7]/30 text-white hover:bg-[#0078D7]/40 border border-[#0078D7]/50">
                    <Brain className="w-3 h-3 mr-1" /> {stats?.completedModules || 0} Modules Completed
                  </Badge>
                  <Badge className="bg-[#00A5E0]/30 text-white hover:bg-[#00A5E0]/40 border border-[#00A5E0]/50">
                    <Trophy className="w-3 h-3 mr-1" /> {stats?.passedQuizzes || 0} Quizzes Passed
                  </Badge>
                  <Badge className="bg-[#C5F2FF]/30 text-white hover:bg-[#C5F2FF]/40 border border-[#C5F2FF]/50">
                    <Award className="w-3 h-3 mr-1" /> {Math.max(stats?.averageScore || 0, 0)}% Avg. Score
                  </Badge>
                </div>
              </div>
              <div className="flex md:hidden w-full mt-2 p-3 bg-[#0057B8]/60 rounded-lg border border-[#0078D7]/30 backdrop-blur-sm justify-center">
                <div className="text-3xl font-bold text-white mr-2">
                  {stats?.frameworkProgress || 0}%
                </div>
                <div className="text-[#C5F2FF]/90 text-sm self-end mb-1">Total Progress</div>
              </div>
              <div className="hidden md:flex flex-col items-center justify-center bg-[#0057B8]/60 p-4 rounded-lg border border-[#0078D7]/30 backdrop-blur-sm">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00A5E0] to-[#C5F2FF]">
                  {stats?.frameworkProgress || 0}%
                </div>
                <div className="text-[#C5F2FF]/90 text-sm">Total Progress</div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-md bg-gradient-to-b from-white to-[#F7FAFF] border border-[#E0F0FF]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <BookCheck className="h-4 w-4 mr-2 text-[#0078D7]" />
                  Frameworks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1 text-[#0A2540]">{stats?.completedFrameworks || 0}/{stats?.totalFrameworks || 0}</div>
                <Progress value={stats?.frameworkProgress} className="h-2 bg-[#E0F0FF]" />
                <p className="text-xs text-gray-500 mt-2">
                  {stats?.frameworkProgress || 0}% of frameworks completed
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-gradient-to-b from-white to-[#F7FAFF] border border-[#E0F0FF]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-[#00A5E0]" />
                  Modules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1 text-[#0A2540]">{stats?.completedModules || 0}/{stats?.totalModules || 0}</div>
                <Progress value={stats?.moduleProgress} className="h-2 bg-[#E0F0FF]" />
                <p className="text-xs text-gray-500 mt-2">
                  {stats?.moduleProgress || 0}% of modules completed
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-gradient-to-b from-white to-[#F7FAFF] border border-[#E0F0FF]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2 text-[#0096F6]" />
                  Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1 text-[#0A2540]">{stats?.passedQuizzes || 0}/{stats?.totalQuizzes || 0}</div>
                <Progress value={stats?.quizProgress} className="h-2 bg-[#E0F0FF]" />
                <p className="text-xs text-gray-500 mt-2">
                  {stats?.quizProgress || 0}% of quizzes passed
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-gradient-to-b from-white to-[#F7FAFF] border border-[#E0F0FF]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Target className="h-4 w-4 mr-2 text-[#00B1F5]" />
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1 text-[#0A2540]">{stats?.averageScore || 0}%</div>
                <Progress value={stats?.averageScore} className="h-2 bg-[#E0F0FF]" />
                <p className="text-xs text-gray-500 mt-2">
                  Across all quiz attempts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-[#F0F8FF] dark:bg-[#0A2540]/10">
              <TabsTrigger value="progress" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0078D7]/10 data-[state=active]:text-[#0078D7] dark:data-[state=active]:text-[#0078D7]">
                <BookCheck className="h-4 w-4 mr-2" />
                Framework Progress
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0078D7]/10 data-[state=active]:text-[#0078D7] dark:data-[state=active]:text-[#0078D7]">
                <BarChart2 className="h-4 w-4 mr-2" />
                Quiz Performance
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0078D7]/10 data-[state=active]:text-[#0078D7] dark:data-[state=active]:text-[#0078D7]">
                <Lightbulb className="h-4 w-4 mr-2" />
                Recommendations
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
                  {progressData && progressData.length > 0 ? (
                    progressData.map((progress: UserProgress) => {
                      const framework = getFrameworkDetails(progress.frameworkId);
                      return (
                        <Card key={progress.id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle>{framework?.name}</CardTitle>
                              <Badge variant={progress.status === 'completed' ? 'default' : 
                                progress.status === 'in_progress' ? 'secondary' : 'outline'}>
                                {progress.status === 'completed' ? 'Completed' : 
                                 progress.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                              </Badge>
                            </div>
                            <CardDescription>{framework?.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-600">
                                {progress.completedModules || 0} of {progress.totalModules} modules complete
                              </div>
                              <Link to={`/frameworks/${framework?.id}`}>
                                <Button variant="outline" size="sm" className="flex items-center">
                                  Continue Learning <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                            <Progress 
                              value={progress.totalModules > 0 ? 
                                Math.round(((progress.completedModules || 0) / progress.totalModules) * 100) : 0} 
                              className="h-2 mt-3" 
                            />
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
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
                        <Card key={attempt.id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="flex items-center">
                                Quiz #{attempt.quizId}
                                {attempt.passed ? (
                                  <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                                ) : null}
                              </CardTitle>
                              <Badge variant={attempt.passed ? 'default' : 'destructive'}>
                                {attempt.passed ? 'Passed' : 'Failed'}
                              </Badge>
                            </div>
                            <CardDescription className="flex justify-between">
                              <span>Framework Quiz</span>
                              {attempt.completedAt && (
                                <span className="text-xs flex items-center">
                                  <Clock className="mr-1 h-3 w-3" /> 
                                  {new Date(attempt.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <Award className="mr-1 h-4 w-4 text-amber-500" />
                                <span className="text-sm font-medium">
                                  Score: {Math.round((attempt.score / attempt.maxScore) * 100)}%
                                </span>
                              </div>
                              <Link to={`/quizzes/${attempt.quizId}`}>
                                <Button variant="outline" size="sm">
                                  Try Again
                                </Button>
                              </Link>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-600">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      Suggested Framework
                    </CardTitle>
                    <CardDescription>
                      Based on your learning patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white">
                        <BookOpen className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Design Thinking</h3>
                        <p className="text-sm text-muted-foreground">Perfect next step for your learning journey</p>
                      </div>
                    </div>
                    
                    <Link to="/">
                      <Button className="w-full">
                        Start Learning <ArrowRightCircle className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-600">
                      <Target className="h-5 w-5 mr-2" />
                      Practice Recommendation
                    </CardTitle>
                    <CardDescription>
                      Strengthen your knowledge
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-300 flex items-center justify-center text-white">
                        <BarChart2 className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Take Your First Quiz</h3>
                        <p className="text-sm text-muted-foreground">Test your knowledge with a beginner quiz</p>
                      </div>
                    </div>
                    
                    <Link to="/quizzes">
                      <Button className="w-full">
                        Start Quiz <ArrowRightCircle className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;