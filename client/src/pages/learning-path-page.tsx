import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import LearningPathView from '@/components/learning-path/learning-path-view';
import { Map, Compass, Navigation, Route } from 'lucide-react';

export default function LearningPathPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-10">
        {/* Page Header with enhanced design */}
        <div className="mb-6 sm:mb-8 relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0A2540] via-[#0E3A5C] to-[#0078D7] p-4 sm:p-6 lg:p-8 shadow-lg">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[#00A5E0]/30 to-[#C5F2FF]/10 rounded-full -mt-20 -mr-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-[200px] h-[200px] bg-gradient-to-tr from-[#6a5ff9]/20 to-[#9387fd]/10 rounded-full mb-[-100px] ml-[-100px] blur-3xl"></div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-white bg-opacity-10 p-2 rounded-md mr-3 sm:mr-4">
                <Map className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-header text-white">
                Your Learning Journey
              </h1>
            </div>
            <p className="text-white/80 text-sm sm:text-base md:text-lg">
              Follow this personalized learning path to systematically improve your problem-solving skills. 
              We've carefully crafted this journey to optimize your skill development and professional growth.
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center mt-4 sm:mt-5 space-y-2 sm:space-y-0 sm:space-x-1 text-white/70 text-xs sm:text-sm">
              <div className="flex items-center">
                <Compass className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>Tailored progression</span>
              </div>
              
              <span className="hidden sm:inline mx-2">•</span>
              
              <div className="flex items-center">
                <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>Skill-based sequencing</span>
              </div>
              
              <span className="hidden sm:inline mx-2">•</span>
              
              <div className="flex items-center">
                <Route className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>Adaptive difficulty</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Learning Path View */}
        <LearningPathView />
      </div>
    </MainLayout>
  );
}