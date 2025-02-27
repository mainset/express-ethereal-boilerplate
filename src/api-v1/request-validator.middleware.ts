import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: {
        code: 'BAD_REQUEST',
        message: ReasonPhrases.BAD_REQUEST,
        errors: errors.array(),
      },
    });

    return;
  }
  next();
};

export { validateRequest };
