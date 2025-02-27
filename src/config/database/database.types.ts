import type { Generated } from 'kysely';

interface UserTable {
  id: Generated<string>;
  email_encrypted: string;
  email_iv: string;
  email_tag: string;
  email_hash: string;
  password_hash: string;
  created_at: Generated<Date>;
}

interface RefreshTokenTable {
  id: Generated<string>;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  is_revoked: Generated<boolean>;
  created_at: Generated<Date>;
}
interface DatabaseBoilerplate {
  users: UserTable;
  refresh_tokens: RefreshTokenTable;
}

export type { DatabaseBoilerplate, UserTable };
