import express from 'express';

import { AuthRoute } from './auth';
import { UserRoute } from './users';
import { WelcomeRoute } from './welcome';

const expressRouter = express.Router();

const apiV1Routes = expressRouter.use('/v1', [
  AuthRoute,
  UserRoute,
  WelcomeRoute,
  // NOTE: put other v1 routes here
]);

export { apiV1Routes };
