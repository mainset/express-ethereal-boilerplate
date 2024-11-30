import express from 'express';

import apiV1 from './v1';

const expressRouter = express.Router();

const v1Router = expressRouter.use('/v1', [
  apiV1,
  // NOTE: put other v1 routes here
]);

export default v1Router;
