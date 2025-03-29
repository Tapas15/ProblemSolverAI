import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the interface for QuizAttempt props
interface QuizAttempt {
  id: number;
  quizId: number;
  userId: number;
  score: number;
  maxScore: number;
  passed: boolean;
  completedAt: Date | string | null;
  answers?: string;
  timeTaken?: number;
  quizTitle?: string;
}

interface PerformanceLineChartProps {
  quizAttempts: QuizAttempt[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

export function PerformanceLineChart({ 
  quizAttempts, 
  isLoading = false,
  onRefresh
}: PerformanceLineChartProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<string>("all");

  // Handle refresh action
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        toast({
          title: "Data refreshed",
          description: "Performance data has been updated."
        });
      } catch (error) {
        toast({
          title: "Refresh failed",
          description: "Could not refresh performance data.",
          variant: "destructive"
        });
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // If no data or loading, show loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Quiz Performance Trends</CardTitle>
          <CardDescription>Your progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  // If no quiz attempts, show empty state
  if (!quizAttempts?.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Quiz Performance Trends</CardTitle>
          <CardDescription>Complete quizzes to see your performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
            <p className="text-gray-500">No quiz attempts yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Take some quizzes to see your performance trends here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to prepare data based on timeframe
  const prepareLineData = (attempts: QuizAttempt[], type: 'all' | 'byQuiz') => {
    // Sort attempts by completion date, oldest first
    const sortedAttempts = [...attempts].filter(a => a.completedAt).sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateA - dateB; // oldest first
    });

    if (type === 'all') {
      // Format data for line chart showing all attempts chronologically
      return sortedAttempts.map((attempt, index) => {
        // Calculate score percentage
        const scorePercentage = Math.round((attempt.score / attempt.maxScore) * 100);
        
        // Format the date
        const attemptDate = new Date(attempt.completedAt as Date);
        const formattedDate = attemptDate.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric' 
        });
        
        // Get quiz name/title if available or use ID
        const quizName = attempt.quizTitle || `Quiz #${attempt.quizId}`;
        
        return {
          name: formattedDate,
          score: scorePercentage,
          quiz: quizName,
          attemptNumber: index + 1,
          // Determine color based on score
          color: scorePercentage < 60 ? '#ef4444' : 
                 scorePercentage < 80 ? '#f59e0b' : 
                 '#22c55e'
        };
      });
    } else {
      // Group by quiz and show most recent attempt for each quiz
      const quizMap: Record<number, QuizAttempt[]> = {};
      
      // Group attempts by quiz ID
      sortedAttempts.forEach(attempt => {
        if (!quizMap[attempt.quizId]) {
          quizMap[attempt.quizId] = [];
        }
        quizMap[attempt.quizId].push(attempt);
      });
      
      // Get the most recent attempt for each quiz
      return Object.values(quizMap)
        .map(quizAttempts => quizAttempts[quizAttempts.length - 1]) // Get most recent
        .map(attempt => {
          // Calculate score percentage
          const scorePercentage = Math.round((attempt.score / attempt.maxScore) * 100);
          
          // Format the date
          const attemptDate = new Date(attempt.completedAt as Date);
          const formattedDate = attemptDate.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric' 
          });
          
          // Get quiz name/title if available or use ID
          const quizName = attempt.quizTitle || `Quiz #${attempt.quizId}`;
          
          return {
            name: quizName,
            date: formattedDate,
            score: scorePercentage,
            // Determine color based on score
            color: scorePercentage < 60 ? '#ef4444' : 
                   scorePercentage < 80 ? '#f59e0b' : 
                   '#22c55e'
          };
        });
    }
  };

  // Prepare data for different views
  const allAttemptsData = prepareLineData(quizAttempts, 'all');
  const byQuizData = prepareLineData(quizAttempts, 'byQuiz');

  // Customize the tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          {activeTab === "all" ? (
            <>
              <p className="font-medium">Attempt {data.attemptNumber}</p>
              <p className="text-sm text-gray-500">{data.name}</p>
              <p className="font-medium">{data.quiz}</p>
            </>
          ) : (
            <>
              <p className="font-medium">{data.name}</p>
              <p className="text-sm text-gray-500">{data.date}</p>
            </>
          )}
          <p style={{ color: data.color, fontWeight: 'bold' }}>
            Score: {data.score}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Quiz Performance Trends</CardTitle>
            <CardDescription>View how your quiz scores have changed over time</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing || !onRefresh}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="all" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="all">All Attempts</TabsTrigger>
            <TabsTrigger value="byQuiz">By Quiz</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={allAttemptsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine 
                  y={70} 
                  stroke="#888888" 
                  strokeDasharray="3 3"
                  label={{ value: 'Passing (70%)', position: 'right', fontSize: 12 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  name="Score %" 
                  stroke="#3b82f6" 
                  activeDot={{ r: 8 }}
                  dot={{ 
                    stroke: '#fff', 
                    strokeWidth: 2,
                    r: 6,
                    fill: (entry) => entry.color || '#3b82f6' 
                  }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="byQuiz" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={byQuizData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                  height={80}
                />
                <YAxis 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine 
                  y={70} 
                  stroke="#888888" 
                  strokeDasharray="3 3"
                  label={{ value: 'Passing (70%)', position: 'right', fontSize: 12 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  name="Score %"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                  dot={{ 
                    stroke: '#fff', 
                    strokeWidth: 2,
                    r: 6,
                    fill: (entry) => entry.color || '#3b82f6'
                  }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}