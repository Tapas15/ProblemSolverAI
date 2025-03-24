
import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import LearningProgress from '@/components/framework/learning-progress';
import { useQuery } from '@tanstack/react-query';
import { getFrameworks, getUserProgress } from '@/lib/api';

const LearningPathPage: React.FC = () => {
  const { data: frameworks } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: () => getFrameworks(),
  });

  const { data: progress } = useQuery({
    queryKey: ['/api/user/progress'],
    queryFn: () => getUserProgress(),
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold font-header text-primary mb-6">My Learning Path</h1>
        <div className="space-y-8">
          <LearningProgress />
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Recommended Next Steps</h2>
            <div className="grid gap-6">
              {frameworks?.map(framework => {
                const frameworkProgress = progress?.find(p => p.frameworkId === framework.id);
                if (!frameworkProgress || frameworkProgress.status === 'not_started') {
                  return (
                    <div key={framework.id} className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-xl font-medium mb-2">{framework.name}</h3>
                      <p className="text-gray-600 mb-4">{framework.description}</p>
                      <a 
                        href={`/frameworks/${framework.id}`}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        Start Learning →
                      </a>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LearningPathPage;
