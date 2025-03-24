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
    <div className="mt-6 bg-white rounded-lg shadow-md border border-[#E0F0FF] p-5 max-w-3xl hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#0078D7]/5 to-[#00A5E0]/10 rounded-full -mt-20 -mr-20 blur-2xl"></div>
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <h3 className="text-[#0078D7] font-medium flex items-center">
          Your Learning Progress
          {progressPercentage === 100 && (
            <span className="ml-2 text-xs bg-[#DCEFFF] text-[#0078D7] px-2 py-0.5 rounded-full border border-[#0078D7]/20">
              All Complete!
            </span>
          )}
        </h3>
        {isLoading ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <span className="text-sm text-gray-500 font-medium">
            {completedFrameworks} of {totalFrameworks} frameworks completed
          </span>
        )}
      </div>
      
      {isLoading ? (
        <Skeleton className="h-2 w-full rounded-full" />
      ) : (
        <Progress value={progressPercentage} className="h-2 blue-progress" />
      )}
      
      <div className="flex items-center justify-between mt-4 relative z-10">
        <div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <span className="text-sm text-gray-600">Next recommended framework:</span>
              <span className="ml-1 text-sm font-semibold text-[#0A2540]">
                {nextRecommendedFramework?.name || "All frameworks completed!"}
              </span>
            </>
          )}
        </div>
        
        {!isLoading && nextRecommendedFramework && (
          <Link to={`/frameworks/${nextRecommendedFramework.id}`}>
            <span className="flex items-center text-[#0078D7] hover:text-[#00A5E0] text-sm font-medium transition-all duration-200 group">
              Continue Learning 
              <svg className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" 
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default LearningProgress;
