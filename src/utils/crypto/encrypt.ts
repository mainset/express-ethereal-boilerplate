import crypto from 'crypto';

interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

// In summary, both SHA-512 and AES-256 offer unique advantages in their respective domains.
// While SHA-512 is optimized for speed in hashing, AES-256 balances security and performance effectively.
// Source: https://www.restack.io/p/secure-hashing-techniques-answer-sha-512-vs-aes-256-cat-ai
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

class Encryption {
  private static getEncryptionKey(): Buffer {
    const encryptionKey = process.env.SECURITY__ENCRYPTION_KEY;

    if (!encryptionKey) {
      throw new Error('Encryption key is not set');
    }

    return Buffer.from(encryptionKey, 'hex');
  }

  static encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(
      ENCRYPTION_ALGORITHM,
      this.getEncryptionKey(),
      iv,
    );

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  static decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      this.getEncryptionKey(),
      Buffer.from(iv, 'hex'),
    );

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}

export { Encryption };
