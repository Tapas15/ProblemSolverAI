import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import AiAssistant from '@/components/ai/ai-assistant';

const AiAssistantPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="mb-8 relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0A2540] via-[#0E3A5C] to-[#0078D7] p-6 lg:p-8 shadow-lg">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[#00A5E0]/30 to-[#C5F2FF]/10 rounded-full -mt-20 -mr-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-[200px] h-[200px] bg-gradient-to-tr from-[#00A5E0]/20 to-[#C5F2FF]/10 rounded-full mb-[-100px] ml-[-100px] blur-3xl"></div>
          
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-3xl font-bold font-header text-white mb-3">
              AI Business Framework Assistant
            </h1>
            <p className="text-white/80 max-w-3xl">
              Get personalized guidance on applying business frameworks to your specific challenges.
              Connect with AI to receive step-by-step assistance tailored to your business needs.
            </p>
          </div>
        </div>
        
        <AiAssistant />
      </div>
    </MainLayout>
  );
};

export default AiAssistantPage;
