declare module 'speakeasy' {
  interface GenerateSecretOptions {
    name?: string;
    issuer?: string;
    length?: number;
    symbols?: boolean;
    otpauth_url?: boolean;
  }

  interface GenerateSecretResult {
    ascii: string;
    base32: string;
    hex: string;
    otpauth_url?: string;
  }

  interface TotpVerifyOptions {
    secret: string;
    encoding?: 'ascii' | 'base32' | 'hex';
    token: string;
    window?: number;
    step?: number;
    time?: number;
    timestamp?: number;
    counter?: number;
  }

  interface HotpVerifyOptions {
    secret: string;
    encoding?: 'ascii' | 'base32' | 'hex';
    token: string;
    counter: number;
    window?: number;
  }

  export function generateSecret(options?: GenerateSecretOptions): GenerateSecretResult;

  export namespace hotp {
    function generate(options: {
      secret: string;
      encoding?: 'ascii' | 'base32' | 'hex';
      counter: number;
      digits?: number;
    }): string;

    function verify(options: HotpVerifyOptions): boolean;
  }

  export namespace totp {
    function generate(options: {
      secret: string;
      encoding?: 'ascii' | 'base32' | 'hex';
      step?: number;
      time?: number;
      timestamp?: number;
      digits?: number;
      counter?: number;
    }): string;

    function verify(options: TotpVerifyOptions): boolean;
  }
}