import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { storage } from '../storage';
import { randomBytes } from 'crypto';

export class TwoFactorAuthService {
  /**
   * Generate a new secret key for a user
   * @returns Object containing secret information
   */
  public generateSecret(username: string): {
    secret: string;
    otpauth_url: string;
  } {
    const secretObj = speakeasy.generateSecret({
      name: `QuestionPro AI (${username})`,
      issuer: 'QuestionPro AI'
    });

    return {
      secret: secretObj.base32,
      otpauth_url: secretObj.otpauth_url || ''
    };
  }

  /**
   * Generate a QR code for the 2FA setup
   * @param otpauthUrl The otpauth URL generated from speakeasy
   * @returns Promise resolving to a data URL of the QR code
   */
  public async generateQrCode(otpauthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify a token against a user's secret
   * @param token The token provided by the user
   * @param secret The user's secret
   * @returns Boolean indicating if the token is valid
   */
  public verifyToken(token: string, secret: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }

  /**
   * Generate backup codes for a user
   * @param count Number of backup codes to generate
   * @returns Array of backup codes
   */
  public generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.substring(0, 4)}-${code.substring(4)}`);
    }
    return codes;
  }

  /**
   * Verify a backup code
   * @param code The backup code provided by the user
   * @param storedCodes The stored backup codes
   * @returns Object with validity and updated codes
   */
  public verifyBackupCode(
    code: string,
    storedCodesJson: string
  ): { isValid: boolean; updatedCodes: string[] | null } {
    try {
      const storedCodes: string[] = JSON.parse(storedCodesJson);
      const normalizedCode = code.replace(/\s+/g, '').toUpperCase();
      
      const index = storedCodes.findIndex(
        (c) => c.replace(/-/g, '') === normalizedCode.replace(/-/g, '')
      );
      
      if (index === -1) {
        return { isValid: false, updatedCodes: null };
      }
      
      // Remove the used backup code
      const updatedCodes = [...storedCodes];
      updatedCodes.splice(index, 1);
      
      return { isValid: true, updatedCodes };
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return { isValid: false, updatedCodes: null };
    }
  }

  /**
   * Enable 2FA for a user
   * @param userId The user's ID
   * @param secret The generated secret
   * @returns Promise resolving to the updated user
   */
  public async enableTwoFactor(userId: number, secret: string): Promise<any> {
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    
    // Update the user record with 2FA information
    return await storage.updateUser(userId, {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorBackupCodes: JSON.stringify(backupCodes)
    });
  }

  /**
   * Disable 2FA for a user
   * @param userId The user's ID
   * @returns Promise resolving to the updated user
   */
  public async disableTwoFactor(userId: number): Promise<any> {
    // Update the user record to disable 2FA
    return await storage.updateUser(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null
    });
  }
}

export const twoFactorAuthService = new TwoFactorAuthService();