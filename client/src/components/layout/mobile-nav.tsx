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
      <div className={`flex items-center space-x-3 p-3 rounded-xl ${
        isActive 
          ? 'bg-gradient-to-r from-[#7d5af1]/20 to-[#ff59b2]/20 text-white' 
          : 'text-white/80 hover:bg-[#36005A]/30 hover:text-white'
      } transition-all`}>
        <div className={`${isActive ? 'text-[#ff59b2]' : ''}`}>
          {icon}
        </div>
        <span className="font-medium">{label}</span>
        {isActive && <div className="ml-auto h-full w-1 rounded-full bg-gradient-to-b from-[#7d5af1] to-[#ff59b2]"></div>}
      </div>
    </Link>
  );

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-r from-[#16001E] to-[#270033] border-b border-[#7d5af1]/20 flex items-center justify-between px-4">
      <Link to="/">
        <div className="font-bold text-xl font-header tracking-tight flex items-center group">
          <div className="relative">
            <span className="text-[#ff59b2]">Question</span>
            <span className="text-white">Pro</span>
            <span className="text-[#7d5af1]">AI</span>
          </div>
        </div>
      </Link>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-[#36005A]/50">
            <Menu className="h-5 w-5 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] border-r border-[#7d5af1]/20 bg-gradient-to-b from-[#16001E] to-[#270033]">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">App navigation links and settings</SheetDescription>
          <div className="flex flex-col h-full">
            {/* User profile section */}
            {user && (
              <div className="p-4 border-b border-[#7d5af1]/10 flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-[#ff59b2]/30">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-[#7d5af1] to-[#ff59b2] text-white font-medium">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-xs text-white/50 truncate max-w-[180px]">{user.email}</p>
                </div>
              </div>
            )}

            {/* Search bar */}
            <div className="p-4 border-b border-[#7d5af1]/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ff59b2]/70 h-4 w-4" />
                <Input 
                  type="text" 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search..." 
                  className="pl-10 py-2 rounded-xl text-sm text-white pr-8 focus:ring-1 focus:ring-[#ff59b2] w-full bg-[#36005A]/30 border-0"
                />
                {searchValue && (
                  <button 
                    onClick={() => setSearchValue('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#ff59b2]/70 hover:text-[#ff59b2]"
                  >
                    <X className="h-3.5 w-3.5" />
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
                isActive={location.startsWith('/frameworks')} 
              />
              <NavItem 
                to="/learning-path" 
                icon={<BarChart className="h-5 w-5" />} 
                label="Learning Path" 
                isActive={location.startsWith('/learning-path')} 
              />
              <NavItem 
                to="/ai-assistant" 
                icon={<Lightbulb className="h-5 w-5" />} 
                label="AI Assistant" 
                isActive={location === '/ai-assistant'} 
              />
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
              <div className="p-4 border-t border-[#7d5af1]/10">
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center space-x-2 justify-center p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-[#36005A]/50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </Button>
              </div>
            )}

            {!user && (
              <div className="p-4 border-t border-[#7d5af1]/10">
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-[#7d5af1] to-[#ff59b2] hover:from-[#7d5af1]/90 hover:to-[#ff59b2]/90 text-white shadow-md hover:shadow-lg transition-all rounded-xl">
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