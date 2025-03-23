import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import { Framework, User } from '@shared/schema';

export class CertificateService {
  /**
   * Generate a completion certificate for a framework
   * @param user - The user who completed the framework
   * @param framework - The completed framework
   * @param completionDate - The date of completion
   * @returns Buffer containing the PDF data
   */
  public async generateCertificate(
    user: User,
    framework: Framework,
    completionDate: Date = new Date()
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 50,
          info: {
            Title: `${framework.name} Completion Certificate`,
            Author: 'QuestionPro AI',
            Subject: 'Completion Certificate',
            Keywords: 'certificate, completion, framework, questionpro'
          }
        });

        // Set up document styling
        doc.font('Helvetica');
        
        // Add company logo/branding
        this.addBranding(doc);
        
        // Add certificate header
        this.addCertificateHeader(doc);
        
        // Add certificate content
        this.addCertificateContent(doc, user, framework, completionDate);
        
        // Add certificate footer
        this.addCertificateFooter(doc, completionDate);
        
        // Collect the PDF data in a buffer
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfData = Buffer.concat(chunks);
          resolve(pdfData);
        });
        
        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add branding elements to the certificate
   * @param doc - The PDF document
   */
  private addBranding(doc: PDFKit.PDFDocument): void {
    // Draw a border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
       .lineWidth(3)
       .stroke('#0A2540');
    
    // Add colored header area
    doc.rect(30, 30, doc.page.width - 60, 120)
       .fillAndStroke('#00A3E0', '#0A2540');
    
    // Add logo placeholder
    doc.fontSize(24)
       .fillColor('#FFB81C')
       .text('QuestionPro AI', 60, 70, { align: 'left' });
  }

  /**
   * Add certificate header
   * @param doc - The PDF document
   */
  private addCertificateHeader(doc: PDFKit.PDFDocument): void {
    doc.fontSize(42)
       .fillColor('#FFFFFF')
       .text('CERTIFICATE OF COMPLETION', doc.page.width / 2, 70, { 
         align: 'center' 
       });
  }

  /**
   * Add certificate content
   * @param doc - The PDF document
   * @param user - The user who completed the framework
   * @param framework - The completed framework
   * @param completionDate - The date of completion
   */
  private addCertificateContent(
    doc: PDFKit.PDFDocument, 
    user: User, 
    framework: Framework, 
    completionDate: Date
  ): void {
    const userName = user.name || user.username;
    
    // Certificate awarded text
    doc.moveDown(5)
       .fontSize(20)
       .fillColor('#0A2540')
       .text('This certificate is awarded to', { align: 'center' });
    
    // User name
    doc.moveDown(1)
       .fontSize(36)
       .fillColor('#0A2540')
       .text(userName, { align: 'center' });
    
    // Framework completion text
    doc.moveDown(1.5)
       .fontSize(18)
       .fillColor('#0A2540')
       .text(`for successfully completing all modules in the`, { align: 'center' });
    
    // Framework name
    doc.moveDown(0.5)
       .fontSize(26)
       .fillColor('#00A3E0')
       .text(framework.name, { align: 'center' });
    
    // Framework description summary
    doc.moveDown(1)
       .fontSize(14)
       .fillColor('#666666')
       .text(this.truncateDescription(framework.description), { 
         align: 'center',
         width: 500,
         lineGap: 5
       });
  }

  /**
   * Add certificate footer
   * @param doc - The PDF document
   * @param completionDate - The date of completion
   */
  private addCertificateFooter(doc: PDFKit.PDFDocument, completionDate: Date): void {
    const dateString = completionDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Add date
    doc.moveDown(3)
       .fontSize(14)
       .fillColor('#0A2540')
       .text(`Completed on: ${dateString}`, { align: 'center' });
       
    // Add signature line
    const signatureY = doc.y + 30;
    const signatureLineY = signatureY + 30;
    doc.moveTo(doc.page.width / 2 - 100, signatureLineY)
       .lineTo(doc.page.width / 2 + 100, signatureLineY)
       .stroke('#0A2540');
       
    // Add signature title
    doc.fontSize(12)
       .text('QuestionPro AI', doc.page.width / 2, signatureLineY + 10, { align: 'center' });
    
    // Add verification text
    doc.moveDown(4)
       .fontSize(10)
       .fillColor('#999999')
       .text('This certificate verifies the completion of all training modules within the framework.', {
         align: 'center'
       });
    
    // Add QR code placeholder text
    doc.fontSize(8)
       .text('Certificate ID: ' + this.generateCertificateId(completionDate), {
         align: 'center'
       });
  }

  /**
   * Truncate framework description if it's too long
   * @param description - The framework description
   * @returns Truncated description
   */
  private truncateDescription(description: string): string {
    if (description.length > 300) {
      return description.substring(0, 297) + '...';
    }
    return description;
  }

  /**
   * Generate a unique certificate ID
   * @param completionDate - The date of completion
   * @returns Certificate ID
   */
  private generateCertificateId(completionDate: Date): string {
    const timestamp = completionDate.getTime();
    const randomPart = Math.floor(Math.random() * 10000);
    return `CERT-${timestamp}-${randomPart}`;
  }
}

export const certificateService = new CertificateService();