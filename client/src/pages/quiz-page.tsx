import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Quiz, Framework } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronLeft, Clock, Award, BarChart } from "lucide-react";
import { getQuizzesByFramework, getFramework } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export default function QuizPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const [activeTab, setActiveTab] = useState<string>("beginner");
  
  const frameworkIdNum = parseInt(frameworkId);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);
  
  // Get framework details
  const {
    data: framework,
    isLoading: isLoadingFramework,
    error: frameworkError
  } = useQuery({
    queryKey: ["/api/frameworks", frameworkIdNum],
    queryFn: () => getFramework(frameworkIdNum),
    enabled: !!frameworkIdNum && !isNaN(frameworkIdNum)
  });
  
  // Get quizzes for the framework
  const {
    data: quizzes,
    isLoading: isLoadingQuizzes,
    error: quizzesError
  } = useQuery({
    queryKey: ["/api/quizzes/framework", frameworkIdNum, activeTab],
    queryFn: () => getQuizzesByFramework(frameworkIdNum, activeTab),
    enabled: !!frameworkIdNum && !isNaN(frameworkIdNum)
  });
  
  const isLoading = isLoadingFramework || isLoadingQuizzes;
  const error = frameworkError || quizzesError;
  
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
        <div className="text-destructive mb-4">Error loading quizzes</div>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to home
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4" 
          onClick={() => navigate("/")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Frameworks
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{framework?.name} Quizzes</h1>
          <p className="text-muted-foreground">
            Test your knowledge on different aspects of {framework?.name}
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="beginner" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        {["beginner", "intermediate", "advanced"].map(level => (
          <TabsContent key={level} value={level} className="space-y-4">
            {!quizzes || quizzes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center p-6">
                    <p>No {level} quizzes available for this framework yet.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              quizzes.map((quiz: Quiz) => (
                <QuizCard 
                  key={quiz.id} 
                  quiz={quiz} 
                  onStart={() => navigate(`/quiz/${frameworkId}/${quiz.id}`)} 
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface QuizCardProps {
  quiz: Quiz;
  onStart: () => void;
}

function QuizCard({ quiz, onStart }: QuizCardProps) {
  const numQuestions = JSON.parse(quiz.questions).length || 0;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
          </div>
          <Badge variant="outline" className={getLevelBadgeColor(quiz.level)}>
            {quiz.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Award className="mr-1 h-4 w-4" />
            <span>Pass Score: {quiz.passingScore || 70}%</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span>Time Limit: {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No limit'}</span>
          </div>
          <div className="flex items-center">
            <BarChart className="mr-1 h-4 w-4" />
            <span>{numQuestions} Questions</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onStart} className="w-full">Start Quiz</Button>
      </CardFooter>
    </Card>
  );
}

function getLevelBadgeColor(level: string): string {
  switch (level.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    case "intermediate":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    case "advanced":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
    default:
      return "";
  }
}