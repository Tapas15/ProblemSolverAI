import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getExercise, submitExerciseSolution, getUserExerciseSubmissions } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, SendIcon, CheckCircle, Clock, BookOpen, HelpCircle, ListChecks, Users, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket, WebSocketStatus } from "@/hooks/use-websocket";
import { Input } from "@/components/ui/input";

export default function ExerciseDetailPage() {
  const [, params] = useRoute("/exercise/:exerciseId");
  const exerciseId = params?.exerciseId ? parseInt(params.exerciseId) : undefined;
  const [, setLocation] = useLocation();
  const [solution, setSolution] = useState("");
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("description");
  const { user } = useAuth();
  const [isSolutionUpdated, setIsSolutionUpdated] = useState(false);

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
  const hasSubmitted = exerciseSubmissions && exerciseSubmissions.length > 0;
  const latestSubmission = hasSubmitted ? exerciseSubmissions[0] : null;
  
  // Connect to WebSocket for real-time collaboration if user is logged in
  const { status: wsStatus, messages, activeUsers, updateSolution, addComment } = useWebSocket(
    exerciseId || 0,
    user?.id || 0,
    user?.username || 'Anonymous',
    {
      onOpen: () => {
        toast({
          title: "Collaboration active",
          description: "You are now connected to the collaboration server."
        });
      },
      onClose: () => {
        toast({
          title: "Collaboration ended",
          description: "You have been disconnected from the collaboration server."
        });
      }
    }
  );
  
  // Handle when a user is typing their solution
  useEffect(() => {
    if (!isSolutionUpdated && solution && !hasSubmitted) {
      // Debounce to avoid sending too many updates
      const timeout = setTimeout(() => {
        updateSolution(solution);
        setIsSolutionUpdated(true);
        
        // Reset flag after some time
        setTimeout(() => {
          setIsSolutionUpdated(false);
        }, 3000);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [solution, updateSolution, hasSubmitted, isSolutionUpdated]);
  
  // Handle posting a comment
  const handleCommentSubmit = () => {
    if (!comment.trim()) return;
    
    const success = addComment(comment);
    if (success) {
      setComment("");
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

    submitMutation.mutate({ exerciseId: exerciseId!, solution });
  };

  if (!exerciseId) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Exercise Not Found</h1>
        <p>The requested exercise could not be found.</p>
        <Link href="/exercises">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exercises
          </Button>
        </Link>
      </div>
    );
  }

  // Loading state
  if (exerciseLoading || submissionsLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-2/3 mb-6" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-64 w-full rounded-lg mb-8" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Exercise Not Found</h1>
        <p>The requested exercise could not be found.</p>
        <Link href="/exercises">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exercises
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
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
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4 w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid grid-cols-5 mb-8">
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
              <TabsTrigger value="collaborate" className="flex items-center">
                <Users className="mr-2 h-4 w-4" /> Collaborate
                {activeUsers.length > 1 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeUsers.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Connection status indicator */}
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              wsStatus === 'open' 
                ? 'bg-green-500' 
                : wsStatus === 'connecting' 
                  ? 'bg-yellow-500 animate-pulse' 
                  : 'bg-red-500'
            }`} />
            <span className="text-sm text-muted-foreground">
              {wsStatus === 'open' 
                ? 'Connected' 
                : wsStatus === 'connecting' 
                  ? 'Connecting...' 
                  : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

        <TabsContent value="description">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Description</CardTitle>
              <CardDescription>{exercise.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                <h3 className="text-xl font-semibold mb-4">Scenario</h3>
                <div className="mb-6 whitespace-pre-line">{exercise.scenario}</div>
                
                {exercise.resources && (
                  <>
                    <h3 className="text-xl font-semibold mb-4">Resources</h3>
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
              <CardTitle>Your Solution</CardTitle>
              <CardDescription>
                Submit your solution to the exercise
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
                          {latestSubmission.score}/10
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
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
                    ) : (
                      <>
                        <SendIcon className="mr-2 h-4 w-4" /> Submit Solution
                      </>
                    )}
                  </Button>
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

        <TabsContent value="collaborate">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Collaboration</CardTitle>
              <CardDescription>
                Work on this exercise with your peers in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active users panel */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-2">Active Users ({activeUsers.length})</h3>
                  <div className="border rounded p-4 min-h-[200px] bg-muted/30">
                    {activeUsers.length > 0 ? (
                      <ul className="space-y-2">
                        {activeUsers.map((user, index) => (
                          <li key={index} className="flex items-center p-2 rounded hover:bg-muted">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span>{user.username}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center pt-6">
                        No active users
                      </p>
                    )}
                  </div>
                </div>

                {/* Activity feed panel */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Activity Feed</h3>
                  <div className="border rounded p-4 h-[300px] overflow-y-auto bg-muted/30">
                    {messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((msg, index) => (
                          <div key={index} className="flex flex-col space-y-1 px-3 py-2 rounded bg-muted/50">
                            <div className="flex items-center">
                              <span className="font-medium mr-2">{msg.username}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            
                            {msg.type === 'user-joined' && (
                              <p className="text-green-600 dark:text-green-400 text-sm">
                                User joined the collaboration
                              </p>
                            )}
                            
                            {msg.type === 'user-left' && (
                              <p className="text-orange-600 dark:text-orange-400 text-sm">
                                User left the collaboration
                              </p>
                            )}
                            
                            {msg.type === 'solution-updated' && (
                              <p className="text-blue-600 dark:text-blue-400 text-sm">
                                Updated their solution
                              </p>
                            )}
                            
                            {msg.type === 'new-comment' && (
                              <div className="mt-1 text-sm bg-background p-2 rounded">
                                {msg.comment}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center pt-6">
                        No activity yet
                      </p>
                    )}
                  </div>
                  
                  {/* Comment input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleCommentSubmit();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleCommentSubmit}
                      disabled={!comment.trim()}
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
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