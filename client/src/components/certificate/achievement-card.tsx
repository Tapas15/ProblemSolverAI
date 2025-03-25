import React from 'react';
import { Award, Trophy, Medal, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { Achievement } from '@/lib/api';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { title, description, isEarned, progress, requiredProgress, earnedDate } = achievement;
  
  const renderIcon = () => {
    if (achievement.id.includes('certificate')) {
      return <Award className="h-6 w-6" />;
    } else if (achievement.id.includes('quiz')) {
      return <Medal className="h-6 w-6" />;
    } else if (achievement.id.includes('framework')) {
      return <Trophy className="h-6 w-6" />;
    } else {
      return <Check className="h-6 w-6" />;
    }
  };
  
  const progressPercentage = progress !== undefined && requiredProgress 
    ? Math.min(100, Math.round((progress / requiredProgress) * 100))
    : 0;
  
  const earnedDateFormatted = earnedDate 
    ? new Date(earnedDate).toLocaleDateString() 
    : null;
  
  return (
    <div 
      className={`flex p-4 rounded-xl border transition-all ${
        isEarned 
          ? 'border-primary/20 bg-primary/5' 
          : 'border-gray-200 bg-gray-50/50 opacity-70'
      }`}
    >
      <div className="relative h-12 w-12 rounded-full shrink-0 flex items-center justify-center">
        {progress !== undefined && requiredProgress ? (
          <>
            <div className="absolute inset-0 rounded-full">
              <svg className="w-full h-full" viewBox="0 0 48 48">
                <circle 
                  cx="24" 
                  cy="24" 
                  r="20" 
                  fill="none" 
                  stroke="#e5e7eb" 
                  strokeWidth="4" 
                />
                <circle 
                  cx="24" 
                  cy="24" 
                  r="20" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeDasharray={`${125 * (progressPercentage / 100)} 125`} 
                  strokeDashoffset="-31.25"
                  className={isEarned ? "text-primary" : "text-gray-300"}
                  transform="rotate(-90 24 24)"
                />
              </svg>
            </div>
            <div className={`z-10 ${isEarned ? "text-primary" : "text-gray-400"}`}>
              {renderIcon()}
            </div>
          </>
        ) : (
          <div className={`flex items-center justify-center h-full w-full rounded-full ${
            isEarned ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"
          }`}>
            {renderIcon()}
          </div>
        )}
      </div>
      
      <div className="ml-4">
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
        
        {progress !== undefined && requiredProgress && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className={isEarned ? "text-primary" : "text-gray-500"}>
                {progress} / {requiredProgress}
              </span>
              <span className={isEarned ? "text-primary" : "text-gray-500"}>
                {progressPercentage}%
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className={`h-1.5 ${!isEarned && "bg-gray-100"}`} 
            />
          </div>
        )}
        
        {earnedDateFormatted && (
          <p className="text-xs text-gray-500 mt-1.5">
            Earned: {earnedDateFormatted}
          </p>
        )}
      </div>
    </div>
  );
}