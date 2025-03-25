import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, ArrowRight, Search, Filter, ArrowLeft } from 'lucide-react';
import { Framework, UserProgress } from '@shared/schema';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

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
                  {framework.image_url ? (
                    <div className="h-32 rounded-lg overflow-hidden mb-3">
                      <img 
                        src={framework.image_url} 
                        alt={framework.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-32 rounded-lg bg-gradient-to-r from-[#3b82f6]/10 to-[#60a5fa]/10 flex items-center justify-center mb-3">
                      <BookOpen className="h-10 w-10 text-[#3b82f6]/60" />
                    </div>
                  )}
                  
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