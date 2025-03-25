import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Search, 
  Filter,
  ChevronDown,
  GraduationCap,
  Network,
  Boxes,
  Layers,
  Target,
  Compass,
  Lightbulb,
  Workflow,
  ScanSearch,
  TreePine,
  Gauge,
  Settings,
  BookMarked
} from 'lucide-react';
import { Framework, UserProgress } from '@shared/schema';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Function to generate a dynamic gradient based on framework ID
function getFrameworkGradient(id: number): string {
  // Collection of beautiful gradients
  const gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)', // Blue-purple
    'linear-gradient(135deg, #6a11cb, #2575fc)', // Deep blue-purple
    'linear-gradient(135deg, #f093fb, #f5576c)', // Pink-red
    'linear-gradient(135deg, #ff9a9e, #fad0c4)', // Soft pink
    'linear-gradient(135deg, #fbc2eb, #a6c1ee)', // Lavender
    'linear-gradient(135deg, #a1c4fd, #c2e9fb)', // Light blue
    'linear-gradient(135deg, #84fab0, #8fd3f4)', // Teal-blue
    'linear-gradient(135deg, #fdcbf1, #e6dee9)', // Soft pink
    'linear-gradient(135deg, #d4fc79, #96e6a1)', // Green
    'linear-gradient(135deg, #ffcb8c, #ff8b8d)'  // Orange-pink
  ];
  
  // Use modulo to cycle through gradients based on ID
  return gradients[id % gradients.length];
}

// Function to get an appropriate icon based on framework name
function getFrameworkIcon(name: string, id: number): JSX.Element {
  // Get an icon based on the framework name or fall back to a default
  const iconMap: Record<string, JSX.Element> = {
    'MECE': <Boxes className="h-12 w-12 text-white drop-shadow-lg" />,
    'Design Thinking': <Lightbulb className="h-12 w-12 text-white drop-shadow-lg" />,
    'SWOT Analysis': <Layers className="h-12 w-12 text-white drop-shadow-lg" />,
    'First Principles Thinking': <TreePine className="h-12 w-12 text-white drop-shadow-lg" />,
    'Porter\'s Five Forces': <Network className="h-12 w-12 text-white drop-shadow-lg" />,
    'Jobs-To-Be-Done': <Target className="h-12 w-12 text-white drop-shadow-lg" />,
    'Blue Ocean Strategy': <Compass className="h-12 w-12 text-white drop-shadow-lg" />,
    'SCAMPER': <Workflow className="h-12 w-12 text-white drop-shadow-lg" />,
    'Problem-Tree Analysis': <ScanSearch className="h-12 w-12 text-white drop-shadow-lg" />,
    'Pareto Principle': <Gauge className="h-12 w-12 text-white drop-shadow-lg" />
  };
  
  // Try to find an exact match, or use a fallback based on ID
  return iconMap[name] || iconMap[Object.keys(iconMap)[id % Object.keys(iconMap).length]] || <BookOpen className="h-12 w-12 text-white drop-shadow-lg" />;
}

