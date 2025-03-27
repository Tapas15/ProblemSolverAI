import QRCode from 'qrcode';

interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  scale?: number;
  width?: number;
  color?: {
    dark: string;
    light: string;
  };
}

/**
 * Generates a QR code as a data URL
 * @param data The data to encode in the QR code
 * @param options Optional configuration for the QR code
 * @returns A Promise that resolves to a data URL string
 */
export async function generateQRCode(data: string, options: QRCodeOptions = {}): Promise<string> {
  const opts = {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    margin: options.margin !== undefined ? options.margin : 4,
    scale: options.scale || 4,
    width: options.width,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#ffffff'
    }
  };

  try {
    const qrDataUrl = await QRCode.toDataURL(data, opts);
    return qrDataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generates a QR code as an SVG string
 * @param data The data to encode in the QR code
 * @param options Optional configuration for the QR code
 * @returns A Promise that resolves to an SVG string
 */
export async function generateQRCodeSvg(data: string, options: QRCodeOptions = {}): Promise<string> {
  const opts = {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    margin: options.margin !== undefined ? options.margin : 4,
    scale: options.scale || 4,
    width: options.width,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#ffffff'
    }
  };

  try {
    const qrSvg = await QRCode.toString(data, {
      ...opts,
      type: 'svg'
    });
    return qrSvg;
  } catch (err) {
    console.error('Error generating QR code SVG:', err);
    throw new Error('Failed to generate QR code SVG');
  }
}

/**
 * Extracts certificate ID from certificate number in format "FP-{frameworkId}-{userId}-{timestamp}"
 * @param certificateNumber The certificate number string
 * @returns Object containing extracted parts or null if invalid format
 */
export function parseCertificateNumber(certificateNumber: string): { 
  frameworkId: number; 
  userId: number; 
  timestamp: number;
} | null {
  const regex = /^FP-(\d+)-(\d+)-(\d+)$/;
  const match = certificateNumber.match(regex);
  
  if (!match || match.length !== 4) {
    return null;
  }
  
  return {
    frameworkId: parseInt(match[1], 10),
    userId: parseInt(match[2], 10),
    timestamp: parseInt(match[3], 10)
  };
}