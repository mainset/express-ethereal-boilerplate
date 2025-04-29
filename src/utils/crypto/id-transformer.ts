import crypto from 'crypto';

/** Characters used for Base62 encoding (0-9, A-Z, a-z) */
const BASE62_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/** Base for encoding calculations (length of alphabet) */
const BASE62_BASE = BigInt(BASE62_ALPHABET.length);

/**
 * Configuration options for the ID Transformer
 */
interface TransformerConfig {
  /** Salt string used for ID obfuscation */
  salt: string;
  /** Separator between prefix and encoded ID (default: '_') */
  separator?: string;
}

/**
 * Transforms database IDs into URL-safe public identifiers and back
 * Uses Base62 encoding with salt-based obfuscation
 * Implements singleton pattern for global salt configuration
 */
class IdTransformer {
  /** Singleton instance */
  private static instance: IdTransformer;

  /** Salt value converted to bigint for calculations */
  private salt!: bigint;

  /** Separator between prefix and encoded ID */
  private separator: string;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.separator = '_'; // default separator
  }

  /**
   * Initializes the transformer with configuration
   * Must be called before any encode/decode operations
   * @throws Error if salt is not provided
   */
  static init(config: TransformerConfig): void {
    if (!config.salt) {
      throw new Error('Salt must be provided.');
    }
    if (!IdTransformer.instance) {
      IdTransformer.instance = new IdTransformer();
    }
    // Convert salt string to bigint using sha256 hash for consistency and security
    // IdTransformer.instance.salt = BigInt(
    //   '0x' + Buffer.from(config.salt, 'utf8').toString('hex'),
    // );
    IdTransformer.instance.salt = BigInt(
      '0x' +
        crypto
          .createHash('sha256')
          .update(config.salt)
          .digest('hex')
          .slice(0, 12), // Use the first 16 bytes of the hash
    );
  }

  /**
   * Gets the singleton instance of the transformer
   * @throws Error if transformer hasn't been initialized
   */
  private static getInstance(): IdTransformer {
    if (!IdTransformer.instance) {
      throw new Error('IdTransformer must be initialized first.');
    }
    return IdTransformer.instance;
  }

  /**
   * Converts database ID to public ID with optional prefix
   * @param prefix - Optional prefix for the ID (e.g., 'usr', 'doc')
   * @param id - Database integer ID
   * @returns URL-safe Base62 encoded string with optional prefix
   */
  static encode(id: number, prefix?: string): string {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('ID must be a positive integer');
    }

    const idTransformerInstance = IdTransformer.getInstance();
    const numId = BigInt(id);

    // Apply reversible transformation using bit-shifting and XOR
    const shifted = numId << 5n;
    const transformed = shifted ^ idTransformerInstance.salt;
    const encoded = IdTransformer.toBase62(transformed);

    return prefix
      ? `${prefix}${idTransformerInstance.separator}${encoded}`
      : encoded;
  }

  /**
   * Converts public ID back to database ID
   * @param encoded - Base62 encoded string with optional prefix
   * @returns Original database ID
   */
  static decode(encoded: string): number {
    const idTransformerInstance = IdTransformer.getInstance();

    // Remove prefix if present
    const parts = encoded.split(idTransformerInstance.separator);
    const encodedPart = parts[parts.length - 1];

    const transformed = IdTransformer.fromBase62(encodedPart);

    // Reverse the transformation by XORing and shifting back
    const unshifted = transformed ^ idTransformerInstance.salt;
    const original = unshifted >> 5n;

    return Number(original);
  }

  /**
   * Gets prefix from encoded ID if present
   * @param encoded - Encoded ID with possible prefix
   * @returns Prefix if present, undefined otherwise
   */
  static getPrefix(encoded: string): string | undefined {
    const idTransformerInstance = IdTransformer.getInstance();

    const parts = encoded.split(idTransformerInstance.separator);
    return parts.length > 1 ? parts[0] : undefined;
  }

  /**
   * Converts bigint to Base62 string
   * @param num - Number to convert
   * @returns Base62 encoded string
   */
  private static toBase62(num: bigint): string {
    if (num === 0n) return BASE62_ALPHABET[0];
    let str = '';
    while (num > 0n) {
      str = BASE62_ALPHABET[Number(num % BASE62_BASE)] + str;
      num /= BASE62_BASE;
    }
    return str;
  }

  /**
   * Converts Base62 string back to bigint
   * @param encoded - Base62 string to convert
   * @returns Original number as bigint
   * @throws Error if string contains invalid characters
   */
  private static fromBase62(encoded: string): bigint {
    return encoded.split('').reduce((acc, char) => {
      const idx = BASE62_ALPHABET.indexOf(char);
      if (idx === -1) {
        throw new Error(`Invalid Base62 character: ${char}`);
      }
      return acc * BASE62_BASE + BigInt(idx);
    }, 0n);
  }

  /**
   * Tests the transformer with various IDs
   * Verifies encode/decode reversibility
   */
  static test(): void {
    IdTransformer.init({
      salt: 'test-salt-for-development-only',
    });

    const testCases = [
      { id: 1, prefix: 'usr' },
      { id: 42, prefix: 'doc' },
      { id: 123 },
      { id: 9999, prefix: 'item' },
    ];

    console.log('ID Transformer Test:');
    console.log('-------------------');
    testCases.forEach(({ prefix, id }) => {
      const encoded = IdTransformer.encode(id, prefix);
      const decoded = IdTransformer.decode(encoded);
      const extractedPrefix = IdTransformer.getPrefix(encoded);

      console.log(
        `${prefix ?? ''} ${id.toString().padStart(6)} → ${encoded} → ${decoded}` +
          (prefix ? ` (prefix: ${extractedPrefix})` : ''),
      );

      if (id !== decoded) {
        throw new Error(`Failed: ${id} !== ${decoded}`);
      }
      if (prefix && prefix !== extractedPrefix) {
        throw new Error(`Failed: prefix ${prefix} !== ${extractedPrefix}`);
      }
    });
  }
}

export { IdTransformer };
