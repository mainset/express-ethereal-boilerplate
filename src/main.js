const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const apiRouter = require('./api-router');

const handleForwardingToLatestApiPrefix = (req, res, next) => {
  const isReqUrlStartsWithApiPrefix = /^(\/api\/v1)/.test(req.url);
  if (!isReqUrlStartsWithApiPrefix) { req.url = `/api/v1${req.url}`; }
  next('route');
};

app.get('/*', handleForwardingToLatestApiPrefix);

app.use('/', apiRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
