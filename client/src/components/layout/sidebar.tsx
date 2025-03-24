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
  Home
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
        isActive ? "bg-[#36005A]/50 text-[#ff59b2]" : "text-white/80 hover:bg-[#36005A]/30 hover:text-white"
      )}>
        <div className={cn(
          "flex-shrink-0",
          isActive && "text-[#ff59b2]"
        )}>
          {icon}
        </div>
        {!isCollapsed && <span className="text-sm font-medium truncate">{label}</span>}
        {isActive && !isCollapsed && (
          <div className="ml-auto w-1.5 h-6 rounded-full bg-gradient-to-b from-[#7d5af1] to-[#ff59b2]"></div>
        )}
      </div>
    </Link>
  );

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 transition-all duration-300 bg-gradient-to-b from-[#16001E] to-[#270033] border-r border-[#7d5af1]/10",
      isCollapsed ? "w-[70px]" : "w-[240px]",
      isMobile && "hidden"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo and collapse button */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-[#7d5af1]/10",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <Link to="/">
              <div className="font-bold text-xl font-header tracking-tight flex items-center group">
                <div className="relative">
                  <span className="text-[#ff59b2]">Q</span>
                  <span className="text-white">Pro</span>
                  <span className="text-[#7d5af1]">AI</span>
                </div>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link to="/">
              <div className="font-bold text-2xl font-header">
                <span className="text-[#ff59b2]">Q</span>
              </div>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 rounded-full hover:bg-[#36005A]/50"
          >
            <ChevronRight className={cn(
              "h-4 w-4 text-[#7d5af1]",
              isCollapsed && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Profile section */}
        {user && (
          <div className={cn(
            "flex items-center p-4 border-b border-[#7d5af1]/10",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative w-full p-0 h-auto flex items-center justify-between bg-transparent">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9 ring-2 ring-[#ff59b2]/30 shadow-inner">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-[#7d5af1] to-[#ff59b2] text-white font-medium">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-medium text-white truncate max-w-[120px]">{user.name}</p>
                        <p className="text-xs text-white/50 truncate max-w-[120px]">{user.email}</p>
                      </div>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 text-white/50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px] mt-1 py-2 rounded-xl border border-[#7d5af1]/20 shadow-xl bg-[#16001E] backdrop-blur-sm">
                  <div className="p-2">
                    <Link to="/profile">
                      <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#36005A]/50 flex items-center space-x-2 text-sm text-white">
                        <User className="h-4 w-4 text-[#7d5af1]" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/settings">
                      <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#36005A]/50 flex items-center space-x-2 text-sm text-white">
                        <Settings className="h-4 w-4 text-[#7d5af1]" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </Link>
                    {isAdmin && (
                      <Link to="/scorm-admin">
                        <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#36005A]/50 flex items-center space-x-2 text-sm text-white">
                          <FileCode className="h-4 w-4 text-[#7d5af1]" />
                          <span>Admin Panel</span>
                          <Badge className="ml-2 bg-[#ff59b2]/10 text-[#ff59b2] hover:bg-[#ff59b2]/20 px-1.5 py-0 text-[10px]">
                            Admin
                          </Badge>
                        </DropdownMenuItem>
                      </Link>
                    )}
                  </div>
                  <DropdownMenuSeparator className="my-1 bg-[#7d5af1]/10" />
                  <div className="p-2">
                    <DropdownMenuItem 
                      className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#36005A]/50 flex items-center space-x-2 text-sm text-red-400 hover:text-red-300" 
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Avatar className="h-9 w-9 ring-2 ring-[#ff59b2]/30 shadow-inner">
                <AvatarImage src="" alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#7d5af1] to-[#ff59b2] text-white font-medium">
                  {user?.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        )}

        {/* Search bar */}
        <div className={cn("px-4 pt-4", isCollapsed && "hidden")}>
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
            isActive={location.startsWith('/frameworks')} 
          />
          <NavLink 
            to="/learning-path" 
            icon={<BarChart className="h-5 w-5" />} 
            label="Learning Path" 
            isActive={location.startsWith('/learning-path')} 
          />
          <NavLink 
            to="/ai-assistant" 
            icon={<Lightbulb className="h-5 w-5" />} 
            label="AI Assistant" 
            isActive={location === '/ai-assistant'} 
          />
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
            to="/founder" 
            icon={<Briefcase className="h-5 w-5" />} 
            label="Founder" 
            isActive={location === '/founder'} 
          />
        </div>

        {/* Bottom section */}
        <div className="p-4 border-t border-[#7d5af1]/10">
          {!user ? (
            <Link to="/auth">
              <Button className={cn(
                "w-full bg-gradient-to-r from-[#7d5af1] to-[#ff59b2] hover:from-[#7d5af1]/90 hover:to-[#ff59b2]/90 text-white shadow-md hover:shadow-lg transition-all rounded-xl",
                isCollapsed && "aspect-square p-0"
              )}>
                {isCollapsed ? <User className="h-5 w-5" /> : "Sign In"}
              </Button>
            </Link>
          ) : isCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="w-full aspect-square rounded-xl text-red-400 hover:text-red-300 hover:bg-[#36005A]/50"
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