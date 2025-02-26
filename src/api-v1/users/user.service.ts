import { dbPgBoilerplateKysely } from '../../config/database';
import { Encryption, Hash } from '../../utils';

interface CreateUserData {
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  email: string;
}

class UserService {
  static async createUser(data: CreateUserData): Promise<UserResponse> {
    // Encrypt email
    const { encrypted, iv, tag } = Encryption.encrypt(data.email);

    // Hash email for searching
    const emailHash = Hash.email(data.email);

    // Hash password
    const passwordHash = await Hash.password(data.password);

    // Insert user
    const user = await dbPgBoilerplateKysely
      .insertInto('users')
      .values({
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

    // Return decrypted user data
    return {
      id: user.id,
      email: Encryption.decrypt(
        user.email_encrypted,
        user.email_iv,
        user.email_tag,
      ),
    };
  }

  static async findByEmail(email: string) {
    const emailHash = Hash.email(email);

    const user = await dbPgBoilerplateKysely
      .selectFrom('users')
      .where('email_hash', '=', emailHash)
      .selectAll()
      .executeTakeFirst();

    return user;
  }
}

export { UserService };
