import React from 'react';
import { useLocation } from 'wouter';
import { Framework, UserProgress, Module } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, BookOpen, ChevronRight, ArrowRightCircle, 
  Award, Clock, Target, Zap, List, BarChart2, Brain
} from 'lucide-react';

interface LearningProgressMapProps {
  frameworks: Framework[];
  userProgress: UserProgress[];
  allModules?: Record<number, Module[]>;
}

export function LearningProgressMap({ frameworks, userProgress, allModules = {} }: LearningProgressMapProps) {
  const [_, setLocation] = useLocation();

  // Get framework progress
  const getFrameworkProgress = (frameworkId: number) => {
    return userProgress.find(p => p.frameworkId === frameworkId);
  };

  // Get next module to study for a framework
  const getNextModule = (frameworkId: number) => {
    const modules = allModules[frameworkId] || [];
    if (!modules.length) return null;
    
    // Find first incomplete module
    return modules.find(m => !m.completed);
  };

  // Calculate progress percentage from completed modules
  const getModuleProgressPercent = (frameworkId: number) => {
    const progress = getFrameworkProgress(frameworkId);
    
    // If we have already calculated progress, use that
    if (progress?.completedModules && progress?.totalModules) {
      return Math.round((progress.completedModules / progress.totalModules) * 100);
    }
    
    // Otherwise calculate from module data
    const modules = allModules[frameworkId] || [];
    if (!modules.length) return 0;
    
    const completedCount = modules.filter(m => m.completed).length;
    return Math.round((completedCount / modules.length) * 100);
  };
  
  return (
    <div className="space-y-6">
      <div className="sticky -top-4 pt-4 pb-2 bg-white z-10">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-base font-semibold text-[#0f172a]">Learning Progress Map</h3>
          <Badge variant="outline" className="text-xs font-normal">
            {frameworks.length} Frameworks
          </Badge>
        </div>
        <p className="text-xs text-[#64748b] mb-4">Track your journey through all business frameworks</p>
        
        {/* Overall progress bar */}
        <div className="relative">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-[#64748b]">Overall Completion</span>
            <span className="font-medium">
              {userProgress.filter(p => p.status === 'completed').length} / {frameworks.length} Complete
            </span>
          </div>
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#0057B8] to-[#00A5E0] rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.round((userProgress.filter(p => p.status === 'completed').length / frameworks.length) * 100)}%` 
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {frameworks.map((framework) => {
          const progress = getFrameworkProgress(framework.id);
          const nextModule = getNextModule(framework.id);
          const progressPercent = getModuleProgressPercent(framework.id);
          const isCompleted = progress?.status === 'completed';
          
          return (
            <Card key={framework.id} className={`relative overflow-hidden border ${isCompleted ? 'border-green-300' : ''}`}>
              {isCompleted && (
                <div className="absolute top-0 right-0">
                  <div className="bg-green-500 text-white p-1 transform rotate-45 translate-x-4 translate-y-2 px-4 text-xs font-medium shadow-sm">
                    COMPLETE
                  </div>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{framework.name}</CardTitle>
                  <Badge className={progress?.status === 'completed' ? 'badge-green' : 
                    progress?.status === 'in_progress' ? 'badge-blue' : 'badge-outline'}>
                    {progress?.status === 'completed' ? 'Mastered' : 
                     progress?.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between space-x-4 text-[#64748b] text-xs">
                    <div className="flex items-center">
                      <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                      <span>{progress?.completedModules || 0} of {progress?.totalModules || 0} modules</span>
                    </div>
                    
                    {progress?.status === 'in_progress' && (
                      <div className="flex items-center">
                        <Target className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                        <span className="text-blue-500 font-medium">{nextModule?.name || 'Next Module'}</span>
                      </div>
                    )}
                    
                    {progress?.status === 'completed' && (
                      <div className="flex items-center">
                        <Award className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                        <span className="text-green-600 font-medium">All Complete!</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress bar with module dots */}
                  <div className="relative pt-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-[#64748b]">Progress</span>
                      <span className="text-xs font-medium">{progressPercent}%</span>
                    </div>
                    
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                      <div
                        style={{ width: `${progressPercent}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] transition-all duration-300"
                      ></div>
                    </div>
                    
                    {/* Module dots positioning */}
                    {allModules[framework.id] && (
                      <div className="flex justify-between absolute top-10 left-0 right-0">
                        {allModules[framework.id].map((module, index) => {
                          const position = `${(index / (allModules[framework.id].length - 1)) * 100}%`;
                          return (
                            <div 
                              key={module.id}
                              className={`w-3 h-3 rounded-full -ml-1.5 ${
                                module.completed ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                              style={{ left: position }}
                              title={module.name}
                            >
                              {module.completed && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant={isCompleted ? "outline" : "default"}
                      size="sm" 
                      className={isCompleted 
                        ? "w-full text-green-600 border-green-300 hover:bg-green-50" 
                        : "w-full bg-gradient-to-r from-[#3b82f6] to-[#4f46e5]"
                      }
                      onClick={() => setLocation(`/frameworks/${framework.id}`)}
                    >
                      {isCompleted ? (
                        <span className="flex items-center">
                          <CheckCircle className="mr-1.5 h-4 w-4" />
                          Review Framework
                        </span>
                      ) : progress?.status === 'in_progress' ? (
                        <span className="flex items-center">
                          <ArrowRightCircle className="mr-1.5 h-4 w-4" />
                          Continue Learning
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Zap className="mr-1.5 h-4 w-4" />
                          Start Learning
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}