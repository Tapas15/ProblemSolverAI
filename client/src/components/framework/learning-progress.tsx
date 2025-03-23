
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getFrameworks, getUserProgress, getQuizAttempts } from '@/lib/api';

const LearningProgress: React.FC = () => {
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/user/progress'],
    queryFn: () => getUserProgress(),
  });
  
  const { data: frameworks, isLoading: frameworksLoading } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: () => getFrameworks(),
  });

  const { data: quizAttempts, isLoading: quizLoading } = useQuery({
    queryKey: ['/api/quiz-attempts/user'],
    queryFn: () => getQuizAttempts(),
  });
  
  const isLoading = progressLoading || frameworksLoading || quizLoading;
  
  const completedFrameworks = progress?.filter(p => p.status === 'completed')?.length || 0;
  const totalFrameworks = frameworks?.length || 0;
  const progressPercentage = totalFrameworks > 0 ? (completedFrameworks / totalFrameworks) * 100 : 0;
  
  const getFrameworkRecommendations = () => {
    if (!frameworks || !progress || !quizAttempts) return [];
    
    const userPerformance = new Map();
    
    // Calculate performance score for each framework
    quizAttempts.forEach(attempt => {
      const framework = frameworks.find(f => f.id === attempt.quizId);
      if (framework) {
        const currentScore = userPerformance.get(framework.id) || { total: 0, count: 0 };
        userPerformance.set(framework.id, {
          total: currentScore.total + (attempt.score / attempt.maxScore),
          count: currentScore.count + 1
        });
      }
    });
    
    return frameworks
      .filter(framework => {
        const userProgress = progress.find(p => p.frameworkId === framework.id);
        return !userProgress || userProgress.status !== 'completed';
      })
      .sort((a, b) => {
        const aPerf = userPerformance.get(a.id);
        const bPerf = userPerformance.get(b.id);
        const aScore = aPerf ? aPerf.total / aPerf.count : 0;
        const bScore = bPerf ? bPerf.total / bPerf.count : 0;
        return bScore - aScore;
      })
      .slice(0, 3);
  };

  const recommendedFrameworks = getFrameworkRecommendations();
  
  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm p-4 max-w-3xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-primary font-medium">Your Learning Progress</h3>
        {isLoading ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <span className="text-sm text-gray-500">
            {completedFrameworks} of {totalFrameworks} frameworks completed
          </span>
        )}
      </div>
      
      {isLoading ? (
        <Skeleton className="h-2 w-full rounded-full" />
      ) : (
        <Progress value={progressPercentage} className="h-2" />
      )}
      
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-3">Recommended Frameworks</h4>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {recommendedFrameworks.map(framework => (
              <div key={framework.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">{framework.name}</h5>
                    <p className="text-sm text-gray-500">{framework.level}</p>
                  </div>
                  <Link to={`/frameworks/${framework.id}`}>
                    <Button variant="secondary" size="sm">Start Learning</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningProgress;
