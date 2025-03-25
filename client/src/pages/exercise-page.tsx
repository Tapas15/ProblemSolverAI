import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Exercise, Framework } from "@shared/schema";
import { getFramework, getFrameworkExercises } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Clock, Info, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { isNativePlatform } from "@/lib/capacitor";
import MainLayout from "@/components/layout/main-layout";
import { MobileAppLayout } from "@/components/layout/mobile-app-layout";

export default function ExercisePage() {
  const [, params] = useRoute("/exercises/:frameworkId");
  const [_, navigate] = useLocation();
  const frameworkId = params?.frameworkId ? parseInt(params.frameworkId) : undefined;
  const [isNative, setIsNative] = useState(false);
  
  // Check if running on native platform
  useEffect(() => {
    setIsNative(isNativePlatform());
  }, []);
  
  const Layout = isNative ? MobileAppLayout : MainLayout;

  // Redirect if no frameworkId
  if (!frameworkId) {
    return (
      <Layout>
        <div className={`native-scroll pb-4 ${isNative ? "px-4" : ""}`}>
          {!isNative && (
            <div className="flex items-center mb-4 py-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="mr-2 h-9 w-9 rounded-full text-[#3b82f6]" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="mobile-h1 text-[#0f172a]">Exercises</h1>
            </div>
          )}
          
          <div className="native-empty-state">
            <div className="native-empty-state-icon">
              <BookOpen className="h-8 w-8" />
            </div>
            <h2 className="native-empty-state-title">Select a Framework</h2>
            <p className="native-empty-state-description">
              Please select a framework to view its exercises
            </p>
            <Button 
              className="native-button text-sm py-2.5 flex justify-center items-center"
              onClick={() => navigate('/exercises-frameworks')}
            >
              Browse Frameworks
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Get framework and its exercises
  const { data: framework, isLoading: frameworkLoading } = useQuery({
    queryKey: [`/api/frameworks/${frameworkId}`],
    queryFn: () => getFramework(frameworkId),
  });

  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: [`/api/frameworks/${frameworkId}/exercises`],
    queryFn: () => getFrameworkExercises(frameworkId),
    enabled: !!frameworkId,
  });

  // Loading state
  if (frameworkLoading || exercisesLoading) {
    return (
      <Layout>
        <div className={`native-scroll pb-4 ${isNative ? "px-4" : ""}`}>
          {!isNative && (
            <div className="flex items-center mb-4 py-2">
              <Skeleton className="h-9 w-9 rounded-full mr-2" />
              <Skeleton className="h-7 w-48" />
            </div>
          )}
          
          <Skeleton className="h-5 w-full mb-4" />
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`native-scroll pb-8 ${isNative ? "px-4" : ""}`}>
        {/* Page Header - Only show for non-native */}
        {!isNative && (
          <div className="flex items-center mb-4 py-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2 h-9 w-9 rounded-full text-[#3b82f6]" 
              onClick={() => navigate('/exercises-frameworks')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="mobile-h1 text-[#0f172a]">{framework?.name}</h1>
          </div>
        )}
        
        <div className="mb-5">
          <p className="text-sm text-[#64748b]">
            Apply {framework?.name} to real-world business scenarios and practice your problem-solving skills.
          </p>
        </div>
        
        {exercises && exercises.length > 0 ? (
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        ) : (
          <div className="native-empty-state mt-8">
            <div className="native-empty-state-icon">
              <Info className="h-8 w-8" />
            </div>
            <h2 className="native-empty-state-title">No Exercises Available</h2>
            <p className="native-empty-state-description">
              There are currently no exercises available for this framework.
            </p>
            <Button 
              className="native-button-secondary text-sm py-2.5 flex justify-center items-center"
              onClick={() => navigate('/exercises-frameworks')}
            >
              Browse Other Frameworks
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
}

function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [_, navigate] = useLocation();
  
  const getDifficultyBadgeClass = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "badge-green";
      case "intermediate":
        return "badge-blue";
      case "advanced":
        return "badge-purple";
      case "expert":
        return "badge-red";
      default:
        return "badge-blue";
    }
  };

  return (
    <Card className="native-card touch-feedback overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="card-title text-[#0f172a] text-lg font-medium">
            {exercise.title}
          </CardTitle>
          <Badge variant="outline" className={getDifficultyBadgeClass(exercise.difficulty)}>
            {exercise.difficulty}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 text-sm mt-1">
          {exercise.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 pb-2">
        <div className="text-sm text-[#64748b] mb-3 line-clamp-2">
          {exercise.scenario.substring(0, 120)}...
        </div>
        
        <div className="flex items-center text-xs text-[#64748b]">
          <Clock className="h-3 w-3 mr-1" />
          <span>Estimated time: {exercise.estimatedTime} minutes</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          className="native-button text-sm py-2.5 w-full flex justify-center items-center"
          onClick={() => navigate(`/exercise/${exercise.id}`)}
        >
          Start Exercise
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}