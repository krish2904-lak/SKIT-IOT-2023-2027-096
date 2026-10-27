const jwt = require('jsonwebtoken');
const env = require('../config/env');

function unauthorized(next) {
  const error = new Error('A valid bearer token is required');
  error.statusCode = 401;
  error.code = 'AUTHENTICATION_REQUIRED';
  return next(error);
}

function authenticate(req, _res, next) {
  if (!env.jwtSecret) {
    const error = new Error('JWT authentication is not configured');
    error.statusCode = 503;
    error.code = 'SERVICE_UNAVAILABLE';
    return next(error);
  }

  if (Buffer.byteLength(env.jwtSecret, 'utf8') < 32) {
    const error = new Error('JWT authentication is not configured securely');
    error.statusCode = 503;
    error.code = 'SERVICE_UNAVAILABLE';
    return next(error);
  }

  const authorization = req.get('authorization') || '';
  const match = /^Bearer ([^\s]+)$/i.exec(authorization);
  if (!match) {
    return unauthorized(next);
  }

  try {
    const claims = jwt.verify(match[1], env.jwtSecret, {
      algorithms: ['HS256'],
      maxAge: '15m',
      clockTolerance: 5,
    });

    if (
      typeof claims === 'string'
      || typeof claims.sub !== 'string'
      || !claims.sub.trim()
      || claims.sub.length > 256
      || !Number.isInteger(claims.iat)
      || !Number.isInteger(claims.exp)
      || claims.iat > Math.floor(Date.now() / 1000) + 5
      || claims.exp <= claims.iat
    ) {
      return unauthorized(next);
    }

    req.userId = claims.sub;
    return next();
  } catch (_error) {
    return unauthorized(next);
  }
}

module.exports = authenticate;
