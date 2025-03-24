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
        ? 'bg-[#0A2540]/95 backdrop-blur-md shadow-lg' 
        : 'bg-gradient-to-r from-[#0A2540] via-[#0A2540] to-[#0E3A5C]'
      }`}
    >
      {/* Top accent bar with blue gradient */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0078D7] via-[#00A5E0] to-[#C5F2FF]"></div>
      
      <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
            <div className="font-bold text-2xl font-header tracking-tight flex items-center relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#0078D7] via-[#00A5E0] to-[#C5F2FF] opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700 rounded-full"></div>
              <div className="relative">
                <span className="text-[#C5F2FF]">Question</span>
                <span className="text-white">Pro</span>
                <span className="text-[#00A5E0] ml-1 relative">
                  AI
                  <Sparkles className="absolute -top-1 -right-4 h-3 w-3 text-[#C5F2FF] animate-pulse" />
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex space-x-6 ml-16">
            <Link to="/">
              <div className={`py-2 flex items-center space-x-1.5 group ${location.startsWith('/frameworks') || location === '/' ? 'text-[#00A5E0]' : 'text-white hover:text-[#00A5E0]'} transition-colors`}>
                <BookOpen className={`h-4 w-4 ${location.startsWith('/frameworks') || location === '/' ? 'text-[#00A5E0]' : 'text-white group-hover:text-[#00A5E0]'} transition-colors`} />
                <span className={`${location.startsWith('/frameworks') || location === '/' ? 'border-b-2 border-[#00A5E0]' : 'border-b-2 border-transparent group-hover:border-[#00A5E0]/50'} transition-all pb-0.5`}>
                  Frameworks
                </span>
              </div>
            </Link>
            <Link to="/learning-path">
              <div className={`py-2 flex items-center space-x-1.5 group ${location.startsWith('/learning-path') ? 'text-[#C5F2FF]' : 'text-white hover:text-[#C5F2FF]'} transition-colors`}>
                <BarChart className={`h-4 w-4 ${location.startsWith('/learning-path') ? 'text-[#C5F2FF]' : 'text-white group-hover:text-[#C5F2FF]'} transition-colors`} />
                <span className={`${location.startsWith('/learning-path') ? 'border-b-2 border-[#C5F2FF]' : 'border-b-2 border-transparent group-hover:border-[#C5F2FF]/50'} transition-all pb-0.5`}>
                  Learning Path
                </span>
              </div>
            </Link>
            <Link to="/ai-assistant">
              <div className={`py-2 flex items-center space-x-1.5 group ${location === '/ai-assistant' ? 'text-[#0078D7]' : 'text-white hover:text-[#0078D7]'} transition-colors`}>
                <Lightbulb className={`h-4 w-4 ${location === '/ai-assistant' ? 'text-[#0078D7]' : 'text-white group-hover:text-[#0078D7]'} transition-colors`} />
                <span className={`${location === '/ai-assistant' ? 'border-b-2 border-[#0078D7]' : 'border-b-2 border-transparent group-hover:border-[#0078D7]/50'} transition-all pb-0.5`}>
                  AI Assistant
                </span>
              </div>
            </Link>
            <Link to="/dashboard">
              <div className={`py-2 flex items-center space-x-1.5 group ${location === '/dashboard' ? 'text-[#89CFF0]' : 'text-white hover:text-[#89CFF0]'} transition-colors`}>
                <LayoutDashboard className={`h-4 w-4 ${location === '/dashboard' ? 'text-[#89CFF0]' : 'text-white group-hover:text-[#89CFF0]'} transition-colors`} />
                <span className={`${location === '/dashboard' ? 'border-b-2 border-[#89CFF0]' : 'border-b-2 border-transparent group-hover:border-[#89CFF0]/50'} transition-all pb-0.5`}>
                  Dashboard
                </span>
              </div>
            </Link>
            <Link to="/exercises">
              <div className={`py-2 flex items-center space-x-1.5 group ${location.startsWith('/exercises') || location.startsWith('/exercise/') ? 'text-[#B3E0FF]' : 'text-white hover:text-[#B3E0FF]'} transition-colors`}>
                <Dumbbell className={`h-4 w-4 ${location.startsWith('/exercises') || location.startsWith('/exercise/') ? 'text-[#B3E0FF]' : 'text-white group-hover:text-[#B3E0FF]'} transition-colors`} />
                <span className={`${location.startsWith('/exercises') || location.startsWith('/exercise/') ? 'border-b-2 border-[#B3E0FF]' : 'border-b-2 border-transparent group-hover:border-[#B3E0FF]/50'} transition-all pb-0.5`}>
                  Practice
                </span>
              </div>
            </Link>
            <Link to="/founder">
              <div className={`py-2 flex items-center space-x-1.5 group ${location === '/founder' ? 'text-[#7CB9E8]' : 'text-white hover:text-[#7CB9E8]'} transition-colors`}>
                <Briefcase className={`h-4 w-4 ${location === '/founder' ? 'text-[#7CB9E8]' : 'text-white group-hover:text-[#7CB9E8]'} transition-colors`} />
                <span className={`${location === '/founder' ? 'border-b-2 border-[#7CB9E8]' : 'border-b-2 border-transparent group-hover:border-[#7CB9E8]/50'} transition-all pb-0.5`}>
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
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0078D7] via-[#00A5E0] to-[#C5F2FF] rounded-full opacity-75 group-hover:opacity-100 blur-sm transition duration-200"></div>
                <div className="relative flex items-center bg-[#0A2540] rounded-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    type="text" 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search frameworks..." 
                    className="pl-10 py-1.5 rounded-full text-sm text-white border-0 bg-[#0A2540]/90 focus:ring-1 focus:ring-[#00A5E0]/80 w-48 md:w-56"
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
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0078D7] to-[#00A5E0] rounded-full opacity-0 group-hover:opacity-100 blur-sm transition duration-200"></div>
                  <div className="relative flex items-center space-x-2 py-1.5 px-2 rounded-full bg-[#0E3A5C]/40 hover:bg-[#0E3A5C]/60 transition-all">
                    <Avatar className="h-8 w-8 ring-2 ring-[#00A5E0]/60 shadow-inner">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-[#0078D7] to-[#00A5E0] text-white font-medium">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 py-2 rounded-xl border border-[#E1F5FE] shadow-xl bg-white/95 backdrop-blur-sm">
                <div className="px-4 py-2 border-b border-[#E1F5FE]">
                  <p className="text-sm font-medium text-[#0078D7]">{user.name}</p>
                  <p className="text-xs text-[#0A2540]/70 truncate">{user.email}</p>
                </div>
                <div className="p-2">
                  <Link to="/profile">
                    <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#F0F9FF] flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-[#0078D7]/70" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/settings">
                    <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#F0F9FF] flex items-center space-x-2 text-sm">
                      <Settings className="h-4 w-4 text-[#0078D7]/70" />
                      <span>Account Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/dashboard">
                    <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#F0F9FF] flex items-center space-x-2 text-sm">
                      <LayoutDashboard className="h-4 w-4 text-[#0078D7]/70" />
                      <span>My Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  {isAdmin && (
                    <Link to="/scorm-admin">
                      <DropdownMenuItem className="py-2 px-3 rounded-lg cursor-pointer hover:bg-[#F0F9FF] flex items-center space-x-2 text-sm">
                        <FileCode className="h-4 w-4 text-[#0078D7]/70" />
                        <span>Admin Panel</span>
                        <Badge className="ml-2 bg-[#0078D7]/10 text-[#0078D7] hover:bg-[#0078D7]/20 px-1.5 py-0 text-[10px]">
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
              className="lg:hidden focus:outline-none bg-[#0E3A5C]/40 rounded-full hover:bg-[#0E3A5C]/60 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="hidden lg:block">
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-[#0078D7] to-[#00A5E0] hover:from-[#0078D7]/90 hover:to-[#00A5E0]/90 text-white shadow-md hover:shadow-lg transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden bg-[#0A2540]/95 border-t border-[#0E3A5C] py-4 px-4 backdrop-blur-md space-y-3 shadow-xl animate-in slide-in-from-top-5 duration-300">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search frameworks..." 
              className="pl-10 py-2 rounded-xl text-sm text-white pr-8 focus:ring-1 focus:ring-[#00A5E0] w-full bg-[#0E3A5C]/80 border-0"
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
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/' ? 'bg-gradient-to-br from-[#00A5E0]/20 to-[#00A5E0]/5 text-[#00A5E0]' : 'text-white hover:bg-[#0A2540]/60'} transition-colors`}>
                <BookOpen className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Frameworks</span>
              </div>
            </Link>
            <Link to="/learning-path" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/learning-path' ? 'bg-gradient-to-br from-[#C5F2FF]/20 to-[#C5F2FF]/5 text-[#C5F2FF]' : 'text-white hover:bg-[#0A2540]/60'} transition-colors`}>
                <BarChart className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Learning Path</span>
              </div>
            </Link>
            <Link to="/ai-assistant" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/ai-assistant' ? 'bg-gradient-to-br from-[#0078D7]/20 to-[#0078D7]/5 text-[#0078D7]' : 'text-white hover:bg-[#0A2540]/60'} transition-colors`}>
                <Lightbulb className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
            </Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/dashboard' ? 'bg-gradient-to-br from-[#89CFF0]/20 to-[#89CFF0]/5 text-[#89CFF0]' : 'text-white hover:bg-[#0A2540]/60'} transition-colors`}>
                <LayoutDashboard className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Dashboard</span>
              </div>
            </Link>
            <Link to="/exercises" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location.startsWith('/exercises') ? 'bg-gradient-to-br from-[#B3E0FF]/20 to-[#B3E0FF]/5 text-[#B3E0FF]' : 'text-white hover:bg-[#0A2540]/60'} transition-colors`}>
                <Dumbbell className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Practice</span>
              </div>
            </Link>
            <Link to="/founder" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/founder' ? 'bg-gradient-to-br from-[#7CB9E8]/20 to-[#7CB9E8]/5 text-[#7CB9E8]' : 'text-white hover:bg-[#0A2540]/60'} transition-colors`}>
                <Briefcase className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Founder</span>
              </div>
            </Link>
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/profile' ? 'bg-gradient-to-br from-[#B6D0E2]/20 to-[#B6D0E2]/5 text-[#B6D0E2]' : 'text-white hover:bg-[#0A2540]/60'} transition-colors`}>
                <User className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Profile</span>
              </div>
            </Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/settings' ? 'bg-gradient-to-br from-[#84C0ED]/20 to-[#84C0ED]/5 text-[#84C0ED]' : 'text-white hover:bg-[#0A2540]/60'} transition-colors`}>
                <Settings className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">Settings</span>
              </div>
            </Link>
            {isAdmin && (
              <Link to="/scorm-admin" onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${location === '/scorm-admin' ? 'bg-gradient-to-br from-[#81D4FA]/20 to-[#81D4FA]/5 text-[#81D4FA]' : 'text-white hover:bg-[#0A2540]/60'} transition-colors`}>
                  <FileCode className="h-5 w-5 mb-1" />
                  <span className="font-medium text-sm">Admin</span>
                </div>
              </Link>
            )}
          </div>
          <div className="pt-3 border-t border-[#0E3A5C]/50 flex justify-center">
            <Button 
              variant="ghost" 
              className="text-red-400 hover:text-red-300 hover:bg-[#0E3A5C]"
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