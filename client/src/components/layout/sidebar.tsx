import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Menu, 
  ChevronDown, 
  FileCode, 
  User, 
  Settings, 
  LayoutDashboard, 
  LogOut,
  BookOpen,
  BarChart,
  Lightbulb,
  Dumbbell,
  Briefcase,
  X,
  ChevronRight,
  Home,
  Smartphone
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Sidebar: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const isAdmin = user && user.username === 'admin';

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const NavLink = ({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive: boolean }) => (
    <Link to={to}>
      <div className={cn(
        "flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-200",
        isActive ? "bg-[#1a4482]/50 text-[#60a5fa]" : "text-white/80 hover:bg-[#1a4482]/30 hover:text-white"
      )}>
        <div className={cn(
          "flex-shrink-0",
          isActive && "text-[#60a5fa]"
        )}>
          {icon}
        </div>
        {!isCollapsed && <span className="text-sm font-medium truncate">{label}</span>}
        {isActive && !isCollapsed && (
          <div className="ml-auto w-1.5 h-6 rounded-full bg-gradient-to-b from-[#3b82f6] to-[#60a5fa]"></div>
        )}
      </div>
    </Link>
  );

  return (
    <div className={cn(
      "h-screen sticky top-0 z-50 transition-all duration-300 bg-gradient-to-b from-[#0f2544] to-[#19355f] border-r border-[#3b82f6]/10",
      isCollapsed ? "w-[70px]" : "w-[240px]",
      isMobile && "hidden"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo and collapse button */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-[#3b82f6]/10",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <Link to="/">
              <div className="font-bold text-xl font-header tracking-tight flex items-center group">
                <div className="relative">
                  <span className="text-[#3b82f6]">Framework</span>
                  <span className="text-white">Pro</span>
                </div>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link to="/">
              <div className="font-bold text-2xl font-header">
                <span className="text-[#3b82f6]">F</span>
              </div>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 rounded-full hover:bg-[#1a4482]/50"
          >
            <ChevronRight className={cn(
              "h-4 w-4 text-[#3b82f6]",
              isCollapsed && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Profile section */}
        {user && (
          <div className={cn(
            "flex items-center p-3 border-b border-[#3b82f6]/10",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed ? (
              <div className="flex items-center justify-between w-full">
                <Link to="/profile" className="flex-1">
                  <Button variant="ghost" className="relative w-full px-2 py-1.5 h-auto flex items-center justify-between bg-transparent hover:bg-white/5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] text-white">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-white truncate">{user.name}</span>
                    </div>
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-[#1a4482]/50">
                      <ChevronDown className="h-4 w-4 text-[#3b82f6]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[220px] mt-1 py-2 rounded-xl border border-[#3b82f6]/20 shadow-xl bg-[#0f172a] backdrop-blur-sm">
                    <div className="p-2">
                      <Link to="/profile">
                        <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#1a4482]/50 flex items-center space-x-2 text-sm text-white">
                          <User className="h-4 w-4 text-[#3b82f6]" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/settings">
                        <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#1a4482]/50 flex items-center space-x-2 text-sm text-white">
                          <Settings className="h-4 w-4 text-[#3b82f6]" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                      </Link>
                      {isAdmin && (
                        <Link to="/scorm-admin">
                          <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#1a4482]/50 flex items-center space-x-2 text-sm text-white">
                            <FileCode className="h-4 w-4 text-[#3b82f6]" />
                            <span>Admin Panel</span>
                            <Badge className="ml-2 bg-[#60a5fa]/10 text-[#60a5fa] hover:bg-[#60a5fa]/20 px-1.5 py-0 text-[10px]">
                              Admin
                            </Badge>
                          </DropdownMenuItem>
                        </Link>
                      )}
                    </div>
                    <DropdownMenuSeparator className="my-1 bg-[#3b82f6]/10" />
                    <div className="p-2">
                      <DropdownMenuItem 
                        className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#1a4482]/50 flex items-center space-x-2 text-sm text-red-400 hover:text-red-300" 
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Avatar className="h-9 w-9 ring-2 ring-[#60a5fa]/30 shadow-inner">
                <AvatarImage src="" alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] text-white font-medium">
                  {user?.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        )}

        {/* Search bar */}
        <div className={cn("px-4 pt-4", isCollapsed && "hidden")}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#60a5fa]/70 h-4 w-4" />
            <Input 
              type="text" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..." 
              className="pl-10 py-2 rounded-xl text-sm text-white pr-8 focus:ring-1 focus:ring-[#3b82f6] w-full bg-[#1a4482]/30 border-0"
            />
            {searchValue && (
              <button 
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#60a5fa]/70 hover:text-[#60a5fa]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto pt-4 px-2 pb-2">
          <NavLink 
            to="/" 
            icon={<Home className="h-5 w-5" />} 
            label="Home" 
            isActive={location === '/'} 
          />
          <NavLink 
            to="/frameworks" 
            icon={<BookOpen className="h-5 w-5" />} 
            label="Frameworks" 
            isActive={location === '/frameworks' || location.startsWith('/frameworks/')} 
          />
          <NavLink 
            to="/learning-path" 
            icon={<BarChart className="h-5 w-5" />} 
            label="Learning Path" 
            isActive={location.startsWith('/learning-path')} 
          />
          {/* AI Assistant removed */}
          <NavLink 
            to="/dashboard" 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="Dashboard" 
            isActive={location === '/dashboard'} 
          />
          <NavLink 
            to="/exercises" 
            icon={<Dumbbell className="h-5 w-5" />} 
            label="Practice" 
            isActive={location.startsWith('/exercises') || location.startsWith('/exercise/')} 
          />
          <NavLink 
            to="/mobile-features" 
            icon={<Smartphone className="h-5 w-5" />} 
            label="Mobile Features" 
            isActive={location === '/mobile-features'} 
          />
          <NavLink 
            to="/founder" 
            icon={<Briefcase className="h-5 w-5" />} 
            label="Founder" 
            isActive={location === '/founder'} 
          />
        </div>

        {/* Bottom section */}
        <div className="p-4 border-t border-[#3b82f6]/10">
          {!user ? (
            <Link to="/auth">
              <Button className={cn(
                "w-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] hover:from-[#3b82f6]/90 hover:to-[#60a5fa]/90 text-white shadow-md hover:shadow-lg transition-all rounded-xl",
                isCollapsed && "aspect-square p-0"
              )}>
                {isCollapsed ? <User className="h-5 w-5" /> : "Sign In"}
              </Button>
            </Link>
          ) : isCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="w-full aspect-square rounded-xl text-red-400 hover:text-red-300 hover:bg-[#1a4482]/50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;