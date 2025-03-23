import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuiz, submitQuizAttempt } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ChevronLeft, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type Question = {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
};

export default function TakeQuizPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { frameworkId, quizId } = useParams<{ frameworkId: string; quizId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  
  const frameworkIdNum = parseInt(frameworkId);
  const quizIdNum = parseInt(quizId);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);
  
  // Get quiz details
  const {
    data: quiz,
    isLoading,
    error
  } = useQuery({
    queryKey: ["/api/quizzes", quizIdNum],
    queryFn: () => getQuiz(quizIdNum),
    enabled: !!quizIdNum && !isNaN(quizIdNum)
  });
  
  // Parse questions when quiz is loaded
  const [questions, setQuestions] = useState<Question[]>([]);
  
  useEffect(() => {
    if (quiz) {
      try {
        const parsedQuestions = JSON.parse(quiz.questions);
        setQuestions(parsedQuestions);
        
        // Initialize timer if there's a time limit
        if (quiz.timeLimit) {
          setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
        }
        
        // Record start time
        setStartTime(new Date());
      } catch (e) {
        console.error("Error parsing quiz questions:", e);
        toast({
          title: "Error",
          description: "Could not parse quiz questions",
          variant: "destructive"
        });
      }
    }
  }, [quiz, toast]);
  
  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || quizCompleted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          // Auto-submit quiz when time is up
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, quizCompleted]);
  
  // Format time remaining as mm:ss
  const formatTimeRemaining = () => {
    if (timeRemaining === null) return "--:--";
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  
  // Calculate time taken in seconds
  const calculateTimeTaken = (): number => {
    if (!startTime) return 0;
    const endTime = new Date();
    return Math.round((endTime.getTime() - startTime.getTime()) / 1000);
  };
  
  // Handle quiz submission
  const submitQuizMutation = useMutation({
    mutationFn: (data: {
      quizId: number;
      answers: string;
      score: number;
      maxScore: number;
      timeTaken?: number;
    }) => submitQuizAttempt(
      data.quizId,
      data.answers,
      data.score,
      data.maxScore,
      data.timeTaken
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-attempts/user"] });
      toast({
        title: "Quiz submitted",
        description: "Your answers have been recorded."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const submitQuiz = () => {
    if (!quiz || !questions.length) return;
    
    const timeTaken = calculateTimeTaken();
    
    // Calculate score
    let correctAnswers = 0;
    const answers = [];
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const selectedAnswer = selectedAnswers[question.id] !== undefined ? selectedAnswers[question.id] : -1;
      
      answers.push({
        questionId: question.id,
        selectedOption: selectedAnswer,
        correct: selectedAnswer === question.correctAnswer
      });
      
      if (selectedAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    }
    
    const scoreValue = Math.round((correctAnswers / questions.length) * 100);
    setScore(scoreValue);
    
    // Submit quiz attempt
    submitQuizMutation.mutate({
      quizId: quizIdNum,
      answers: JSON.stringify(answers),
      score: scoreValue,
      maxScore: 100, // max score is 100%
      timeTaken: timeTaken
    });
    
    setQuizCompleted(true);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Last question, submit quiz
      submitQuiz();
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
        <div className="text-destructive mb-4">Error loading quiz</div>
        <Button variant="outline" onClick={() => navigate(`/quizzes/${frameworkId}`)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to quizzes
        </Button>
      </div>
    );
  }
  
  // Display results if quiz is completed
  if (quizCompleted) {
    const passingScore = quiz.passingScore || 70;
    const passed = score >= passingScore;
    
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
              <CardDescription>{quiz.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4">
                {passed ? (
                  <div className="text-green-600 flex flex-col items-center">
                    <CheckCircle2 className="h-16 w-16 mb-2" />
                    <h2 className="text-2xl font-bold">Congratulations!</h2>
                    <p>You passed the quiz</p>
                  </div>
                ) : (
                  <div className="text-red-600 flex flex-col items-center">
                    <XCircle className="h-16 w-16 mb-2" />
                    <h2 className="text-2xl font-bold">Better luck next time!</h2>
                    <p>You didn't reach the passing score</p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Your Score</span>
                  <span className="font-semibold">{score}%</span>
                </div>
                <Progress value={score} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Passing Score</span>
                  <span className="font-semibold">{passingScore}%</span>
                </div>
                <Progress value={passingScore} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded">
                  <div className="text-muted-foreground">Time Taken</div>
                  <div className="font-medium">{Math.floor(calculateTimeTaken() / 60)}m {calculateTimeTaken() % 60}s</div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded">
                  <div className="text-muted-foreground">Correct Answers</div>
                  <div className="font-medium">{Math.round(score / 100 * questions.length)} of {questions.length}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(`/quizzes/${frameworkId}`)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to quizzes
              </Button>
              <Button onClick={() => navigate("/")}>
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  // Quiz in progress
  const question = questions[currentQuestion];
  
  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
        <div className="text-destructive mb-4">Error: No questions found</div>
        <Button variant="outline" onClick={() => navigate(`/quizzes/${frameworkId}`)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to quizzes
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>Question {currentQuestion + 1} of {questions.length}</CardDescription>
              </div>
              {timeRemaining !== null && (
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{formatTimeRemaining()}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={(currentQuestion + 1) / questions.length * 100} className="h-2" />
            
            <div className="font-medium text-lg">{question.text}</div>
            
            <RadioGroup 
              value={selectedAnswers[question.id]?.toString()} 
              onValueChange={(value) => handleSelectAnswer(question.id, parseInt(value))}
            >
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">{option}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button onClick={handleNextQuestion}>
              {currentQuestion < questions.length - 1 ? "Next" : "Submit"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}