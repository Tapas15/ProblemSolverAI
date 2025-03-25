import React from 'react';
import { Module } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BookOpen, Target, Award, Clock } from 'lucide-react';

interface ModuleProgressTrackerProps {
  modules: Module[];
  frameworkName: string;
}

export function ModuleProgressTracker({ modules, frameworkName }: ModuleProgressTrackerProps) {
  const completedModules = modules.filter(m => m.completed);
  const completionPercentage = modules.length ? Math.round((completedModules.length / modules.length) * 100) : 0;
  
  return (
    <Card className="border-none shadow-sm bg-gray-50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-[#0f172a]">
            {frameworkName} Modules
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {completedModules.length}/{modules.length} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Overall progress */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#64748b]">Overall Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress 
              value={completionPercentage} 
              className="h-1.5"
            />
          </div>
          
          {/* Module list */}
          <div className="space-y-2 mt-2">
            {modules.map((module, idx) => (
              <div 
                key={module.id} 
                className={`p-2 rounded-md border flex items-center justify-between ${
                  module.completed 
                    ? 'bg-green-50 border-green-200' 
                    : idx === completedModules.length 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-2 ${
                    module.completed 
                      ? 'bg-green-500 text-white' 
                      : idx === completedModules.length
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {module.completed ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : idx === completedModules.length ? (
                      <Target className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-xs">{idx + 1}</span>
                    )}
                  </div>
                  <div>
                    <div className={`text-xs font-medium ${
                      module.completed 
                        ? 'text-green-700' 
                        : idx === completedModules.length
                          ? 'text-blue-700'
                          : 'text-gray-700'
                    }`}>
                      {module.name}
                    </div>
                    {idx === completedModules.length && !module.completed && (
                      <div className="text-[10px] text-blue-500">
                        Current Module
                      </div>
                    )}
                  </div>
                </div>
                
                {module.completed && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 h-5 text-[10px]">
                    Completed
                  </Badge>
                )}
                
                {!module.completed && idx === completedModules.length && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 h-5 text-[10px]">
                    In Progress
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}