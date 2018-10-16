const expressRouter = require('express').Router();

const v1Router = require('./v1/index');

const apiRouter = expressRouter.use('/api', [
  v1Router
]);

module.exports = apiRouter;