export default function FrameworksPage() {
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [animateItems, setAnimateItems] = useState<boolean>(false);
  
  const { data: frameworks, isLoading: frameworksLoading } = useQuery<Framework[]>({
    queryKey: ['/api/frameworks'],
  });

  const { data: progressData, isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ['/api/user/progress'],
  });

  const isLoading = frameworksLoading || progressLoading;

  // Trigger animation after initial load
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        setAnimateItems(true);
      }, 100);
    }
  }, [isLoading]);

  // Get completion status for each framework
  const getFrameworkProgress = (frameworkId: number) => {
    if (!progressData) return 0;
    const progress = progressData.find(p => p.frameworkId === frameworkId);
    if (!progress || !progress.completedModules || !progress.totalModules) return 0;
    return progress.completedModules / progress.totalModules * 100;
  };

  const getProgressStatus = (frameworkId: number): string => {
    if (!progressData) return 'not_started';
    const progress = progressData.find(p => p.frameworkId === frameworkId);
    return progress?.status || 'not_started';
  };

  // Apply filters to frameworks
  const getFilteredFrameworks = () => {
    if (!frameworks) return [];
    
    let filtered = [...frameworks];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(term) || 
        f.description.toLowerCase().includes(term)
      );
    }
    
    // Apply level filter
    if (filterLevel) {
      filtered = filtered.filter(f => f.level === filterLevel);
    }
    
    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(f => {
        const status = getProgressStatus(f.id);
        if (activeTab === 'in_progress') return status === 'in_progress';
        if (activeTab === 'completed') return status === 'completed';
        if (activeTab === 'not_started') return status === 'not_started';
        return true;
      });
    }
    
    return filtered;
  };

  const filteredFrameworks = getFilteredFrameworks();

  // Card animation delay
  const getAnimationDelay = (index: number) => {
    return `${index * 0.075}s`;
  };

  return (
    <div className="native-scroll pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4 py-2">
        <h1 className="mobile-h1 text-[#0f172a]">Frameworks</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 border-[#3b82f6]/30 text-[#3b82f6]">
              <Settings className="h-4 w-4 mr-1.5" />
              <span>View</span>
              <ChevronDown className="h-3.5 w-3.5 ml-1.5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white w-48 border-[#3b82f6]/10">
            <DropdownMenuItem 
              className={`${!filterLevel ? 'bg-[#EFF6FF] font-medium text-[#3b82f6]' : ''}`}
              onClick={() => setFilterLevel(null)}
            >
              All Levels
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={`${filterLevel === 'Beginner' ? 'bg-[#EFF6FF] font-medium text-[#3b82f6]' : ''}`}
              onClick={() => setFilterLevel('Beginner')}
            >
              Beginner
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={`${filterLevel === 'Intermediate' ? 'bg-[#EFF6FF] font-medium text-[#3b82f6]' : ''}`}
              onClick={() => setFilterLevel('Intermediate')}
            >
              Intermediate
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={`${filterLevel === 'Advanced' ? 'bg-[#EFF6FF] font-medium text-[#3b82f6]' : ''}`}
              onClick={() => setFilterLevel('Advanced')}
            >
              Advanced
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748b] h-4 w-4" />
        <Input 
          className="native-input pl-10 pr-4 bg-white"
          placeholder="Search frameworks..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-[#64748b] hover:bg-slate-100"
            onClick={() => setSearchTerm('')}
          >
            ✕
          </Button>
        )}
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-5">
        <TabsList className="bg-slate-50 p-1 rounded-lg border border-slate-100 w-full">
          <TabsTrigger 
            value="all" 
            className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#3b82f6] data-[state=active]:shadow-sm text-xs"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="in_progress" 
            className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#3b82f6] data-[state=active]:shadow-sm text-xs"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#3b82f6] data-[state=active]:shadow-sm text-xs"
          >
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="native-card">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full rounded-md" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredFrameworks.length === 0 ? (
        <div className="native-empty-state py-8">
          <div className="native-empty-state-icon">
            <BookMarked className="h-8 w-8" />
          </div>
          <p className="native-empty-state-title">No matching frameworks</p>
          <p className="native-empty-state-description">
            {searchTerm 
              ? `No frameworks found matching "${searchTerm}"` 
              : filterLevel 
                ? `No ${filterLevel} frameworks found in this category` 
                : "No frameworks available in this category"}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setFilterLevel(null);
              setActiveTab('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFrameworks.map((framework, index) => (
            <Link key={framework.id} to={`/frameworks/${framework.id}`}>
              <Card 
                className={`native-card overflow-hidden touch-feedback transform transition-all duration-500 ${
                  animateItems ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: getAnimationDelay(index) }}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Framework Visual */}
                  <div className="w-full sm:w-[140px] h-32 sm:h-auto relative overflow-hidden">
                    {/* Dynamic gradient background with subtle pattern */}
                    <div 
                      className="absolute inset-0 transition-all duration-700 ease-in-out" 
                      style={{
                        background: getFrameworkGradient(framework.id),
                        opacity: 0.9
                      }}
                    />
                    
                    {/* Floating abstract shapes */}
                    <div className="absolute inset-0 overflow-hidden">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div 
                          key={i}
                          className="absolute rounded-full mix-blend-overlay animate-float"
                          style={{
                            width: `${60 + (framework.id * 5 + i * 15) % 40}px`,
                            height: `${60 + (framework.id * 5 + i * 15) % 40}px`,
                            background: `rgba(255, 255, 255, ${0.4 - i * 0.1})`,
                            left: `${(framework.id * 13 + i * 30) % 80}%`,
                            top: `${(framework.id * 17 + i * 25) % 80}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${4 + i}s`
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Framework icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {getFrameworkIcon(framework.name, framework.id)}
                    </div>

                    {/* Framework status badge */}
                    <div className="absolute top-2 left-2">
                      {getProgressStatus(framework.id) === 'completed' ? (
                        <Badge className="bg-emerald-500 text-white border-0 text-xs">Completed</Badge>
                      ) : getProgressStatus(framework.id) === 'in_progress' ? (
                        <Badge className="bg-amber-500 text-white border-0 text-xs">In Progress</Badge>
                      ) : null}
                    </div>
                  </div>

                  {/* Framework Content */}
                  <div className="flex-1 flex flex-col">
                    <CardHeader className="pb-0 pt-3 px-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="card-title text-[#0f172a] text-lg font-medium">
                          {framework.name}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={framework.level === 'Beginner' 
                            ? 'badge-blue' 
                            : framework.level === 'Intermediate' 
                              ? 'badge-purple' 
                              : 'badge-orange'
                          }
                        >
                          {framework.level}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 text-sm mt-1">
                        {framework.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-0 px-4 mt-auto">
                      <div className="grid grid-cols-2 gap-2 py-2">
                        <div className="flex items-center text-xs text-[#64748b]">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-[#3b82f6]" />
                          <span>{`${framework.duration} minutes`}</span>
                        </div>
                        <div className="flex items-center text-xs text-[#64748b]">
                          <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-[#3b82f6]" />
                          <span>Certificate</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1 py-2">
                        <div className="flex justify-between items-center text-xs text-[#64748b]">
                          <span>Progress</span>
                          <span className="font-medium text-[#3b82f6]">
                            {Math.round(getFrameworkProgress(framework.id))}%
                          </span>
                        </div>
                        <Progress 
                          value={getFrameworkProgress(framework.id)} 
                          className="h-1.5 animate-progress bg-slate-100" 
                          indicatorClassName="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]"
                        />
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-3">
                      <Button 
                        className="w-full text-sm py-2 flex justify-center items-center bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white hover:shadow-md transition-all"
                      >
                        <span>Explore Framework</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}