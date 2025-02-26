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

interface DatabaseBoilerplate {
  users: UserTable;
}

export type { DatabaseBoilerplate, UserTable };
