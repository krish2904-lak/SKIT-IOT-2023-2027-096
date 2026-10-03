const env = require('../config/env');
const { isDatabaseConnected } = require('../config/database');

function getHealth(_req, res, next) {
  if (!isDatabaseConnected()) {
    const error = new Error('Database is unavailable');
    error.statusCode = 503;
    error.code = 'SERVICE_UNAVAILABLE';
    return next(error);
  }

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      message: 'F-096 backend is running',
      service: 'backend',
      environment: env.nodeEnv,
      database: 'connected',
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = { getHealth };