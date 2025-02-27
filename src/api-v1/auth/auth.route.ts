import express from 'express';

import * as ApiV1AuthController from './auth.controller';

const expressRouter = express.Router();

const AuthRoute = expressRouter
  .post('/auth/login', ApiV1AuthController.postLogin)
  .post('/auth/logout', ApiV1AuthController.postLogout)
  .post('/auth/refresh', ApiV1AuthController.postRefreshToken);

export { AuthRoute };
