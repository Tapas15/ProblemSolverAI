import 'express-session';

declare module 'express-session' {
  interface SessionData {
    twoFactorSetup?: {
      secret?: string;
    };
  }
}