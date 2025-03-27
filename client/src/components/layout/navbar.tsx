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
        ? 'shadow-lg' 
        : ''
      }`}
    >
      {/* Neon accent bar at top */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#7d5af1]/10 via-[#ff59b2] to-[#7d5af1]/10"></div>
      
      <div className="container mx-auto px-4 md:px-6 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
            <div className="font-bold text-2xl font-header tracking-tight flex items-center relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#7d5af1] via-[#ff59b2] to-[#7d5af1] opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700 rounded-full"></div>
              <div className="relative">
                <span className="text-[#ff59b2]">Framework</span>
                <span className="text-white">Pro</span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex space-x-5 ml-12">
            <Link to="/">
              <div className={`py-1 flex items-center space-x-1 group nav-link ${location.startsWith('/frameworks') || location === '/' ? 'active' : ''}`}>
                <BookOpen className="h-3.5 w-3.5" />
                <span className="text-sm pb-0.5">
                  Frameworks
                </span>
              </div>
            </Link>
            <Link to="/learning-path">
              <div className={`py-1 flex items-center space-x-1 group nav-link ${location.startsWith('/learning-path') ? 'active' : ''}`}>
                <BarChart className="h-3.5 w-3.5" />
                <span className="text-sm pb-0.5">
                  Learning
                </span>
              </div>
            </Link>
            <Link to="/ai-assistant">
              <div className={`py-1 flex items-center space-x-1 group nav-link ${location === '/ai-assistant' ? 'active' : ''}`}>
                <Lightbulb className="h-3.5 w-3.5" />
                <span className="text-sm pb-0.5">
                  AI Assistant
                </span>
              </div>
            </Link>
            <Link to="/dashboard">
              <div className={`py-1 flex items-center space-x-1 group nav-link ${location === '/dashboard' ? 'active' : ''}`}>
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="text-sm pb-0.5">
                  Dashboard
                </span>
              </div>
            </Link>
            <Link to="/exercises">
              <div className={`py-1 flex items-center space-x-1 group nav-link ${location.startsWith('/exercises') || location.startsWith('/exercise/') ? 'active' : ''}`}>
                <Dumbbell className="h-3.5 w-3.5" />
                <span className="text-sm pb-0.5">
                  Practice
                </span>
              </div>
            </Link>
            <Link to="/founder">
              <div className={`py-1 flex items-center space-x-1 group nav-link ${location === '/founder' ? 'active' : ''}`}>
                <Briefcase className="h-3.5 w-3.5" />
                <span className="text-sm pb-0.5">
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
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#7d5af1] via-[#ff59b2] to-[#7d5af1] rounded-full opacity-75 group-hover:opacity-100 blur-sm transition duration-200"></div>
                <div className="relative flex items-center bg-[#270033]/80 rounded-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ff59b2]/70 h-4 w-4" />
                  <Input 
                    type="text" 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search frameworks..." 
                    className="pl-10 py-1.5 rounded-full text-sm text-white border-0 bg-transparent focus:ring-1 focus:ring-[#ff59b2]/80 w-48 md:w-56"
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
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#7d5af1] to-[#ff59b2] rounded-full opacity-0 group-hover:opacity-100 blur-sm transition duration-200"></div>
                  <div className="relative flex items-center space-x-2 py-1.5 px-2 rounded-full bg-[#270033]/50 hover:bg-[#270033]/70 transition-all">
                    <Avatar className="h-8 w-8 ring-2 ring-[#ff59b2]/60 shadow-inner">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-[#7d5af1] to-[#ff59b2] text-white font-medium">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 py-2 rounded-xl border border-[#7d5af1]/20 shadow-xl bg-white/95 backdrop-blur-sm">
                <div className="px-4 py-2 border-b border-[#ff59b2]/10">
                  <p className="text-sm font-medium text-[#7d5af1]">{user.name}</p>
                  <p className="text-xs text-[#36005A]/60 truncate">{user.email}</p>
                </div>
                <div className="p-2">
                  <Link to="/profile">
                    <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#7d5af1]/5 flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-[#7d5af1]/70" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/settings">
                    <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#7d5af1]/5 flex items-center space-x-2 text-sm">
                      <Settings className="h-4 w-4 text-[#7d5af1]/70" />
                      <span>Account Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/dashboard">
                    <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#7d5af1]/5 flex items-center space-x-2 text-sm">
                      <LayoutDashboard className="h-4 w-4 text-[#7d5af1]/70" />
                      <span>My Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  {isAdmin && (
                    <Link to="/scorm-admin">
                      <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#7d5af1]/5 flex items-center space-x-2 text-sm">
                        <FileCode className="h-4 w-4 text-[#7d5af1]/70" />
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
                    className="py-2 px-3 rounded-lg cursor-pointer hover:bg-red-50 flex items-center space-x-2 text-sm text-red-500 hover:text-red-600" 
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
              className="lg:hidden focus:outline-none bg-[#270033]/50 rounded-full hover:bg-[#270033]/70 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="hidden lg:block">
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-[#7d5af1] to-[#ff59b2] hover:from-[#7d5af1]/90 hover:to-[#ff59b2]/90 text-white shadow-md hover:shadow-lg transition-all rounded-xl">
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden bg-gradient-to-b from-[#16001E] to-[#270033] border-t border-[#7d5af1]/20 py-4 px-4 backdrop-blur-md space-y-3 shadow-xl animate-in slide-in-from-top-5 duration-300">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ff59b2]/70 h-4 w-4" />
            <Input 
              type="text" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search frameworks..." 
              className="pl-10 py-2 rounded-xl text-sm text-white pr-8 focus:ring-1 focus:ring-[#ff59b2] w-full bg-[#36005A]/50 border-0"
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
          
          <div className="grid grid-cols-2 gap-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/' ? 'bg-gradient-to-br from-[#7d5af1]/20 to-[#7d5af1]/5 text-[#7d5af1]' : 'text-white hover:bg-[#36005A]/50'} transition-colors`}>
                <BookOpen className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Frameworks</span>
              </div>
            </Link>
            <Link to="/learning-path" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/learning-path' ? 'bg-gradient-to-br from-[#ff59b2]/20 to-[#ff59b2]/5 text-[#ff59b2]' : 'text-white hover:bg-[#36005A]/50'} transition-colors`}>
                <BarChart className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Learning Path</span>
              </div>
            </Link>
            <Link to="/ai-assistant" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/ai-assistant' ? 'bg-gradient-to-br from-[#7d5af1]/20 to-[#7d5af1]/5 text-[#7d5af1]' : 'text-white hover:bg-[#36005A]/50'} transition-colors`}>
                <Lightbulb className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
            </Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/dashboard' ? 'bg-gradient-to-br from-[#ff59b2]/20 to-[#ff59b2]/5 text-[#ff59b2]' : 'text-white hover:bg-[#36005A]/50'} transition-colors`}>
                <LayoutDashboard className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Dashboard</span>
              </div>
            </Link>
            <Link to="/exercises" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location.startsWith('/exercises') ? 'bg-gradient-to-br from-[#7d5af1]/20 to-[#7d5af1]/5 text-[#7d5af1]' : 'text-white hover:bg-[#36005A]/50'} transition-colors`}>
                <Dumbbell className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Practice</span>
              </div>
            </Link>
            <Link to="/founder" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/founder' ? 'bg-gradient-to-br from-[#ff59b2]/20 to-[#ff59b2]/5 text-[#ff59b2]' : 'text-white hover:bg-[#36005A]/50'} transition-colors`}>
                <Briefcase className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Founder</span>
              </div>
            </Link>
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/profile' ? 'bg-gradient-to-br from-[#7d5af1]/20 to-[#7d5af1]/5 text-[#7d5af1]' : 'text-white hover:bg-[#36005A]/50'} transition-colors`}>
                <User className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Profile</span>
              </div>
            </Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/settings' ? 'bg-gradient-to-br from-[#ff59b2]/20 to-[#ff59b2]/5 text-[#ff59b2]' : 'text-white hover:bg-[#36005A]/50'} transition-colors`}>
                <Settings className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Settings</span>
              </div>
            </Link>
            {isAdmin && (
              <Link to="/scorm-admin" onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/scorm-admin' ? 'bg-gradient-to-br from-[#7d5af1]/20 to-[#7d5af1]/5 text-[#7d5af1]' : 'text-white hover:bg-[#36005A]/50'} transition-colors`}>
                  <FileCode className="h-5 w-5 mb-1" />
                  <span className="font-medium text-sm">Admin</span>
                </div>
              </Link>
            )}
          </div>
          <div className="pt-3 border-t border-[#7d5af1]/20 flex justify-center">
            <Button 
              variant="ghost" 
              className="text-red-400 hover:text-red-300 hover:bg-[#36005A]/70"
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