import React from 'react';
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
  ArrowLeft,
  Network,
  Boxes,
  Layers,
  Target,
  Compass,
  Lightbulb,
  Workflow,
  ScanSearch,
  TreePine,
  Gauge
} from 'lucide-react';
import { Framework, UserProgress } from '@shared/schema';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

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
  const { data: frameworks, isLoading: frameworksLoading } = useQuery<Framework[]>({
    queryKey: ['/api/frameworks'],
  });

  const { data: progressData, isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ['/api/user/progress'],
  });

  // Get completion status for each framework
  const getFrameworkProgress = (frameworkId: number) => {
    if (!progressData) return 0;
    const progress = progressData.find(p => p.frameworkId === frameworkId);
    if (!progress || !progress.completedModules || !progress.totalModules) return 0;
    return progress.completedModules / progress.totalModules * 100;
  };

  const isLoading = frameworksLoading || progressLoading;

  return (
    <div className="native-scroll pb-8">
      {/* Page Header */}
      <div className="flex items-center mb-4 py-2">
        {/* Back button removed as requested */}
        <h1 className="mobile-h1 text-[#0f172a]">Frameworks</h1>
      </div>

      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748b] h-4 w-4" />
        <Input 
          className="native-input pl-10 pr-10 bg-white"
          placeholder="Search frameworks..." 
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-[#64748b]"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-[#64748b]">
          Explore our collection of powerful frameworks to enhance your business problem-solving skills
        </p>
      </div>

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
      ) : (
        <div className="space-y-4">
          {frameworks?.map((framework) => (
            <Card key={framework.id} className="native-card overflow-hidden touch-feedback">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="card-title text-[#0f172a] text-lg font-medium">
                    {framework.name}
                  </CardTitle>
                  <Badge variant="outline" className={`badge-${framework.level === 'Beginner' ? 'blue' : framework.level === 'Intermediate' ? 'purple' : 'orange'}`}>
                    {framework.level}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-sm mt-1">
                  {framework.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="relative">
                  <div className="h-32 relative rounded-lg overflow-hidden mb-3 bg-white">
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

                    {/* Framework name as elegant overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 text-white">
                      <h4 className="text-sm font-medium text-center">{framework.name}</h4>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-[#64748b]">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{`${framework.duration} min`}</span>
                      </div>
                      <span>{Math.round(getFrameworkProgress(framework.id))}% Complete</span>
                    </div>
                    <Progress value={getFrameworkProgress(framework.id)} className="h-1.5 animate-progress" />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Link to={`/frameworks/${framework.id}`}>
                  <Button 
                    className="native-button text-sm py-2.5 w-full flex justify-center items-center"
                  >
                    <span>Explore Framework</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}