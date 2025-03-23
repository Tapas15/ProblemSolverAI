import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserProgress } from '@/lib/api';

interface FrameworkTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FrameworkTabs: React.FC<FrameworkTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            className={`border-b-2 ${
              activeTab === 'all' 
                ? 'border-secondary text-secondary' 
                : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
            } py-4 px-1 font-medium text-sm`}
            onClick={() => onTabChange('all')}
          >
            All Frameworks
          </button>
          
          <button
            className={`border-b-2 ${
              activeTab === 'completed' 
                ? 'border-secondary text-secondary' 
                : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
            } py-4 px-1 font-medium text-sm whitespace-nowrap`}
            onClick={() => onTabChange('completed')}
          >
            Completed
          </button>
          
          <button
            className={`border-b-2 ${
              activeTab === 'in_progress' 
                ? 'border-secondary text-secondary' 
                : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
            } py-4 px-1 font-medium text-sm whitespace-nowrap`}
            onClick={() => onTabChange('in_progress')}
          >
            In Progress
          </button>
          
          <button
            className={`border-b-2 ${
              activeTab === 'recommended' 
                ? 'border-secondary text-secondary' 
                : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
            } py-4 px-1 font-medium text-sm whitespace-nowrap`}
            onClick={() => onTabChange('recommended')}
          >
            Recommended for You
          </button>
        </nav>
      </div>
    </div>
  );
};

export default FrameworkTabs;
