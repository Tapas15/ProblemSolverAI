import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import LearningPathView from '@/components/learning-path/learning-path-view';

export default function LearningPathPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-header text-primary mb-3">
            Personalized Learning Path
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Follow this guided learning journey to systematically improve your problem-solving skills. 
            We've organized the frameworks in a sequence optimized for learning progression.
          </p>
        </div>
        
        {/* Learning Path View */}
        <LearningPathView />
      </div>
    </MainLayout>
  );
}