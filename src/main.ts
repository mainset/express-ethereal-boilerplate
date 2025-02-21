import express, { NextFunction, Request, Response } from 'express';

import { apiV1Routes } from './api-v1';

const path = require('path');
// !IMPORTANT: load environment variables before importing environment based configs
require('dotenv').config({
  path: process.env.NODE_ENV && path.join(`./.env.${process.env.NODE_ENV}`),
});

const app = express();
const port = process.env.PORT || 3000;

const handleForwardingToLatestApiPrefix = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isReqUrlStartsWithApiPrefix = /^(\/api\/v1)/.test(req.url);
  if (!isReqUrlStartsWithApiPrefix) {
    req.url = `/api/v1${req.url}`;
  }
  next('route');
};

app.get('/*', handleForwardingToLatestApiPrefix);

app.use('/api', [apiV1Routes]);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
