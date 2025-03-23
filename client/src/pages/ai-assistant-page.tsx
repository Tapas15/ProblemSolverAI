import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import AiAssistant from '@/components/ai/ai-assistant';

const AiAssistantPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-header text-primary mb-3">
            AI Business Framework Assistant
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Get personalized guidance on applying business frameworks to your specific challenges.
            Connect with AI to receive step-by-step assistance tailored to your business needs.
          </p>
        </div>
        
        <AiAssistant />
      </div>
    </MainLayout>
  );
};

export default AiAssistantPage;
