import React from 'react';
import AiAssistant from '@/components/ai/ai-assistant';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AiAssistantPage: React.FC = () => {
  return (
    <div className="native-scroll pb-16">
      {/* Mobile App Header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-4">
        <div className="flex items-center">
          {/* Back button removed as requested */}
          <h1 className="mobile-h1 text-[#0f172a]">AI Assistant</h1>
        </div>
      </div>
      
      <div className="px-4">
        <div className="mb-5 relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0A2540] via-[#0E3A5C] to-[#0078D7] p-4 shadow-lg">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[#00A5E0]/30 to-[#C5F2FF]/10 rounded-full -mt-20 -mr-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-[200px] h-[200px] bg-gradient-to-tr from-[#00A5E0]/20 to-[#C5F2FF]/10 rounded-full mb-[-100px] ml-[-100px] blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-2">
              Business Framework Assistant
            </h2>
            <p className="text-white/80 text-sm">
              Get personalized guidance on applying business frameworks to your specific challenges.
            </p>
          </div>
        </div>
        
        <AiAssistant />
      </div>
    </div>
  );
};

export default AiAssistantPage;
