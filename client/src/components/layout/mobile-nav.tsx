import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  Menu, 
  X, 
  LogOut,
  Home,
  BookOpen,
  BarChart,
  Lightbulb,
  LayoutDashboard,
  Dumbbell,
  Briefcase,
  User,
  Settings,
  FileCode,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MobileNav: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = user && user.username === 'admin';

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  const NavItem = ({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive: boolean }) => (
    <Link to={to} onClick={() => setIsOpen(false)}>
      <div className={`flex items-center space-x-3 p-2.5 sm:p-3 rounded-xl touch-manipulation active:opacity-80 ${
        isActive 
          ? 'bg-gradient-to-r from-[#3b82f6]/20 to-[#60a5fa]/20 text-white' 
          : 'text-white/80 hover:bg-[#1a4482]/30 hover:text-white'
      } transition-all`}>
        <div className={`${isActive ? 'text-[#60a5fa]' : ''}`}>
          {React.cloneElement(icon as React.ReactElement, { 
            className: 'h-4 w-4 sm:h-5 sm:w-5'
          })}
        </div>
        <span className="font-medium text-sm sm:text-base">{label}</span>
        {isActive && <div className="ml-auto h-full w-1 rounded-full bg-gradient-to-b from-[#3b82f6] to-[#60a5fa]"></div>}
      </div>
    </Link>
  );

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 bg-gradient-to-r from-[#0f2544] to-[#19355f] border-b border-[#3b82f6]/20 flex items-center justify-between px-3 sm:px-4 shadow-md">
      <Link to="/">
        <div className="font-bold text-lg sm:text-xl font-header tracking-tight flex items-center group touch-manipulation">
          <div className="relative">
            <span className="text-[#3b82f6]">Framework</span>
            <span className="text-white">Pro</span>
          </div>
        </div>
      </Link>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#1a4482]/50 touch-manipulation">
            <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[85vw] max-w-[280px] border-r border-[#3b82f6]/20 bg-gradient-to-b from-[#0f2544] to-[#19355f]">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">App navigation links and settings</SheetDescription>
          <div className="flex flex-col h-full">
            {/* User profile section */}
            {user && (
              <div className="p-3 sm:p-4 border-b border-[#3b82f6]/10 flex items-center space-x-3">
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-[#60a5fa]/30">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] text-white text-xs sm:text-sm font-medium">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm sm:text-base text-white">{user.name}</p>
                  <p className="text-xs text-white/50 truncate max-w-[180px]">{user.email}</p>
                </div>
              </div>
            )}

            {/* Search bar */}
            <div className="p-3 sm:p-4 border-b border-[#3b82f6]/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#60a5fa]/70 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <Input 
                  type="text" 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search..." 
                  className="h-9 pl-9 pr-8 py-1.5 sm:py-2 rounded-xl text-sm text-white focus:ring-1 focus:ring-[#3b82f6] w-full bg-[#1a4482]/30 border-0 touch-manipulation"
                />
                {searchValue && (
                  <button 
                    onClick={() => setSearchValue('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#60a5fa]/70 hover:text-[#60a5fa] touch-manipulation active:opacity-80 p-1.5"
                  >
                    <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <NavItem 
                to="/" 
                icon={<Home className="h-5 w-5" />} 
                label="Home" 
                isActive={location === '/'} 
              />
              <NavItem 
                to="/frameworks" 
                icon={<BookOpen className="h-5 w-5" />} 
                label="Frameworks" 
                isActive={location === '/frameworks' || location.startsWith('/frameworks/')} 
              />
              <NavItem 
                to="/learning-path" 
                icon={<BarChart className="h-5 w-5" />} 
                label="Learning Path" 
                isActive={location.startsWith('/learning-path')} 
              />
              {/* AI Assistant removed */}
              <NavItem 
                to="/dashboard" 
                icon={<LayoutDashboard className="h-5 w-5" />} 
                label="Dashboard" 
                isActive={location === '/dashboard'} 
              />
              <NavItem 
                to="/exercises" 
                icon={<Dumbbell className="h-5 w-5" />} 
                label="Practice" 
                isActive={location.startsWith('/exercises') || location.startsWith('/exercise/')} 
              />
              <NavItem 
                to="/founder" 
                icon={<Briefcase className="h-5 w-5" />} 
                label="Founder" 
                isActive={location === '/founder'} 
              />
              <NavItem 
                to="/profile" 
                icon={<User className="h-5 w-5" />} 
                label="Profile" 
                isActive={location === '/profile'} 
              />
              <NavItem 
                to="/settings" 
                icon={<Settings className="h-5 w-5" />} 
                label="Settings" 
                isActive={location === '/settings'} 
              />
              {isAdmin && (
                <NavItem 
                  to="/scorm-admin" 
                  icon={<FileCode className="h-5 w-5" />} 
                  label="Admin Panel" 
                  isActive={location === '/scorm-admin'} 
                />
              )}
            </div>

            {/* Logout button */}
            {user && (
              <div className="p-3 sm:p-4 border-t border-[#3b82f6]/10">
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center space-x-2 justify-center p-2.5 sm:p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-[#1a4482]/50 active:opacity-80 touch-manipulation h-10 sm:h-11"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base font-medium">Sign out</span>
                </Button>
              </div>
            )}

            {!user && (
              <div className="p-3 sm:p-4 border-t border-[#3b82f6]/10">
                <Link to="/auth" onClick={() => setIsOpen(false)} className="block w-full">
                  <Button className="w-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] hover:from-[#3b82f6]/90 hover:to-[#60a5fa]/90 text-white shadow-md hover:shadow-lg transition-all rounded-xl h-10 sm:h-11 text-sm sm:text-base font-medium touch-manipulation active:opacity-90">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;