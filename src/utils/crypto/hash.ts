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

  static email(email: string): string {
    // Single place for email normalization
    const normalizedEmail = email.trim().toLowerCase();

    return crypto.createHash('sha256').update(normalizedEmail).digest('hex');
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}

export { Hash };
