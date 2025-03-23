import React, { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getFramework, getModules } from '@/lib/api';
import MainLayout from '@/components/layout/main-layout';
import FrameworkDetail from '@/components/framework/framework-detail';
import { Loader2 } from 'lucide-react';

const FrameworkPage: React.FC = () => {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  
  // Convert id to number
  const frameworkId = parseInt(id);
  
  // Redirect if ID is invalid
  useEffect(() => {
    if (isNaN(frameworkId)) {
      navigate('/');
    }
  }, [frameworkId, navigate]);
  
  const { data: framework, isLoading: frameworkLoading } = useQuery({
    queryKey: [`/api/frameworks/${frameworkId}`],
    queryFn: () => getFramework(frameworkId),
    enabled: !isNaN(frameworkId),
  });
  
  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: [`/api/frameworks/${frameworkId}/modules`],
    queryFn: () => getModules(frameworkId),
    enabled: !isNaN(frameworkId),
  });
  
  const isLoading = frameworkLoading || modulesLoading;
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      </MainLayout>
    );
  }
  
  if (!framework) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Framework Not Found</h1>
          <p className="text-gray-600 mb-6">The framework you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="text-secondary hover:underline"
          >
            Return to Frameworks
          </button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <FrameworkDetail 
        isOpen={true} 
        onClose={() => navigate('/')}
        framework={framework}
        modules={modules}
        isLoading={false}
      />
    </MainLayout>
  );
};

export default FrameworkPage;
