import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { Framework, UserProgress } from '@shared/schema';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export default function FrameworksPage() {
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
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-header bg-clip-text text-transparent bg-gradient-to-r from-[#7d5af1] to-[#ff59b2]">
            Business Frameworks
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Explore our collection of powerful business frameworks to enhance your problem-solving skills
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frameworks?.map((framework) => (
              <Card key={framework.id} className="framework-card overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="card-title font-header text-xl">
                      {framework.name}
                    </CardTitle>
                    <Badge variant="outline" className="bg-[#7d5af1]/10 text-[#7d5af1] border-[#7d5af1]/20">
                      {framework.level}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {framework.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="py-2">
                  <div className="relative">
                    <div className="shine"></div>
                    {framework.imageUrl ? (
                      <div className="h-40 rounded-md overflow-hidden mb-4">
                        <img 
                          src={framework.imageUrl} 
                          alt={framework.name} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-40 rounded-md bg-gradient-to-br from-[#7d5af1]/10 to-[#ff59b2]/10 flex items-center justify-center mb-4">
                        <BookOpen className="h-12 w-12 text-[#7d5af1]/50" />
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>{`${framework.duration} min`}</span>
                        </div>
                        <span>{Math.round(getFrameworkProgress(framework.id))}% Complete</span>
                      </div>
                      <Progress value={getFrameworkProgress(framework.id)} className="h-2 animate-progress" />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2">
                  <Link to={`/frameworks/${framework.id}`}>
                    <Button 
                      className="w-full btn-primary group"
                    >
                      <span>Explore Framework</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}