import type { Request, Response } from 'express';

import { UserService } from './user.service';

const postUserRegister = async (req: Request, res: Response) => {
  try {
    // Check if user exists
    const existingUser = await UserService.findByEmail(req.body.email);
    if (existingUser) {
      res.status(400).json({
        error: {
          code: 400,
          message: 'Email already registered',
        },
      });
      return;
    }

    // Create new user
    const user = await UserService.createUser({
      email: req.body.email,
      password: req.body.password,
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('Registration error:', error);

    res.status(500).json({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });
  }
};

export { postUserRegister };
