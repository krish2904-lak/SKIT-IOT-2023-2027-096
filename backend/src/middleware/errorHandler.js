const { randomUUID } = require('node:crypto');

const errorCodesByStatus = {
  400: 'VALIDATION_ERROR',
  401: 'AUTHENTICATION_REQUIRED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'FILE_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'VALIDATION_ERROR',
  502: 'UPSTREAM_SERVICE_ERROR',
  503: 'SERVICE_UNAVAILABLE',
};

function errorHandler(error, _req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const requestedStatus = Number(error.statusCode || error.status);
  const statusCode = Number.isInteger(requestedStatus)
    && requestedStatus >= 400
    && requestedStatus <= 599
    ? requestedStatus
    : 500;
  const isServerError = statusCode >= 500;
  const requestId = randomUUID();

  res.set('X-Request-Id', requestId);
  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode === 500
        ? 'INTERNAL_ERROR'
        : error.code || errorCodesByStatus[statusCode] || 'INTERNAL_ERROR',
      message: isServerError ? 'Internal server error' : error.message || 'Request failed',
      details: isServerError || !Array.isArray(error.details) ? [] : error.details,
      requestId,
    },
  });
}

module.exports = errorHandler;