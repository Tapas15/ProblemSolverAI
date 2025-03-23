import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFrameworks, getModules, getUserProgress } from '@/lib/api';
import FrameworkCard from './framework-card';
import FrameworkDetail from './framework-detail';
import { Framework, Module, UserProgress } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

const FrameworkGrid: React.FC = () => {
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<number | null>(null);
  
  const { data: frameworks, isLoading: frameworksLoading } = useQuery<Framework[]>({
    queryKey: ['/api/frameworks'],
    queryFn: () => getFrameworks(),
  });
  
  const { data: userProgress, isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ['/api/user/progress'],
    queryFn: () => getUserProgress(),
  });
  
  const { data: selectedFramework } = useQuery<Framework>({
    queryKey: [`/api/frameworks/${selectedFrameworkId}`],
    queryFn: () => getFramework(selectedFrameworkId!),
    enabled: !!selectedFrameworkId,
  });
  
  const { data: modules, isLoading: modulesLoading } = useQuery<Module[]>({
    queryKey: [`/api/frameworks/${selectedFrameworkId}/modules`],
    queryFn: () => getModules(selectedFrameworkId!),
    enabled: !!selectedFrameworkId,
  });
  
  const handleFrameworkClick = (id: number) => {
    setSelectedFrameworkId(id);
  };
  
  const handleCloseDetail = () => {
    setSelectedFrameworkId(null);
  };
  
  const getFrameworkProgress = (frameworkId: number) => {
    if (!userProgress) return { status: 'not_started', completedModules: 0 };
    
    const progress = userProgress.find(p => p.frameworkId === frameworkId);
    if (!progress) return { status: 'not_started', completedModules: 0 };
    
    return {
      status: progress.status,
      completedModules: progress.completedModules
    };
  };
  
  if (frameworksLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frameworks?.map((framework) => {
          const { status, completedModules } = getFrameworkProgress(framework.id);
          
          // Add click event to handle opening framework detail
          const handleCardClick = () => handleFrameworkClick(framework.id);
          
          return (
            <div key={framework.id} onClick={handleCardClick} className="cursor-pointer">
              <FrameworkCard 
                framework={framework} 
                modules={[]} // Empty array because we're not individually loading modules for cards
                progressStatus={status}
                completedModules={completedModules}
              />
            </div>
          );
        })}
      </div>
      
      <FrameworkDetail 
        isOpen={!!selectedFrameworkId} 
        onClose={handleCloseDetail}
        framework={selectedFramework}
        modules={modules}
        isLoading={modulesLoading}
      />
    </>
  );
};

export default FrameworkGrid;
