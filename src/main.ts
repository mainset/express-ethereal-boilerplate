import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { apiV1Routes } from './api-v1';
import * as PassportConfig from './config/passport';

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

// parsers
app.use(cookieParser(process.env.SECURITY__COOKIE_SECRET)); // parse cookie to get JWT from {req.cookies} or {req.signedCookies}
app.use(express.json()); // parse application/json to get from {req.body}
// authentication
app.use(passport.initialize());
PassportConfig.initializeStrategies();

app.get('/*', handleForwardingToLatestApiPrefix);
app.post('/*', handleForwardingToLatestApiPrefix);
app.patch('/*', handleForwardingToLatestApiPrefix);
app.delete('/*', handleForwardingToLatestApiPrefix);

app.use('/api', [apiV1Routes]);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
