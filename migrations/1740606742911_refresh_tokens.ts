import type { Kysely } from 'kysely';
import { sql } from 'kysely';

import type { DatabaseBoilerplate } from '../src/config/database';

// biome-ignore lint/suspicious/noExplicitAny: `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<DatabaseBoilerplate>): Promise<void> {
  // up migration code goes here...
  // note: up migrations are mandatory. you must implement this function.
  // For more info, see: https://kysely.dev/docs/migrations

  await db.schema
    .createTable('refresh_tokens')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_public_id', 'varchar(32)', (col) =>
      col.notNull().references('users.public_id').onDelete('cascade'),
    )
    .addColumn('token_hash', 'varchar(255)', (col) => col.notNull().unique()) // Store only hashed token
    .addColumn('expires_at', sql`timestamp with time zone`, (col) =>
      col.notNull(),
    ) // Expiration time
    .addColumn('is_revoked', 'boolean', (col) => col.notNull().defaultTo(false)) // Revocation flag
    .addColumn('created_at', sql`timestamp with time zone`, (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();

  // Index for fast user token lookups
  await db.schema
    .createIndex('idx_refresh_tokens_user')
    .on('refresh_tokens')
    .column('user_public_id')
    .execute();

  // Compound index for active token lookups
  await db.schema
    .createIndex('idx_refresh_tokens_active')
    .on('refresh_tokens')
    .columns(['token_hash', 'is_revoked', 'expires_at'])
    .execute();
}

// biome-ignore lint/suspicious/noExplicitAny: `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<DatabaseBoilerplate>): Promise<void> {
  // down migration code goes here...
  // note: down migrations are optional. you can safely delete this function.
  // For more info, see: https://kysely.dev/docs/migrations

  await db.schema.dropIndex('idx_refresh_tokens_user').execute();
  await db.schema.dropIndex('idx_refresh_tokens_active').execute();
  await db.schema.dropTable('refresh_tokens').execute();
}
