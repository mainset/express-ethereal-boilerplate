import { CompiledQuery } from 'kysely';

import {
  dbPgBoilerplateKysely,
  dbPgBoilerplatePool,
} from '../../config/database';

const getPgAllDbTables = () => {
  return dbPgBoilerplatePool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
  );
};

const getKyselyAllDbTables = () => {
  return dbPgBoilerplateKysely.executeQuery(
    CompiledQuery.raw(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
      [],
    ),
  );
};

export { getKyselyAllDbTables, getPgAllDbTables };
