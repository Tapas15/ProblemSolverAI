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
  Users,
  Settings, 
  LayoutDashboard, 
  LogOut,
  BookOpen,
  Lightbulb,
  BarChart,
  Dumbbell
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const Navbar: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user && user.username === 'admin';
  const isFrameworkPage = location.startsWith('/'); // Adjust this condition as needed
  const isLearningPathPage = location.startsWith('/learning-path'); // Adjust this condition as needed

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-primary text-white shadow-lg backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
            <div className="font-bold text-2xl font-header tracking-tight flex items-center">
              <span className="text-accent">Question</span>
              <span className="text-white">Pro</span>
              <span className="text-secondary ml-1">AI</span>
            </div>
          </Link>

          <div className="hidden md:flex space-x-8 ml-16">
            <Link to="/">
              <div className={`py-2 flex items-center space-x-1.5 group ${location.startsWith('/frameworks') || location === '/' ? 'text-secondary' : 'text-white hover:text-secondary'} transition-colors`}>
                <BookOpen className={`h-4 w-4 ${location.startsWith('/frameworks') || location === '/' ? 'text-secondary' : 'text-white group-hover:text-secondary'} transition-colors`} />
                <span className={`${location.startsWith('/frameworks') || location === '/' ? 'border-b-2 border-secondary' : 'border-b-2 border-transparent group-hover:border-secondary/50'} transition-all pb-0.5`}>
                  Business Problem Solving
                </span>
              </div>
            </Link>
            <Link to="/learning-path">
              <div className={`py-2 flex items-center space-x-1.5 group ${location.startsWith('/learning-path') ? 'text-secondary' : 'text-white hover:text-secondary'} transition-colors`}>
                <BarChart className={`h-4 w-4 ${location.startsWith('/learning-path') ? 'text-secondary' : 'text-white group-hover:text-secondary'} transition-colors`} />
                <span className={`${location.startsWith('/learning-path') ? 'border-b-2 border-secondary' : 'border-b-2 border-transparent group-hover:border-secondary/50'} transition-all pb-0.5`}>
                  Your Learning Journey
                </span>
              </div>
            </Link>
            <Link to="/ai-assistant">
              <div className={`py-2 flex items-center space-x-1.5 group ${location === '/ai-assistant' ? 'text-secondary' : 'text-white hover:text-secondary'} transition-colors`}>
                <Lightbulb className={`h-4 w-4 ${location === '/ai-assistant' ? 'text-secondary' : 'text-white group-hover:text-secondary'} transition-colors`} />
                <span className={`${location === '/ai-assistant' ? 'border-b-2 border-secondary' : 'border-b-2 border-transparent group-hover:border-secondary/50'} transition-all pb-0.5`}>
                  AI Assistant
                </span>
              </div>
            </Link>
            <Link to="/dashboard">
              <div className={`py-2 flex items-center space-x-1.5 group ${location === '/dashboard' ? 'text-secondary' : 'text-white hover:text-secondary'} transition-colors`}>
                <LayoutDashboard className={`h-4 w-4 ${location === '/dashboard' ? 'text-secondary' : 'text-white group-hover:text-secondary'} transition-colors`} />
                <span className={`${location === '/dashboard' ? 'border-b-2 border-secondary' : 'border-b-2 border-transparent group-hover:border-secondary/50'} transition-all pb-0.5`}>
                  Dashboard
                </span>
              </div>
            </Link>
            <Link to="/exercises">
              <div className={`py-2 flex items-center space-x-1.5 group ${location.startsWith('/exercises') || location.startsWith('/exercise/') ? 'text-secondary' : 'text-white hover:text-secondary'} transition-colors`}>
                <Dumbbell className={`h-4 w-4 ${location.startsWith('/exercises') || location.startsWith('/exercise/') ? 'text-secondary' : 'text-white group-hover:text-secondary'} transition-colors`} />
                <span className={`${location.startsWith('/exercises') || location.startsWith('/exercise/') ? 'border-b-2 border-secondary' : 'border-b-2 border-transparent group-hover:border-secondary/50'} transition-all pb-0.5`}>
                  Practice Exercises
                </span>
              </div>
            </Link>
            <Link to="/founder">
              <div className={`py-2 flex items-center space-x-1.5 group ${location === '/founder' ? 'text-secondary' : 'text-white hover:text-secondary'} transition-colors`}>
                <Users className={`h-4 w-4 ${location === '/founder' ? 'text-secondary' : 'text-white group-hover:text-secondary'} transition-colors`} />
                <span className={`${location === '/founder' ? 'border-b-2 border-secondary' : 'border-b-2 border-transparent group-hover:border-secondary/50'} transition-all pb-0.5`}>
                  Our Founder
                </span>
              </div>
            </Link>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search frameworks..." 
                className="pl-10 py-1.5 rounded-full text-sm text-gray-700 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary w-48 md:w-56 border-2 bg-white/95"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                <div className="flex items-center bg-primary-800/40 py-1.5 px-2 rounded-full hover:bg-primary-800/60 transition-colors">
                  <Avatar className="h-8 w-8 border-2 border-secondary/60">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback className="bg-secondary text-white font-medium">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm ml-2 font-medium">{user.name}</span>
                  <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 py-2">
                <Link to="/profile">
                  <DropdownMenuItem className="py-2 px-4 hover:bg-gray-50">
                    <User className="mr-2 h-4 w-4 text-primary/70" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link to="/settings">
                  <DropdownMenuItem className="py-2 px-4 hover:bg-gray-50">
                    <Settings className="mr-2 h-4 w-4 text-primary/70" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                </Link>
                <Link to="/dashboard">
                  <DropdownMenuItem className="py-2 px-4 hover:bg-gray-50">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-primary/70" />
                    <span>My Dashboard</span>
                  </DropdownMenuItem>
                </Link>
                {isAdmin && (
                  <Link to="/scorm-admin">
                    <DropdownMenuItem className="py-2 px-4 hover:bg-gray-50">
                      <FileCode className="mr-2 h-4 w-4 text-primary/70" />
                      <span>SCORM Admin</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem 
                  className="py-2 px-4 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button 
              className="md:hidden focus:outline-none bg-primary-800/40 p-2 rounded-full hover:bg-primary-800/60 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden bg-primary/95 border-t border-primary-700 py-4 px-6 backdrop-blur-sm space-y-4 shadow-lg">
          <div className="space-y-4">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex items-center space-x-3 py-2 px-3 rounded-lg ${location === '/' ? 'bg-primary-800 text-secondary' : 'text-white hover:bg-primary-800/60'}`}>
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Frameworks</span>
              </div>
            </Link>
            <Link to="/learning-path" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex items-center space-x-3 py-2 px-3 rounded-lg ${location === '/learning-path' ? 'bg-primary-800 text-secondary' : 'text-white hover:bg-primary-800/60'}`}>
                <BarChart className="h-5 w-5" />
                <span className="font-medium">Learning Path</span>
              </div>
            </Link>
            <Link to="/ai-assistant" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex items-center space-x-3 py-2 px-3 rounded-lg ${location === '/ai-assistant' ? 'bg-primary-800 text-secondary' : 'text-white hover:bg-primary-800/60'}`}>
                <Lightbulb className="h-5 w-5" />
                <span className="font-medium">AI Assistant</span>
              </div>
            </Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex items-center space-x-3 py-2 px-3 rounded-lg ${location === '/dashboard' ? 'bg-primary-800 text-secondary' : 'text-white hover:bg-primary-800/60'}`}>
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </div>
            </Link>
            <Link to="/exercises" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex items-center space-x-3 py-2 px-3 rounded-lg ${location.startsWith('/exercises') || location.startsWith('/exercise/') ? 'bg-primary-800 text-secondary' : 'text-white hover:bg-primary-800/60'}`}>
                <Dumbbell className="h-5 w-5" />
                <span className="font-medium">Practice Exercises</span>
              </div>
            </Link>
            <Link to="/founder" onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex items-center space-x-3 py-2 px-3 rounded-lg ${location === '/founder' ? 'bg-primary-800 text-secondary' : 'text-white hover:bg-primary-800/60'}`}>
                <Users className="h-5 w-5" />
                <span className="font-medium">Our Founder</span>
              </div>
            </Link>
            {isAdmin && (
              <Link to="/scorm-admin" onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center space-x-3 py-2 px-3 rounded-lg ${location === '/scorm-admin' ? 'bg-primary-800 text-secondary' : 'text-white hover:bg-primary-800/60'}`}>
                  <FileCode className="h-5 w-5" />
                  <span className="font-medium">SCORM Admin</span>
                </div>
              </Link>
            )}
            <div className="pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="text" 
                  placeholder="Search frameworks..." 
                  className="pl-10 py-2 rounded-xl text-sm text-gray-700 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary w-full bg-white/95 border-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;