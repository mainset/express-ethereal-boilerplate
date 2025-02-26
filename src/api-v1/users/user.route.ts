import express from 'express';

import { validateRequest } from '../request-validator.middleware';
import * as ApiV1UserController from './user.controller';
import * as ApiV1UserValidation from './user.validation';

const expressRouter = express.Router();

const UserRoute = expressRouter.post(
  '/users/register',
  ApiV1UserValidation.validateRegister,
  validateRequest,
  ApiV1UserController.postUserRegister,
);

export { UserRoute };
