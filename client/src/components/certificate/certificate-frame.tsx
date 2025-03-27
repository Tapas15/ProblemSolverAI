import React from 'react';
import { Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CertificateFrameProps {
  title: string;
  userName: string;
  description: string;
  certificateNumber: string;
  issueDate: string | null;
  frameworkName: string;
  onDownload: () => void;
}

export function CertificateFrame({
  title,
  userName,
  description,
  certificateNumber,
  issueDate,
  frameworkName,
  onDownload
}: CertificateFrameProps) {
  // Format date nicely
  const formattedDate = issueDate 
    ? new Date(issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';
  
  // Generate a background pattern based on the framework name (for visual variety)
  const getPatternStyle = (name: string) => {
    const patterns = {
      'MECE': 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px)',
      'Design Thinking': 'radial-gradient(circle at 25px 25px, #f3f4f6 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f3f4f6 2%, transparent 0%)',
      'SWOT': 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
      'First Principles': 'repeating-linear-gradient(to right, #f9fafb, #f9fafb 20px, #f3f4f6 20px, #f3f4f6 40px)',
      "Porter's Five Forces": 'radial-gradient(circle, #f3f4f6 10%, transparent 10%), radial-gradient(circle, #f3f4f6 10%, transparent 10%)',
      'Jobs-To-Be-Done': 'linear-gradient(0deg, #f9fafb 2px, transparent 2px), linear-gradient(90deg, #f9fafb 2px, transparent 2px)',
      'Blue Ocean': 'linear-gradient(135deg, #f3f4f6 25%, transparent 25%), linear-gradient(225deg, #f3f4f6 25%, transparent 25%), linear-gradient(315deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, #f3f4f6 25%, transparent 25%)',
      'SCAMPER': 'linear-gradient(to bottom, #f9fafb, #f9fafb 50%, #f3f4f6 50%, #f3f4f6)',
      'Problem-Tree': 'repeating-linear-gradient(to bottom, #f9fafb, #f9fafb 15px, #f3f4f6 15px, #f3f4f6 30px)',
      'Pareto': 'linear-gradient(to right, #f9fafb, #f9fafb 4px, transparent 4px, transparent 20px)'
    };
    
    // Default pattern if framework name isn't in our list
    const defaultPattern = 'linear-gradient(to right, rgba(243, 244, 246, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(243, 244, 246, 0.2) 1px, transparent 1px)';
    
    return patterns[name as keyof typeof patterns] || defaultPattern;
  };
  
  const patternStyle = getPatternStyle(frameworkName);
  
  // Determine border color based on framework name for visual distinction
  const getBorderColor = (name: string) => {
    const colors = {
      'MECE': 'border-black',
      'Design Thinking': 'border-black',
      'SWOT': 'border-black',
      'First Principles': 'border-black',
      "Porter's Five Forces": 'border-black',
      'Jobs-To-Be-Done': 'border-black',
      'Blue Ocean': 'border-black',
      'SCAMPER': 'border-black',
      'Problem-Tree': 'border-black',
      'Pareto': 'border-black'
    };
    
    return colors[name as keyof typeof colors] || 'border-black';
  };
  
  const borderColorClass = getBorderColor(frameworkName);
  
  return (
    <div className={`relative rounded-xl overflow-hidden shadow-md border-4 ${borderColorClass} transition-all hover:shadow-lg`}>
      {/* Certificate Background */}
      <div 
        className="p-6 bg-white"
        style={{ 
          backgroundImage: patternStyle,
          backgroundSize: frameworkName === "Porter's Five Forces" ? '40px 40px' : 
                          frameworkName === 'SWOT' ? '50px 50px' : 
                          '20px 20px',
          backgroundPosition: frameworkName === 'SWOT' ? '0 0, 25px 0, 25px -25px, 0px 25px' : '0 0'
        }}
      >
        {/* Certificate Header */}
        <div className="flex flex-col items-center mb-4">
          <img src="/images/fp-logo.jpg" alt="Framework Pro Logo" className="h-16 mb-3" />
          <h2 className="text-lg font-bold text-black leading-tight mb-1">{title}</h2>
          <p className="text-sm text-gray-500">Certificate #{certificateNumber}</p>
          <div className="flex items-center mt-2 px-3 py-1 rounded-full bg-black/5 text-black text-xs font-medium">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Verified
          </div>
        </div>
        
        {/* Certificate Content */}
        <div className="my-8 text-center">
          <p className="text-sm text-gray-500 mb-2">This certificate is awarded to</p>
          <h1 className="text-2xl font-bold mb-3">{userName || 'User'}</h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">{description}</p>
        </div>
        
        {/* Signature */}
        <div className="flex flex-col items-center mt-4">
          <img src="/images/signature.jpg" alt="Signature" className="h-12 mb-1" />
          <p className="text-sm font-medium text-gray-700">Manas Kumar</p>
        </div>
        
        {/* Certificate Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <p className="font-medium">Issue Date</p>
            <p>{formattedDate}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Framework</p>
            <p>{frameworkName}</p>
          </div>
        </div>
      </div>
      
      {/* Download Button */}
      <div className="bg-gray-50 p-3 border-t border-gray-100">
        <Button 
          onClick={onDownload} 
          variant="outline" 
          className="w-full hover:bg-black hover:text-white transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Certificate
        </Button>
      </div>
    </div>
  );
}