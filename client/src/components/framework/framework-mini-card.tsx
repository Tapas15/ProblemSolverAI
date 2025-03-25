import React from 'react';
import { Framework } from '@shared/schema';
import { Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen,
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
} from "lucide-react";

interface FrameworkMiniCardProps {
  framework: Framework;
  progressPercent: number;
}

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

const FrameworkMiniCard: React.FC<FrameworkMiniCardProps> = ({ 
  framework, 
  progressPercent 
}) => {
  return (
    <div className="flex items-start space-x-3">
      {/* Visual framework icon */}
      <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
        {/* Dynamic gradient background */}
        <div 
          className="absolute inset-0" 
          style={{
            background: getFrameworkGradient(framework.id),
          }}
        />
        
        {/* Floating abstract shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 2 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full mix-blend-overlay animate-float"
              style={{
                width: `${20 + (framework.id * 3 + i * 8) % 20}px`,
                height: `${20 + (framework.id * 3 + i * 8) % 20}px`,
                background: `rgba(255, 255, 255, ${0.4 - i * 0.1})`,
                left: `${(framework.id * 10 + i * 25) % 80}%`,
                top: `${(framework.id * 15 + i * 20) % 80}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i}s`
              }}
            />
          ))}
        </div>
        
        {/* Framework icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {getFrameworkIcon(framework.name, framework.id)}
        </div>
      </div>
      
      {/* Framework details */}
      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="font-medium text-[#0f172a] text-sm line-clamp-1">{framework.name}</h3>
          <Badge 
            variant="outline" 
            className={`badge-${framework.level === 'Beginner' ? 'blue' : framework.level === 'Intermediate' ? 'purple' : 'orange'} text-xs`}
          >
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
            <span>{Math.round(progressPercent)}% Complete</span>
          </div>
          <Progress value={progressPercent} className="h-1.5 animate-progress" />
        </div>
      </div>
    </div>
  );
};

export default FrameworkMiniCard;