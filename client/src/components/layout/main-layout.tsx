import React, { ReactNode } from 'react';
import Sidebar from './sidebar';
import MobileNav from './mobile-nav';
import Footer from './footer';
import { useAuth } from '@/hooks/use-auth';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FF]">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Mobile navigation */}
      <MobileNav />
      
      {/* Main content area */}
      <div className="flex flex-col min-h-screen">
        {/* Content with padding to account for sidebar */}
        <div className="flex-1 lg:ml-[240px] pt-16 lg:pt-0 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto py-6">
            {children}
          </div>
        </div>
        
        {/* Footer with padding to account for sidebar */}
        <div className="lg:ml-[240px]">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
