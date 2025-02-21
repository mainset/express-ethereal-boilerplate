import express from 'express';

import * as ApiV1DbTableController from './db-table.controller';
const expressRouter = express.Router();

const dbTableRoutes = expressRouter.get(
  '/db-tables',
  ApiV1DbTableController.getDbTables
);

export { dbTableRoutes };
