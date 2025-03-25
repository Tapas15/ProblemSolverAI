import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  ChevronRight, 
  Clock, 
  ArrowRight, 
  Lightbulb, 
  Award, 
  BookMarked,
  BarChart,
  Zap,
  Network,
  Boxes,
  Layers,
  Target,
  Compass,
  Workflow,
  ScanSearch,
  TreePine,
  Gauge
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { getFrameworks, getUserProgress } from '@/lib/api';
import { Framework, UserProgress } from '@shared/schema';
import { Progress } from '@/components/ui/progress';
import { isNativePlatform } from '@/lib/capacitor';
import FrameworkMiniCard from '@/components/framework/framework-mini-card';

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
    'MECE': <Boxes className="h-8 w-8 text-white drop-shadow-lg" />,
    'Design Thinking': <Lightbulb className="h-8 w-8 text-white drop-shadow-lg" />,
    'SWOT Analysis': <Layers className="h-8 w-8 text-white drop-shadow-lg" />,
    'First Principles Thinking': <TreePine className="h-8 w-8 text-white drop-shadow-lg" />,
    'Porter\'s Five Forces': <Network className="h-8 w-8 text-white drop-shadow-lg" />,
    'Jobs-To-Be-Done': <Target className="h-8 w-8 text-white drop-shadow-lg" />,
    'Blue Ocean Strategy': <Compass className="h-8 w-8 text-white drop-shadow-lg" />,
    'SCAMPER': <Workflow className="h-8 w-8 text-white drop-shadow-lg" />,
    'Problem-Tree Analysis': <ScanSearch className="h-8 w-8 text-white drop-shadow-lg" />,
    'Pareto Principle': <Gauge className="h-8 w-8 text-white drop-shadow-lg" />
  };
  
  // Try to find an exact match, or use a fallback based on ID
  return iconMap[name] || iconMap[Object.keys(iconMap)[id % Object.keys(iconMap).length]] || <BookOpen className="h-8 w-8 text-white drop-shadow-lg" />;
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const isNative = isNativePlatform();
  
  const { data: frameworks, isLoading: frameworksLoading } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: () => getFrameworks(),
  });
  
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/user/progress'],
    queryFn: () => getUserProgress(),
  });
  
  // Calculate overall progress
  const overallProgress = React.useMemo(() => {
    if (!userProgress || userProgress.length === 0) return 0;
    
    const totalModules = userProgress.reduce((sum, progress) => sum + (progress.totalModules || 0), 0);
    const completedModules = userProgress.reduce((sum, progress) => sum + (progress.completedModules || 0), 0);
    
    return totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  }, [userProgress]);
  
  // Filter frameworks based on active tab
  const filteredFrameworks = React.useMemo(() => {
    if (!frameworks || !userProgress) return [];
    
    switch (activeTab) {
      case 'completed':
        return frameworks.filter(framework => {
          const progress = userProgress.find(p => p.frameworkId === framework.id);
          return progress && progress.status === 'completed';
        });
      case 'in_progress':
        return frameworks.filter(framework => {
          const progress = userProgress.find(p => p.frameworkId === framework.id);
          return progress && progress.status === 'in_progress';
        });
      case 'recommended':
        // For simplicity, we're recommending frameworks that haven't been started yet
        return frameworks.filter(framework => {
          const progress = userProgress.find(p => p.frameworkId === framework.id);
          return !progress || progress.status === 'not_started';
        }).slice(0, 3); // Limit to 3 recommendations
      default:
        return frameworks;
    }
  }, [frameworks, userProgress, activeTab]);
  
  // Get progress for a framework
  const getFrameworkProgress = (frameworkId: number) => {
    if (!userProgress) return 0;
    const progress = userProgress.find(p => p.frameworkId === frameworkId);
    if (!progress || !progress.completedModules || !progress.totalModules) return 0;
    return progress.completedModules / progress.totalModules * 100;
  };
  
  const isLoading = frameworksLoading || progressLoading;
  
  return (
    <div className="native-scroll pb-6">
      {/* Welcome Header */}
      <div className="pt-2 pb-4">
        <h1 className="mobile-h1 text-[#0f172a]">Welcome, {user?.name.split(' ')[0]}</h1>
        <p className="text-[#64748b] text-sm">
          Continue your journey with business problem-solving frameworks
        </p>
      </div>
      
      {/* Progress Overview */}
      <Card className="native-card mb-5 bg-gradient-to-r from-[#0f2544] to-[#19355f] text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Your Progress</h3>
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
              {overallProgress}% Complete
            </Badge>
          </div>
          <Progress value={overallProgress} className="h-1.5 bg-white/20" />
          
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-lg font-medium">{userProgress?.filter(p => p.status === 'completed').length || 0}</div>
              <div className="text-xs text-white/80">Completed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-lg font-medium">{userProgress?.filter(p => p.status === 'in_progress').length || 0}</div>
              <div className="text-xs text-white/80">In Progress</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-lg font-medium">{frameworks?.length ? (frameworks.length - (userProgress?.length || 0)) : 0}</div>
              <div className="text-xs text-white/80">To Start</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="native-scroll-x mb-5">
        <div className="flex space-x-3 px-1 py-1">
          <Link to="/frameworks">
            <div className="native-card touch-feedback min-w-[110px] p-3 flex flex-col items-center justify-center text-center">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5 text-[#3b82f6]" />
              </div>
              <span className="text-xs font-medium text-[#0f172a]">Frameworks</span>
            </div>
          </Link>
          
          <Link to="/ai-assistant">
            <div className="native-card touch-feedback min-w-[110px] p-3 flex flex-col items-center justify-center text-center">
              <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center mb-2">
                <Lightbulb className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-xs font-medium text-[#0f172a]">AI Assistant</span>
            </div>
          </Link>
          
          <Link to="/exercises">
            <div className="native-card touch-feedback min-w-[110px] p-3 flex flex-col items-center justify-center text-center">
              <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-xs font-medium text-[#0f172a]">Practice</span>
            </div>
          </Link>
          
          <Link to="/dashboard">
            <div className="native-card touch-feedback min-w-[110px] p-3 flex flex-col items-center justify-center text-center">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                <BarChart className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-[#0f172a]">Dashboard</span>
            </div>
          </Link>
          
          {isNative && (
            <Link to="/mobile-features">
              <div className="native-card touch-feedback min-w-[110px] p-3 flex flex-col items-center justify-center text-center">
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
                  <Zap className="h-5 w-5 text-indigo-500" />
                </div>
                <span className="text-xs font-medium text-[#0f172a]">Mobile Features</span>
              </div>
            </Link>
          )}
        </div>
      </div>
      
      {/* Frameworks Tabs */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="mobile-h2 text-[#0f172a]">Frameworks</h2>
          <Link to="/frameworks">
            <Button variant="ghost" size="sm" className="h-8 text-[#3b82f6]">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="segmented-control w-full mb-4">
            <TabsTrigger value="all" className="segmented-control-option text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="segmented-control-option text-xs">
              In Progress
            </TabsTrigger>
            <TabsTrigger value="recommended" className="segmented-control-option text-xs">
              Recommended
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0 space-y-3">
            {isLoading ? (
              <div className="native-empty-state">
                <div className="native-spinner" />
                <p className="text-sm text-[#64748b] mt-2">Loading frameworks...</p>
              </div>
            ) : filteredFrameworks.length === 0 ? (
              <div className="native-empty-state">
                <div className="native-empty-state-icon">
                  <BookMarked className="h-6 w-6" />
                </div>
                <p className="native-empty-state-title">No frameworks available</p>
                <p className="native-empty-state-description">Check back later for new content</p>
              </div>
            ) : (
              filteredFrameworks.slice(0, 3).map((framework) => (
                <Link key={framework.id} to={`/frameworks/${framework.id}`}>
                  <Card className="native-card touch-feedback overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        {framework.image_url ? (
                          <img 
                            src={framework.image_url} 
                            alt={framework.name} 
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-[#3b82f6]/10 to-[#60a5fa]/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-8 w-8 text-[#3b82f6]/60" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-[#0f172a] text-sm line-clamp-1">{framework.name}</h3>
                            <Badge variant="outline" className={`badge-${framework.level === 'Beginner' ? 'blue' : framework.level === 'Intermediate' ? 'purple' : 'orange'} text-xs`}>
                              {framework.level}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-[#64748b] line-clamp-1 mt-0.5">{framework.description}</p>
                          
                          <div className="mt-2 space-y-1">
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
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
            
            {!isLoading && filteredFrameworks.length > 3 && (
              <div className="text-center pt-2">
                <Link to="/frameworks">
                  <Button variant="outline" size="sm" className="text-xs w-full">
                    View All {filteredFrameworks.length} Frameworks
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="in_progress" className="mt-0 space-y-3">
            {isLoading ? (
              <div className="native-empty-state">
                <div className="native-spinner" />
                <p className="text-sm text-[#64748b] mt-2">Loading frameworks...</p>
              </div>
            ) : filteredFrameworks.length === 0 ? (
              <div className="native-empty-state">
                <div className="native-empty-state-icon">
                  <Clock className="h-6 w-6" />
                </div>
                <p className="native-empty-state-title">No frameworks in progress</p>
                <p className="native-empty-state-description">Start exploring frameworks to track your progress</p>
                <Link to="/frameworks">
                  <Button variant="outline" size="sm" className="mt-4">
                    Browse Frameworks
                  </Button>
                </Link>
              </div>
            ) : (
              filteredFrameworks.map((framework) => (
                <Link key={framework.id} to={`/frameworks/${framework.id}`}>
                  <Card className="native-card touch-feedback overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        {framework.image_url ? (
                          <img 
                            src={framework.image_url} 
                            alt={framework.name} 
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-[#3b82f6]/10 to-[#60a5fa]/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-8 w-8 text-[#3b82f6]/60" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-[#0f172a] text-sm line-clamp-1">{framework.name}</h3>
                            <Badge variant="outline" className={`badge-${framework.level === 'Beginner' ? 'blue' : framework.level === 'Intermediate' ? 'purple' : 'orange'} text-xs`}>
                              {framework.level}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-[#64748b] line-clamp-1 mt-0.5">{framework.description}</p>
                          
                          <div className="mt-2 space-y-1">
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
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="recommended" className="mt-0 space-y-3">
            {isLoading ? (
              <div className="native-empty-state">
                <div className="native-spinner" />
                <p className="text-sm text-[#64748b] mt-2">Loading frameworks...</p>
              </div>
            ) : filteredFrameworks.length === 0 ? (
              <div className="native-empty-state">
                <div className="native-empty-state-icon">
                  <Award className="h-6 w-6" />
                </div>
                <p className="native-empty-state-title">No recommendations yet</p>
                <p className="native-empty-state-description">Complete more frameworks to receive personalized recommendations</p>
                <Link to="/frameworks">
                  <Button variant="outline" size="sm" className="mt-4">
                    Browse Frameworks
                  </Button>
                </Link>
              </div>
            ) : (
              filteredFrameworks.map((framework) => (
                <Link key={framework.id} to={`/frameworks/${framework.id}`}>
                  <Card className="native-card touch-feedback overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        {framework.image_url ? (
                          <img 
                            src={framework.image_url} 
                            alt={framework.name} 
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-[#3b82f6]/10 to-[#60a5fa]/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-8 w-8 text-[#3b82f6]/60" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-[#0f172a] text-sm line-clamp-1">{framework.name}</h3>
                            <Badge variant="outline" className={`badge-${framework.level === 'Beginner' ? 'blue' : framework.level === 'Intermediate' ? 'purple' : 'orange'} text-xs`}>
                              {framework.level}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-[#64748b] line-clamp-1 mt-0.5">{framework.description}</p>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between items-center text-xs text-[#64748b]">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{`${framework.duration} min`}</span>
                              </div>
                              <span>Ready to start</span>
                            </div>
                            <Button variant="outline" size="sm" className="w-full text-xs mt-1 h-7">
                              Start Learning
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HomePage;