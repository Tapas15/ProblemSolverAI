import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserCertificates, getUserAchievements } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, FileText, Medal, Trophy, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { CertificateFrame } from '@/components/certificate/certificate-frame';
import { AchievementCard } from '@/components/certificate/achievement-card';

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
  
  const { user } = useAuth();
  
  const renderCertificates = () => {
    if (certificatesLoading) {
      return (
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="w-full">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
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
      <div className="space-y-8">
        {certificates.map((certificate) => (
          <div key={certificate.id} className="relative">
            {certificate.status !== 'active' && (
              <Badge 
                variant={certificate.status === 'expired' ? 'destructive' : 'secondary'}
                className="absolute top-3 right-3 z-20"
              >
                {certificate.status === 'expired' ? 'Expired' : 'Revoked'}
              </Badge>
            )}
            
            {/* Extract framework name from description - in a real app you'd get this from the API */}
            {(() => {
              const frameworkNameMatch = certificate.description.match(/the (.+?) framework/i);
              const frameworkName = frameworkNameMatch ? frameworkNameMatch[1] : "Professional Framework";
              
              return (
                <CertificateFrame
                  title={certificate.title}
                  userName={user?.name || ""}
                  description={certificate.description}
                  certificateNumber={certificate.certificateNumber}
                  issueDate={certificate.issueDate}
                  frameworkName={frameworkName}
                  onDownload={() => handleDownloadCertificate(certificate.id)}
                />
              );
            })()}
          </div>
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
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    );
  };
  
  return (
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
  );
}