import express, { Request, Response } from 'express';

const expressRouter = express.Router();

const apiV1 = expressRouter.get('/', (req: Request, res: Response) => {
  return res.json({ welcomeMessage: 'API v1: Hello World!' });
});

export default apiV1;
