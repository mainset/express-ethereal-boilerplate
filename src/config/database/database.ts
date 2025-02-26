import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import type { DatabaseBoilerplate } from './database.types';

// postgres pool setup
const DB_CREDENTIAL_BY_KEY = {
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DB: process.env.POSTGRES_DB,
  POSTGRES_PORT: 5432,
};

const connectionString = `postgresql://${DB_CREDENTIAL_BY_KEY.POSTGRES_USER}:${DB_CREDENTIAL_BY_KEY.POSTGRES_PASSWORD}@${DB_CREDENTIAL_BY_KEY.POSTGRES_HOST}:${DB_CREDENTIAL_BY_KEY.POSTGRES_PORT}/${DB_CREDENTIAL_BY_KEY.POSTGRES_DB}`;

const dbPgBoilerplatePool = new Pool({
  connectionString,
});

// kysely setup
// https://kysely.dev/docs/getting-started#instantiation
const dialect = new PostgresDialect({
  pool: dbPgBoilerplatePool,
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
const dbPgBoilerplateKysely = new Kysely<DatabaseBoilerplate>({
  dialect,
});

export { dbPgBoilerplateKysely, dbPgBoilerplatePool };
