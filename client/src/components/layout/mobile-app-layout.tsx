import React, { useEffect, useState } from 'react';
import { Home, BookOpen, Award, User, Settings, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { isNativePlatform, getPlatform } from '@/lib/capacitor';
import { useAuth } from '@/hooks/use-auth';
import "../../styles/mobile.css";

interface MobileAppLayoutProps {
  children: React.ReactNode;
}

export function MobileAppLayout({ children }: MobileAppLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [platform, setPlatform] = useState<string>('web');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  // These paths require no authentication and don't use the mobile layout
  const publicPaths = ['/auth', '/about', '/contact', '/privacy', '/terms', '/founder'];
  if (publicPaths.some(path => location.startsWith(path))) {
    return <>{children}</>;
  }

  // If user is not authenticated and not on a public path, children will handle redirection
  if (!user) {
    return <>{children}</>;
  }

  const menuItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: <Home className="h-5 w-5" /> 
    },
    { 
      name: 'Frameworks', 
      path: '/frameworks', 
      icon: <BookOpen className="h-5 w-5" /> 
    },
    { 
      name: 'Exercises', 
      path: '/exercises', 
      icon: <Award className="h-5 w-5" /> 
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: <User className="h-5 w-5" /> 
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <Settings className="h-5 w-5" /> 
    }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className={`capacitor-app ${platform} min-h-screen bg-background`}>
      {/* Mobile Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b z-30 flex items-center justify-between px-4">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <span className="font-bold text-xl text-primary">Question<span className="text-blue-600">Pro</span> AI</span>
          </div>
        </Link>
        
        <Sheet open={showMenu} onOpenChange={setShowMenu}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[250px] sm:w-[300px]">
            <div className="py-4">
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-xl text-primary">Question<span className="text-blue-600">Pro</span> AI</span>
                <Button variant="ghost" size="icon" onClick={() => setShowMenu(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center p-3 rounded-md cursor-pointer ${
                        isActive(item.path)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setShowMenu(false)}
                    >
                      {item.icon}
                      <span className="ml-3 font-medium">{item.name}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="pt-14 pb-16 px-4 native-scroll">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <nav className="mobile-tab-bar bg-white border-t">
        {menuItems.slice(0, 5).map((item) => (
          <Link key={item.path} href={item.path}>
            <div
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive(item.path) ? "text-primary" : "text-gray-500"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}