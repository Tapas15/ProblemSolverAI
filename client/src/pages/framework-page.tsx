import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getFramework, getModules, getUserProgress } from '@/lib/api';
import MainLayout from '@/components/layout/main-layout';
import FrameworkDetail from '@/components/framework/framework-detail';
import { FrameworkWizardList } from '@/components/framework/framework-wizard-list';
import { FrameworkDetailSkeleton } from '@/components/ui/skeleton-loader';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Framework } from '@shared/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FrameworkPage: React.FC = () => {
  const params = useParams();
  const [_, navigate] = useLocation();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<string>("modules");
  
  // Convert id to number
  const frameworkId = parseInt(params.id || '0');
  
  // Redirect if ID is invalid
  useEffect(() => {
    if (isNaN(frameworkId)) {
      navigate('/');
    }
  }, [frameworkId, navigate]);
  
  const { 
    data: framework, 
    isLoading: frameworkLoading,
    error: frameworkError
  } = useQuery({
    queryKey: [`/api/frameworks/${frameworkId}`],
    queryFn: () => getFramework(frameworkId),
    enabled: !isNaN(frameworkId),
  });
  
  const { 
    data: modules, 
    isLoading: modulesLoading,
    error: modulesError 
  } = useQuery({
    queryKey: [`/api/frameworks/${frameworkId}/modules`],
    queryFn: () => getModules(frameworkId),
    enabled: !isNaN(frameworkId),
  });
  
  // Fetch user progress data
  const {
    data: userProgress,
    isLoading: progressLoading,
    error: progressError
  } = useQuery({
    queryKey: ['/api/user/progress'],
    queryFn: () => getUserProgress(),
  });
  
  // Enhance framework with status from user progress
  const enhancedFramework = useMemo(() => {
    if (!framework || !userProgress) return framework;
    
    // Find progress for this framework
    const progress = userProgress.find(p => p.frameworkId === framework.id);
    
    // Return framework with status added
    return {
      ...framework,
      status: progress ? progress.status : 'not_started'
    } as Framework & { status: string };
  }, [framework, userProgress]);
  
  const isLoading = frameworkLoading || modulesLoading || progressLoading;
  const error = frameworkError || modulesError || progressError;
  
  if (isLoading) {
    return (
      <MainLayout>
        <FrameworkDetailSkeleton />
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'}
            </AlertDescription>
          </Alert>
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
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="wizard">Interactive Wizard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules" className="mt-0">
            <FrameworkDetail 
              isOpen={true} 
              onClose={() => navigate('/')}
              framework={enhancedFramework}
              modules={modules}
              isLoading={false}
            />
          </TabsContent>
          
          <TabsContent value="wizard" className="mt-0">
            <FrameworkWizardList frameworkId={frameworkId} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default FrameworkPage;
