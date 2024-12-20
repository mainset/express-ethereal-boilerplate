import express from 'express';

import v1Router from './v1/index';

const expressRouter = express.Router();

const apiRouter = expressRouter.use('/api', [v1Router]);

export default apiRouter;
