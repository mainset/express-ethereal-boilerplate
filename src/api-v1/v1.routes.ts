import express from 'express';

import * as ApiV1Controller from './v1.controller';

const expressRouter = express.Router();

const v1Routes = expressRouter.get('/', ApiV1Controller.getIndex);

export { v1Routes };
