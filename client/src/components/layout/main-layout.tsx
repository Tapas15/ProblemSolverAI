import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { isNativePlatform } from '@/lib/capacitor';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isNative, setIsNative] = useState(false);
  
  useEffect(() => {
    setIsNative(isNativePlatform());
  }, []);
  
  // For mobile app, we don't use any of the web layout components
  if (isNative) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex-1">
          {children}
        </div>
      </div>
    );
  }
  
  // For web, we return a simplified version without sidebars
  return (
    <div className="min-h-screen flex bg-[#F7F9FF]">
      {/* Main content area */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
