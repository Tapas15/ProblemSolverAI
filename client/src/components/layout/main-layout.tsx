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
    <div className="min-h-screen flex bg-[#F7F9FF]">
      {/* Sidebar for desktop - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Mobile navigation - shown only on mobile */}
        <MobileNav />
        
        {/* Content */}
        <div className="flex-1 pt-16 lg:pt-0 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto py-6">
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
