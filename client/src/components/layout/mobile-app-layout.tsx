import React, { useEffect, useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Award, 
  User, 
  Settings, 
  Menu, 
  X, 
  Lightbulb, 
  LayoutDashboard, 
  Smartphone,
  LogOut
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isNativePlatform, getPlatform } from '@/lib/capacitor';
import { useAuth } from '@/hooks/use-auth';
import "../../styles/mobile.css";

interface MobileAppLayoutProps {
  children: React.ReactNode;
}

export function MobileAppLayout({ children }: MobileAppLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [platform, setPlatform] = useState<string>('web');
  const [showMenu, setShowMenu] = useState(false);
  const isNative = isNativePlatform();

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  // These paths require no authentication and don't use the mobile layout
  const publicPaths = ['/auth', '/about', '/contact', '/privacy', '/terms'];
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
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      name: 'Practice', 
      path: '/exercises', 
      icon: <Award className="h-5 w-5" /> 
    },
    { 
      name: 'AI Assistant', 
      path: '/ai-assistant', 
      icon: <Lightbulb className="h-5 w-5" /> 
    }
  ];

  const secondaryMenuItems = [
    { 
      name: 'Mobile Features', 
      path: '/mobile-features', 
      icon: <Smartphone className="h-5 w-5" />,
      badge: isNative ? 'NATIVE' : 'WEB'
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: <User className="h-5 w-5" /> 
    },
    { 
      name: 'Founder', 
      path: '/founder', 
      icon: <Award className="h-5 w-5" /> 
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
  
  // More aggressive fix for navigation sliding issues
  const handleNavigation = (path: string) => {
    // First close the menu and prevent any interactions
    document.body.classList.add('prevent-scroll');
    setShowMenu(false);
    
    // Force a slight pause before navigation to ensure menu is closed
    setTimeout(() => {
      // Navigate using direct location update rather than router
      window.location.href = path;
      
      // Remove prevention after navigation starts
      setTimeout(() => {
        document.body.classList.remove('prevent-scroll');
      }, 300);
    }, 50);
  };

  return (
    <div className={`capacitor-app ${platform} min-h-screen bg-background`}>
      {/* Mobile Status Bar - only visible on native */}
      {isNative && (
        <div className="status-bar-placeholder" 
          style={{ 
            height: platform === 'ios' ? 'var(--safe-area-inset-top, 47px)' : '24px',
            background: 'linear-gradient(to right, #0f2544, #19355f)'
          }}
        />
      )}

      {/* Mobile Top Bar */}
      <header className="sticky top-0 left-0 right-0 h-14 bg-gradient-to-r from-[#0f2544] to-[#19355f] z-30 flex items-center justify-between px-4 shadow-md">
        <div 
          className="flex items-center cursor-pointer nav-item"
          onClick={() => handleNavigation("/")}
        >
          <span className="font-bold text-xl text-white font-header tracking-tight">
            <span className="text-[#3b82f6]">Question</span>
            <span className="text-white">Pro </span>
            <span className="text-[#60a5fa]">AI</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isNative && (
            <Badge variant="outline" className="border-[#3b82f6]/30 text-[#60a5fa] mr-2">
              {platform.toUpperCase()}
            </Badge>
          )}
          {/* Custom side menu implementation */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                document.body.classList.add('prevent-scroll');
                setShowMenu(true);
              }} 
              className="text-white hover:bg-[#1a4482]/50"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            {/* Custom overlay */}
            {showMenu && (
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 touch-none"
                onClick={() => {
                  document.body.classList.add('prevent-scroll');
                  setShowMenu(false);
                  setTimeout(() => {
                    document.body.classList.remove('prevent-scroll');
                  }, 300);
                }}
              />
            )}
            
            {/* Custom side panel */}
            <div 
              className={`fixed top-0 left-0 bottom-0 w-[280px] sm:w-[300px] z-50 transform transition-transform duration-300 ease-in-out touch-none
                ${showMenu ? 'translate-x-0' : '-translate-x-full'}
                border-r border-[#3b82f6]/10 bg-gradient-to-b from-[#0f2544] to-[#19355f] text-white shadow-lg`}
            >
              <div className="py-4 h-full flex flex-col">
                <div className="flex items-center justify-between px-4 mb-6">
                  <div
                    className="font-bold text-xl font-header tracking-tight cursor-pointer"
                    onClick={() => {
                      document.body.classList.add('prevent-scroll');
                      setShowMenu(false);
                      setTimeout(() => {
                        window.location.href = "/";
                        document.body.classList.remove('prevent-scroll');
                      }, 300);
                    }}
                  >
                    <span className="text-[#3b82f6]">Question</span>
                    <span className="text-white">Pro </span>
                    <span className="text-[#60a5fa]">AI</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      document.body.classList.add('prevent-scroll');
                      setShowMenu(false);
                      setTimeout(() => {
                        document.body.classList.remove('prevent-scroll');
                      }, 300);
                    }} 
                    className="text-white hover:bg-[#1a4482]/50"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* User Profile Summary */}
                {user && (
                  <div className="mb-6 mx-4 p-3 border border-[#3b82f6]/10 rounded-xl bg-[#1a4482]/30">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 ring-2 ring-[#60a5fa]/30 shadow-inner">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] text-white font-medium">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-white/60">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Navigation */}
                <div className="px-4 mb-4 overflow-y-auto flex-1">
                  <h3 className="text-xs uppercase text-white/50 font-semibold mb-2 px-3">Main Navigation</h3>
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <div
                        key={item.path}
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                          isActive(item.path)
                            ? "bg-[#1a4482]/50 text-[#60a5fa]" 
                            : "text-white/80 hover:bg-[#1a4482]/30 hover:text-white"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          document.body.classList.add('prevent-scroll');
                          setShowMenu(false);
                          setTimeout(() => {
                            window.location.href = item.path;
                            document.body.classList.remove('prevent-scroll');
                          }, 300);
                        }}
                      >
                        <div className={isActive(item.path) ? "text-[#60a5fa]" : ""}>
                          {item.icon}
                        </div>
                        <span className="ml-3 font-medium">{item.name}</span>
                        {isActive(item.path) && (
                          <div className="ml-auto w-1.5 h-6 rounded-full bg-gradient-to-b from-[#3b82f6] to-[#60a5fa]"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Navigation */}
                <div className="px-4 mb-4">
                  <h3 className="text-xs uppercase text-white/50 font-semibold mb-2 px-3">More Options</h3>
                  <div className="space-y-1">
                    {secondaryMenuItems.map((item) => (
                      <div
                        key={item.path}
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                          isActive(item.path)
                            ? "bg-[#1a4482]/50 text-[#60a5fa]"
                            : "text-white/80 hover:bg-[#1a4482]/30 hover:text-white"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          document.body.classList.add('prevent-scroll');
                          setShowMenu(false);
                          setTimeout(() => {
                            window.location.href = item.path;
                            document.body.classList.remove('prevent-scroll');
                          }, 300);
                        }}
                      >
                        <div className={isActive(item.path) ? "text-[#60a5fa]" : ""}>
                          {item.icon}
                        </div>
                        <span className="ml-3 font-medium">{item.name}</span>
                        {item.badge && (
                          <Badge 
                            variant="outline" 
                            className="ml-auto text-xs py-0 px-1.5 border-[#3b82f6]/30 text-[#60a5fa]"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {isActive(item.path) && !item.badge && (
                          <div className="ml-auto w-1.5 h-6 rounded-full bg-gradient-to-b from-[#3b82f6] to-[#60a5fa]"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logout Button */}
                <div className="px-4 mb-4">
                  <div 
                    className="flex items-center p-3 rounded-xl cursor-pointer transition-colors text-white/80 hover:bg-[#1a4482]/30 hover:text-white border border-[#3b82f6]/20"
                    onClick={() => {
                      document.body.classList.add('prevent-scroll');
                      setShowMenu(false);
                      setTimeout(() => {
                        logoutMutation.mutate();
                        setTimeout(() => {
                          document.body.classList.remove('prevent-scroll');
                        }, 300);
                      }, 300);
                    }}
                  >
                    <LogOut className="h-5 w-5 text-[#ff6b6b]" />
                    <span className="ml-3 font-medium">Logout</span>
                  </div>
                </div>

                {/* Version information */}
                <div className="mt-auto px-4 pt-4 border-t border-[#3b82f6]/10 text-center text-xs text-white/40">
                  <p>QuestionPro AI Mobile {isNative ? platform : 'Web'} v1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="native-scroll pb-20">
        <div className="mobile-container mx-auto px-4">
          {children}
        </div>
      </main>

      {/* Mobile Tab Bar - Direct button implementation for better touch handling */}
      <nav className="mobile-tab-bar bg-gradient-to-r from-[#0f2544] to-[#19355f] border-t border-[#3b82f6]/10">
        {menuItems.slice(0, 5).map((item) => (
          <button
            key={item.path}
            className={`flex flex-col items-center justify-center w-full h-full outline-none touch-manipulation ${
              isActive(item.path) ? "text-[#60a5fa]" : "text-white/70"
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              document.body.classList.add('prevent-scroll');
              // Wait briefly before navigation to prevent scrolling during transition
              setTimeout(() => {
                window.location.href = item.path;
                setTimeout(() => {
                  document.body.classList.remove('prevent-scroll');
                }, 100);
              }, 50);
            }}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}