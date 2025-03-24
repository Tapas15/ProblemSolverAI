import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import LearningProgress from '@/components/framework/learning-progress';
import FrameworkTabs from '@/components/framework/framework-tabs';
import FrameworkGrid from '@/components/framework/framework-grid';
import FeaturedSection from '@/components/ai/featured-section';
import { useQuery } from '@tanstack/react-query';
import { getFrameworks, getUserProgress } from '@/lib/api';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: frameworks, isLoading: frameworksLoading } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: () => getFrameworks(),
  });
  
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/user/progress'],
    queryFn: () => getUserProgress(),
  });
  
  // Filter frameworks based on active tab
  const filteredFrameworks = React.useMemo(() => {
    if (!frameworks || !userProgress) return [];
    
    switch (activeTab) {
      case 'completed':
        return frameworks.filter(framework => {
          const progress = userProgress.find(p => p.frameworkId === framework.id);
          return progress && progress.status === 'completed';
        });
      case 'in_progress':
        return frameworks.filter(framework => {
          const progress = userProgress.find(p => p.frameworkId === framework.id);
          return progress && progress.status === 'in_progress';
        });
      case 'recommended':
        // For simplicity, we're recommending frameworks that haven't been started yet
        return frameworks.filter(framework => {
          const progress = userProgress.find(p => p.frameworkId === framework.id);
          return !progress || progress.status === 'not_started';
        }).slice(0, 3); // Limit to 3 recommendations
      default:
        return frameworks;
    }
  }, [frameworks, userProgress, activeTab]);
  
  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 pt-16 pb-4 sm:pt-20 sm:pb-6 md:py-10 lg:max-w-7xl">
        {/* Page Header */}
        <div className="mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-header text-primary mb-2 sm:mb-3">
            Business Problem-Solving Frameworks
          </h1>
          <p className="text-gray-600 max-w-3xl text-sm sm:text-base">
            Access professional frameworks to structure your thinking and enhance your problem-solving capabilities. 
            Combine with AI assistance to develop innovative solutions.
          </p>
          
          <LearningProgress />
        </div>
        
        {/* Framework Tabs */}
        <FrameworkTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Framework Grid */}
        <div className="mt-4 sm:mt-6">
          <FrameworkGrid />
        </div>
        
        {/* Featured AI Section */}
        <div className="mt-6 sm:mt-8">
          <FeaturedSection />
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
