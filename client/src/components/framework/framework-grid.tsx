import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFrameworks, getModules, getUserProgress, getFramework } from '@/lib/api';
import FrameworkCard from './framework-card';
import FrameworkDetail from './framework-detail';
import { Framework, Module, UserProgress } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

// Create a properly typed empty module placeholder
const EMPTY_MODULE: Module = {
  id: 0,
  frameworkId: 0,
  name: '',
  description: '',
  content: null,
  examples: null,
  keyTakeaways: null,
  quizQuestions: null,
  videoUrl: null,
  resources: null,
  image_url: null,
  completed: false,
  order: 0,
  scormPath: null,
};

// Create empty modules array with properly typed elements
const createEmptyModules = (count: number): Module[] => {
  return Array(count).fill(EMPTY_MODULE);
};

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
    if (!userProgress) return { status: 'not_started', completedModules: 0, totalModules: 0 };
    
    const progress = userProgress.find(p => p.frameworkId === frameworkId);
    if (!progress) return { status: 'not_started', completedModules: 0, totalModules: 0 };
    
    return {
      status: progress.status,
      completedModules: progress.completedModules || 0,
      totalModules: progress.totalModules || 0
    };
  };
  
  if (frameworksLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-40 bg-gradient-to-r from-[#9545ff]/10 to-[#ff59b2]/10" />
                <Skeleton className="h-6 w-20 bg-gradient-to-r from-[#9545ff]/10 to-[#ff59b2]/10" />
              </div>
              <Skeleton className="h-4 w-full bg-gradient-to-r from-[#9545ff]/10 to-[#ff59b2]/10" />
              <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-[#9545ff]/10 to-[#ff59b2]/10" />
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-20 bg-gradient-to-r from-[#9545ff]/10 to-[#ff59b2]/10" />
                <Skeleton className="h-4 w-20 bg-gradient-to-r from-[#9545ff]/10 to-[#ff59b2]/10" />
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Skeleton className="h-4 w-full bg-gradient-to-r from-[#9545ff]/10 to-[#ff59b2]/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  const groupedFrameworks = frameworks?.reduce((acc, framework) => {
    const { status } = getFrameworkProgress(framework.id);
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(framework);
    return acc;
  }, {} as Record<string, Framework[]>) || {};

  return (
    <>
      {groupedFrameworks['completed']?.length > 0 && (
        <>
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-primary">Completed Frameworks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-5 sm:mb-8">
            {groupedFrameworks['completed'].map((framework) => {
              const { status, completedModules, totalModules } = getFrameworkProgress(framework.id);
              return (
                <div key={framework.id} onClick={() => handleFrameworkClick(framework.id)} className="cursor-pointer touch-manipulation">
                  <FrameworkCard 
                    framework={framework}
                    modules={createEmptyModules(totalModules)}
                    progressStatus={status}
                    completedModules={completedModules}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}

      {groupedFrameworks['in_progress']?.length > 0 && (
        <>
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-primary">In Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-5 sm:mb-8">
            {groupedFrameworks['in_progress'].map((framework) => {
              const { status, completedModules, totalModules } = getFrameworkProgress(framework.id);
              return (
                <div key={framework.id} onClick={() => handleFrameworkClick(framework.id)} className="cursor-pointer touch-manipulation">
                  <FrameworkCard 
                    framework={framework}
                    modules={createEmptyModules(totalModules)}
                    progressStatus={status}
                    completedModules={completedModules}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}

      {groupedFrameworks['not_started']?.length > 0 && (
        <>
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-primary">Available Frameworks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {groupedFrameworks['not_started'].map((framework) => {
              const { status, completedModules, totalModules } = getFrameworkProgress(framework.id);
              return (
                <div key={framework.id} onClick={() => handleFrameworkClick(framework.id)} className="cursor-pointer touch-manipulation">
                  <FrameworkCard 
                    framework={framework}
                    modules={createEmptyModules(totalModules)}
                    progressStatus={status}
                    completedModules={completedModules}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
      
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
