import React from 'react';
import { QuizAttempt, Module, Framework, UserProgress } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, BarChart2, Award, BookOpen, Book, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';

interface QuizAttemptWithMetadata extends QuizAttempt {
  frameworkId?: number;
  moduleId?: number;
}

interface QuizModuleInsightsProps {
  quizAttempts: QuizAttemptWithMetadata[];
  frameworks: Framework[];
  userProgress: UserProgress[];
  allModulesByFramework: Record<number, Module[]>;
}

// Define the insight type for type safety
interface FrameworkInsight {
  frameworkId: number;
  framework: Framework;
  recentAttempts: QuizAttemptWithMetadata[];
  avgScore: number;
  moduleCompletion: number;
  needsAttention: boolean;
  excellentProgress: boolean;
  progress: UserProgress;
}

export function QuizModuleInsights({ 
  quizAttempts, 
  frameworks, 
  userProgress, 
  allModulesByFramework 
}: QuizModuleInsightsProps) {
  const [, setLocation] = useLocation();

  // Group quiz attempts by framework
  const attemptsByFramework: Record<number, QuizAttemptWithMetadata[]> = {};
  
  quizAttempts.forEach(attempt => {
    // We're using the extended interface that allows optional frameworkId/moduleId
    const quiz = attempt.quizId;
    const framework = frameworks.find(f => 
      f.id === (attempt as QuizAttemptWithMetadata).frameworkId || 
      // Try to find framework if frameworkId is not directly on the attempt
      allModulesByFramework[f.id]?.some(m => m.id === (attempt as QuizAttemptWithMetadata).moduleId)
    );
    
    if (framework) {
      if (!attemptsByFramework[framework.id]) {
        attemptsByFramework[framework.id] = [];
      }
      attemptsByFramework[framework.id].push(attempt);
    }
  });

  // Calculate insights for each framework
  const frameworkInsights: FrameworkInsight[] = Object.keys(attemptsByFramework)
    .map(frameworkIdStr => {
      const frameworkId = parseInt(frameworkIdStr);
      const framework = frameworks.find(f => f.id === frameworkId);
      const attempts = attemptsByFramework[frameworkId];
      const progress = userProgress.find(p => p.frameworkId === frameworkId);
      
      if (!framework || !attempts.length || !progress) {
        return null;
      }
      
      // Get recent attempts
      const recentAttempts = [...attempts].sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA; // Sort by most recent first
      }).slice(0, 3); // Get most recent 3
      
      // Calculate average score for this framework
      const avgScore = Math.round(
        attempts.reduce((sum, a) => sum + (a.score / a.maxScore * 100), 0) / attempts.length
      );
      
      // Calculate module completion percentage
      const moduleCompletion = progress.totalModules > 0 
        ? Math.round((progress.completedModules || 0) / progress.totalModules * 100)
        : 0;
      
      // Determine if this needs attention based on quiz scores vs. module completion
      const needsAttention = avgScore < 70 && moduleCompletion > 50;
      const excellentProgress = avgScore > 85 && moduleCompletion > 75;
      
      return {
        frameworkId,
        framework,
        recentAttempts,
        avgScore,
        moduleCompletion,
        needsAttention,
        excellentProgress,
        progress
      };
    })
    .filter((insight): insight is FrameworkInsight => insight !== null);

  if (!frameworkInsights.length) {
    return null;
  }

  return (
    <Card className="native-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-[#0f172a]">
          <div className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4 text-blue-600" />
            Quiz & Module Insights
          </div>
        </CardTitle>
        <CardDescription className="text-xs text-[#64748b]">
          How your quiz performance relates to your learning progress
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {frameworkInsights.map(insight => (
            <div key={insight.frameworkId} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <h3 className="font-medium text-sm">{insight.framework.name}</h3>
                  {insight.needsAttention && (
                    <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-[10px]">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Needs Review
                    </Badge>
                  )}
                  {insight.excellentProgress && (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 ml-2 px-1.5 py-0 text-[10px]">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Excellent
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-[#64748b] mb-1 flex items-center">
                    <Award className="mr-1 h-3 w-3 text-amber-500" />
                    Average Quiz Score
                  </div>
                  <div className="flex items-center">
                    <Progress value={insight.avgScore} className="h-2 flex-1" />
                    <span className="ml-2 text-xs font-medium">{insight.avgScore}%</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-[#64748b] mb-1 flex items-center">
                    <BookOpen className="mr-1 h-3 w-3 text-blue-500" />
                    Module Completion
                  </div>
                  <div className="flex items-center">
                    <Progress value={insight.moduleCompletion} className="h-2 flex-1" />
                    <span className="ml-2 text-xs font-medium">{insight.moduleCompletion}%</span>
                  </div>
                </div>
              </div>
              
              {insight.recentAttempts.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-[#64748b] mb-1">Recent Quiz Activity</div>
                  <div className="flex flex-wrap gap-2">
                    {insight.recentAttempts.map(attempt => (
                      <Badge 
                        key={attempt.id}
                        className={`text-[10px] ${attempt.passed ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                      >
                        {Math.round((attempt.score / attempt.maxScore) * 100)}% 
                        {attempt.completedAt && (
                          <span className="ml-1 opacity-70">
                            {new Date(attempt.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recommendation based on analysis */}
              <div className="text-xs">
                {insight.needsAttention && (
                  <p className="text-red-600 mb-2">
                    Your quiz scores are lower than your module progress suggests. Consider reviewing the material again.
                  </p>
                )}
                {insight.excellentProgress && (
                  <p className="text-green-600 mb-2">
                    Great job! Your quiz scores reflect strong understanding of the modules.
                  </p>
                )}
                {!insight.needsAttention && !insight.excellentProgress && insight.avgScore < 70 && (
                  <p className="text-amber-600 mb-2">
                    Try reviewing the modules to improve your quiz scores.
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => setLocation(`/frameworks/${insight.frameworkId}`)}
                >
                  <Book className="mr-1 h-3 w-3" />
                  Review Modules
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => setLocation(`/quizzes/${insight.frameworkId}`)}
                >
                  <BarChart2 className="mr-1 h-3 w-3" />
                  Take Quizzes
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}