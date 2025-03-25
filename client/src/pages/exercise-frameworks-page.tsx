import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Framework } from "@shared/schema";
import { getFrameworks } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  ChevronRight, 
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
import MainLayout from "@/components/layout/main-layout";

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
    'MECE': <Boxes className="h-12 w-12 text-white drop-shadow-lg" />,
    'Design Thinking': <Lightbulb className="h-12 w-12 text-white drop-shadow-lg" />,
    'SWOT Analysis': <Layers className="h-12 w-12 text-white drop-shadow-lg" />,
    'First Principles Thinking': <TreePine className="h-12 w-12 text-white drop-shadow-lg" />,
    'Porter\'s Five Forces': <Network className="h-12 w-12 text-white drop-shadow-lg" />,
    'Jobs-To-Be-Done': <Target className="h-12 w-12 text-white drop-shadow-lg" />,
    'Blue Ocean Strategy': <Compass className="h-12 w-12 text-white drop-shadow-lg" />,
    'SCAMPER': <Workflow className="h-12 w-12 text-white drop-shadow-lg" />,
    'Problem-Tree Analysis': <ScanSearch className="h-12 w-12 text-white drop-shadow-lg" />,
    'Pareto Principle': <Gauge className="h-12 w-12 text-white drop-shadow-lg" />
  };
  
  // Try to find an exact match, or use a fallback based on ID
  return iconMap[name] || iconMap[Object.keys(iconMap)[id % Object.keys(iconMap).length]] || <BookOpen className="h-12 w-12 text-white drop-shadow-lg" />;
}

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
    <Card className="framework-card h-full flex flex-col hover:shadow-lg transition-all duration-300">
      {/* Visual header area with dynamic gradient and icon */}
      <div className="h-48 relative rounded-t-lg overflow-hidden">
        {/* Dynamic gradient background */}
        <div 
          className="absolute inset-0 transition-all duration-700 ease-in-out" 
          style={{
            background: getFrameworkGradient(framework.id),
          }}
        />
        
        {/* Floating abstract shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full mix-blend-overlay animate-float"
              style={{
                width: `${40 + (framework.id * 5 + i * 15) % 60}px`,
                height: `${40 + (framework.id * 5 + i * 15) % 60}px`,
                background: `rgba(255, 255, 255, ${0.4 - i * 0.1})`,
                left: `${(framework.id * 13 + i * 30) % 80}%`,
                top: `${(framework.id * 17 + i * 25) % 80}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i}s`
              }}
            />
          ))}
        </div>
        
        {/* Framework icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {getFrameworkIcon(framework.name, framework.id)}
        </div>
        
        {/* Shine effect */}
        <div className="shine"></div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">{framework.name}</CardTitle>
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
          <Button className="w-full group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
            View Exercises
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}