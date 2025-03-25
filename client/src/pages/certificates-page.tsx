import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserCertificates, getUserAchievements } from '@/lib/api';
import { MobileAppLayout } from '@/components/layout/mobile-app-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, FileText, Medal, Trophy, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState('certificates');
  const { toast } = useToast();
  
  // Get user certificates
  const {
    data: certificates,
    isLoading: certificatesLoading,
    error: certificatesError
  } = useQuery({
    queryKey: ['/api/certificates'],
    queryFn: getUserCertificates
  });
  
  // Get user achievements
  const {
    data: achievements,
    isLoading: achievementsLoading,
    error: achievementsError
  } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: getUserAchievements
  });
  
  const handleDownloadCertificate = (id: number) => {
    toast({
      title: "Download Started",
      description: "Your certificate will be downloaded shortly.",
    });
    // In a real implementation, this would trigger a download
    window.open(`/api/certificates/${id}/download`, '_blank');
  };
  
  const renderCertificates = () => {
    if (certificatesLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-28 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }
    
    if (certificatesError) {
      return (
        <div className="text-center py-10">
          <p className="text-red-500">Error loading certificates</p>
        </div>
      );
    }
    
    if (!certificates || certificates.length === 0) {
      return (
        <div className="text-center py-10">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Complete frameworks and pass quizzes to earn certificates.
          </p>
          <Button variant="outline" asChild>
            <a href="/frameworks">Explore Frameworks</a>
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{certificate.title}</CardTitle>
                  <CardDescription>
                    Certificate #{certificate.certificateNumber}
                  </CardDescription>
                </div>
                <Badge 
                  variant={certificate.status === 'active' ? 'default' : 'destructive'}
                  className="ml-2"
                >
                  {certificate.status === 'active' ? 'Active' : 'Expired'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 mr-2 text-primary" />
                <span className="text-sm">{certificate.description}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <div>Issued: {certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : 'Unknown'}</div>
                {certificate.expiryDate && (
                  <div>Expires: {new Date(certificate.expiryDate).toLocaleDateString()}</div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleDownloadCertificate(certificate.id)} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderAchievements = () => {
    if (achievementsLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="ml-4 flex-1">
                <Skeleton className="h-5 w-28 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (achievementsError) {
      return (
        <div className="text-center py-10">
          <p className="text-red-500">Error loading achievements</p>
        </div>
      );
    }
    
    if (!achievements || achievements.length === 0) {
      return (
        <div className="text-center py-10">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Start learning to earn achievements and track your progress.
          </p>
          <Button variant="outline" asChild>
            <a href="/frameworks">Start Learning</a>
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`flex p-4 border rounded-lg ${
              achievement.isEarned 
                ? 'bg-primary/5 border-primary/30' 
                : 'bg-gray-100 border-gray-200 opacity-70'
            }`}
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {achievement.progress !== undefined ? (
                <div className="relative h-12 w-12 flex items-center justify-center">
                  {/* Circular progress indicator */}
                  <svg className="absolute" width="48" height="48" viewBox="0 0 48 48">
                    <circle 
                      cx="24" 
                      cy="24" 
                      r="20" 
                      fill="none" 
                      stroke="#e5e7eb" 
                      strokeWidth="4" 
                    />
                    <circle 
                      cx="24" 
                      cy="24" 
                      r="20" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      strokeDasharray={`${125 * (achievement.progress / (achievement.requiredProgress || 1))} 125`} 
                      strokeDashoffset="-31.25"
                      className="text-primary"
                      transform="rotate(-90 24 24)"
                    />
                  </svg>
                  <Award className="h-6 w-6 text-primary z-10" />
                </div>
              ) : achievement.isEarned ? (
                <Award className="h-6 w-6 text-primary" />
              ) : (
                <Award className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-sm">{achievement.title}</h3>
              <p className="text-xs text-gray-600">{achievement.description}</p>
              {achievement.progress !== undefined && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{achievement.progress} / {achievement.requiredProgress}</span>
                    <span>{Math.round((achievement.progress / (achievement.requiredProgress || 1)) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(achievement.progress / (achievement.requiredProgress || 1)) * 100} 
                    className="h-1.5" 
                  />
                </div>
              )}
              {achievement.earnedDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Earned: {achievement.earnedDate ? new Date(achievement.earnedDate).toLocaleDateString() : 'Unknown'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <MobileAppLayout>
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary mb-2">Certificates & Achievements</h1>
          <p className="text-gray-600">Track your learning journey and showcase your expertise</p>
        </div>
        
        <Tabs defaultValue="certificates" onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="certificates" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex-1">
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="certificates" className="mt-4">
            {renderCertificates()}
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-4">
            {renderAchievements()}
          </TabsContent>
        </Tabs>
      </div>
    </MobileAppLayout>
  );
}