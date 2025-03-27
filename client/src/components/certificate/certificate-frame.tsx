import * as React from 'react';
import QRCode from 'qrcode';
import { Button } from "@/components/ui/button";
import { Download, ShieldCheck } from "lucide-react";
import { getFrameworkIcon } from "@/components/icons/framework-icons";

export interface CertificateFrameProps {
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
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');
  
  // Get framework-specific accent colors
  const getAccentColor = (name: string) => {
    const colors = {
      'MECE': '#3B82F6', // Blue
      'Design Thinking': '#8B5CF6', // Purple
      'SWOT': '#10B981', // Green
      'First Principles': '#F59E0B', // Amber
      "Porter's Five Forces": '#EF4444', // Red
      'Jobs-To-Be-Done': '#6366F1', // Indigo
      'Blue Ocean': '#0EA5E9', // Sky
      'SCAMPER': '#EC4899', // Pink
      'Problem-Tree': '#14B8A6', // Teal
      'Pareto': '#F97316'  // Orange
    };
    
    return colors[name as keyof typeof colors] || '#000000';
  };
  
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

  const accentColor = getAccentColor(frameworkName);
  const patternStyle = getPatternStyle(frameworkName);

  // Generate QR code on component mount
  React.useEffect(() => {
    const generateQR = async () => {
      try {
        // Create a validation URL with the certificate number - this will be the destination for QR verification
        // Use an actual verification URL that includes the certificate number and framework name
        const validationUrl = `https://frameworkpro.vercel.app/certificate/verify/${certificateNumber}?framework=${encodeURIComponent(frameworkName)}&name=${encodeURIComponent(userName)}`;
        
        const options = {
          errorCorrectionLevel: 'H' as const,
          margin: 1,
          color: {
            dark: accentColor,
            light: '#FFFFFF'
          }
        };
        
        const url = await QRCode.toDataURL(validationUrl, options);
        setQrCodeUrl(url);
      } catch (err) {
        console.error("Error generating QR code:", err);
      }
    };
    
    generateQR();
  }, [certificateNumber, accentColor, frameworkName, userName]);

  // Format date nicely
  const formattedDate = issueDate 
    ? new Date(issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';
  
  return (
    <div 
      className="relative rounded-xl overflow-hidden shadow-xl transition-all hover:shadow-2xl"
      style={{ 
        border: `4px solid #D4AF37`,
        background: "#F8F5E6", // Subtle cream background
        backgroundImage: `
          linear-gradient(to bottom, rgba(248, 245, 230, 0.97), rgba(255, 253, 244, 0.97)), 
          url('/api/static/images/fp-logo-new.jpg')
        `,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: '400px 400px'
      }}
    >
      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 rounded-tl-lg" style={{ borderColor: '#D4AF37' }}></div>
      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 rounded-tr-lg" style={{ borderColor: '#D4AF37' }}></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 rounded-bl-lg" style={{ borderColor: '#D4AF37' }}></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 rounded-br-lg" style={{ borderColor: '#D4AF37' }}></div>
      
      {/* Light Pattern Elements - Soft Linen Texture */}
      <div className="absolute inset-0 opacity-10" style={{ 
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 1px, transparent 1px, transparent 50px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 1px, transparent 1px, transparent 50px)
        `,
        backgroundSize: '50px 50px' 
      }}></div>
      
      {/* Certificate Background */}
      <div 
        className="p-6 bg-white bg-opacity-95"
        style={{ 
          backgroundImage: `
            linear-gradient(rgba(255, 253, 244, 0.8), rgba(248, 245, 230, 0.8)),
            linear-gradient(45deg, rgba(212, 175, 55, 0.05) 25%, transparent 25%, transparent 75%, rgba(212, 175, 55, 0.05) 75%),
            linear-gradient(45deg, rgba(212, 175, 55, 0.05) 25%, transparent 25%, transparent 75%, rgba(212, 175, 55, 0.05) 75%)
          `,
          backgroundPosition: '0 0, 0 0, 10px 10px',
          backgroundSize: 'cover, 20px 20px, 20px 20px',
          backgroundColor: 'rgba(248, 245, 230, 0.95)',
          backdropFilter: 'blur(4px)',
          boxShadow: 'inset 0 0 30px rgba(212, 175, 55, 0.1)'
        }}
      >
        {/* Certificate Header with Logo (no embellishments) */}
        <div className="flex flex-col items-center mb-4 relative">
          <div className="relative">
            <img src="/api/static/images/fp-logo-new.jpg" alt="Framework Pro Logo" className="h-20 mb-3" />
          </div>
          
          <h2 className="text-2xl font-bold text-black leading-tight mb-1 font-serif tracking-wider text-center mx-auto" style={{letterSpacing: "0.08em", wordSpacing: "0.1em"}}>{title}</h2>
          <p className="text-sm text-gray-500 text-center">Certificate #{certificateNumber}</p>
          <div className="flex items-center justify-center mt-2 px-4 py-1.5 rounded-md bg-gradient-to-r from-amber-100 to-yellow-100 text-xs font-medium shadow-sm mx-auto"
               style={{border: `1px solid #D4AF37`}}>
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" style={{color: '#D4AF37'}}/>
            <span style={{color: '#996515', fontWeight: 600}}>Verified Certificate</span>
          </div>
        </div>
        
        {/* Framework Badge removed to avoid overlap */}
        
        {/* Certificate Content */}
        <div className="my-8 text-center">
          <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">This certificate is awarded to</p>
          <h1 className="text-3xl font-bold mb-4 font-serif">{userName || 'User'}</h1>
          <div className="max-w-lg mx-auto p-4 border rounded-lg bg-white bg-opacity-80" style={{borderColor: `#D4AF3740`, borderWidth: '1px'}}>
            <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
          </div>
        </div>
        
        {/* Signature and QR Code Row */}
        <div className="mt-8 flex justify-between items-end">
          {/* Signature */}
          <div className="flex flex-col items-center">
            <img src="/api/static/images/manas-signature.png" alt="Signature" className="h-16 mb-0" />
            <p className="text-sm font-medium text-gray-700 mt-1">Manas Kumar</p>
            <p className="text-xs text-gray-500">CEO & Platform Director</p>
          </div>
          
          {/* QR Code */}
          {qrCodeUrl && (
            <div className="flex flex-col items-center border-2 border-amber-200 p-1 rounded-md bg-white">
              <div className="rounded-sm overflow-hidden">
                <img src={qrCodeUrl} alt="Certificate Validation QR Code" className="h-20 w-20" />
              </div>
              <p className="text-xs text-amber-800 mt-1 font-medium">Scan to verify</p>
            </div>
          )}
        </div>
        
        {/* Certificate Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <p className="font-medium">Issue Date</p>
            <p>{formattedDate}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Framework</p>
            <p>{frameworkName}</p>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs leading-relaxed" style={{color: '#996515'}}>
            This certificate verifies mastery of the <span className="inline-block italic mx-1">{frameworkName}</span> framework and its professional business applications.
          </p>
        </div>
      </div>
      
      {/* Download Button */}
      <div className="bg-gray-50 p-3 border-t border-gray-200">
        <Button 
          onClick={onDownload} 
          variant="outline" 
          className="w-full hover:text-white transition-colors hover:bg-amber-700"
          style={{
            backgroundColor: "white", 
            borderColor: '#D4AF37', 
            color: '#996515',
            boxShadow: '0 2px 4px rgba(153, 101, 21, 0.15)'
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Certificate
        </Button>
      </div>
      

    </div>
  );
}