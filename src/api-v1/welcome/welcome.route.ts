import express from 'express';

import { authenticatedRequest } from '../../config/passport';
import * as ApiV1WelcomeController from './welcome.controller';

const expressRouter = express.Router();

const WelcomeRoute = expressRouter
  .get('/', ApiV1WelcomeController.getPublicIndex)
  .get('/welcome/public', ApiV1WelcomeController.getPublicIndex)
  .get(
    '/welcome/protected',
    authenticatedRequest,
    ApiV1WelcomeController.getProtectedIndex,
  );

export { WelcomeRoute };
