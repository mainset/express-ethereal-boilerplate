const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const apiRouter = require('./api-router');

const handleRedirectToLatestApi = (req, res) => (
  res.redirect('/api/v1')
);

app.get(['/', '/api'], handleRedirectToLatestApi);

app.use('/', apiRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
