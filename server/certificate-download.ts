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

    // Get framework-specific background style - match with frontend backgrounds
    let backgroundColor = '#F8F5E6'; // Default cream background
    
    // Use a mapping object to match frontend backgrounds (from certificate-frame.tsx)
    const frameworkBackgrounds: Record<string, string> = {
      'MECE': '#f0f8ff', // Light blue background
      'First Principles': '#edf5f7', // Light teal
      'First Principles Thinking': '#edf5f7', // Light teal (same as First Principles)
      'SWOT': '#f0f7f0', // Light green
      'SWOT Analysis': '#f0f7f0', // Light green (same as SWOT)
      'Design Thinking': '#f8f0ff', // Light purple
      'Jobs-To-Be-Done': '#f0f1ff', // Light indigo
      'Porter\'s Five Forces': '#fff0f0', // Light red
      'Blue Ocean': '#f0f7ff', // Light sky blue
      'SCAMPER': '#fdf0f7', // Light pink
      'Problem-Tree': '#f0faf8', // Light teal
      'Pareto': '#fff5f0'  // Light orange
    };
    
    // Get the background color from the mapping or use the default cream background
    if (frameworkBackgrounds[frameworkName]) {
      backgroundColor = frameworkBackgrounds[frameworkName];
    }
    
    // Create a compact certificate HTML that fits on one page
    const certificateHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${certificate.title} - Framework Pro</title>
      <style>
        @page {
          size: 11in 8.5in;
          margin: 0.2in;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: ${backgroundColor};
        }
        
        .certificate {
          width: 800px;
          height: 650px; /* Increased height to accommodate all content */
          margin: 0 auto;
          position: relative;
          border: 3px solid ${accentColor};
          background-color: #fff;
          box-sizing: border-box;
          overflow: hidden; /* Ensure content doesn't overflow */
        }
        
        .corner {
          position: absolute;
          width: 30px;
          height: 30px;
          border-width: 3px;
          border-color: ${accentColor};
        }
        
        .corner-tl {
          top: 5px;
          left: 5px;
          border-top-style: solid;
          border-left-style: solid;
        }
        
        .corner-tr {
          top: 5px;
          right: 5px;
          border-top-style: solid;
          border-right-style: solid;
        }
        
        .corner-bl {
          bottom: 5px;
          left: 5px;
          border-bottom-style: solid;
          border-left-style: solid;
        }
        
        .corner-br {
          bottom: 5px;
          right: 5px;
          border-bottom-style: solid;
          border-right-style: solid;
        }
        
        .inner-content {
          padding: 20px;
          margin: 10px;
          height: calc(100% - 20px);
          border: 1px solid #ddd;
          background-color: #fff;
          position: relative;
        }
        
        .header {
          text-align: center;
          margin-bottom: 10px;
        }
        
        .logo {
          height: 50px;
          margin-bottom: 5px;
        }
        
        .title {
          font-size: 24px;
          font-weight: bold;
          color: ${accentColor};
          margin: 5px 0;
        }
        
        .certificate-number {
          font-size: 12px;
          color: #666;
          margin: 3px 0;
        }
        
        .verified-badge {
          display: inline-block;
          background-color: ${accentColor}20;
          border: 1px solid ${accentColor};
          color: ${accentColor};
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
          margin: 5px auto;
        }
        
        .content {
          text-align: center;
          margin: 10px 0;
        }
        
        .award-text {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          margin: 0 0 5px 0;
        }
        
        .recipient {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 5px 0 10px 0;
        }
        
        .recipient-name {
          font-size: 28px;
          font-weight: bold;
          margin: 0;
        }
        
        .badge-icon {
          height: 40px;
          margin-left: 10px;
        }
        
        .description-box {
          margin: 0 auto 15px auto;
          padding: 20px 25px;
          max-width: 80%;
          border: 1px solid ${accentColor}40;
          background-color: ${accentColor}05;
          box-shadow: 0 1px 3px ${accentColor}10;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 4px;
        }
        
        .description {
          font-size: 14px;
          line-height: 1.6;
          margin: 0 auto;
          text-align: center;
          color: #333;
          font-family: 'Georgia', serif;
          font-style: italic;
          max-width: 90%;
        }
        
        .bottom-section {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
        }
        
        .signature-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 170px;
        }
        
        .signature {
          display: flex;
          justify-content: center;
          width: 100%;
          margin-bottom: 8px;
        }
        
        .signature-image {
          height: 40px;
          max-width: 120px;
          margin: 0 auto;
        }
        
        .signatory-details {
          text-align: center;
          width: 100%;
        }
        
        .signatory-name {
          font-weight: bold;
          font-size: 14px;
          margin: 0;
        }
        
        .signatory-title {
          font-size: 12px;
          color: #666;
          margin: 0;
        }
        
        .qr-section {
          display: flex;
          align-items: center;
          margin-right: 5px;
        }
        
        .qr-code {
          width: 70px;
          height: 70px;
          border: 1px solid #ddd;
          padding: 2px;
          margin-right: 10px;
        }
        
        .qr-details {
          margin-left: 5px;
          text-align: left;
        }
        
        .qr-text {
          font-size: 12px;
          color: ${accentColor};
          font-weight: bold;
          margin: 0 0 3px 0;
        }
        
        .qr-info {
          font-size: 10px;
          color: #666;
          margin: 0;
        }
        
        .certificate-footer {
          display: flex;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          margin-top: 15px;
          font-size: 12px;
          color: #666;
          width: 100%;
          box-sizing: border-box;
        }
        
        .footer-item {
          text-align: left;
          flex: 1;
          padding: 0 10px;
        }
        
        /* Align left item (Issue Date) */
        .footer-item:first-child {
          max-width: 35%;
        }
        
        /* Align right item (Framework) to align with QR code */
        .footer-item:last-child {
          max-width: 35%;
          margin-right: 5px;
        }
        
        .footer-label {
          font-weight: bold;
          color: ${accentColor};
          margin: 0 0 3px 0;
        }
        
        .footer-value {
          margin: 0;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
        }
        
        /* Certificate dimensions and other styles remain unchanged */
      </style>
    </head>
    <body>
      <div class="certificate">
        <!-- Corner elements -->
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>
        
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
          
          <!-- Certificate verification text - now positioned ABOVE the framework and issue date -->
          <div style="border-top: 1px solid #ddd; margin-top: 15px; padding-top: 15px; text-align: center;">
            <p style="font-size: 12px; color: ${accentColor}; margin: 0 0 20px 0; font-weight: 500;">
              This certificate verifies mastery of the ${frameworkName} framework and its professional business applications.
            </p>
          </div>
          
          <!-- Issue Date section - positioned absolutely on left side -->
          <div style="position: absolute; bottom: 35px; left: 75px; text-align: center; width: 180px;">
            <p style="font-weight: bold; color: ${accentColor}; margin: 0 0 3px 0; font-size: 12px;">Issue Date</p>
            <p style="font-weight: 600; margin: 0; font-size: 12px; color: #666;">${certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'}) : new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
          </div>
          
          <!-- Framework section - positioned absolutely on right side for perfect alignment with QR code -->
          <div style="position: absolute; bottom: 35px; right: 78px; text-align: center; width: 100px;">
            <p style="font-weight: bold; color: ${accentColor}; margin: 0 0 3px 0; font-size: 12px;">Framework</p>
            <p style="font-weight: 600; margin: 0; font-size: 12px; color: #666; white-space: normal; overflow-wrap: break-word;">${frameworkName}</p>
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