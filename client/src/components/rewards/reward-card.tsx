import React from "react";
import { format } from "date-fns";
import { Reward, UserReward } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Clock, Gift, Star, Medal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RewardCardProps {
  userReward: UserReward & { reward: Reward | null };
}

export function RewardCard({ userReward }: RewardCardProps) {
  const { reward, earnedAt, data } = userReward;
  
  if (!reward) {
    return null; // Don't render if reward is null
  }
  
  // Parse data if it exists
  let parsedData: Record<string, any> | null = null;
  if (data) {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse reward data:", e);
    }
  }
  
  // Get icon based on reward type
  const getIcon = () => {
    switch (reward.type) {
      case "achievement":
        return <Award className="h-5 w-5 text-blue-500" />;
      case "streak":
        return <Star className="h-5 w-5 text-orange-500" />;
      case "special":
        return <Gift className="h-5 w-5 text-purple-500" />;
      default:
        return <Medal className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  // Get badge color based on rarity
  const getBadgeVariant = () => {
    switch (reward.rarity) {
      case "common":
        return "outline";
      case "uncommon":
        return "secondary";
      case "rare":
        return "default";
      case "epic":
        return "destructive";
      case "legendary":
        return "yellow";
      default:
        return "outline";
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className={`pb-2 ${getBackgroundClass(reward.type)}`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center">
            {getIcon()}
            <span className="ml-2">{reward.name}</span>
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant={getBadgeVariant()} className="uppercase text-xs">
                  {reward.rarity || "Standard"}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getRarityDescription(reward.rarity)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="line-clamp-2">{reward.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {parsedData && (
          <div className="text-sm text-muted-foreground mb-2">
            {Object.entries(parsedData).map(([key, value]) => (
              <div key={key} className="flex items-center mt-1">
                <span className="capitalize">{formatKey(key)}:</span>
                <span className="ml-1 font-medium">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        )}
        {reward.pointValue && (
          <div className="flex items-center justify-end mt-2">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium">{reward.pointValue} points</span>
          </div>
        )}
      </CardContent>
      {earnedAt && (
        <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Earned on {format(new Date(earnedAt), "MMM d, yyyy")}
        </CardFooter>
      )}
    </Card>
  );
}

// Helper functions
function formatKey(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
}

function formatValue(value: any): string {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "string") {
    // Check if it's a date string
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return format(date, "MMM d, yyyy");
    }
    return value;
  }
  return JSON.stringify(value);
}

function getBackgroundClass(type: string): string {
  switch (type) {
    case "achievement":
      return "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30";
    case "streak":
      return "bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30";
    case "special":
      return "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30";
    default:
      return "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/30 dark:to-slate-900/30";
  }
}

function getRarityDescription(rarity: string | null): string {
  switch (rarity) {
    case "common":
      return "Easily obtainable reward";
    case "uncommon":
      return "Somewhat challenging to obtain";
    case "rare":
      return "Difficult to achieve, requires dedication";
    case "epic":
      return "Very challenging achievement, truly impressive";
    case "legendary":
      return "Extremely rare achievement, achieved by very few";
    default:
      return "Standard reward";
  }
}