import React from 'react';
import { Link } from 'wouter';
import { Framework, Module } from '@shared/schema';
import { Clock, GraduationCap, Check, X, ArrowRight, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  
  const getStatusBadge = () => {
    switch (progressStatus) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 font-medium px-3 py-1">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 font-medium px-3 py-1">In Progress</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium px-3 py-1">Not Started</Badge>;
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
    <div className="framework-card rounded-xl overflow-hidden bg-white">
      <div className="h-40 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            onError={(e) => {
              // Replace with a default image on error
              e.currentTarget.src = "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=500&auto=format&fit=crop";
              e.currentTarget.onerror = null; // Prevent infinite loop if default also fails
            }}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
            <span className="text-sm">{name}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold font-header text-primary">{name}</h3>
          {getStatusBadge()}
        </div>
        
        <p className="mt-2 text-gray-700 mb-4 line-clamp-3">{description}</p>
        
        <div className="mt-4 flex items-center text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <Clock className="mr-1.5 h-4 w-4 text-primary/70" /> 
            <span>{duration} min</span>
          </span>
          <span className="mx-3 text-gray-300">•</span>
          <span className="flex items-center">
            <GraduationCap className="mr-1.5 h-4 w-4 text-primary/70" /> 
            <span className="capitalize">{level}</span>
          </span>
          {progressStatus === 'completed' && (
            <>
              <span className="mx-3 text-gray-300">•</span>
              <span className="flex items-center">
                <Award className="mr-1.5 h-4 w-4 text-amber-500" /> 
                <span className="text-amber-700">Mastered</span>
              </span>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-secondary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{completedModules} completed</span>
          <span>{totalModules} total modules</span>
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
        <Link to={`/quizzes/${id}`}>
          <span className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            View Quizzes
          </span>
        </Link>
        
        <Link to={`/frameworks/${id}`}>
          <div className="flex items-center text-sm font-medium text-secondary hover:text-secondary/80 transition-colors">
            {getLinkText()}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default FrameworkCard;
