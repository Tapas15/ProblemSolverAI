
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download } from 'lucide-react';

interface CertificateCardProps {
  frameworkId: number;
  frameworkName: string;
  completedModules: number;
  totalModules: number;
  passedQuizzes: number;
  onRequestCertificate: () => void;
}

export function CertificateCard({
  frameworkId,
  frameworkName,
  completedModules,
  totalModules,
  passedQuizzes,
  onRequestCertificate
}: CertificateCardProps) {
  const isEligible = completedModules === totalModules && passedQuizzes > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-6 w-6 mr-2 text-blue-500" />
          {frameworkName} Certification
        </CardTitle>
        <CardDescription>
          Complete all modules and pass quizzes to earn your certificate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Modules Completed:</span>
            <span>{completedModules}/{totalModules}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Quizzes Passed:</span>
            <span>{passedQuizzes}</span>
          </div>
          <Button 
            className="w-full"
            disabled={!isEligible}
            onClick={onRequestCertificate}
          >
            {isEligible ? (
              <>
                <Download className="h-4 w-4 mr-2" />
                Get Certificate
              </>
            ) : 'Complete Requirements'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
