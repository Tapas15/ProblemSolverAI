import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getExercise, submitExerciseSolution, getUserExerciseSubmissions, deleteExerciseSubmission } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Send as SendIcon,
  CheckCircle, 
  Clock, 
  BookOpen, 
  HelpCircle, 
  ListChecks, 
  RefreshCw, 
  Trash2,
  Brain
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/main-layout";
import { MobileAppLayout } from "@/components/layout/mobile-app-layout";
import { isNativePlatform } from "@/lib/capacitor";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ExerciseDetailPage() {
  const [, params] = useRoute("/exercise/:exerciseId");
  const exerciseId = params?.exerciseId ? parseInt(params.exerciseId) : undefined;
  const [, setLocation] = useLocation();
  const [solution, setSolution] = useState("");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("description");
  const { user } = useAuth();
  const [practiceMode, setPracticeMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch exercise
  const { data: exercise, isLoading: exerciseLoading } = useQuery({
    queryKey: [`/api/exercises/${exerciseId}`],
    queryFn: () => getExercise(exerciseId!),
    enabled: !!exerciseId,
  });

  // Fetch user submissions for this exercise
  const { data: userSubmissions, isLoading: submissionsLoading } = useQuery({
    queryKey: [`/api/exercises/${exerciseId}/submissions/user`],
    queryFn: () => getUserExerciseSubmissions(),
    enabled: !!exerciseId,
  });

  // Filter submissions for this specific exercise
  const exerciseSubmissions = userSubmissions?.filter(
    (submission) => submission.exerciseId === exerciseId
  );

  // Check if user has already submitted a solution
  const hasSubmission = exerciseSubmissions && exerciseSubmissions.length > 0;
  const hasSubmitted = hasSubmission && !practiceMode;
  const latestSubmission = hasSubmission ? exerciseSubmissions[0] : null;

  // Handle practice mode toggle
  const togglePracticeMode = () => {
    setPracticeMode(!practiceMode);
    if (!practiceMode) {
      setSolution("");
      toast({
        title: "Practice Mode Enabled",
        description: "You can now practice this exercise again.",
      });
    } else {
      toast({
        title: "Practice Mode Disabled",
        description: "Your previous submission is visible again.",
      });
    }
  };

  // Submit solution mutation
  const submitMutation = useMutation({
    mutationFn: ({ exerciseId, solution }: { exerciseId: number; solution: string }) =>
      submitExerciseSolution(exerciseId, solution),
    onSuccess: () => {
      toast({
        title: "Solution submitted",
        description: "Your solution has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/exercises/${exerciseId}/submissions/user`] });
      setPracticeMode(false);
      setActiveTab("solution");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete submission mutation
  const deleteMutation = useMutation({
    mutationFn: (submissionId: number) => deleteExerciseSubmission(submissionId),
    onSuccess: () => {
      toast({
        title: "Submission deleted",
        description: "Your solution has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/exercises/${exerciseId}/submissions/user`] });
      setPracticeMode(false);
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  // Handle submission deletion
  const handleDeleteSubmission = () => {
    if (latestSubmission?.id) {
      deleteMutation.mutate(latestSubmission.id);
    }
  };

  // Handle submission
  const handleSubmit = () => {
    if (!solution.trim()) {
      toast({
        title: "Error",
        description: "Please enter your solution before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Turn off practice mode when submitting
    if (practiceMode) {
      setPracticeMode(false);
    }
    
    submitMutation.mutate({ exerciseId: exerciseId!, solution });
  };

  // State for native platform detection
  const [isNative, setIsNative] = useState(false);
  
  // Check if running on native platform
  useEffect(() => {
    setIsNative(isNativePlatform());
  }, []);
  
  const Layout = isNative ? MobileAppLayout : MainLayout;

  if (!exerciseId) {
    return (
      <Layout>
        <div className={isNative ? "p-4" : "container mx-auto"}>
          <h1 className={isNative ? "text-xl font-bold mb-4" : "text-3xl font-bold mb-6"}>Exercise Not Found</h1>
          <p>The requested exercise could not be found.</p>
          <Button 
            className="mt-4" 
            onClick={() => setLocation("/exercises")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exercises
          </Button>
        </div>
      </Layout>
    );
  }

  // Loading state
  if (exerciseLoading || submissionsLoading) {
    return (
      <Layout>
        <div className={isNative ? "p-4" : "container mx-auto"}>
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-5 w-full mb-3" />
          <Skeleton className="h-40 w-full rounded-lg mb-4" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </Layout>
    );
  }

  if (!exercise) {
    return (
      <Layout>
        <div className={isNative ? "p-4" : "container mx-auto"}>
          <h1 className={isNative ? "text-xl font-bold mb-4" : "text-3xl font-bold mb-6"}>Exercise Not Found</h1>
          <p>The requested exercise could not be found.</p>
          <Button 
            className="mt-4" 
            onClick={() => setLocation("/exercises")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exercises
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={isNative ? "p-4" : "container mx-auto"}>
        <div className={isNative ? "space-y-3 mb-4" : "flex flex-col lg:flex-row lg:items-center justify-between mb-6"}>
          {isNative ? (
            <>
              <div className="flex justify-between items-start">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-2 h-8 -ml-2"
                  onClick={() => setLocation(`/exercises/${exercise.frameworkId}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> 
                  <span className="text-sm">Back</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex items-center text-xs py-0 h-5">
                    <Clock className="mr-1 h-3 w-3" />
                    {exercise.estimatedTime}m
                  </Badge>
                  <Badge className={`${getDifficultyBadgeClass(exercise.difficulty)} text-xs py-0 h-5`}>
                    {exercise.difficulty}
                  </Badge>
                </div>
              </div>
              <h1 className="text-xl font-bold leading-tight">{exercise.title}</h1>
            </>
          ) : (
            <>
              <div className="flex items-center mb-4 lg:mb-0">
                <Link href={`/exercises/${exercise.frameworkId}`}>
                  <Button variant="ghost" size="sm" className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Exercises
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold">{exercise.title}</h1>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {exercise.estimatedTime} minutes
                </Badge>
                <Badge className={getDifficultyBadgeClass(exercise.difficulty)}>
                  {exercise.difficulty}
                </Badge>
              </div>
            </>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid grid-cols-4 ${isNative ? 'mb-4' : 'mb-8'}`}>
            {isNative ? (
              <>
                <TabsTrigger value="description" className="flex flex-col items-center justify-center py-1 px-1 text-xs h-16">
                  <BookOpen className="h-5 w-5 mb-1" /> 
                  <span>Desc</span>
                </TabsTrigger>
                <TabsTrigger value="steps" className="flex flex-col items-center justify-center py-1 px-1 text-xs h-16">
                  <ListChecks className="h-5 w-5 mb-1" /> 
                  <span>Steps</span>
                </TabsTrigger>
                <TabsTrigger value="solution" className="flex flex-col items-center justify-center py-1 px-1 text-xs h-16">
                  <CheckCircle className="h-5 w-5 mb-1" /> 
                  <span>Solution</span>
                </TabsTrigger>
                <TabsTrigger value="help" className="flex flex-col items-center justify-center py-1 px-1 text-xs h-16">
                  <HelpCircle className="h-5 w-5 mb-1" /> 
                  <span>Help</span>
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="description" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" /> Description
                </TabsTrigger>
                <TabsTrigger value="steps" className="flex items-center">
                  <ListChecks className="mr-2 h-4 w-4" /> Steps
                </TabsTrigger>
                <TabsTrigger value="solution" className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" /> Your Solution
                </TabsTrigger>
                <TabsTrigger value="help" className="flex items-center">
                  <HelpCircle className="mr-2 h-4 w-4" /> Help
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="description">
            <Card className={isNative ? "border-0 shadow-sm" : ""}>
              <CardHeader className={isNative ? "px-3 py-3" : ""}>
                <CardTitle className={isNative ? "text-lg" : ""}>Exercise Description</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
              <CardContent className={isNative ? "px-3 pb-3" : ""}>
                <div className={`prose max-w-none dark:prose-invert ${isNative ? "text-sm" : ""}`}>
                  <h3 className={isNative ? "text-base font-semibold mb-2" : "text-xl font-semibold mb-4"}>Scenario</h3>
                  <div className={isNative ? "mb-4 whitespace-pre-line" : "mb-6 whitespace-pre-line"}>{exercise.scenario}</div>
                  
                  {exercise.resources && (
                    <>
                      <h3 className={isNative ? "text-base font-semibold mb-2" : "text-xl font-semibold mb-4"}>Resources</h3>
                      <div className="whitespace-pre-line">{exercise.resources}</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="steps">
            <Card>
              <CardHeader>
                <CardTitle>Steps to Solve</CardTitle>
                <CardDescription>Follow these steps to complete the exercise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert whitespace-pre-line">
                  {exercise.steps.split('\n').map((step, index) => (
                    <div key={index} className="mb-4 flex">
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>{step.trim()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solution">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Your Solution</span>
                  {hasSubmission && (
                    <div className="flex gap-2">
                      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete your submission? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteSubmission}
                              disabled={deleteMutation.isPending}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {deleteMutation.isPending ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={togglePracticeMode}
                        className="flex items-center"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {practiceMode ? "View My Submission" : "Practice Again"}
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  {practiceMode 
                    ? "Practice mode - your solution won't be saved" 
                    : "Submit your solution to the exercise"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasSubmitted ? (
                  <div className="space-y-6">
                    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle>Solution Submitted</AlertTitle>
                      <AlertDescription>
                        You have already submitted a solution for this exercise.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="prose max-w-none dark:prose-invert">
                      <h3 className="text-xl font-semibold mb-3">Your Submission</h3>
                      <div className="bg-muted p-4 rounded-md whitespace-pre-line">
                        {latestSubmission?.solution}
                      </div>
                      
                      {exercise.sampleSolution && (
                        <>
                          <h3 className="text-xl font-semibold mt-6 mb-3">Original Solution</h3>
                          <div className="bg-muted p-4 rounded-md whitespace-pre-line">
                            {exercise.sampleSolution}
                          </div>
                        </>
                      )}
                      
                      {latestSubmission?.feedback && (
                        <>
                          <h3 className="text-xl font-semibold mt-6 mb-3">Feedback</h3>
                          <div className="bg-muted p-4 rounded-md whitespace-pre-line">
                            {latestSubmission.feedback}
                          </div>
                        </>
                      )}
                      
                      {latestSubmission?.score !== null && (
                        <div className="mt-6 flex items-center">
                          <span className="text-lg font-medium mr-2">Score:</span>
                          <Badge variant="outline" className="text-lg">
                            {latestSubmission?.score}/10
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {practiceMode && exerciseSubmissions && exerciseSubmissions.length > 0 && (
                      <Alert className="mb-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        <AlertTitle>Practice Mode Active</AlertTitle> 
                        <AlertDescription>
                          Practice mode - submit to override your previous solution.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter your solution below. Be thorough and apply the framework principles.
                    </p>
                    
                    <Textarea
                      placeholder="Type your solution here..."
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="min-h-[200px]"
                    />
                    
                    <Button 
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending}
                      className="w-full"
                    >
                      {submitMutation.isPending ? (
                        <>Submitting...</>
                      ) : practiceMode ? (
                        <>
                          <SendIcon className="mr-2 h-4 w-4" /> Submit & Override Previous Solution
                        </>
                      ) : (
                        <>
                          <SendIcon className="mr-2 h-4 w-4" /> Submit Solution
                        </>
                      )}
                    </Button>
                    
                    {practiceMode && (
                      <div className="flex justify-center pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={togglePracticeMode}
                        >
                          Exit Practice Mode
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle>Guidance & Tips</CardTitle>
                <CardDescription>
                  Need help? Here are some hints to get you started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  {exercise.sampleSolution ? (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold mb-4">Sample Solution Approach</h3>
                      <div className="whitespace-pre-line">
                        {exercise.sampleSolution}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold mb-4">Tips for Success</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Carefully analyze the problem statement and identify the key issues.</li>
                        <li>Apply the framework methodology step by step.</li>
                        <li>Consider multiple perspectives and stakeholders.</li>
                        <li>Provide concrete recommendations, not just analysis.</li>
                        <li>Structure your answer logically with clear sections.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function getDifficultyBadgeClass(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "intermediate":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "advanced":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "expert":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
}