const expressRouter = require('express').Router();

const apiV1 = require('./v1');

const v1Router = expressRouter.use('/v1', [
  apiV1,
  // NOTE: put other v1 routes here
]);

module.exports = v1Router;
