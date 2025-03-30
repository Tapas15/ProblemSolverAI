import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { storage } from './storage';
import QRCode from 'qrcode';
import { getCertificateDescription } from '../shared/certificate-descriptions';

/**
 * Download a certificate by ID with a layout matching the screenshot exactly
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
    
    // Determine accent color based on framework - match frontend certificate-frame.tsx colors exactly
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
      'Blue Ocean Strategy': '#0EA5E9', // Sky Blue
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
    
    // Create a certificate HTML that exactly matches the screenshot
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
          margin: 0;
        }
        
        body {
          font-family: 'Inter', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: white;
        }
        
        .certificate-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
        }
        
        .certificate {
          width: 100%;
          max-width: 950px;
          margin: 0 auto;
          position: relative;
          background-color: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        /* Border with corners */
        .certificate::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 3px solid ${accentColor};
          pointer-events: none;
        }
        
        /* Corner accents */
        .corner {
          position: absolute;
          width: 30px;
          height: 30px;
          border-color: ${accentColor};
          border-width: 3px;
          z-index: 5;
        }
        
        .corner-tl {
          top: -3px;
          left: -3px;
          border-top: 3px solid ${accentColor};
          border-left: 3px solid ${accentColor};
        }
        
        .corner-tr {
          top: -3px;
          right: -3px;
          border-top: 3px solid ${accentColor};
          border-right: 3px solid ${accentColor};
        }
        
        .corner-bl {
          bottom: -3px;
          left: -3px;
          border-bottom: 3px solid ${accentColor};
          border-left: 3px solid ${accentColor};
        }
        
        .corner-br {
          bottom: -3px;
          right: -3px;
          border-bottom: 3px solid ${accentColor};
          border-right: 3px solid ${accentColor};
        }
        
        .certificate-content {
          padding: 40px;
          position: relative;
          z-index: 2;
        }
        
        /* Header section */
        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .logo {
          width: 70px;
          height: 70px;
          margin-bottom: 20px;
          background-color: black;
        }
        
        .title {
          font-family: 'Space Grotesk', serif;
          font-size: 28px;
          font-weight: bold;
          color: ${accentColor};
          margin: 10px 0 5px;
          text-align: center;
        }
        
        .certificate-number {
          font-size: 14px;
          color: #666;
          margin: 5px 0 10px;
          text-align: center;
        }
        
        .verified-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid ${accentColor};
          color: #333;
          padding: 5px 15px;
          border-radius: 3px;
          font-size: 14px;
          font-weight: 500;
          margin: 10px auto;
        }
        
        .verified-badge::before {
          content: "✓";
          color: ${accentColor};
          margin-right: 5px;
        }
        
        /* Award text */
        .award-text {
          text-align: center;
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 20px 0 5px;
        }
        
        /* Recipient name */
        .recipient {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 10px 0 25px;
        }
        
        .recipient-name {
          font-family: 'Space Grotesk', serif;
          font-size: 36px;
          font-weight: bold;
          color: #000;
          margin: 0;
          text-align: center;
        }
        
        .badge-icon {
          width: 45px;
          height: 45px;
          margin-left: 10px;
          object-fit: contain;
        }
        
        /* Description box */
        .description-box {
          width: 85%;
          margin: 0 auto 30px;
          padding: 20px;
          border: 1px solid ${accentColor};
          border-radius: 5px;
          background-color: white;
        }
        
        .description {
          font-size: 16px;
          line-height: 1.5;
          color: #333;
          text-align: center;
          margin: 0;
          font-style: italic;
        }
        
        /* Signature and QR section */
        .bottom-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 20px;
        }
        
        .signature-section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-left: 20px;
        }
        
        .signature {
          margin-bottom: 5px;
        }
        
        .signature-image {
          height: 60px;
          max-width: 180px;
        }
        
        .signatory-name {
          font-weight: bold;
          font-size: 16px;
          margin: 5px 0 0;
          color: #333;
        }
        
        .signatory-title {
          font-size: 13px;
          color: #666;
          margin: 2px 0 0;
        }
        
        .qr-section {
          display: flex;
          align-items: center;
          margin-right: 20px;
        }
        
        .qr-code {
          width: 70px;
          height: 70px;
          margin-right: 10px;
          border: 1px solid #ddd;
        }
        
        .qr-details {
          display: flex;
          flex-direction: column;
        }
        
        .qr-text {
          font-size: 14px;
          color: ${accentColor};
          font-weight: bold;
          margin: 0 0 3px;
        }
        
        .qr-info {
          font-size: 12px;
          color: #666;
          margin: 0;
        }
        
        /* Verification section */
        .divider {
          width: 100%;
          height: 1px;
          background-color: #ddd;
          margin: 30px 0 15px;
        }
        
        .verification-text {
          text-align: center;
          font-size: 14px;
          color: ${accentColor};
          margin: 0 0 20px;
        }
        
        /* Footer */
        .certificate-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
        
        .footer-left {
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        
        .footer-right {
          display: flex;
          flex-direction: column;
          text-align: right;
        }
        
        .footer-label {
          font-size: 14px;
          font-weight: bold;
          color: ${accentColor};
          margin: 0 0 5px;
        }
        
        .footer-value {
          font-size: 14px;
          color: #333;
          margin: 0;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .certificate {
            box-shadow: none;
            margin: 0;
            page-break-inside: avoid;
          }
          
          #printInstructions {
            display: none !important;
          }
          
          .certificate-container {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div id="printInstructions" style="background: #f8f9fa; padding: 15px; margin: 15px auto; border: 1px solid #ddd; border-radius: 5px; font-family: Arial, sans-serif; max-width: 800px;">
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
      
      <div class="certificate-container">
        <div class="certificate">
          <!-- Corner Elements -->
          <div class="corner corner-tl"></div>
          <div class="corner corner-tr"></div>
          <div class="corner corner-bl"></div>
          <div class="corner corner-br"></div>
          
          <div class="certificate-content">
            <!-- Certificate Header -->
            <div class="header">
              <img src="/api/images/fp-logo-certificates-optimized.jpg" alt="Framework Pro Logo" class="logo" onerror="this.src='/api/images/fp-logo-new.png'; this.onerror=null;">
              <h2 class="title">${certificate.title}</h2>
              <p class="certificate-number">Certificate #${certificate.certificateNumber}</p>
              <div class="verified-badge">✓ Verified Certificate</div>
            </div>
            
            <!-- Certificate Content -->
            <p class="award-text">THIS CERTIFICATE IS AWARDED TO</p>
            
            <div class="recipient">
              <h1 class="recipient-name">${user.name}</h1>
              <img src="/api/images/certified-badge.png" alt="Certified Professional" class="badge-icon" onerror="this.style.display='none';">
            </div>
            
            <div class="description-box">
              <p class="description">${
                  // Use the new professional description if available, otherwise fall back to the certificate description
                  (getCertificateDescription(frameworkName) || certificate.description).length > 300 
                  ? (getCertificateDescription(frameworkName) || certificate.description).substring(0, 300) + '...' 
                  : (getCertificateDescription(frameworkName) || certificate.description)
                }</p>
            </div>
            
            <!-- Bottom Section with Signature and QR -->
            <div class="bottom-section">
              <!-- Signature Section -->
              <div class="signature-section">
                <div class="signature">
                  <img src="/api/images/manas-signature.png" alt="Signature" class="signature-image" onerror="this.src='/api/images/signature-new.jpg'; this.onerror=null;">
                </div>
                <p class="signatory-name">Manas Kumar</p>
                <p class="signatory-title">CEO & Platform Director</p>
              </div>
              
              <!-- QR Code Section -->
              <div class="qr-section">
                <img src="/api/certificates/${certificate.id}/qr" alt="QR Code" class="qr-code">
                <div class="qr-details">
                  <p class="qr-text">Scan to verify</p>
                  <p class="qr-info">Verify this certificate online</p>
                </div>
              </div>
            </div>
            
            <!-- Divider -->
            <div class="divider"></div>
            
            <!-- Verification Text -->
            <p class="verification-text">
              This certificate verifies mastery of the ${frameworkName} framework and its professional business applications.
            </p>
            
            <!-- Footer with Issue Date and Framework Name -->
            <div class="certificate-footer">
              <!-- Issue Date -->
              <div class="footer-left">
                <p class="footer-label">Issue Date</p>
                <p class="footer-value">${certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'}) : new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
              </div>
              
              <!-- Framework -->
              <div class="footer-right">
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
          }, 1000);
        };
      </script>
    </body>
    </html>
    `;
    
    // Set proper headers for download
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const sanitizedFrameworkName = frameworkName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `FP-Certificate-${sanitizedFrameworkName}-${timestamp}.html`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Send the certificate HTML to the response
    res.send(certificateHtml);
  } catch (error) {
    console.error("Error generating certificate:", error);
    next(error);
  }
}