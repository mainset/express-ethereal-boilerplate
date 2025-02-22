import { Request, Response } from 'express';

import * as ApiV1DbTableService from './db-table.service';

const getDbTables = async (_req: Request, res: Response) => {
  try {
    const dbPgRes = await ApiV1DbTableService.getPgAllDbTables();
    const dbPgKysely = await ApiV1DbTableService.getKyselyAllDbTables();

    res.json({ pg_rows: dbPgRes.rows, kysely_rows: dbPgKysely.rows });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export { getDbTables };
