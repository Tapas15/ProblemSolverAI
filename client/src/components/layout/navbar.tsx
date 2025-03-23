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
import { Search, Menu, ChevronDown, FileCode } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Navbar: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isAdmin = user && user.username === 'admin';
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <div className="font-bold text-xl font-header tracking-tight">
              <span className="text-accent">Question</span>
              <span className="text-white">Pro</span>{' '}
              <span className="text-secondary">AI</span>
            </div>
          </Link>
          
          <div className="hidden md:flex space-x-6 ml-10">
            <Link to="/">
              <span className={`py-2 px-1 ${location === '/' ? 'border-b-2 border-secondary' : 'hover:border-b-2 hover:border-secondary transition-all'}`}>
                Frameworks
              </span>
            </Link>
            <Link to="/learning-path">
              <span className={`py-2 px-1 ${location === '/learning-path' ? 'border-b-2 border-secondary' : 'hover:border-b-2 hover:border-secondary transition-all'}`}>
                Learning Path
              </span>
            </Link>
            <Link to="/ai-assistant">
              <span className={`py-2 px-1 ${location === '/ai-assistant' ? 'border-b-2 border-secondary' : 'hover:border-b-2 hover:border-secondary transition-all'}`}>
                AI Assistant
              </span>
            </Link>
            <Link to="/dashboard">
              <span className={`py-2 px-1 ${location === '/dashboard' ? 'border-b-2 border-secondary' : 'hover:border-b-2 hover:border-secondary transition-all'}`}>
                Dashboard
              </span>
            </Link>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search frameworks..." 
                className="pl-10 py-1 rounded-full text-sm text-gray-600 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary w-40 md:w-auto"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                <Avatar className="h-8 w-8 border-2 border-accent">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="bg-secondary text-white">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <Link to="/profile">
                  <DropdownMenuItem>
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link to="/settings">
                  <DropdownMenuItem>
                    Account Settings
                  </DropdownMenuItem>
                </Link>
                <Link to="/dashboard">
                  <DropdownMenuItem>
                    My Dashboard
                  </DropdownMenuItem>
                </Link>
                {isAdmin && (
                  <Link to="/scorm-admin">
                    <DropdownMenuItem className="flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      SCORM Admin
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <button 
              className="md:hidden focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu />
            </button>
          </div>
        )}
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden bg-primary border-t border-primary-700 py-3 px-4">
          <div className="space-y-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <span className={`block py-2 px-1 ${location === '/' ? 'text-secondary' : 'text-white'}`}>
                Frameworks
              </span>
            </Link>
            <Link to="/learning-path" onClick={() => setMobileMenuOpen(false)}>
              <span className={`block py-2 px-1 ${location === '/learning-path' ? 'text-secondary' : 'text-white'}`}>
                Learning Path
              </span>
            </Link>
            <Link to="/ai-assistant" onClick={() => setMobileMenuOpen(false)}>
              <span className={`block py-2 px-1 ${location === '/ai-assistant' ? 'text-secondary' : 'text-white'}`}>
                AI Assistant
              </span>
            </Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <span className={`block py-2 px-1 ${location === '/dashboard' ? 'text-secondary' : 'text-white'}`}>
                Dashboard
              </span>
            </Link>
            {isAdmin && (
              <Link to="/scorm-admin" onClick={() => setMobileMenuOpen(false)}>
                <span className={`block py-2 px-1 flex items-center gap-2 ${location === '/scorm-admin' ? 'text-secondary' : 'text-white'}`}>
                  <FileCode className="h-4 w-4" />
                  SCORM Admin
                </span>
              </Link>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search frameworks..." 
                className="pl-10 py-1 rounded-full text-sm text-gray-600 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary w-full"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
