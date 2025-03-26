import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { QuizAttempt } from '@shared/schema';

interface QuizPerformanceChartProps {
  quizAttempts: QuizAttempt[];
  onRefresh: () => void;
}

export function QuizPerformanceChart({ quizAttempts, onRefresh }: QuizPerformanceChartProps) {
  // Group attempts by quiz
  const attemptsByQuiz = React.useMemo(() => {
    const grouped: Record<number, QuizAttempt[]> = {};
    
    // Group attempts by quizId
    quizAttempts.forEach(attempt => {
      if (!grouped[attempt.quizId]) {
        grouped[attempt.quizId] = [];
      }
      grouped[attempt.quizId].push(attempt);
    });
    
    // Sort attempts within each quiz by date (most recent first)
    Object.keys(grouped).forEach(quizId => {
      grouped[Number(quizId)].sort((a, b) => {
        // If completedAt is null, put at the end
        if (!a.completedAt) return 1;
        if (!b.completedAt) return -1;
        
        // Sort by date, most recent first
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      });
      
      // Keep only the most recent 3 attempts
      grouped[Number(quizId)] = grouped[Number(quizId)].slice(0, 3);
    });
    
    return grouped;
  }, [quizAttempts]);
  
  // Format data for the chart - include all quizzes with attempts
  const chartData = React.useMemo(() => {
    const data: Array<{
      name: string;
      attempt1?: number;
      attempt2?: number;
      attempt3?: number;
    }> = [];

    // Sort attempts by completedAt date before processing
    Object.entries(attemptsByQuiz).forEach(([quizId, attempts]) => {
      attempts.sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      });
    });
    
    Object.entries(attemptsByQuiz).forEach(([quizId, attempts]) => {
      if (attempts.length > 0) {
        const quizName = `Quiz #${quizId}`;
        const entry: any = { name: quizName };
        
        // Add score percentage for each attempt (most recent first)
        attempts.forEach((attempt, index) => {
          const attemptNumber = attempts.length - index; // Reverse the index for display
          const scorePercentage = Math.round((attempt.score / attempt.maxScore) * 100);
          entry[`attempt${attemptNumber}`] = scorePercentage;
        });
        
        data.push(entry);
      }
    });
    
    return data;
  }, [attemptsByQuiz]);
  
  // Count total attempts per quiz for the recent 3 attempts
  const attemptCounts = React.useMemo(() => {
    return Object.entries(attemptsByQuiz).map(([quizId, attempts]) => ({
      quizId: Number(quizId),
      count: attempts.length,
      recentAttempts: attempts.slice(0, 3)
    }));
  }, [attemptsByQuiz]);

  // Colors for the chart
  const colors = ['#4338CA', '#3B82F6', '#60A5FA'];
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base text-[#0f172a]">Quiz Performance Analysis</CardTitle>
            <CardDescription className="text-xs text-[#64748b]">
              Compare your last 3 attempts for each quiz
            </CardDescription>
          </div>
          <button 
            onClick={onRefresh}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3.5 w-3.5 mr-1" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
            </svg>
            Refresh
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                    unit="%" 
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Score']}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      return value.replace('attempt', 'Attempt ');
                    }}
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                  <Bar 
                    dataKey="attempt3" 
                    name="Attempt 3" 
                    fill={colors[0]} 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="attempt2" 
                    name="Attempt 2" 
                    fill={colors[1]} 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="attempt1" 
                    name="Attempt 1 (Most Recent)" 
                    fill={colors[2]} 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
              {attemptCounts.map((item) => (
                <div 
                  key={item.quizId} 
                  className="bg-gray-50 rounded-lg p-2 text-center"
                >
                  <div className="font-medium text-xs text-[#334155]">Quiz #{item.quizId}</div>
                  <div className="text-lg font-semibold">{item.count}/3</div>
                  <div className="text-xs text-[#64748b]">Recent Attempts</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 flex-col">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-gray-400 mb-2" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 20v-6M6 20V10M18 20V4"></path>
            </svg>
            <div className="text-sm text-gray-500">No quiz data available yet</div>
            <div className="text-xs text-gray-400 mt-1">Take quizzes to see performance analysis</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}