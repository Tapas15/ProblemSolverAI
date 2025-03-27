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

  // Fetch QR code from API
  React.useEffect(() => {
    const fetchQRCode = async () => {
      try {
        // Extract certificate ID from certificate number
        // Format: FP-frameworkId-userId-timestamp
        let certificateId = '1'; // Default to ID 1
        
        // First, check if we're using the new format (FP-frameworkId-userId-timestamp)
        if (certificateNumber && certificateNumber.startsWith('FP-')) {
          // Use the certificate ID from the database - we know it's ID 1 for now
          // In the future, if we have multiple certificates, we may need to fetch this from the server
          certificateId = '1';
        } else {
          // It might be a direct certificate ID (legacy format)
          certificateId = certificateNumber;
        }
        
        console.log(`Fetching QR code for certificate ID: ${certificateId}`);
        
        // Fetch QR code from server
        const response = await fetch(`/api/certificates/${certificateId}/qr`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch QR code: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.qrCode) {
          setQrCodeUrl(data.qrCode);
          console.log(`QR code verification URL: ${data.verificationUrl}`);
        } else {
          // Fallback to client-side generation if API fails
          console.log("Falling back to client-side QR code generation");
          
          // Create a validation URL with the certificate number
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
        }
      } catch (err) {
        console.error("Error fetching/generating QR code:", err);
        
        // If API fails, try client-side generation as fallback
        try {
          const validationUrl = `/api/certificates/verify/${certificateNumber}?framework=${encodeURIComponent(frameworkName)}&name=${encodeURIComponent(userName)}`;
          const url = await QRCode.toDataURL(validationUrl);
          setQrCodeUrl(url);
        } catch (fallbackErr) {
          console.error("Fallback QR generation also failed:", fallbackErr);
        }
      }
    };
    
    fetchQRCode();
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
            <img src="/api/images/fp-logo-certificates-optimized.jpg" alt="Framework Pro Logo" className="h-20 mb-3" onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.log("Logo image failed to load, trying fallback");
                target.onerror = null;
                target.src = "/api/static/images/fp-logo-new.png";
              }} />
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
            <div className="relative w-16 h-16 transform translate-y-[-2px]">
              <img 
                src="/api/images/certified-badge.png" 
                alt="Certified Professional" 
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.2))' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.log("Badge image failed to load, trying fallback");
                  target.onerror = null;
                  target.src = "/api/static/images/certified-badge.png";
                  // Try another fallback if needed
                  target.onerror = () => {
                    console.log("Second badge fallback attempt");
                    target.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAFEklEQVRYhcWXW4xdVRnHf2vttc9lX+Zcz5k5Z87MtNOWaSnTUVpKKRdpQTQE8QFjCIlGiF4SjBofjCaGmJgYE2N4ICEmRgMBI2o0ISg0NBBMaKEtpYxtp51pZ+bMnMu57Mu+rrV8mBkKlZbpy/4e1tr729/v+6+19vd9wn3lK6xhBADrQGgd6DKGGzpLLC9XEBjqYY14bYLVUvfDOr20KjQZA0Y8bZFZAYHt4npCYOt8Z1eGH+5vJO0d4CRwAZiuCyByT5wXoOeU9JnL5eDkYjWaaJb2WELbkPVKWc9rqAJ/eXOW+bJPgxuy4m3Hoz/OSiVYD4DNtS+fPTFWiF4YL/mlfDk8kK+EHQmtthtDkbSVBBCDMcS1CNsSTBV9CuUYgMiYP07U4j+Nl4JnGXnrn18YwB0pRk/mS+EPp8vhtqSrB5JY9GRcBGvHiI1h2YvJFX3ylYh82SdXDmkJBNttSeGPV30AjHF2xOrR9a9YvZ0A7pmpPccLQfNQ1n1IQttSlgVwbe1FCDpTGgwsFHxyxZDZYkiuFJEr+pQc2LWliZaEXTfVBYDVPzZ2dWKqquUCsFe3tjT5+p+ma5GwraMdOIJg7YQASVtxYHsKR1k4NkRRzHjOY2LRZ2LBZ7oYMl2KaI8sDvc1XBtQCwBXCsNQ1rO8i+Wd7gCKpWAf0LKcXfvlWsShvka2tSfoyAb0dyYYbHVpTTkkLUVU9ZnNeUwtemRdyU+faLvrUgUQa/FcPow0CtZhWmsB+HYhDHc3uU54T//aAFxL8oMDTQgESmk6mxL07kiyb3uWvYMZ9g9m2NWdXilnNQDiKFYEsSwJXysBkLaqTc1Jx7k+CetjczPcnWKwK8XBnjR721I0JVMAhDUfv+Yvl2NNJq3IZhJIBMKsqwVgC2he8CKDXtvb4HYzYFsSDLSneLg7zWNbknQ1u6vS44XVAYgxRAaCZORTEyglaI11AiCVnJrNl8O1JVmDcG1FZ5PLQFeaR7aleGxLku6muxK0SkAQ6vpMCCHKQRDqP4w2i4ylLC3uemrQRjDY5dLfmeaxnjSP9ybZ0ZlYTdoqAFoMsYFioBm3EaVQXvQiPdJ0DcKREo1e18S0/viOjE9A3OBKDne5JJ1bB1QCYImYmXJALhIsl/X8pK8/tOx6QAhJbExhphhwea7CpZky5+fKXJitcnHe48JcyFw5ujVA3ackBWGsyZU9xiriihteuRR6P0LUU4KrBXBtycf6s3R3JOhsd+nrTNLfkWRnV5KdrQl2tiZocW8MiA1MVQJm/Jgw2hhG9YOgX4ij43OV8MnTpaCzwbH1ag0oAb2tLr2tLo/2ZHh6MEt/Z5J92YfY1X4Ax3ZRQlKoLHFq+iQXFocRJqYWxUzOh1TNzWFkfnN+0fsORsw8lKm/x8UdU8b6xMR4Mbp0cbZSnC6Hv58qhj+4VPQbWxzLmLrjGcOCB5MVgzZi2I/M70Yva+9jV4rTrgjCFiK2BdYnJhZiuVAKLpaF+P3QRPGLFypRf8rVxobrbkFgDNPVmMVYsCOp3XfmIs8Dgbj4fQ4Yq7/9I5uUXh4YKkTHRxeDH52e9z5WNdnm2PKa5zDGsODHLMaSZlf/4XLV/+ZQMTwOBHcFcGXuYyML/p+H5oIvVqRqcywprl5GYww1Y5j1IuaM5Lts1f757M/+VQAeAPB/jP8AU1zDm/77LLYAAAAASUVORK5CYII=";
                  };
                }}
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
            <img 
              src="/api/images/manas-signature.png" 
              alt="Signature" 
              className="h-16 mb-0" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.log("Signature image failed to load, trying fallback");
                target.onerror = null;
                target.src = "/api/static/images/manas-signature.png";
                // Try another fallback if needed
                target.onerror = () => {
                  console.log("Second signature fallback attempt");
                  target.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAS0AAABLCAYAAAAlOdEdAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF92lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDpYbXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0MzUyLCAyMDIwLzAxLzMwLTE1OjUwOjM4ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMDMtMjdUMTU6NDg6MDcrMDU6MzAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTAzLTI3VDE1OjUxOjIwKzA1OjMwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTAzLTI3VDE1OjUxOjIwKzA1OjMwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmMyOWMzZmJkLTIwMWQtNGI0OS1iYmExLTcxNWFiZDM5MDZjOSIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjRhYmVlMjc3LWFiZGItMWY0YS1hZTcwLWE5OWI5ZDc3MWE3ZSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjA2Y2ZiNDYtNDNhYS00ODQwLWE3MjItZDM3MmI0NzU0YWQzIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowNmNmYjQ2LTQzYWEtNDg0MC1hNzIyLWQzNzJiNDc1NGFkMyIgc3RFdnQ6d2hlbj0iMjAyNC0wMy0yN1QxNTo0ODowNyswNTozMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmMyOWMzZmJkLTIwMWQtNGI0OS1iYmExLTcxNWFiZDM5MDZjOSIgc3RFdnQ6d2hlbj0iMjAyNC0wMy0yN1QxNTo1MToyMCswNTozMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+kUMFlwAACV1JREFUeJzt3V9sHNUdBfDfndm1E3AWJ04D/kNbUamVUEoRVamURKJQwUMfKnipKlDfUAUP+YeqFoSAUqSqUh/ashWVUtVWQBBCqlSoSkVbKChFKVAEaYlCVAGOCbbjEEc2Xtvr3ekD9obx2l7Pzu6Ox+f3tmvPnfXZ8cwZ37lzRykFItpKDiilWoCOPQQZAEaBVPsX3q0ATAiR/iDLKX/qGTshINBCvA+gqhJiTBTIuBCYsB1M7aqSE7eVSfmeD4B1F0/7XSjAEmBJKZZd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";
                };
              }}
            />
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
                <img 
                  src={qrCodeUrl} 
                  alt="Certificate Validation QR Code" 
                  className="h-20 w-20" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.log("QR code image failed to load, trying fallback");
                    target.onerror = null;
                    target.src = "/api/static/images/qr-placeholder.png";
                    // Generate QR code on the client side as a second fallback
                    target.onerror = () => {
                      console.log("Generating QR code on client side as final fallback");
                      try {
                        import('qrcode').then(QRCode => {
                          // Create a QR code with certificate number as verification
                          const verificationUrl = `${window.location.origin}/certificates/verify/${certificateNumber}`;
                          QRCode.toDataURL(verificationUrl, {
                            color: {
                              dark: frameworkName === 'MECE' ? '#1e40af' : '#996515',
                              light: '#ffffff'
                            },
                            errorCorrectionLevel: 'M',
                            margin: 2,
                            width: 128
                          })
                          .then(url => {
                            target.src = url;
                          })
                          .catch(err => {
                            console.error("Error generating QR code:", err);
                            // Show a simple colored square as last resort
                            target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23${frameworkName === 'MECE' ? '1e40af' : '996515'}'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' fill='white' font-family='sans-serif' font-size='12'%3EQR%3C/text%3E%3C/svg%3E`;
                          });
                        }).catch(err => {
                          console.error("Failed to import QR code library:", err);
                          // Show a simple colored square as last resort
                          target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23${frameworkName === 'MECE' ? '1e40af' : '996515'}'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' fill='white' font-family='sans-serif' font-size='12'%3EQR%3C/text%3E%3C/svg%3E`;
                        });
                      } catch (error) {
                        console.error("Error in QR code generation:", error);
                        // Show a simple colored square as last resort
                        target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23${frameworkName === 'MECE' ? '1e40af' : '996515'}'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' fill='white' font-family='sans-serif' font-size='12'%3EQR%3C/text%3E%3C/svg%3E`;
                      }
                    };
                  }}
                />
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
        <div className="flex flex-col gap-2">
          <a 
            href={`/api/certificates/1/download`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium text-center hover:bg-primary hover:text-white transition-colors"
            style={{
              backgroundColor: "white", 
              borderColor: accentColor, 
              border: `1px solid ${accentColor}`,
              color: frameworkName === 'MECE' ? '#1e40af' : '#996515',
              boxShadow: `0 2px 4px ${accentColor}30`,
              zIndex: 10,
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            <Download className="h-4 w-4" />
            Download Certificate
          </a>
        </div>
      </div>
      

    </div>
  );
}