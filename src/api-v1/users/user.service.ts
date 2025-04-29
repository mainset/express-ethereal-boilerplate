import { dbPgBoilerplateKysely } from '../../config/database';
import { Encryption, Hash, IdTransformer } from '../../utils';

interface CreateUserData {
  email: string;
  password: string;
}

interface UserResponse {
  public_id: string;
  email: string;
}

class UserService {
  static async createUser(data: CreateUserData): Promise<UserResponse> {
    // Hash email for searching
    const { emailHash, emailNormalized } = Hash.email(data.email);

    // Encrypt email
    const { encrypted, iv, tag } = Encryption.encrypt(emailNormalized);

    // Hash password
    const passwordHash = await Hash.password(data.password);

    // Insert user
    const user = await dbPgBoilerplateKysely
      .insertInto('users')
      .values({
        // Temporary public_id that will be updated
        public_id: 'TEMPORARY_PUBLIC_ID',
        email_encrypted: encrypted,
        email_iv: iv,
        email_tag: tag,
        email_hash: emailHash,
        password_hash: passwordHash,
      })
      .returningAll()
      .executeTakeFirst();

    if (!user) {
      throw new Error('Failed to create user');
    }

    // Generate public_id from internal ID for external use in URLs
    const publicId = IdTransformer.encode(user.id, 'usr');

    // Update user with public_id
    await dbPgBoilerplateKysely
      .updateTable('users')
      .set({ public_id: publicId })
      .where('id', '=', user.id)
      .execute();

    // Return decrypted user data
    return {
      public_id: user.public_id,
      email: Encryption.decrypt(
        user.email_encrypted,
        user.email_iv,
        user.email_tag,
      ),
    };
  }

  static async findByEmail(email: string) {
    const { emailHash } = Hash.email(email);

    const user = await dbPgBoilerplateKysely
      .selectFrom('users')
      .where('email_hash', '=', emailHash)
      .selectAll()
      .executeTakeFirst();

    return user;
  }

  /**
   * Find user by their public ID
   * @param publicId - The public ID of the user (e.g., 'usr_abc123')
   * @returns User record if found, undefined otherwise
   */
  static async findByPublicId(publicId: string) {
    const user = await dbPgBoilerplateKysely
      .selectFrom('users')
      .where('public_id', '=', publicId)
      .selectAll()
      .executeTakeFirst();

    return user;
  }
}

export { UserService };
