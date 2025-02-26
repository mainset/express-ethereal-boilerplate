import type { Request } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';

const COOKIE__JWT_KEY_NAME__BY_ID = {
  ACCESS_TOKEN: 'access_token',
};

// middleware to authenticate requests
const authenticatedRequest = passport.authenticate('jwt', { session: false });

// Function to extract JWT from cookie
const cookieJwtExtractor = (req: Request) => {
  return req?.signedCookies?.[COOKIE__JWT_KEY_NAME__BY_ID.ACCESS_TOKEN];
};

// Initialize passport
function initializeStrategies() {
  const opts = {
    // Option 1: extract JWT from cookie
    // Function that accepts a request as the only parameter
    // and returns either the JWT as a string or null
    // See https://github.com/themikenicholson/passport-jwt#extracting-the-jwt-from-the-request for more details
    jwtFromRequest: cookieJwtExtractor,
    // Option 2: extract JWT from Authorization header
    // See https://www.passportjs.org/packages/passport-jwt/ for more details
    // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    // String or buffer containing the secret (symmetric)
    // or PEM-encoded public key (asymmetric) for verifying the token's signature.
    secretOrKey: process.env.SECURITY__JWT_SECRET!,
    // If true the request will be passed to the verify callback.
    // i.e. verify(request, jwt_payload, done_callback)
    passReqToCallback: true as const,
  };

  passport.use(
    // jwt_payload is an object literal containing the decoded JWT payload
    // done is a passport error first callback accepting arguments done(error, user, info)
    new JwtStrategy(opts, (_req, jwt_payload, done) => {
      // TODO: add logic to verify the user
      return done(null, jwt_payload);
    }),
  );
}

export {
  authenticatedRequest,
  COOKIE__JWT_KEY_NAME__BY_ID,
  initializeStrategies,
};
