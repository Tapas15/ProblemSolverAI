import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { storage } from './storage';
import QRCode from 'qrcode';
import { getCertificateDescription } from '../shared/certificate-descriptions';

// Read base64 encoded images with fallbacks for missing files
function loadImageAsBase64(filePath: string, fallbackPath?: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath)).toString('base64');
  } catch (error) {
    console.error(`Error loading image from ${filePath}:`, error);
    if (fallbackPath) {
      try {
        console.log(`Attempting to load fallback image from ${fallbackPath}`);
        return fs.readFileSync(path.join(process.cwd(), fallbackPath)).toString('base64');
      } catch (fallbackError) {
        console.error(`Error loading fallback image from ${fallbackPath}:`, fallbackError);
      }
    }
    // Return an empty transparent image as a last resort
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
}

// Define image paths with primary and fallback locations
const LOGO_BASE64 = loadImageAsBase64(
  'public/images/fp-logo-certificates-optimized.jpg', 
  'public/images/fp-logo-certificates.jpg'
);
const BADGE_BASE64 = loadImageAsBase64(
  'public/static/images/certified-badge.png',
  'public/images/certified-badge.png'
);
const SIGNATURE_BASE64 = loadImageAsBase64(
  'public/static/images/manas-signature.png',
  'public/images/manas-signature.png'
);

/**
 * Generate QR code as data URL
 * @param data The URL or text to encode in the QR code
 * @param color Optional accent color to use for the QR code
 */
async function generateQrCode(data: string, color?: string): Promise<string> {
  try {
    const qrOptions = {
      errorCorrectionLevel: 'H' as const,
      margin: 1,
      width: 150,
      color: {
        dark: color || '#000000', // Use provided color or default to black
        light: '#ffffff'
      }
    };
    
    // Generate QR code directly in the function
    const qrDataUrl = await QRCode.toDataURL(data, qrOptions);
    // Return only the base64 part (remove the data:image/png;base64, prefix)
    return qrDataUrl.replace('data:image/png;base64,', '');
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Use fallback if QR generation fails
    try {
      return fs.readFileSync(path.join(process.cwd(), 'public/static/images/qr-placeholder.png')).toString('base64');
    } catch (e) {
      console.error('Error reading fallback QR image:', e);
      // Return a minimal empty transparent image as fallback
      return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }
  }
}

/**
 * Download a certificate by ID with a simplified layout
 */
