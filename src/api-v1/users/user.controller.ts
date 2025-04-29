import type { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { UserService } from './user.service';

const postUserRegister = async (req: Request, res: Response) => {
  try {
    // Check if user exists
    const existingUser = await UserService.findByEmail(req.body.email);
    if (existingUser) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: {
          code: 'BAD_REQUEST',
          message: ReasonPhrases.BAD_REQUEST,
        },
      });
      return;
    }

    // Create new user
    const user = await UserService.createUser({
      email: req.body.email,
      password: req.body.password,
    });

    res.status(StatusCodes.CREATED).json({
      public_id: user.public_id,
      email: user.email,
    });
  } catch (error) {
    console.error('Registration error:', error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      },
    });
  }
};

export { postUserRegister };
