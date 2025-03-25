
import React, { useEffect, useState } from 'react';
import { CertificateCard } from './certificate-card';
import { useToast } from '@/hooks/use-toast';

export function CertificateList({ frameworks, userProgress, quizAttempts }) {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState([]);

  const handleRequestCertificate = async (frameworkId) => {
    try {
      const response = await fetch(`/api/certificates/issue/${frameworkId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to issue certificate');
      }

      const certificate = await response.json();
      setCertificates([...certificates, certificate]);
      
      toast({
        title: "Certificate Issued!",
        description: "Your certificate has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to issue certificate. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {frameworks.map((framework) => {
        const progress = userProgress.find(p => p.frameworkId === framework.id) || { completedModules: 0 };
        const passedQuizzes = quizAttempts.filter(
          a => a.frameworkId === framework.id && a.passed
        ).length;

        return (
          <CertificateCard
            key={framework.id}
            frameworkId={framework.id}
            frameworkName={framework.name}
            completedModules={progress.completedModules}
            totalModules={progress.totalModules || 0}
            passedQuizzes={passedQuizzes}
            onRequestCertificate={() => handleRequestCertificate(framework.id)}
          />
        );
      })}
    </div>
  );
}
