import type { Request, Response } from 'express';

const getIndex = (_req: Request, res: Response) => {
  return res.json({ welcomeMessage: 'API v1: Hello World!' });
};

export { getIndex };
