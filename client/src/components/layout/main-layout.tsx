import React, { ReactNode } from 'react';
import Navbar from './navbar';
import Footer from './footer';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Add padding top to account for the fixed navbar */}
      <div className="flex-1 pt-16">{children}</div>
      <Footer />
    </div>
  );
};

export default MainLayout;
