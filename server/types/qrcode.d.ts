declare module 'qrcode' {
  interface QRCodeToStringOptions {
    type?: 'utf8' | 'terminal' | 'svg';
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    size?: number;
    margin?: number;
    scale?: number;
    width?: number;
    small?: boolean;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  interface QRCodeToDataURLOptions {
    type?: 'image/png' | 'image/jpeg' | 'image/webp';
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    size?: number;
    margin?: number;
    scale?: number;
    width?: number;
    quality?: number; // Only for image/jpeg and image/webp
    color?: {
      dark?: string;
      light?: string;
    };
  }

  interface QRCodeToFileOptions extends QRCodeToDataURLOptions {
    type?: 'png' | 'svg' | 'utf8';
    color?: {
      dark?: string;
      light?: string;
    };
    rendererOpts?: {
      deflateLevel?: number;
      deflateStrategy?: number;
      quality?: number;
    };
  }

  export function toString(
    text: string,
    options?: QRCodeToStringOptions,
    cb?: (error: Error | null, string: string) => void
  ): Promise<string>;

  export function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions,
    cb?: (error: Error | null, url: string) => void
  ): Promise<string>;

  export function toFile(
    path: string,
    text: string,
    options?: QRCodeToFileOptions,
    cb?: (error: Error | null) => void
  ): Promise<void>;

  export function toFileStream(
    stream: NodeJS.WritableStream,
    text: string,
    options?: QRCodeToFileOptions
  ): void;

  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: QRCodeToDataURLOptions,
    cb?: (error: Error | null) => void
  ): Promise<void>;

  export function toCanvas(
    text: string,
    options?: QRCodeToDataURLOptions,
    cb?: (error: Error | null, canvas: HTMLCanvasElement) => void
  ): Promise<HTMLCanvasElement>;
}