export async function downloadCertificate(req: Request, res: Response, next: NextFunction) {
  try {
    // Get the certificate ID from the URL parameter
    const certificateId = parseInt(req.params.id);
    
    // Get certificate data
    const certificate = await storage.getCertificate(certificateId);
    if (!certificate) {
      return res.status(404).send("Certificate not found");
    }
    
    // Get user information
    const user = await storage.getUser(certificate.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    
    // Get framework information
    const framework = await storage.getFramework(certificate.frameworkId);
    if (!framework) {
      return res.status(404).send("Framework not found");
    }
    
    const frameworkName = framework.name;
    
    // Determine accent color based on framework - match frontend certificate-frame.tsx colors
    let accentColor = '#D4AF37'; // Default gold color (same as frontend)
    
    // Using the exact same color values from the frontend certificate-frame.tsx
    const frameworkColors: Record<string, string> = {
      'MECE': '#3B82F6', // Blue
      'Design Thinking': '#8B5CF6', // Purple
      'SWOT': '#10B981', // Green
      'SWOT Analysis': '#10B981', // Green (same as SWOT)
      'First Principles': '#F59E0B', // Amber (Gold)
      'First Principles Thinking': '#F59E0B', // Amber (Gold) (same as First Principles)
      "Porter's Five Forces": '#EF4444', // Red
      'Jobs-To-Be-Done': '#6366F1', // Indigo
      'Blue Ocean': '#0EA5E9', // Sky Blue
      'SCAMPER': '#EC4899', // Pink
      'Problem-Tree': '#14B8A6', // Teal
      'Pareto': '#F97316'  // Orange
    };
    
    // Get the color from the mapping or use the default gold color
    if (frameworkColors[frameworkName]) {
      accentColor = frameworkColors[frameworkName];
    }

    // Generate QR code for certificate verification
    const baseUrl = process.env.BASE_URL || 'https://frameworkpro.ai';
    const verificationUrl = `${baseUrl}/api/certificates/verify/${certificate.certificateNumber}?framework=${encodeURIComponent(frameworkName)}`;
    const qrCode = await generateQrCode(verificationUrl, accentColor);

    // Get framework-specific background styles - match with frontend certificate-frame.tsx exactly
    const getBackgroundStyle = (name: string) => {
      const backgrounds: Record<string, any> = {
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
      
      return backgrounds[name] || backgrounds['Default'];
    };
    
    // Get background style for the current framework
    const backgroundStyle = getBackgroundStyle(frameworkName);
    
    // Create a compact certificate HTML that fits on one page
    const certificateHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${certificate.title} - Framework Pro</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        
        @page {
          size: 11in 8.5in;
          margin: 0.2in;
        }
        
        body {
          font-family: 'Outfit', 'Inter', 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        
        .certificate {
          width: 850px;
          height: 600px;
          margin: 20px auto;
          position: relative;
          border: 4px solid ${accentColor};
          border-radius: 15px;
          background: ${backgroundStyle.background};
          background-image: ${backgroundStyle.gradient};
          background-repeat: no-repeat;
          background-position: center center;
          background-size: 400px 400px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }
        
        /* Decorative Corner Elements */
        .corner {
          position: absolute;
          width: 60px;
          height: 60px;
          border-width: 4px;
          border-color: ${accentColor};
          z-index: 1;
        }
        
        .corner-tl {
          top: 0;
          left: 0;
          border-top-style: solid;
          border-left-style: solid;
          border-top-left-radius: 10px;
        }
        
        .corner-tr {
          top: 0;
          right: 0;
          border-top-style: solid;
          border-right-style: solid;
          border-top-right-radius: 10px;
        }
        
        .corner-bl {
          bottom: 0;
          left: 0;
          border-bottom-style: solid;
          border-left-style: solid;
          border-bottom-left-radius: 10px;
        }
        
        .corner-br {
          bottom: 0;
          right: 0;
          border-bottom-style: solid;
          border-right-style: solid;
          border-bottom-right-radius: 10px;
        }
        
        /* Light Pattern Elements */
        .pattern-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.1;
          background-image: ${backgroundStyle.pattern};
          background-size: ${backgroundStyle.patternSize};
          z-index: 1;
        }
        
        .inner-content {
          position: relative;
          margin: 10px;
          padding: 24px;
          height: calc(100% - 20px);
          z-index: 2;
          background-image: linear-gradient(rgba(255, 255, 255, 0.8), ${backgroundStyle.innerBg});
          background-position: 0 0;
          background-size: cover;
          background-color: ${backgroundStyle.innerBg};
          backdrop-filter: blur(4px);
          box-shadow: ${backgroundStyle.boxShadow};
        }
        
        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 16px;
          position: relative;
        }
        
        .logo {
          height: 80px;
          margin-bottom: 12px;
        }
        
        .title {
          font-family: 'Space Grotesk', serif;
          font-size: 28px;
          font-weight: bold;
          color: #000;
          margin-bottom: 5px;
          letter-spacing: 0.08em;
          word-spacing: 0.1em;
          text-align: center;
        }
        
        .certificate-number {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .verified-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to right, ${accentColor}10, ${accentColor}20);
          border: 1px solid ${accentColor};
          color: ${frameworkName === 'MECE' ? '#1e40af' : '#996515'};
          padding: 6px 12px;
          border-radius: 5px;
          font-size: 14px;
          font-weight: 600;
          margin: 0 auto;
        }
        
        .verified-badge::before {
          content: "✓";
          margin-right: 6px;
        }
        
        .content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin: 32px 0;
        }
        
        .award-text {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
        }
        
        .recipient {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .recipient-name {
          font-family: 'Space Grotesk', serif;
          font-size: 32px;
          font-weight: bold;
          color: #000;
          margin: 0;
        }
        
        .badge-icon {
          width: 60px;
          height: 60px;
          object-fit: contain;
          filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.2));
          transform: translateY(-2px);
        }
        
        .description-box {
          max-width: 80%;
          padding: 20px;
          border: 1px solid ${accentColor}40;
          border-radius: 8px;
          background-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 2px 10px ${accentColor}15;
          margin: 0 auto;
        }
        
        .description {
          font-size: 16px;
          color: #333;
          line-height: 1.5;
          text-align: center;
          margin: 0;
        }
        
        .bottom-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 15px;
          padding: 0 10px;
        }
        
        .signature-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 200px;
        }
        
        .signature {
          padding-bottom: 5px;
          border-bottom: 1px solid #ddd;
          width: 100%;
          margin-bottom: 8px;
          text-align: center;
        }
        
        .signature-image {
          height: 50px;
          max-width: 150px;
          margin: 0 auto;
          filter: contrast(1.3);
        }
        
        .signatory-details {
          text-align: center;
          width: 100%;
        }
        
        .signatory-name {
          font-weight: bold;
          font-size: 15px;
          margin: 0;
          color: #333;
        }
        
        .signatory-title {
          font-size: 13px;
          color: #666;
          margin-top: 2px;
        }
        
        .qr-section {
          display: flex;
          align-items: center;
          padding-right: 10px;
        }
        
        .qr-code {
          width: 75px;
          height: 75px;
          border: 1px solid #ddd;
          padding: 3px;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          margin-right: 12px;
        }
        
        .qr-details {
          margin-left: 4px;
          text-align: left;
        }
        
        .qr-text {
          font-size: 14px;
          color: ${accentColor};
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        
        .qr-info {
          font-size: 12px;
          color: #666;
          margin: 0;
        }
        
        .verification-section {
          margin-top: 25px;
          position: relative;
        }
        
        .verification-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, ${accentColor}30, ${accentColor}30, transparent);
          margin: 5px 0 15px 0;
        }
        
        .verification-text {
          text-align: center;
          font-size: 13px;
          color: ${accentColor};
          margin: 10px 0 25px 0;
          font-weight: 500;
          padding: 0 20px;
        }
        
        .certificate-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          margin-top: 5px;
          padding: 0 15px;
        }
        
        .footer-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 150px;
        }
        
        .footer-left {
          margin-right: auto;
        }
        
        .footer-right {
          margin-left: auto;
        }
        
        .footer-label {
          font-weight: bold;
          font-size: 12px;
          color: ${accentColor};
          margin: 0 0 5px 0;
          letter-spacing: 0.05em;
        }
        
        .footer-value {
          font-size: 12px;
          color: #666;
          font-weight: 600;
          margin: 0;
          max-width: 150px;
          white-space: normal;
          overflow-wrap: break-word;
        }
        
        /* Certificate dimensions and other styles remain unchanged */
      </style>
    </head>
    <body>
      <div class="certificate">
        <!-- Decorative Corner Elements -->
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>
        
        <!-- Light Pattern Elements -->
        <div class="pattern-overlay"></div>
        
        <div class="inner-content">
          <!-- Certificate Header -->
          <div class="header">
            <img src="data:image/jpeg;base64,${LOGO_BASE64}" alt="Framework Pro Logo" class="logo">
            <h2 class="title">${certificate.title}</h2>
            <p class="certificate-number">Certificate #${certificate.certificateNumber}</p>
            <div class="verified-badge">✓ Verified Certificate</div>
          </div>
          
          <!-- Certificate Content -->
          <div class="content">
            <p class="award-text">This certificate is awarded to</p>
            <div class="recipient">
              <h1 class="recipient-name">${user.name}</h1>
              <img src="data:image/png;base64,${BADGE_BASE64}" alt="Certified Professional" class="badge-icon">
            </div>
            <div class="description-box">
              <p class="description">${
                  // Use the new professional description if available, otherwise fall back to the certificate description
                  (getCertificateDescription(frameworkName) || certificate.description).length > 300 
                  ? (getCertificateDescription(frameworkName) || certificate.description).substring(0, 300) + '...' 
                  : (getCertificateDescription(frameworkName) || certificate.description)
                }</p>
            </div>
          </div>
          
          <!-- Bottom Section with Signature and QR -->
          <div class="bottom-section">
            <!-- Signature Section -->
            <div class="signature-section">
              <div class="signature">
                <img src="data:image/png;base64,${SIGNATURE_BASE64}" alt="Signature" class="signature-image">
              </div>
              <div class="signatory-details">
                <p class="signatory-name">Manas Kumar</p>
                <p class="signatory-title">CEO & Platform Director</p>
              </div>
            </div>
            
            <!-- QR Code Section -->
            <div class="qr-section">
              <img src="data:image/png;base64,${qrCode}" alt="QR Code" class="qr-code">
              <div class="qr-details">
                <p class="qr-text">Scan to verify</p>
                <p class="qr-info">Verify this certificate online</p>
              </div>
            </div>
          </div>
          
          <!-- Certificate verification text and footer -->
          <div class="verification-section">
            <div class="verification-divider"></div>
            <p class="verification-text">
              This certificate verifies mastery of the ${frameworkName} framework and its professional business applications.
            </p>
            
            <!-- Footer with Issue Date and Framework Name -->
            <div class="certificate-footer">
              <!-- Issue Date -->
              <div class="footer-item footer-left">
                <p class="footer-label">Issue Date</p>
                <p class="footer-value">${certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'}) : new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
              </div>
              
              <!-- Framework -->
              <div class="footer-item footer-right">
                <p class="footer-label">Framework</p>
                <p class="footer-value">${frameworkName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
    `;
    
    // Set response headers
    res.setHeader('Content-Type', 'text/html');
    
    // Create a safe filename for the certificate
    const sanitizedFrameworkName = frameworkName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const sanitizedUserName = user.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `FP-Certificate-${sanitizedFrameworkName}-${timestamp}.html`;
    
    // Set proper headers for download
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Add print-friendly instructions at the top of the HTML
    const printInstructions = `
    <!-- Print Instructions -->
    <div style="background: #f8f9fa; padding: 15px; margin: 15px 0; border: 1px solid #ddd; border-radius: 5px; font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto;">
      <h3 style="margin-top: 0; color: #333;">Certificate Download Instructions</h3>
      <p style="margin-bottom: 5px;">To save as PDF or print this certificate:</p>
      <ol style="margin-top: 5px;">
        <li>Right-click and select "Print" (or use Ctrl+P / Cmd+P)</li>
        <li>In the print dialog, select "Save as PDF" as the destination</li>
        <li>Set paper orientation to "Landscape"</li>
        <li>Ensure "Background Graphics" is checked in the print options</li>
        <li>Click "Save" to create your PDF certificate</li>
      </ol>
      <p style="font-size: 13px; color: #666; margin-top: 10px;">These instructions won't appear in your printed certificate.</p>
    </div>
    `;
    
    // Insert print instructions after the opening body tag
    const enhancedCertificateHtml = certificateHtml.replace(
      '<body',
      `<body onload="document.getElementById('printInstructions').style.display='block'"
      `
    ).replace(
      '<body>',
      `<body>
      <div id="printInstructions" style="display:none; print-display:none;">
        ${printInstructions}
      </div>
      <style>
        @media print {
          #printInstructions { display: none !important; }
          @page { 
            size: 11in 8.5in landscape; 
            margin: 0.2in; 
          }
          body { 
            margin: 0; 
            padding: 0; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .certificate {
            page-break-inside: avoid;
            box-shadow: none !important;
          }
        }
      </style>
      `
    );
    
    // Send enhanced certificate HTML
    res.send(enhancedCertificateHtml);
  } catch (error) {
    console.error("Error generating certificate:", error);
    next(error);
  }
}