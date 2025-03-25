import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown, 
  Minus,
  Calendar,
  Clock
} from "lucide-react";
import type { QuizAttempt } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

type QuizHistoryProps = {
  attempts: QuizAttempt[];
  quizId?: number;
  frameworkId?: number;
};

export default function QuizHistory({ attempts, quizId, frameworkId }: QuizHistoryProps) {
  const [expandedAttempt, setExpandedAttempt] = useState<number | null>(null);
  
  // Filter attempts for this quiz if quizId is provided
  const filteredAttempts = quizId 
    ? attempts.filter(attempt => attempt.quizId === quizId)
    : attempts;
  
  // Sort attempts by completion date, newest first
  const sortedAttempts = [...filteredAttempts].sort((a, b) => {
    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
  });
  
  // Calculate performance trends
  const getPerformanceTrend = (currentIndex: number) => {
    if (currentIndex >= sortedAttempts.length - 1) return 'neutral'; // First attempt has no trend
    
    const currentScore = sortedAttempts[currentIndex].score;
    const previousScore = sortedAttempts[currentIndex + 1].score;
    
    if (currentScore > previousScore) return 'improved';
    if (currentScore < previousScore) return 'declined';
    return 'neutral';
  };
  
  // Calculate improvement percentage
  const getImprovementPercentage = (currentIndex: number) => {
    if (currentIndex >= sortedAttempts.length - 1) return 0;
    
    const currentScore = sortedAttempts[currentIndex].score;
    const previousScore = sortedAttempts[currentIndex + 1].score;
    
    return Math.round(((currentScore - previousScore) / previousScore) * 100);
  };
  
  // Generate performance feedback and recommendations
  const getPerformanceFeedback = (attempt: QuizAttempt, index: number) => {
    const trend = getPerformanceTrend(index);
    const improvementPercent = getImprovementPercentage(index);
    
    // General feedback based on score
    let feedback = '';
    let recommendations = '';
    
    if (attempt.score >= 90) {
      feedback = "Excellent work! You've demonstrated mastery of this material.";
      recommendations = "Consider exploring advanced topics or helping others learn this material.";
    } else if (attempt.score >= 80) {
      feedback = "Great job! You have a strong understanding of the concepts.";
      recommendations = "Review the few questions you missed to achieve complete mastery.";
    } else if (attempt.score >= 70) {
      feedback = "Good work! You've met the passing threshold.";
      recommendations = "Focus on reviewing the specific topics you missed to improve your score.";
    } else if (attempt.score >= 60) {
      feedback = "You're on the right track, but need more practice.";
      recommendations = "Review the module content again and take notes on key concepts.";
    } else {
      feedback = "This material needs more attention.";
      recommendations = "Consider revisiting the entire module before attempting the quiz again.";
    }
    
    // Add trend-specific feedback
    if (trend === 'improved' && improvementPercent > 0) {
      feedback += ` You've improved by ${improvementPercent}% since your last attempt!`;
    } else if (trend === 'declined' && improvementPercent < 0) {
      recommendations += ` Try a different study approach than your previous attempt.`;
    }
    
    return { feedback, recommendations };
  };
  
  const toggleAttempt = (id: number) => {
    setExpandedAttempt(expandedAttempt === id ? null : id);
  };
  
  if (!sortedAttempts.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Quiz Attempts</CardTitle>
          <CardDescription>You haven't taken any quizzes yet.</CardDescription>
        </CardHeader>
        <CardContent>
          {frameworkId && (
            <Button>
              Take Your First Quiz
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Attempts</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 pt-4">
          {sortedAttempts.map((attempt, index) => {
            const { feedback, recommendations } = getPerformanceFeedback(attempt, index);
            const trend = getPerformanceTrend(index);
            const isExpanded = expandedAttempt === attempt.id;
            
            return (
              <Card key={attempt.id} className="overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                  onClick={() => toggleAttempt(attempt.id)}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 p-2 rounded-full mr-3 ${
                      attempt.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {attempt.passed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-medium">Quiz Attempt #{attempt.id}</h3>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(attempt.completedAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="text-right mr-3">
                      <div className="font-semibold">{attempt.score}%</div>
                      <Badge className={attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
                
                {isExpanded && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex justify-between">
                          <span className="text-sm text-gray-500">Score</span>
                          <span className="text-sm font-medium">{attempt.score}%</span>
                        </div>
                        <Progress value={attempt.score} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-gray-500 mb-1">Time Taken</div>
                          <div className="font-medium flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                          </div>
                        </div>
                        
                        {index < sortedAttempts.length - 1 && (
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-gray-500 mb-1">vs. Previous</div>
                            <div className="font-medium flex items-center">
                              {trend === 'improved' ? (
                                <>
                                  <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-500" />
                                  <span className="text-green-600">+{getImprovementPercentage(index)}%</span>
                                </>
                              ) : trend === 'declined' ? (
                                <>
                                  <ArrowDownRight className="h-3.5 w-3.5 mr-1 text-red-500" />
                                  <span className="text-red-600">{getImprovementPercentage(index)}%</span>
                                </>
                              ) : (
                                <>
                                  <Minus className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                  <span>No change</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-2">Feedback & Recommendations</h4>
                        <p className="text-sm text-blue-700 mb-2">{feedback}</p>
                        <p className="text-sm text-blue-700">{recommendations}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Your score progression over time</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedAttempts.length > 1 ? (
                <div className="space-y-6">
                  <div className="h-[200px] w-full relative">
                    {/* Simple chart visualization */}
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"></div>
                    <div className="absolute left-0 bottom-0 top-0 w-[1px] bg-gray-200"></div>
                    
                    <div className="flex items-end justify-between h-full relative">
                      {[...sortedAttempts].reverse().map((attempt, i) => {
                        const height = `${attempt.score}%`;
                        const isLast = i === sortedAttempts.length - 1;
                        const isImproved = i > 0 && attempt.score > sortedAttempts[sortedAttempts.length - i].score;
                        const isDeclined = i > 0 && attempt.score < sortedAttempts[sortedAttempts.length - i].score;
                        
                        return (
                          <div key={attempt.id} className="flex flex-col items-center" style={{ width: `${100 / sortedAttempts.length}%` }}>
                            <div className="text-xs mb-1">{attempt.score}%</div>
                            <div 
                              className={`w-8 ${isImproved ? 'bg-green-400' : isDeclined ? 'bg-red-400' : 'bg-blue-400'}`} 
                              style={{ height }}
                            ></div>
                            <div className="text-xs mt-1">Attempt {sortedAttempts.length - i}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Performance Summary</h4>
                    {sortedAttempts[0].score > sortedAttempts[sortedAttempts.length - 1].score ? (
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        <span>Your performance has improved over time!</span>
                      </div>
                    ) : sortedAttempts[0].score < sortedAttempts[sortedAttempts.length - 1].score ? (
                      <div className="flex items-center text-red-600">
                        <TrendingDown className="h-4 w-4 mr-2" />
                        <span>Your performance has declined. Review the material again.</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-blue-600">
                        <Minus className="h-4 w-4 mr-2" />
                        <span>Your performance has remained consistent.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Take at least two quizzes to see performance trends</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Learning Recommendations</CardTitle>
              <CardDescription>Personalized suggestions based on your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedAttempts.length > 0 && (
                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium mb-2">Based on your latest attempt ({sortedAttempts[0].score}%)</h4>
                    <p className="text-gray-600 mb-4">{getPerformanceFeedback(sortedAttempts[0], 0).recommendations}</p>
                    
                    {sortedAttempts[0].score < 80 && (
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-blue-500 mr-2">•</span>
                          <span>Review the module content, especially focusing on difficult concepts</span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-blue-500 mr-2">•</span>
                          <span>Take notes and create summaries of key points</span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-blue-500 mr-2">•</span>
                          <span>Use the AI assistant to ask targeted questions about concepts you find challenging</span>
                        </li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}