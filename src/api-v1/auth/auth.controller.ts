import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import type { Selectable } from 'kysely';

import { UserTable } from '../../config/database';
import {
  COOKIE__JWT_KEY_NAME__BY_ID,
  cookieJwtExtractor,
} from '../../config/passport';
import { Encryption, Hash } from '../../utils';
import { RefreshTokenService } from '../refresh-tokens';
import { UserService } from '../users/user.service';

interface TokenTimes {
  accessTokenExpireTimeMs: number;
  refreshTokenExpireTimeMs: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface JWTPayload {
  sub: Selectable<UserTable>['public_id']; // Subject (user public ID)
  exp: number; // Expiration time in seconds
  iss: 'express-ethereal-boilerplate'; // Issuer
}

const getTokenExpirationTimes = (isRememberMe = false): TokenTimes => ({
  // For development, using short times
  // accessTokenExpireTimeMs: 10 * 1000, // 10 seconds
  // refreshTokenExpireTimeMs: 20 * 1000, // 20 seconds

  // For production
  accessTokenExpireTimeMs: 15 * 60 * 1000, // 15 minutes
  refreshTokenExpireTimeMs: isRememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 24 * 60 * 60 * 1000, // 1 day
});

const generateTokens = async (
  userPublicId: Selectable<UserTable>['public_id'],
  tokenTimes: TokenTimes,
): Promise<TokenPair> => {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  // Convert milliseconds to seconds for JWT exp
  const expireTimeInSeconds = Math.floor(
    tokenTimes.accessTokenExpireTimeMs / 1000,
  );

  const payload: JWTPayload = {
    // Registered claims (standardized)
    sub: userPublicId, // Subject (user ID)
    exp: currentTimeInSeconds + expireTimeInSeconds, // Expiration
    iss: 'express-ethereal-boilerplate', // Issuer
    // iat: currentTimeInSeconds, // Issued at
    // jti: crypto.randomUUID(), // JWT ID (unique identifier)

    // Optional registered claims
    // nbf: currentTimeInSeconds, // Not valid before
    // aud: 'your-app-api', // Audience

    // Custom claims (application-specific)
    // role: user.role,          // User role if you have RBAC
    // permissions: [],          // User permissions
    // email_verified: true,     // Email verification status
    // version: '1',            // Token version for invalidation
    // tenant_id: user.tenantId, // For multi-tenant applications
  };

  const accessToken = jwt.sign(payload, process.env.SECURITY__JWT_SECRET!);
  // Convert milliseconds to seconds for refresh token
  const refreshToken = await RefreshTokenService.create(
    userPublicId,
    // !IMPORTANT: convert milliseconds to seconds
    Math.floor(tokenTimes.refreshTokenExpireTimeMs / 1000),
  );

  return { accessToken, refreshToken };
};

const COOKIE_BASE_OPTIONS = {
  httpOnly: true, // Prevents JavaScript access (Mitigates XSS attacks)
  secure: true, // Ensures cookie is sent only over HTTPS (set to true in production)
  sameSite: 'strict', // Prevents CSRF attacks (strictest policy)
  // maxAge: tokenTimes.accessTokenExpireTimeMs, // 15 minutes expiration standard (adjust based on needs)
  // path: '/api', // Restrict to API paths only
  signed: true, // Enables cookie signing for tamper protection
  // domain: 'yourdomain.com', // Optional: Restricts cookie to a specific domain
  partitioned: true, // (Optional, modern browsers) Prevents cross-site tracking, cookie storage (CHIPS)
  priority: 'high', // Prevents cookie from being deleted under storage pressure
} as const;

const setTokenCookies = (
  res: Response,
  tokens: TokenPair,
  tokenTimes: TokenTimes,
): void => {
  // Set new access token cookie
  res.cookie(COOKIE__JWT_KEY_NAME__BY_ID.ACCESS_TOKEN, tokens.accessToken, {
    ...COOKIE_BASE_OPTIONS,
    maxAge: tokenTimes.accessTokenExpireTimeMs, // 15 minutes expiration standard (adjust based on needs)
    // path: '/api', // Restrict to API paths only
    // domain: 'yourdomain.com', // Optional: Restricts cookie to a specific domain
  });

  // Set refresh token cookie
  res.cookie(COOKIE__JWT_KEY_NAME__BY_ID.REFRESH_TOKEN, tokens.refreshToken, {
    ...COOKIE_BASE_OPTIONS,
    maxAge: tokenTimes.refreshTokenExpireTimeMs, // 1 day by default, 30 days for remember expiration standard
    // path: '/api/v1/auth/refresh', // Restrict to refresh endpoint
    // domain: 'yourdomain.com', // Optional: Restricts cookie to a specific domain
  });
};

const getAuthMe = async (req: Request, res: Response) => {
  try {
    // Get access token from signed cookies
    const accessToken = cookieJwtExtractor(req);

    // Verify and decode the token
    const decoded = jwt.verify(
      accessToken,
      process.env.SECURITY__JWT_SECRET!,
    ) as JWTPayload;

    // Get user from database using public_id
    const currentUser = await UserService.findByPublicId(decoded.sub);

    if (!currentUser) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    // Return user data (same format as login response)
    res.status(StatusCodes.OK).json({
      user: {
        id: currentUser.public_id,
        email: Encryption.decrypt(
          currentUser.email_encrypted,
          currentUser.email_iv,
          currentUser.email_tag,
        ),
      },
    });
  } catch (error) {
    console.error('Current user error', error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      },
    });
  }
};

