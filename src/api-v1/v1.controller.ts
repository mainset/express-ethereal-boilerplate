import type { Request, Response } from 'express';

const getIndex = (_req: Request, res: Response) => {
  res.json({ welcomeMessage: 'API v1: Hello World!' });
};

export { getIndex };
