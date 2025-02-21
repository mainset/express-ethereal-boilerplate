import {
  PostgresAdapter,
  PostgresDriver,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'kysely';
import { defineConfig } from 'kysely-ctl';

import { dbPgBoilerplatePool } from './src/config/database';

export default defineConfig({
  // replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
  dialect: {
    createAdapter() {
      return new PostgresAdapter();
    },
    createDriver() {
      return new PostgresDriver({ pool: dbPgBoilerplatePool });
    },
    createIntrospector(db) {
      return new PostgresIntrospector(db);
    },
    createQueryCompiler() {
      return new PostgresQueryCompiler();
    },
  },
  //   migrations: {
  //     migrationFolder: "migrations",
  //   },
  //   plugins: [],
  //   seeds: {
  //     seedFolder: "seeds",
  //   }
});
