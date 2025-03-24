import React, { useState, useEffect } from 'react';
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
  Users,
  Settings, 
  LayoutDashboard, 
  LogOut,
  BookOpen,
  Lightbulb,
  BarChart,
  Dumbbell,
  Sparkles,
  X,
  Briefcase
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Navbar: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const isAdmin = user && user.username === 'admin';

  // Track scroll position to adjust navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-primary/95 backdrop-blur-md shadow-lg' 
        : 'bg-gradient-to-r from-primary via-primary to-primary/95'
      }`}
    >
      {/* Top accent bar with gradient */}
      <div className="h-1 w-full bg-gradient-to-r from-secondary via-accent to-secondary"></div>
      
      <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
            <div className="font-bold text-2xl font-header tracking-tight flex items-center relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-secondary via-accent to-secondary opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700 rounded-full"></div>
              <div className="relative">
                <span className="text-accent">Question</span>
                <span className="text-white">Pro</span>
                <span className="text-secondary ml-1 relative">
                  AI
                  <Sparkles className="absolute -top-1 -right-4 h-3 w-3 text-accent animate-pulse" />
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex space-x-6 ml-16">
            <Link to="/">
              <div className={`py-2 flex items-center space-x-1.5 group ${location.startsWith('/frameworks') || location === '/' ? 'text-accent' : 'text-white hover:text-accent'} transition-colors`}>
                <BookOpen className={`h-4 w-4 ${location.startsWith('/frameworks') || location === '/' ? 'text-accent' : 'text-white group-hover:text-accent'} transition-colors`} />
                <span className={`${location.startsWith('/frameworks') || location === '/' ? 'border-b-2 border-accent' : 'border-b-2 border-transparent group-hover:border-accent/50'} transition-all pb-0.5`}>
                  Frameworks
                </span>
              </div>
            </Link>
            <Link to="/learning-path">
              <div className={`py-2 flex items-center space-x-1.5 group ${location.startsWith('/learning-path') ? 'text-secondary' : 'text-white hover:text-secondary'} transition-colors`}>
                <BarChart className={`h-4 w-4 ${location.startsWith('/learning-path') ? 'text-secondary' : 'text-white group-hover:text-secondary'} transition-colors`} />
                <span className={`${location.startsWith('/learning-path') ? 'border-b-2 border-secondary' : 'border-b-2 border-transparent group-hover:border-secondary/50'} transition-all pb-0.5`}>
                  Learning Path
                </span>
              </div>
            </Link>
            <Link to="/ai-assistant">
              <div className={`py-2 flex items-center space-x-1.5 group ${location === '/ai-assistant' ? 'text-cyan-400' : 'text-white hover:text-cyan-400'} transition-colors`}>
                <Lightbulb className={`h-4 w-4 ${location === '/ai-assistant' ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'} transition-colors`} />
                <span className={`${location === '/ai-assistant' ? 'border-b-2 border-cyan-400' : 'border-b-2 border-transparent group-hover:border-cyan-400/50'} transition-all pb-0.5`}>
                  AI Assistant
                </span>
              </div>
            </Link>
            <Link to="/dashboard">
              <div className={`py-2 flex items-center space-x-1.5 group ${location === '/dashboard' ? 'text-purple-400' : 'text-white hover:text-purple-400'} transition-colors`}>
                <LayoutDashboard className={`h-4 w-4 ${location === '/dashboard' ? 'text-purple-400' : 'text-white group-hover:text-purple-400'} transition-colors`} />
                <span className={`${location === '/dashboard' ? 'border-b-2 border-purple-400' : 'border-b-2 border-transparent group-hover:border-purple-400/50'} transition-all pb-0.5`}>
                  Dashboard
                </span>
              </div>
            </Link>
            <Link to="/exercises">
              <div className={`py-2 flex items-center space-x-1.5 group ${location.startsWith('/exercises') || location.startsWith('/exercise/') ? 'text-emerald-400' : 'text-white hover:text-emerald-400'} transition-colors`}>
                <Dumbbell className={`h-4 w-4 ${location.startsWith('/exercises') || location.startsWith('/exercise/') ? 'text-emerald-400' : 'text-white group-hover:text-emerald-400'} transition-colors`} />
                <span className={`${location.startsWith('/exercises') || location.startsWith('/exercise/') ? 'border-b-2 border-emerald-400' : 'border-b-2 border-transparent group-hover:border-emerald-400/50'} transition-all pb-0.5`}>
                  Practice
                </span>
              </div>
            </Link>
            <Link to="/founder">
              <div className={`py-2 flex items-center space-x-1.5 group ${location === '/founder' ? 'text-amber-400' : 'text-white hover:text-amber-400'} transition-colors`}>
                <Briefcase className={`h-4 w-4 ${location === '/founder' ? 'text-amber-400' : 'text-white group-hover:text-amber-400'} transition-colors`} />
                <span className={`${location === '/founder' ? 'border-b-2 border-amber-400' : 'border-b-2 border-transparent group-hover:border-amber-400/50'} transition-all pb-0.5`}>
                  Founder
                </span>
              </div>
            </Link>
          </div>
        </div>

        {user ? (
          <div className="flex items-center space-x-2 md:space-x-6">
            <div className="relative hidden md:block">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent via-secondary to-accent rounded-full opacity-75 group-hover:opacity-100 blur-sm transition duration-200"></div>
                <div className="relative flex items-center bg-primary rounded-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    type="text" 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search frameworks..." 
                    className="pl-10 py-1.5 rounded-full text-sm text-white border-0 bg-primary/90 focus:ring-1 focus:ring-secondary/80 w-48 md:w-56"
                  />
                  {searchValue && (
                    <button 
                      onClick={() => setSearchValue('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary to-accent rounded-full opacity-0 group-hover:opacity-100 blur-sm transition duration-200"></div>
                  <div className="relative flex items-center space-x-2 py-1.5 px-2 rounded-full bg-primary-900/40 hover:bg-primary-800/60 transition-all">
                    <Avatar className="h-8 w-8 ring-2 ring-secondary/60 shadow-inner">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-white font-medium">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 py-2 rounded-xl border border-slate-100 shadow-xl bg-white/95 backdrop-blur-sm">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-primary">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="p-2">
                  <Link to="/profile">
                    <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-slate-50 flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-primary/70" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/settings">
                    <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-slate-50 flex items-center space-x-2 text-sm">
                      <Settings className="h-4 w-4 text-primary/70" />
                      <span>Account Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/dashboard">
                    <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-slate-50 flex items-center space-x-2 text-sm">
                      <LayoutDashboard className="h-4 w-4 text-primary/70" />
                      <span>My Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  {isAdmin && (
                    <Link to="/scorm-admin">
                      <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-slate-50 flex items-center space-x-2 text-sm">
                        <FileCode className="h-4 w-4 text-primary/70" />
                        <span>Admin Panel</span>
                        <Badge className="ml-2 bg-secondary/10 text-secondary hover:bg-secondary/20 px-1.5 py-0 text-[10px]">
                          Admin
                        </Badge>
                      </DropdownMenuItem>
                    </Link>
                  )}
                </div>
                <DropdownMenuSeparator className="my-1" />
                <div className="p-2">
                  <DropdownMenuItem 
                    className="py-2 px-3 rounded-lg cursor-pointer hover:bg-red-50 flex items-center space-x-2 text-sm text-red-600 hover:text-red-700" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost"
              size="icon"
              className="lg:hidden focus:outline-none bg-primary-800/40 rounded-full hover:bg-primary-800/60 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="hidden lg:block">
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white shadow-md hover:shadow-lg transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden bg-primary/95 border-t border-primary-700 py-4 px-4 backdrop-blur-md space-y-3 shadow-xl animate-in slide-in-from-top-5 duration-300">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search frameworks..." 
              className="pl-10 py-2 rounded-xl text-sm text-white pr-8 focus:ring-1 focus:ring-secondary w-full bg-primary-800/80 border-0"
            />
            {searchValue && (
              <button 
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/' ? 'bg-gradient-to-br from-accent/20 to-accent/5 text-accent' : 'text-white hover:bg-primary-800/60'} transition-colors`}>
                <BookOpen className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Frameworks</span>
              </div>
            </Link>
            <Link to="/learning-path" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/learning-path' ? 'bg-gradient-to-br from-secondary/20 to-secondary/5 text-secondary' : 'text-white hover:bg-primary-800/60'} transition-colors`}>
                <BarChart className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Learning Path</span>
              </div>
            </Link>
            <Link to="/ai-assistant" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/ai-assistant' ? 'bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 text-cyan-400' : 'text-white hover:bg-primary-800/60'} transition-colors`}>
                <Lightbulb className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
            </Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/dashboard' ? 'bg-gradient-to-br from-purple-400/20 to-purple-400/5 text-purple-400' : 'text-white hover:bg-primary-800/60'} transition-colors`}>
                <LayoutDashboard className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Dashboard</span>
              </div>
            </Link>
            <Link to="/exercises" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location.startsWith('/exercises') ? 'bg-gradient-to-br from-emerald-400/20 to-emerald-400/5 text-emerald-400' : 'text-white hover:bg-primary-800/60'} transition-colors`}>
                <Dumbbell className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Practice</span>
              </div>
            </Link>
            <Link to="/founder" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/founder' ? 'bg-gradient-to-br from-amber-400/20 to-amber-400/5 text-amber-400' : 'text-white hover:bg-primary-800/60'} transition-colors`}>
                <Briefcase className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Founder</span>
              </div>
            </Link>
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/profile' ? 'bg-gradient-to-br from-pink-400/20 to-pink-400/5 text-pink-400' : 'text-white hover:bg-primary-800/60'} transition-colors`}>
                <User className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Profile</span>
              </div>
            </Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/settings' ? 'bg-gradient-to-br from-blue-400/20 to-blue-400/5 text-blue-400' : 'text-white hover:bg-primary-800/60'} transition-colors`}>
                <Settings className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Settings</span>
              </div>
            </Link>
            {isAdmin && (
              <Link to="/scorm-admin" onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/scorm-admin' ? 'bg-gradient-to-br from-indigo-400/20 to-indigo-400/5 text-indigo-400' : 'text-white hover:bg-primary-800/60'} transition-colors`}>
                  <FileCode className="h-5 w-5 mb-1" />
                  <span className="font-medium text-sm">Admin</span>
                </div>
              </Link>
            )}
          </div>
          <div className="pt-3 border-t border-primary-700/50 flex justify-center">
            <Button 
              variant="ghost" 
              className="text-red-400 hover:text-red-300 hover:bg-primary-800"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      )}
      
      {/* Spacer for fixed navbar */}
      <div className="h-16 md:hidden"></div>
    </nav>
  );
};

export default Navbar;