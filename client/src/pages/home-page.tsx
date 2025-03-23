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
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-header text-primary mb-3">
            Business Problem-Solving Frameworks
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Access professional frameworks to structure your thinking and enhance your problem-solving capabilities. 
            Combine with AI assistance to develop innovative solutions.
          </p>
          
          <LearningProgress />
        </div>
        
        {/* Framework Tabs */}
        <FrameworkTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Framework Grid */}
        <FrameworkGrid />
        
        {/* Featured AI Section */}
        <FeaturedSection />
      </div>
    </MainLayout>
  );
};

export default HomePage;
