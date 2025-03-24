import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserProgress, getUserQuizAttempts, getFrameworks } from '@/lib/api';
import { Framework, UserProgress, QuizAttempt } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, Award, BookOpen, ChevronRight, BarChart2, Target, BookCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
    const startedFrameworks = progressData.length;
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
      startedFrameworks,
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

  const getQuizLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-header text-primary">My Learning Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your progress across frameworks, modules, and assessments
          </p>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                    <BookCheck className="h-4 w-4 mr-2 text-primary" />
                    Frameworks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stats?.completedFrameworks}/{stats?.totalFrameworks}</div>
                  <Progress value={stats?.frameworkProgress} className="h-2 blue-progress" />
                  <p className="text-xs text-gray-500 mt-2">
                    {stats?.frameworkProgress}% of frameworks completed
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-primary" />
                    Modules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stats?.completedModules}/{stats?.totalModules}</div>
                  <Progress value={stats?.moduleProgress} className="h-2 blue-progress" />
                  <p className="text-xs text-gray-500 mt-2">
                    {stats?.moduleProgress}% of modules completed
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                    Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stats?.passedQuizzes}/{stats?.totalQuizzes}</div>
                  <Progress value={stats?.quizProgress} className="h-2 blue-progress" />
                  <p className="text-xs text-gray-500 mt-2">
                    {stats?.quizProgress}% of quizzes passed
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-primary" />
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stats?.averageScore}%</div>
                  <Progress value={stats?.averageScore} className="h-2 blue-progress" />
                  <p className="text-xs text-gray-500 mt-2">
                    Across all quiz attempts
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Tabs section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="progress">Framework Progress</TabsTrigger>
            <TabsTrigger value="quizzes">Quiz Performance</TabsTrigger>
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
                            {progress.status === 'completed' ? (
                              <Badge className="bg-[#DCEFFF] text-[#0078D7] border border-[#0078D7]/20">Completed</Badge>
                            ) : progress.status === 'in_progress' ? (
                              <Badge className="bg-[#FFF4DC] text-[#F59E0B] border border-[#F59E0B]/20">In Progress</Badge>
                            ) : (
                              <Badge className="bg-[#E9F0F8] text-[#64748B] border border-[#64748B]/20">Not Started</Badge>
                            )}
                          </div>
                          <CardDescription>{framework?.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              {progress.completedModules || 0} of {progress.totalModules} modules complete
                            </div>
                            <Link to={`/frameworks/${framework?.id}`}>
                              <Button variant="outline" size="sm" className="flex items-center text-[#0078D7] hover:text-[#0078D7]/90 hover:bg-[#DCEFFF]/50 transition-all duration-300">
                                Continue Learning <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                          <Progress 
                            value={progress.totalModules > 0 ? 
                              Math.round(((progress.completedModules || 0) / progress.totalModules) * 100) : 0} 
                            className="h-2 mt-3 blue-progress" 
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
                    const quizFramework = frameworks?.find(f => {
                      const frameworkQuizzes = quizAttempts.filter(a => a.quizId === attempt.quizId);
                      return frameworkQuizzes.length > 0;
                    });
                    
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
                            <Badge className={`${attempt.passed ? 
                              'bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20' : 
                              'bg-[#FEE2E2] text-[#DC2626] border border-[#DC2626]/20'}`}>
                              {attempt.passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </div>
                          <CardDescription className="flex justify-between">
                            <span>{quizFramework?.name || 'Framework Quiz'}</span>
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
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;