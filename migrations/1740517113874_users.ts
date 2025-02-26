import type { Kysely } from 'kysely';
import { sql } from 'kysely';

import type { DatabaseBoilerplate } from '../src/config/database';

// biome-ignore lint/suspicious/noExplicitAny: `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<DatabaseBoilerplate>): Promise<void> {
  // up migration code goes here...
  // note: up migrations are mandatory. you must implement this function.
  // For more info, see: https://kysely.dev/docs/migrations
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    // Email storage, hashed and encrypted data
    .addColumn('email_encrypted', 'varchar(512)', (col) => col.notNull()) // Encrypted email
    .addColumn('email_iv', 'varchar(24)', (col) => col.notNull()) // Store IV (Initialization Vector for decryption)
    .addColumn('email_tag', 'varchar(32)', (col) => col.notNull()) // Store auth tag
    .addColumn('email_hash', 'varchar(64)', (col) => col.notNull().unique()) // For searching
    // Password storage, hashed that "cannot be reversed"
    .addColumn('password_hash', 'varchar(255)', (col) => col.notNull())
    // timestamps
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Create index for email searches
  await db.schema
    .createIndex('users_email_hash_idx')
    .on('users')
    .column('email_hash')
    .execute();
}

// biome-ignore lint/suspicious/noExplicitAny: `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<DatabaseBoilerplate>): Promise<void> {
  // down migration code goes here...
  // note: down migrations are optional. you can safely delete this function.
  // For more info, see: https://kysely.dev/docs/migrations

  await db.schema.dropIndex('users_email_hash_idx').execute();

  await db.schema.dropTable('users').execute();
}
