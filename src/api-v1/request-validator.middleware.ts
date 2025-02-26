import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      error: {
        code: 400,
        message: 'Validation error',
        errors: errors.array(),
      },
    });

    return;
  }
  next();
};

export { validateRequest };
