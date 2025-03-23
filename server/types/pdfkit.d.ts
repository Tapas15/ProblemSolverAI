declare module 'pdfkit' {
  import { EventEmitter } from 'events';
  
  namespace PDFDocument {
    interface PDFDocumentOptions {
      size?: string | [number, number];
      margin?: number;
      margins?: { top: number; left: number; bottom: number; right: number };
      layout?: 'portrait' | 'landscape';
      info?: {
        Title?: string;
        Author?: string;
        Subject?: string;
        Keywords?: string;
      };
      autoFirstPage?: boolean;
      bufferPages?: boolean;
    }
    
    type LineCapStyle = 'butt' | 'round' | 'square';
    type LineJoinStyle = 'miter' | 'round' | 'bevel';
    
    interface TextOptions {
      align?: 'left' | 'center' | 'right' | 'justify';
      width?: number;
      height?: number;
      continued?: boolean;
      indent?: number;
      paragraphGap?: number;
      lineGap?: number;
      columns?: number;
      columnGap?: number;
      wordSpacing?: number;
      characterSpacing?: number;
      fill?: boolean;
      stroke?: boolean;
      underline?: boolean;
      link?: string;
      goTo?: string | number;
      destination?: string;
    }
  }
  
  class PDFDocument extends EventEmitter {
    constructor(options?: PDFDocument.PDFDocumentOptions);
    
    // Properties
    page: {
      width: number;
      height: number;
      margins: {
        top: number;
        left: number;
        bottom: number;
        right: number;
      };
    };
    x: number;
    y: number;
    
    // Stream methods
    pipe(dest: NodeJS.WritableStream): this;
    end(): void;
    
    // Text methods
    text(text: string, x?: number, y?: number, options?: PDFDocument.TextOptions): this;
    font(src: string, family?: string): this;
    fontSize(size: number): this;
    
    // Style methods
    fillColor(color: string | number, opacity?: number): this;
    strokeColor(color: string | number, opacity?: number): this;
    lineWidth(width: number): this;
    opacity(opacity: number): this;
    
    // Drawing methods
    rect(x: number, y: number, width: number, height: number): this;
    circle(x: number, y: number, radius: number): this;
    polygon(...points: number[]): this;
    lineTo(x: number, y: number): this;
    moveTo(x: number, y: number): this;
    
    // Path operations
    stroke(color?: string): this;
    fill(color?: string): this;
    fillAndStroke(fillColor?: string, strokeColor?: string): this;
    
    // Document operations
    addPage(options?: PDFDocument.PDFDocumentOptions): this;
    switchToPage(pageNumber: number): this;
    save(): this;
    restore(): this;
    
    // State changes
    scale(xFactor: number, yFactor?: number): this;
    translate(x: number, y: number): this;
    rotate(angle: number, options?: { origin?: [number, number] }): this;
    
    // Content methods
    moveDown(lines?: number): this;
    moveUp(lines?: number): this;
    
    // Images
    image(src: string | Buffer, x?: number, y?: number, options?: { width?: number, height?: number, fit?: [number, number], align?: string, valign?: string }): this;
  }
  
  export = PDFDocument;
}