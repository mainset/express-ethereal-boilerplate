import crypto from 'crypto';

import { dbPgBoilerplateKysely } from '../../config/database';
import { Hash } from '../../utils';

interface TokenInfo {
  user_id: string;
  expires_at: Date;
}

class RefreshTokenService {
  /**
   * Creates a new refresh token for a user
   * @param userId - The user's ID
   * @param expiresInSeconds - Token expiration time in seconds
   * @returns The plain refresh token (to be sent to client)
   */
  static async create(
    userId: string,
    expiresInSeconds: number,
  ): Promise<string> {
    // Generate random token
    const refreshToken = crypto.randomBytes(40).toString('hex');

    // Hash token for storage
    const tokenHash = await Hash.make(refreshToken);

    // Calculate expiration date
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    // Store in database
    await dbPgBoilerplateKysely
      .insertInto('refresh_tokens')
      .values({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      })
      .execute();

    return refreshToken;
  }

  /**
   * Verifies a refresh token
   * @param token - The refresh token to verify
   * @returns The associated user ID if valid, null otherwise
   */
  static async verify(token: string): Promise<string | null> {
    // Get token hash using the same method as in create()
    const tokenHash = await Hash.make(token);

    // Find token in database
    const storedToken = await dbPgBoilerplateKysely
      .selectFrom('refresh_tokens')
      .select(['user_id', 'token_hash', 'is_revoked'])
      .where('token_hash', '=', tokenHash) // Compare hashes directly
      .where('expires_at', '>', new Date())
      .where('is_revoked', '=', false)
      .limit(1)
      .execute();

    if (!storedToken?.[0]) {
      return null;
    }

    return storedToken[0].user_id;
  }

  /**
   * Gets the original token info for a refresh token
   * @param userId - The user's ID
   */
  static async getTokenInfo(token: string): Promise<TokenInfo | null> {
    const tokenHash = await Hash.make(token);

    const result = await dbPgBoilerplateKysely
      .selectFrom('refresh_tokens')
      .select(['user_id', 'expires_at'])
      .where('token_hash', '=', tokenHash)
      .executeTakeFirst();

    return result || null;
  }

  /**
   * Revokes all refresh tokens for a user
   * @param userId - The user's ID
   */
  static async revokeAllForUser(userId: string): Promise<void> {
    await dbPgBoilerplateKysely
      .updateTable('refresh_tokens')
      .set({ is_revoked: true })
      .where('user_id', '=', userId)
      .execute();
  }

  /**
   * Revokes a specific refresh token
   * @param token - The refresh token to revoke
   */
  static async revoke(token: string): Promise<void> {
    const tokenHash = await Hash.make(token);

    await dbPgBoilerplateKysely
      .updateTable('refresh_tokens')
      .set({ is_revoked: true })
      .where('token_hash', '=', tokenHash)
      .execute();
  }
}

export { RefreshTokenService };
