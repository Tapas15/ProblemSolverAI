import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserProgress, getFrameworks } from '@/lib/api';
import { Link } from 'wouter';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const LearningProgress: React.FC = () => {
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/user/progress'],
    queryFn: () => getUserProgress(),
  });
  
  const { data: frameworks, isLoading: frameworksLoading } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: () => getFrameworks(),
  });
  
  const isLoading = progressLoading || frameworksLoading;
  
  const completedFrameworks = progress?.filter(p => p.status === 'completed')?.length || 0;
  const totalFrameworks = frameworks?.length || 0;
  const progressPercentage = totalFrameworks > 0 ? (completedFrameworks / totalFrameworks) * 100 : 0;
  
  // Find next recommended framework
  const getNextRecommendedFramework = () => {
    if (!frameworks || !progress) return null;
    
    // Find in progress frameworks first
    const inProgressFrameworks = frameworks.filter(framework => {
      const userProgress = progress.find(p => p.frameworkId === framework.id);
      return userProgress && userProgress.status === 'in_progress';
    });
    
    if (inProgressFrameworks.length > 0) {
      return inProgressFrameworks[0];
    }
    
    // Then find not started frameworks
    const notStartedFrameworks = frameworks.filter(framework => {
      const userProgress = progress.find(p => p.frameworkId === framework.id);
      return !userProgress || userProgress.status === 'not_started';
    });
    
    if (notStartedFrameworks.length > 0) {
      return notStartedFrameworks[0];
    }
    
    return null;
  };
  
  const nextRecommendedFramework = getNextRecommendedFramework();
  
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
      
      <div className="flex items-center justify-between mt-4">
        <div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <span className="text-sm text-gray-600">Next recommended framework:</span>
              <span className="ml-1 text-sm font-medium">
                {nextRecommendedFramework?.name || "All frameworks completed!"}
              </span>
            </>
          )}
        </div>
        
        {!isLoading && nextRecommendedFramework && (
          <Link to={`/frameworks/${nextRecommendedFramework.id}`}>
            <span className="text-secondary hover:underline text-sm font-medium">
              Continue Learning →
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default LearningProgress;
