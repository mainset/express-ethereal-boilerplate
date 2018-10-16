const expressRouter = require('express').Router();

const apiV1 = expressRouter.get('/', (req, res) => {
  return res.json({ welcomeMessage: 'API v1: Hello World!' });
});

module.exports = apiV1;
