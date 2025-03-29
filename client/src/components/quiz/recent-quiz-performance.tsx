import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { QuizAttempt } from '@/types/quiz-types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentQuizPerformanceProps {
  quizAttempts: QuizAttempt[];
  isLoading?: boolean;
}

export function RecentQuizPerformance({ quizAttempts, isLoading = false }: RecentQuizPerformanceProps) {
  const { toast } = useToast();

  // If no data or loading, show loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recent Quiz Performance</CardTitle>
          <CardDescription>Your 3 most recent quiz results</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  // If no quiz attempts, show empty state
  if (!quizAttempts?.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recent Quiz Performance</CardTitle>
          <CardDescription>Complete quizzes to see your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
            <p className="text-gray-500">No quiz attempts yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Take some quizzes to see your performance analysis here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get 3 most recent attempts
  const recentAttempts = [...quizAttempts]
    .sort((a, b) => new Date(b.completedAt as Date).getTime() - new Date(a.completedAt as Date).getTime())
    .slice(0, 3)
    .reverse(); // Show oldest to newest (left to right)

  // Format data for chart
  const data = recentAttempts.map(attempt => {
    // Calculate score percentage
    const scorePercentage = Math.round((attempt.score / attempt.maxScore) * 100);
    
    // Format the date
    const attemptDate = new Date(attempt.completedAt as Date);
    const formattedDate = attemptDate.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Get quiz title
    // If we don't have the quiz title in the attempt, use "Quiz #"
    const quizName = attempt.quizTitle || `Quiz #${attempt.quizId}`;
    
    return {
      name: `${quizName} (${formattedDate})`,
      score: scorePercentage,
      // Determine color class based on score
      colorClass: scorePercentage < 60 ? 'text-red-500' : 
                 scorePercentage < 80 ? 'text-yellow-500' : 
                 'text-green-500',
      passed: attempt.passed
    };
  });

  // Customize the tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className={`${data.colorClass} font-bold`}>
            Score: {payload[0].value}%
          </p>
          <p className={data.passed ? 'text-green-600' : 'text-red-600'}>
            {data.passed ? 'Passed' : 'Failed'}
          </p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recent Quiz Performance</CardTitle>
        <CardDescription>Your 3 most recent quiz results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={150} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine 
                x={70} 
                stroke="#888888" 
                strokeDasharray="3 3"
                label={{ value: 'Passing (70%)', position: 'insideBottomRight', fontSize: 12 }} 
              />
              <Bar 
                dataKey="score" 
                name="Score %" 
                radius={[0, 4, 4, 0]}
                label={{ 
                  position: 'right',
                  formatter: (value: number) => `${value}%`,
                  fontSize: 12,
                  fill: '#666'
                }}
                // Use dynamic colors based on score
                fill={(data) => {
                  const score = data.score;
                  return score < 60 ? '#ef4444' : 
                         score < 80 ? '#f59e0b' : 
                         '#22c55e';
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}