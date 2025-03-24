import React from 'react';
import { Link } from 'wouter';
import { Framework, Module } from '@shared/schema';
import { Clock, GraduationCap, CheckCircle, ArrowRight, Award, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FrameworkCardProps {
  framework: Framework;
  modules: Module[];
  progressStatus?: string;
  completedModules?: number;
}

const FrameworkCard: React.FC<FrameworkCardProps> = ({ 
  framework, 
  modules, 
  progressStatus = 'not_started',
  completedModules = 0 
}) => {
  const { id, name, description, level, duration, imageUrl } = framework;
  const totalModules = modules.length || 6; // Fallback for display
  
  // Generate a unique gradient based on framework ID for visual variety
  const getGradient = (id: number) => {
    // Using blue-themed gradients for consistency with the app's theme
    const gradients = [
      'from-[#0078D7] to-[#00A5E0]',  // Primary blue to lighter blue
      'from-[#0064B5] to-[#0095D0]',  // Deep blue to medium blue
      'from-[#0078D7] to-[#38B6FF]',  // Primary blue to sky blue
      'from-[#005A9E] to-[#0078D7]',  // Navy blue to primary blue
      'from-[#0078D7] to-[#00A5E0]',  // Repeat for consistency
      'from-[#0064B5] to-[#0095D0]',  
      'from-[#0078D7] to-[#38B6FF]',  
      'from-[#005A9E] to-[#0078D7]',  
      'from-[#0078D7] to-[#00A5E0]',  
      'from-[#0064B5] to-[#0095D0]',  
    ];
    return gradients[(id - 1) % gradients.length];
  };
  
  const getStatusBadge = () => {
    switch (progressStatus) {
      case 'completed':
        return (
          <Badge className="bg-gradient-to-r from-[#198754] to-[#20c997] text-white font-medium px-3 py-1 shadow-sm">
            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-white font-medium px-3 py-1 shadow-sm">
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-[#0078D7] to-[#00A5E0] text-white font-medium px-3 py-1 shadow-sm">
            Not Started
          </Badge>
        );
    }
  };
  
  const getLinkText = () => {
    switch (progressStatus) {
      case 'completed':
        return "View Framework";
      case 'in_progress':
        return "Continue Learning";
      default:
        return "Start Learning";
    }
  };

  const getProgressPercentage = () => {
    if (totalModules === 0) return 0;
    return (completedModules / totalModules) * 100;
  };
  
  return (
    <div className="framework-card rounded-xl overflow-hidden bg-white group hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary/20">
      <div className="relative h-44 overflow-hidden">
        {imageUrl ? (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(id)} opacity-80 z-10`}></div>
            <img 
              src={imageUrl} 
              alt={name}
              onError={(e) => {
                // Fallback to gradient only on error
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <h3 className="text-2xl font-bold text-white drop-shadow-md px-4 text-center transition-transform duration-300 transform group-hover:scale-105">{name}</h3>
            </div>
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getGradient(id)}`}>
            <h3 className="text-2xl font-bold text-white drop-shadow-md px-4 text-center">{name}</h3>
          </div>
        )}
        <div className="absolute top-3 right-3 z-30">
          {getStatusBadge()}
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-700 mb-4 line-clamp-3 text-sm leading-relaxed">{description}</p>
        
        <div className="mt-4 grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center bg-slate-50 p-2 rounded-lg">
            <Clock className="h-4 w-4 text-primary mr-2" /> 
            <span className="text-sm text-gray-700">{duration} min</span>
          </div>
          <div className="flex items-center bg-slate-50 p-2 rounded-lg">
            <GraduationCap className="h-4 w-4 text-primary mr-2" /> 
            <span className="text-sm text-gray-700 capitalize">{level}</span>
          </div>
          <div className="flex items-center bg-slate-50 p-2 rounded-lg">
            <BookOpen className="h-4 w-4 text-primary mr-2" /> 
            <span className="text-sm text-gray-700">{totalModules} Modules</span>
          </div>
          <div className="flex items-center bg-slate-50 p-2 rounded-lg">
            <Award className="h-4 w-4 text-primary mr-2" /> 
            <span className="text-sm text-gray-700">Certificate</span>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="relative pt-1 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-semibold inline-block text-primary">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-primary">
                {Math.round(getProgressPercentage())}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
            <div
              style={{ width: `${getProgressPercentage()}%` }}
              className="animate-progress shadow-inner flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#0078D7] via-[#0095D0] to-[#00A5E0]"
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{completedModules} completed</span>
            <span>{totalModules} total</span>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
        <Link to={`/quizzes/${id}`} className="flex-1">
          <Button variant="outline" className="w-full border-[#0078D7]/50 text-[#0078D7] hover:bg-[#F0F7FF] hover:border-[#0078D7] transition-all duration-300">
            View Quizzes
          </Button>
        </Link>
        
        <Link to={`/frameworks/${id}`} className="flex-1">
          <Button className="w-full group bg-gradient-to-r from-[#0078D7] to-[#00A5E0] hover:from-[#0064B5] hover:to-[#0095D0] shadow-md hover:shadow-lg transition-all duration-300">
            {getLinkText()}
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default FrameworkCard;
