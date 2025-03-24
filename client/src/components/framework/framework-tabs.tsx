import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserProgress } from '@/lib/api';

interface FrameworkTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FrameworkTabs: React.FC<FrameworkTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="mb-5 sm:mb-8">
      <div className="border-b border-[#E0F0FF] overflow-x-auto no-scrollbar">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 px-1 touch-manipulation">
          <button
            className={`border-b-2 ${
              activeTab === 'all' 
                ? 'border-[#0078D7] text-[#0078D7] font-semibold' 
                : 'border-transparent hover:border-[#0078D7]/30 text-gray-500 hover:text-[#0078D7]/80'
            } py-2.5 sm:py-4 px-1 font-medium text-xs sm:text-sm transition-all duration-200 relative group active:opacity-80 touch-manipulation`}
            onClick={() => onTabChange('all')}
          >
            <span className="relative z-10">All</span>
            {activeTab === 'all' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#0078D7] to-[#00A5E0] -mb-0.5"></span>
            )}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0078D7]/70 to-[#00A5E0]/70 -mb-0.5 group-hover:w-full transition-all duration-300 ease-out"></span>
          </button>
          
          <button
            className={`border-b-2 ${
              activeTab === 'completed' 
                ? 'border-[#0078D7] text-[#0078D7] font-semibold' 
                : 'border-transparent hover:border-[#0078D7]/30 text-gray-500 hover:text-[#0078D7]/80'
            } py-2.5 sm:py-4 px-1 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 relative group active:opacity-80 touch-manipulation`}
            onClick={() => onTabChange('completed')}
          >
            <span className="relative z-10">Completed</span>
            {activeTab === 'completed' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#0078D7] to-[#00A5E0] -mb-0.5"></span>
            )}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0078D7]/70 to-[#00A5E0]/70 -mb-0.5 group-hover:w-full transition-all duration-300 ease-out"></span>
          </button>
          
          <button
            className={`border-b-2 ${
              activeTab === 'in_progress' 
                ? 'border-[#0078D7] text-[#0078D7] font-semibold' 
                : 'border-transparent hover:border-[#0078D7]/30 text-gray-500 hover:text-[#0078D7]/80'
            } py-2.5 sm:py-4 px-1 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 relative group active:opacity-80 touch-manipulation`}
            onClick={() => onTabChange('in_progress')}
          >
            <span className="relative z-10">In Progress</span>
            {activeTab === 'in_progress' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#0078D7] to-[#00A5E0] -mb-0.5"></span>
            )}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0078D7]/70 to-[#00A5E0]/70 -mb-0.5 group-hover:w-full transition-all duration-300 ease-out"></span>
          </button>
          
          <button
            className={`border-b-2 ${
              activeTab === 'recommended' 
                ? 'border-[#0078D7] text-[#0078D7] font-semibold' 
                : 'border-transparent hover:border-[#0078D7]/30 text-gray-500 hover:text-[#0078D7]/80'
            } py-2.5 sm:py-4 px-1 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 relative group active:opacity-80 touch-manipulation`}
            onClick={() => onTabChange('recommended')}
          >
            <span className="relative z-10">Recommended</span>
            {activeTab === 'recommended' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#0078D7] to-[#00A5E0] -mb-0.5"></span>
            )}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0078D7]/70 to-[#00A5E0]/70 -mb-0.5 group-hover:w-full transition-all duration-300 ease-out"></span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default FrameworkTabs;
