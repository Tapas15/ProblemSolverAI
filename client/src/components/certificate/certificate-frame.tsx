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
      'First Principles': '#F59E0B', // Amber (Gold)
      "Porter's Five Forces": '#EF4444', // Red
      'Jobs-To-Be-Done': '#6366F1', // Indigo
      'Blue Ocean': '#0EA5E9', // Sky Blue
      'SCAMPER': '#EC4899', // Pink
      'Problem-Tree': '#14B8A6', // Teal
      'Pareto': '#F97316'  // Orange
    };
    
    return colors[name as keyof typeof colors] || '#D4AF37'; // Default to gold if not found
  };
  
  // Get framework-specific background styles
  const getBackgroundStyle = (name: string) => {
    const backgrounds = {
      'MECE': {
        background: "#0F172A", // Dark blue
        gradient: "linear-gradient(to bottom, rgba(15, 23, 42, 0.97), rgba(30, 41, 59, 0.97))",
        pattern: "linear-gradient(45deg, rgba(59, 130, 246, 0.07) 25%, transparent 25%, transparent 75%, rgba(59, 130, 246, 0.07) 75%), linear-gradient(45deg, rgba(59, 130, 246, 0.05) 25%, transparent 25%, transparent 75%, rgba(59, 130, 246, 0.05) 75%)",
        patternSize: "20px 20px",
        innerBg: "rgba(241, 245, 249, 0.97)", // Very light blue-gray
        boxShadow: "inset 0 0 30px rgba(59, 130, 246, 0.1)" // Light blue shadow
      },
      'Default': {
        background: "#F8F5E6", // Cream background
        gradient: "linear-gradient(to bottom, rgba(248, 245, 230, 0.97), rgba(255, 253, 244, 0.97))",
        pattern: "repeating-linear-gradient(0deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 1px, transparent 1px, transparent 50px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 1px, transparent 1px, transparent 50px)",
        patternSize: "50px 50px",
        innerBg: "rgba(248, 245, 230, 0.95)",
        boxShadow: "inset 0 0 30px rgba(212, 175, 55, 0.1)" // Gold shadow
      }
    };
    
    return backgrounds[name as keyof typeof backgrounds] || backgrounds['Default'];
  };

  const accentColor = getAccentColor(frameworkName);
  const backgroundStyle = getBackgroundStyle(frameworkName);

  // Generate QR code on component mount
  React.useEffect(() => {
    const generateQR = async () => {
      try {
        // Create a validation URL with the certificate number - this will be the destination for QR verification
        // Point to our own API verification endpoint
        const validationUrl = `/api/certificates/verify/${certificateNumber}?framework=${encodeURIComponent(frameworkName)}&name=${encodeURIComponent(userName)}`;
        
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
        border: `4px solid ${accentColor}`,
        background: backgroundStyle.background,
        backgroundImage: `
          ${backgroundStyle.gradient}
        `,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: '400px 400px'
      }}
    >
      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 rounded-tl-lg" style={{ borderColor: accentColor }}></div>
      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 rounded-tr-lg" style={{ borderColor: accentColor }}></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 rounded-bl-lg" style={{ borderColor: accentColor }}></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 rounded-br-lg" style={{ borderColor: accentColor }}></div>
      
      {/* Light Pattern Elements - Framework-specific pattern */}
      <div className="absolute inset-0 opacity-10" style={{ 
        backgroundImage: backgroundStyle.pattern,
        backgroundSize: backgroundStyle.patternSize 
      }}></div>
      
      {/* Certificate Background */}
      <div 
        className="p-6 bg-white bg-opacity-95"
        style={{ 
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.8), ${backgroundStyle.innerBg})
          `,
          backgroundPosition: '0 0',
          backgroundSize: 'cover',
          backgroundColor: backgroundStyle.innerBg,
          backdropFilter: 'blur(4px)',
          boxShadow: backgroundStyle.boxShadow
        }}
      >
        {/* Certificate Header with Logo (no embellishments) */}
        <div className="flex flex-col items-center mb-4 relative">
          <div className="relative">
            <img src="/api/static/images/fp-logo-new.png" alt="Framework Pro Logo" className="h-20 mb-3" />
          </div>
          
          <h2 className="text-2xl font-bold text-black leading-tight mb-1 font-serif tracking-wider text-center mx-auto" style={{letterSpacing: "0.08em", wordSpacing: "0.1em"}}>{title}</h2>
          <p className="text-sm text-gray-500 text-center">Certificate #{certificateNumber}</p>
          <div className="flex items-center justify-center mt-2 px-4 py-1.5 rounded-md text-xs font-medium shadow-sm mx-auto"
               style={{
                 border: `1px solid ${accentColor}`,
                 background: `linear-gradient(to right, ${accentColor}10, ${accentColor}20)`
               }}>
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" style={{color: accentColor}}/>
            <span style={{color: frameworkName === 'MECE' ? '#1e40af' : '#996515', fontWeight: 600}}>Verified Certificate</span>
          </div>
        </div>
        
        {/* Framework Badge removed to avoid overlap */}
        
        {/* Certificate Content */}
        <div className="my-8 text-center">
          <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">This certificate is awarded to</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl font-bold font-serif">{userName || 'User'}</h1>
            <div className="relative w-10 h-10 transform translate-y-[-2px]">
              <img 
                src="/api/static/images/certified-badge.png" 
                alt="Certified Professional" 
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.2))' }}
              />
            </div>
          </div>
          <div className="max-w-lg mx-auto p-4 border rounded-lg bg-white bg-opacity-80" 
            style={{
              borderColor: `${accentColor}40`, 
              borderWidth: '1px',
              boxShadow: `0 2px 10px ${accentColor}15`
            }}>
            <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
          </div>
        </div>
        
        {/* Signature and QR Code Row */}
        <div className="mt-8 flex justify-between items-end">
          {/* Signature */}
          <div className="flex flex-col items-center">
            <img src="/api/images/manas-signature.png" alt="Signature" className="h-16 mb-0" />
            <p className="text-sm font-medium text-gray-700 mt-1">Manas Kumar</p>
            <p className="text-xs text-gray-500">CEO & Platform Director</p>
          </div>
          
          {/* QR Code */}
          {qrCodeUrl && (
            <div className="flex flex-col items-center border-2 p-1 rounded-md bg-white"
              style={{ 
                borderColor: `${accentColor}30`,
                boxShadow: `0 2px 8px ${accentColor}20`
              }}>
              <div className="rounded-sm overflow-hidden">
                <img src={qrCodeUrl} alt="Certificate Validation QR Code" className="h-20 w-20" />
              </div>
              <p className="text-xs mt-1 font-medium" style={{ color: frameworkName === 'MECE' ? '#1e40af' : '#996515' }}>
                Scan to verify
              </p>
            </div>
          )}
        </div>
        
        {/* Certificate Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-xs text-gray-500"
          style={{ borderColor: `${accentColor}30` }}>
          <div>
            <p className="font-medium" style={{ color: frameworkName === 'MECE' ? '#1e40af' : '#996515' }}>Issue Date</p>
            <p>{formattedDate}</p>
          </div>
          <div className="text-right">
            <p className="font-medium" style={{ color: frameworkName === 'MECE' ? '#1e40af' : '#996515' }}>Framework</p>
            <p>{frameworkName}</p>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs leading-relaxed" style={{ color: frameworkName === 'MECE' ? '#1e40af' : '#996515' }}>
            This certificate verifies mastery of the <span className="inline-block italic mx-1 font-medium">{frameworkName}</span> framework and its professional business applications.
          </p>
        </div>
      </div>
      
      {/* Download Button */}
      <div className="p-3 border-t" 
        style={{ 
          borderColor: `${accentColor}30`,
          background: frameworkName === 'MECE' ? 'rgba(241, 245, 249, 0.8)' : 'rgba(248, 245, 230, 0.8)'
        }}>
        <Button 
          onClick={onDownload} 
          variant="outline" 
          className="w-full hover:text-white transition-colors"
          style={{
            backgroundColor: "white", 
            borderColor: accentColor, 
            color: frameworkName === 'MECE' ? '#1e40af' : '#996515',
            boxShadow: `0 2px 4px ${accentColor}30`
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Certificate
        </Button>
      </div>
      

    </div>
  );
}