const postLogin = async (req: Request, res: Response) => {
  try {
    // Find user by email
    const user = await UserService.findByEmail(req.body.email);
    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
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
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
      return;
    }

    const tokenTimes = getTokenExpirationTimes(req.body.is_remember_me);
    const tokens = await generateTokens(user.public_id, tokenTimes);

    setTokenCookies(res, tokens, tokenTimes);

    res.status(StatusCodes.OK).json({
      user: {
        id: user.public_id,
        email: req.body.email,
      },
      // auth: {
      //   accessTokenExpiresInMs: tokenTimes.accessTokenExpireTimeMs,
      //   refreshTokenExpiresInMs: tokenTimes.refreshTokenExpireTimeMs,
      // },
    });
  } catch (error) {
    console.error('Login error', error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      },
    });
  }
};

const postLogout = async (req: Request, res: Response) => {
  try {
    // Get refresh token from cookie
    const refreshToken =
      req.signedCookies[COOKIE__JWT_KEY_NAME__BY_ID.REFRESH_TOKEN];

    // Revoke refresh token if exists
    if (refreshToken) {
      await RefreshTokenService.revoke(refreshToken);
    }

    // Clear both cookies
    res.clearCookie(
      COOKIE__JWT_KEY_NAME__BY_ID.ACCESS_TOKEN,
      COOKIE_BASE_OPTIONS,
    );

    res.clearCookie(
      COOKIE__JWT_KEY_NAME__BY_ID.REFRESH_TOKEN,
      COOKIE_BASE_OPTIONS,
    );

    res.status(StatusCodes.OK).json({
      message: 'Successfully logged out',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      },
    });
  }
};

const postRefreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken =
      req.signedCookies[COOKIE__JWT_KEY_NAME__BY_ID.REFRESH_TOKEN];
    if (!refreshToken) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: {
          code: 'REFRESH_TOKEN_REQUIRED',
          message: 'No refresh token provided',
        },
      });
      return;
    }

    // Verify token and get user ID
    const userPublicId = await RefreshTokenService.verify(refreshToken);
    if (!userPublicId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token',
        },
      });
      return;
    }

    // Get original token info for expiration preservation
    const originalToken = await RefreshTokenService.getTokenInfo(refreshToken);
    if (!originalToken) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token',
        },
      });
      return;
    }

    // Calculate remaining time from original expiration
    const remainingTimeMs = originalToken.expires_at.getTime() - Date.now();

    // Ensure remaining time is positive and calculate new times
    if (remainingTimeMs <= 0) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Refresh token has expired',
        },
      });
      return;
    }

    // NOTE: possible to implement a sliding expiration here
    const tokenTimes = {
      ...getTokenExpirationTimes(),
      // !IMPORTANT: avoid object mutation while {tokenTimes.refreshTokenExpireTimeMs = remainingMs}
      // refreshTokenExpireTimeMs: remainingTimeMs,
    };

    // Generate new tokens
    const tokens = await generateTokens(userPublicId, tokenTimes);

    // Implement token rotation
    await RefreshTokenService.revoke(refreshToken);
    setTokenCookies(res, tokens, tokenTimes);

    res.status(StatusCodes.OK).json({
      auth: {
        accessTokenExpiresIn: tokenTimes.accessTokenExpireTimeMs,
        refreshTokenExpiresIn: tokenTimes.refreshTokenExpireTimeMs,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      },
    });
  }
};

export { getAuthMe, postLogin, postLogout, postRefreshToken };
