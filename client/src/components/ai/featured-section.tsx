import React from 'react';
import { Link } from 'wouter';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturedSection: React.FC = () => {
  return (
    <div className="mt-12 bg-white rounded-lg shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-500">
      <div className="md:flex">
        <div className="md:w-1/2 p-6 md:p-8 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0078D7]/10 to-[#00A5E0]/5 rounded-full -mt-10 -mr-10 blur-xl"></div>
          <h2 className="text-xl font-bold font-header text-primary mb-3">Enhance Your Problem-Solving with AI</h2>
          <p className="text-gray-600 mb-4">Connect your ChatGPT or Gemini API to get personalized guidance on applying frameworks to your specific business challenges.</p>
          
          <div className="bg-[#F0F7FF] border border-[#0078D7]/10 rounded-lg p-4 mb-6 shadow-inner">
            <h4 className="font-medium text-[#0078D7] mb-2">AI-Assisted Problem-Solving</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="text-[#0078D7] mt-1 mr-2 h-4 w-4" />
                <span className="text-sm text-gray-600">Step-by-step guidance on applying frameworks</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#0078D7] mt-1 mr-2 h-4 w-4" />
                <span className="text-sm text-gray-600">Custom responses based on your specific challenges</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#0078D7] mt-1 mr-2 h-4 w-4" />
                <span className="text-sm text-gray-600">Personalized recommendations for framework selection</span>
              </li>
            </ul>
          </div>
          
          <Link to="/ai-assistant">
            <Button className="btn-blue-gradient font-medium">
              Connect Your AI Assistant
            </Button>
          </Link>
        </div>
        
        <div className="md:w-1/2 bg-[#F8FBFF] p-6 md:p-8 border-t md:border-t-0 md:border-l border-[#E0F0FF] relative">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#0078D7]/5 to-[#00A5E0]/10 rounded-full -mb-10 -ml-10 blur-xl"></div>
          <h3 className="font-medium text-[#0078D7] mb-3">Example AI Interaction</h3>
          
          <div className="bg-white border border-[#E0F0FF] rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 relative z-10">
            <div className="mb-3 pb-3 border-b border-[#F0F7FF]">
              <p className="text-sm font-medium text-[#0078D7]/80 mb-2">Your question:</p>
              <p className="text-sm">How can I apply the MECE framework to analyze customer satisfaction issues in our retail business?</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-[#0078D7]/80 mb-2">AI response:</p>
              <p className="text-sm text-gray-700 mb-2">To apply MECE to customer satisfaction issues in retail:</p>
              <ol className="text-sm text-gray-700 pl-5 list-decimal space-y-1">
                <li>First, break down satisfaction into main categories: Product, Service, Store Experience, and Post-Purchase.</li>
                <li>For each category, identify mutually exclusive factors (e.g., Product → quality, selection, pricing, availability).</li>
                <li>Create a framework that ensures each issue belongs in exactly one category.</li>
                <li>Collect data through surveys aligned with your MECE structure.</li>
                <li>Analyze results to identify primary drivers of satisfaction issues.</li>
              </ol>
              <p className="text-sm text-gray-700 mt-2">Would you like me to help you develop specific questions for each category?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedSection;
