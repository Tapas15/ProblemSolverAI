import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserRewards, getUserStreak } from "@/lib/api";
import { format } from "date-fns";
import { Reward, UserReward, UserStreak } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RewardCard } from "./reward-card";
import { StreakDisplay } from "./streak-display";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Award, Flame, Star, Gift, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

export function RewardsSection() {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const { 
    data: userRewards, 
    isLoading: isLoadingRewards, 
    error: rewardsError 
  } = useQuery({
    queryKey: ["/api/user/rewards"],
    queryFn: async () => getUserRewards(),
    gcTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 60, // 1 minute
  });
  
  const { 
    data: userStreak, 
    isLoading: isLoadingStreak, 
    error: streakError 
  } = useQuery({
    queryKey: ["/api/user/streak"],
    queryFn: async () => getUserStreak(),
    gcTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Filter rewards based on activeTab
  const filteredRewards = userRewards?.filter(userReward => {
    if (activeTab === "all") return true;
    return userReward.reward?.type === activeTab;
  });
  
  // Group rewards by type for tab counts
  const rewardCounts = React.useMemo(() => {
    if (!userRewards) return {};
    
    return userRewards.reduce((acc: Record<string, number>, reward) => {
      const type = reward.reward?.type || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, { all: userRewards.length });
  }, [userRewards]);
  
  if (rewardsError || streakError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {rewardsError ? "Failed to load rewards." : "Failed to load streak information."}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Streak Display Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 border-blue-100 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Flame className="mr-2 h-5 w-5 text-orange-500" />
            Daily Streak
          </CardTitle>
          <CardDescription>Keep learning daily to maintain your streak</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStreak ? (
            <div className="flex flex-col items-center space-y-3">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
          ) : (
            userStreak && <StreakDisplay userStreak={userStreak} />
          )}
        </CardContent>
      </Card>
      
      {/* Rewards Tab Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
            Your Rewards
          </CardTitle>
          <CardDescription>
            Achievements and rewards you've earned through your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All
                {rewardCounts.all && (
                  <Badge variant="secondary" className="ml-2">
                    {rewardCounts.all}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="achievement">
                <Award className="mr-1 h-4 w-4" />
                Achievements
                {rewardCounts.achievement && (
                  <Badge variant="secondary" className="ml-2">
                    {rewardCounts.achievement}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="streak">
                <Flame className="mr-1 h-4 w-4" />
                Streaks
                {rewardCounts.streak && (
                  <Badge variant="secondary" className="ml-2">
                    {rewardCounts.streak}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="special">
                <Gift className="mr-1 h-4 w-4" />
                Special
                {rewardCounts.special && (
                  <Badge variant="secondary" className="ml-2">
                    {rewardCounts.special}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              {isLoadingRewards ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-md" />
                  ))}
                </div>
              ) : filteredRewards && filteredRewards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRewards.map((userReward) => (
                    <RewardCard
                      key={userReward.id}
                      userReward={userReward}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                  <h3 className="mt-2 text-lg font-semibold">No rewards yet</h3>
                  <p className="text-muted-foreground">
                    Continue learning to earn rewards in this category!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}