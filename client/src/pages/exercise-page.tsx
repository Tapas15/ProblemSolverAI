import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Exercise, Framework } from "@shared/schema";
import { getFramework, getFrameworkExercises } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Info } from "lucide-react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExercisePage() {
  const [, params] = useRoute("/exercises/:frameworkId");
  const frameworkId = params?.frameworkId ? parseInt(params.frameworkId) : undefined;

  // Redirect if no frameworkId
  if (!frameworkId) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Exercises</h1>
        <p>Please select a framework to view its exercises.</p>
        <Link href="/">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>
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
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-2/3 mb-6" />
        <Skeleton className="h-6 w-full mb-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{framework?.name} Exercises</h1>
      </div>
      
      <p className="text-lg text-muted-foreground mb-8">
        Apply {framework?.name} to real-world business scenarios and practice your problem-solving skills.
      </p>
      
      <Separator className="my-8" />
      
      {exercises && exercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No exercises available</h3>
          <p className="text-muted-foreground">
            There are currently no exercises available for this framework.
          </p>
        </div>
      )}
    </div>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
}

function ExerciseCard({ exercise }: ExerciseCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{exercise.title}</CardTitle>
          <Badge className={getDifficultyColor(exercise.difficulty)}>
            {exercise.difficulty}
          </Badge>
        </div>
        <CardDescription>{exercise.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Clock className="mr-2 h-4 w-4" />
          <span>Estimated time: {exercise.estimatedTime} minutes</span>
        </div>
        <p className="text-sm line-clamp-3">
          {exercise.scenario.substring(0, 150)}...
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/exercise/${exercise.id}`}>
          <Button className="w-full">Start Exercise</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}