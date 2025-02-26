import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { COOKIE__JWT_KEY_NAME__BY_ID } from '../../config/passport';
import { Hash } from '../../utils';
import { UserService } from '../users/user.service';

const postLogin = async (req: Request, res: Response) => {
  try {
    // Find user by email
    const user = await UserService.findByEmail(req.body.email);
    if (!user) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
      return;
    }

    // Verify password
    const isValidPassword = await Hash.compare(
      req.body.password,
      user.password_hash,
    );
    if (!isValidPassword) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
      return;
    }

    // Create payload
    // const jwtExpireTime = 15 * 60 * 1000, // 15 minutes
    const jwtExpireTime = 10 * 1000; // 10 seconds

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const payload = {
      sub: user.id,
      exp: currentTimeInSeconds + jwtExpireTime,
    };

    const accessToken = jwt.sign(payload, process.env.SECURITY__JWT_SECRET!);

    // Set new access token cookie
    res.cookie(COOKIE__JWT_KEY_NAME__BY_ID.ACCESS_TOKEN, accessToken, {
      httpOnly: true, // Prevents JavaScript access (Mitigates XSS attacks)
      secure: true, // Ensures cookie is sent only over HTTPS (set to true in production)
      sameSite: 'strict', // Prevents CSRF attacks (strictest policy)
      maxAge: jwtExpireTime, // 15 minutes expiration standard (adjust based on needs)
      // path: '/api', // Restrict to API paths only
      signed: true, // Enables cookie signing for tamper protection
      // domain: 'yourdomain.com', // Optional: Restricts cookie to a specific domain
      partitioned: true, // (Optional, modern browsers) Prevents cross-site tracking, cookie storage (CHIPS)
      priority: 'high', // Prevents cookie from being deleted under storage pressure
    });

    // Return success response with token
    res.status(200).json({
      // token,
      user: {
        id: user.id,
        email: req.body.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });
  }
};

export { postLogin };
