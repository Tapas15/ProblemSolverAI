import React from "react";
import { format, isToday, differenceInCalendarDays } from "date-fns";
import { UserStreak } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkInStreak } from "@/lib/api";
import { Flame, Calendar, Trophy, TrendingUp, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface StreakDisplayProps {
  userStreak: UserStreak;
}

// Streak milestones for visual indicators
const STREAK_MILESTONES = [7, 30, 60, 100, 365];

export function StreakDisplay({ userStreak }: StreakDisplayProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Calculate if the user can check in today
  const canCheckIn = React.useMemo(() => {
    if (!userStreak.lastActivityDate) return true;
    
    const lastActivity = new Date(userStreak.lastActivityDate);
    return !isToday(lastActivity);
  }, [userStreak.lastActivityDate]);
  
  // Calculate streak progress toward next milestone
  const { nextMilestone, progress } = React.useMemo(() => {
    const currentStreak = userStreak.currentStreak || 0;
    
    // Find the next milestone
    const nextMilestone = STREAK_MILESTONES.find(milestone => milestone > currentStreak) || 
                          (currentStreak + 1);
    
    // Calculate progress percentage
    const previousMilestone = STREAK_MILESTONES.filter(m => m < nextMilestone).pop() || 0;
    const range = nextMilestone - previousMilestone;
    const current = currentStreak - previousMilestone;
    const progress = Math.floor((current / range) * 100);
    
    return { nextMilestone, progress };
  }, [userStreak.currentStreak]);
  
  // Mutation for checking in
  const checkInMutation = useMutation({
    mutationFn: checkInStreak,
    onSuccess: () => {
      // Invalidate the streak data to refresh it
      queryClient.invalidateQueries({ queryKey: ["/api/user/streak"] });
      
      // Also invalidate rewards in case any new streak rewards were earned
      queryClient.invalidateQueries({ queryKey: ["/api/user/rewards"] });
      
      toast({
        title: "Streak updated!",
        description: "Your learning streak has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update streak",
        description: error.message || "An error occurred while updating your streak.",
        variant: "destructive",
      });
    },
  });
  
  // Format the date string
  const formatDate = (date: Date | null): string => {
    if (!date) return "Never";
    return format(new Date(date), "MMM d, yyyy");
  };
  
  // Handle check-in button click
  const handleCheckIn = () => {
    if (canCheckIn) {
      checkInMutation.mutate();
    }
  };
  
  // Calculate days since start of streak
  const daysSinceStart = React.useMemo(() => {
    if (!userStreak.streakStartDate) return 0;
    
    const startDate = new Date(userStreak.streakStartDate);
    return differenceInCalendarDays(new Date(), startDate) + 1;
  }, [userStreak.streakStartDate]);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold mr-2">
              {userStreak.currentStreak || 0}
            </span>
            <span className="text-sm text-muted-foreground">
              day{(userStreak.currentStreak !== 1) ? "s" : ""}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Current streak</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={canCheckIn ? "default" : "outline"}
            size="sm"
            onClick={handleCheckIn}
            disabled={!canCheckIn || checkInMutation.isPending}
            className={`transition-all ${canCheckIn ? "animate-pulse" : ""}`}
          >
            {checkInMutation.isPending ? (
              <span className="flex items-center">
                <div className="h-3 w-3 mr-1 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Processing...
              </span>
            ) : canCheckIn ? (
              <span className="flex items-center">
                <Flame className="h-3 w-3 mr-1" />
                Check in
              </span>
            ) : (
              <span className="flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Checked in
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Streak progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span>Progress to {nextMilestone} days</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Streak stats */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <Trophy className="h-3 w-3 mr-1 text-yellow-500" />
          <span className="text-muted-foreground">Best streak:</span>
          <span className="ml-1 font-medium">{userStreak.longestStreak || 0} days</span>
        </div>
        
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1 text-blue-500" />
          <span className="text-muted-foreground">Started:</span>
          <span className="ml-1 font-medium">
            {userStreak.streakStartDate ? 
              formatDate(new Date(userStreak.streakStartDate)) : 
              "Not started"}
          </span>
        </div>
        
        <div className="flex items-center">
          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
          <span className="text-muted-foreground">Consistency:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1 font-medium cursor-help">
                  {daysSinceStart ? Math.round((userStreak.currentStreak || 0) / daysSinceStart * 100) : 0}%
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Percentage of days you've maintained your streak since starting</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center">
          <Flame className="h-3 w-3 mr-1 text-orange-500" />
          <span className="text-muted-foreground">Last activity:</span>
          <span className="ml-1 font-medium">
            {userStreak.lastActivityDate ? 
              formatDate(new Date(userStreak.lastActivityDate)) : 
              "Never"}
          </span>
        </div>
      </div>
    </div>
  );
}