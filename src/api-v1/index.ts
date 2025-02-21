import express from 'express';

import { dbTableRoutes } from './db-tables';
import { v1Routes } from './v1.routes';

const expressRouter = express.Router();

const apiV1Routes = expressRouter.use('/v1', [
  v1Routes,
  dbTableRoutes,
  // NOTE: put other v1 routes here
]);

export { apiV1Routes };
