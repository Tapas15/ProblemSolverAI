import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserCertificates, getUserAchievements, issueFrameworkCertificate } from '@/lib/api';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, FileText, Medal, Trophy, Download, Loader2 } from 'lucide-react';
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
    
    // Create a hidden iframe to handle the download
    try {
      const downloadUrl = `/api/certificates/${id}/download`;
      
      // First option: use window.open (default)
      const newWindow = window.open(downloadUrl, '_blank');
      
      // Fallback option if window.open doesn't work
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Create hidden iframe for download as fallback
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = downloadUrl;
        document.body.appendChild(iframe);
        
        // Remove iframe after download is initiated
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your certificate. Please try again.",
        variant: "destructive",
      });
    }
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
              // Extract framework name from description with improved pattern to match professional descriptions
              const frameworkNameMatch = certificate.description.match(/the (.+?) framework/i);
              const frameworkName = frameworkNameMatch ? frameworkNameMatch[1] : "Professional Framework";
              
              return (
                <CertificateFrame
                  title={certificate.title}
                  userName={user?.name || ""}
                  description={certificate.description}
                  certificateNumber={certificate.certificateNumber}
                  issueDate={certificate.issueDate ? certificate.issueDate.toString() : null}
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
  
  // Get user progress and frameworks for issuing certificates
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/user/progress'],
    queryFn: () => apiRequest('GET', '/api/user/progress').then(res => res.json())
  });

  const { data: frameworks, isLoading: frameworksLoading } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: () => apiRequest('GET', '/api/frameworks').then(res => res.json())
  });

  // Track loading state for certificate issuance
  const [issuingCertificate, setIssuingCertificate] = useState<number | null>(null);

  // Function to handle certificate issuance
  const handleIssueCertificate = async (frameworkId: number) => {
    try {
      setIssuingCertificate(frameworkId);
      const certificate = await issueFrameworkCertificate(frameworkId);
      
      // Update certificates list
      queryClient.invalidateQueries({queryKey: ['/api/certificates']});
      
      toast({
        title: "Certificate Issued",
        description: "Your new certificate has been created successfully."
      });
    } catch (error: any) {
      console.error('Error issuing certificate:', error);
      toast({
        title: "Certificate Error",
        description: error.message || "Failed to issue certificate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIssuingCertificate(null);
    }
  };

  // Function to render eligible frameworks for certification
  const renderEligibleFrameworks = () => {
    if (progressLoading || frameworksLoading) {
      return <Skeleton className="h-20 w-full" />;
    }

    // Find completed frameworks that don't have certificates yet
    const completedFrameworks = [];
    
    if (userProgress && frameworks) {
      // Get frameworks with completed status
      const completedProgress = userProgress.filter((p: any) => p.status === 'completed');
      
      // For each completed framework, check if a certificate already exists
      for (const progress of completedProgress) {
        const framework = frameworks.find((f: any) => f.id === progress.frameworkId);
        
        // Check if user already has a certificate for this framework
        const hasCertificate = certificates?.some((c: any) => 
          c.frameworkId === progress.frameworkId && c.status === 'active'
        );
        
        if (framework && !hasCertificate) {
          completedFrameworks.push({
            id: framework.id,
            name: framework.name
          });
        }
      }
    }

    if (completedFrameworks.length === 0) {
      return (
        <div className="text-center py-4 border rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">
            Complete more frameworks to be eligible for certificates
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium mt-4 mb-2">Eligible for Certification:</h3>
        {completedFrameworks.map(framework => (
          <div key={framework.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              <span>{framework.name}</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => handleIssueCertificate(framework.id)}
              disabled={issuingCertificate === framework.id}
            >
              {issuingCertificate === framework.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Issuing...
                </>
              ) : (
                <>Issue Certificate</>
              )}
            </Button>
          </div>
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
          {renderEligibleFrameworks()}
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-4">
          {renderAchievements()}
        </TabsContent>
      </Tabs>
    </div>
  );
}