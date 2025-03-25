import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Framework } from "@shared/schema";
import { getFrameworks } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import MainLayout from "@/components/layout/main-layout";

export default function ExerciseFrameworksPage() {
  // Fetch all frameworks
  const { data: frameworks, isLoading } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: getFrameworks,
  });

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Skeleton className="h-12 w-2/3 mb-6" />
          <Skeleton className="h-6 w-full mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Practice Exercises</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Apply business frameworks to real-world scenarios and practice your problem-solving skills.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frameworks?.map((framework) => (
            <FrameworkCard key={framework.id} framework={framework} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

interface FrameworkCardProps {
  framework: Framework;
}

function FrameworkCard({ framework }: FrameworkCardProps) {
  // Get a color based on the framework name (for visual variety)
  const getFrameworkColor = (id: number) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-rose-100 text-rose-800 border-rose-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-orange-100 text-orange-800 border-orange-200",
    ];
    return colors[(id - 1) % colors.length];
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200 border-t-4 hover:border-t-4" style={{ borderTopColor: `var(--${framework.id % 2 === 0 ? 'accent' : 'secondary'})` }}>
      {framework.image_url && (
        <div className="h-40 overflow-hidden rounded-t-lg">
          <img 
            src={framework.image_url} 
            alt={framework.name} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{framework.name}</CardTitle>
        <CardDescription className="line-clamp-2">{framework.description.substring(0, 100)}...</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Badge className={`mb-4 ${getFrameworkColor(framework.id)}`}>
          Exercises Available
        </Badge>
        <p className="text-sm line-clamp-3 text-muted-foreground">
          Practical scenarios to apply {framework.name} principles to real business challenges
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/exercises/${framework.id}`}>
          <Button className="w-full group">
            View Exercises
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}