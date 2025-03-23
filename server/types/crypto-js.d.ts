declare module 'crypto-js' {
  namespace CryptoJS {
    interface LibWordArray {
      words: number[];
      sigBytes: number;
      toString(encoder?: any): string;
      concat(wordArray: LibWordArray): this;
      clamp(): void;
      clone(): LibWordArray;
    }

    interface Encoder {
      stringify(wordArray: LibWordArray): string;
      parse(str: string): LibWordArray;
    }

    const enc: {
      Utf8: Encoder;
      Latin1: Encoder;
      Hex: Encoder;
      Base64: Encoder;
      Base64url: Encoder;
    };

    function MD5(message: string | LibWordArray): LibWordArray;
    function SHA1(message: string | LibWordArray): LibWordArray;
    function SHA256(message: string | LibWordArray): LibWordArray;
    function SHA512(message: string | LibWordArray): LibWordArray;
    function HmacSHA1(message: string | LibWordArray, key: string | LibWordArray): LibWordArray;
    function HmacSHA256(message: string | LibWordArray, key: string | LibWordArray): LibWordArray;
    function HmacSHA512(message: string | LibWordArray, key: string | LibWordArray): LibWordArray;
    function AES(message: string | LibWordArray, key: string | LibWordArray, cfg?: any): LibWordArray;
    function DES(message: string | LibWordArray, key: string | LibWordArray, cfg?: any): LibWordArray;
    function TripleDES(message: string | LibWordArray, key: string | LibWordArray, cfg?: any): LibWordArray;
    function Rabbit(message: string | LibWordArray, key: string | LibWordArray, cfg?: any): LibWordArray;
    function RC4(message: string | LibWordArray, key: string | LibWordArray, cfg?: any): LibWordArray;
    function RC4Drop(message: string | LibWordArray, key: string | LibWordArray, cfg?: any): LibWordArray;
    function pad(data: any, blockSize: number): void;
    function unpad(data: any): void;

    function lib(message: string | LibWordArray, key: string | LibWordArray, cfg?: any): LibWordArray;
    function mode(message: string | LibWordArray, key: string | LibWordArray, cfg?: any): LibWordArray;
    function format(message: string | LibWordArray, key: string | LibWordArray, cfg?: any): LibWordArray;
    function kdf(message: string | LibWordArray, key: string | LibWordArray, cfg?: any): LibWordArray;
    function algo(message: string | LibWordArray, key: string | LibWordArray, cfg?: any): LibWordArray;
  }

  export = CryptoJS;
}