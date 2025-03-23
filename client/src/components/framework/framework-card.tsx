import React from 'react';
import { Link } from 'wouter';
import { Framework, Module } from '@shared/schema';
import { Clock, GraduationCap, Check, X } from 'lucide-react';
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
  const { id, name, description, level, duration } = framework;
  const totalModules = modules.length;
  
  const getStatusBadge = () => {
    switch (progressStatus) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">In Progress</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Not Started</Badge>;
    }
  };
  
  const getLinkText = () => {
    switch (progressStatus) {
      case 'completed':
        return "View Framework";
      case 'in_progress':
        return "Continue";
      default:
        return "Start Learning";
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold font-header text-primary">{name}</h3>
          {getStatusBadge()}
        </div>
        
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        
        <div className="mt-4 flex items-center text-xs text-gray-500">
          <span className="flex items-center">
            <Clock className="mr-1 h-3 w-3" /> {duration} min
          </span>
          <span className="mx-2">•</span>
          <span className="flex items-center">
            <GraduationCap className="mr-1 h-3 w-3" /> {level}
          </span>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex -space-x-1">
            {Array.from({ length: totalModules }).map((_, index) => (
              <span 
                key={index} 
                className={`inline-block h-5 w-5 rounded-full ${
                  index < completedModules ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'
                } flex items-center justify-center text-xs`}
              >
                {index < completedModules ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              </span>
            ))}
          </div>
          <span className="ml-2 text-xs text-gray-500">{completedModules}/{totalModules} modules</span>
        </div>
        
        <Link to={`/frameworks/${id}`}>
          <span className="text-sm font-medium text-secondary hover:underline">
            {getLinkText()}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default FrameworkCard;
