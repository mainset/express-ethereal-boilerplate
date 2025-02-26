import type { Request, Response } from 'express';

const getPublicIndex = (_req: Request, res: Response) => {
  res.json({ welcomeMessage: '[API v1] Public: Hello World!' });
};

const getProtectedIndex = (_req: Request, res: Response) => {
  res.json({ welcomeMessage: '[API v1] Protected: Hello World!' });
};

export { getProtectedIndex, getPublicIndex };
