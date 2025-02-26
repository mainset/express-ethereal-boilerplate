import * as argon2 from 'argon2';
import crypto from 'crypto';

class Hash {
  static async password(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  }

  /**
   * Hash email using SHA-256 together with normalization (trim, lowercase)
   * @param email - The email string to normalize and hash
   * @returns Object containing both the normalized email and its SHA-256 hash
   */
  static email(email: string): { emailNormalized: string; emailHash: string } {
    // Single place for email normalization
    const emailNormalized = email.trim().toLowerCase();

    return {
      emailNormalized,
      emailHash: crypto
        .createHash('sha256')
        .update(emailNormalized)
        .digest('hex'),
    };
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}

export { Hash };
