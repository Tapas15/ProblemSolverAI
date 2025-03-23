import React from 'react';
import { Link } from 'wouter';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturedSection: React.FC = () => {
  return (
    <div className="mt-12 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/2 p-6 md:p-8">
          <h2 className="text-xl font-bold font-header text-primary mb-3">Enhance Your Problem-Solving with AI</h2>
          <p className="text-gray-600 mb-4">Connect your ChatGPT or Gemini API to get personalized guidance on applying frameworks to your specific business challenges.</p>
          
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-primary mb-2">AI-Assisted Problem-Solving</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="text-secondary mt-1 mr-2 h-4 w-4" />
                <span className="text-sm text-gray-600">Step-by-step guidance on applying frameworks</span>
              </li>
              <li className="flex items-start">
                <Check className="text-secondary mt-1 mr-2 h-4 w-4" />
                <span className="text-sm text-gray-600">Custom responses based on your specific challenges</span>
              </li>
              <li className="flex items-start">
                <Check className="text-secondary mt-1 mr-2 h-4 w-4" />
                <span className="text-sm text-gray-600">Personalized recommendations for framework selection</span>
              </li>
            </ul>
          </div>
          
          <Link to="/ai-assistant">
            <Button className="bg-secondary hover:bg-secondary/90 text-white font-medium">
              Connect Your AI Assistant
            </Button>
          </Link>
        </div>
        
        <div className="md:w-1/2 bg-gray-50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-gray-200">
          <h3 className="font-medium text-primary mb-3">Example AI Interaction</h3>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="mb-3 pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-2">Your question:</p>
              <p className="text-sm">How can I apply the MECE framework to analyze customer satisfaction issues in our retail business?</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">AI response:</p>
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
