const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const port = Number(process.env.PORT || 5000);
const aiServiceTimeoutMs = Number(process.env.AI_SERVICE_TIMEOUT_MS || 10000);
const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

if (!Number.isInteger(aiServiceTimeoutMs) || aiServiceTimeoutMs < 1000 || aiServiceTimeoutMs > 60000) {
  throw new Error('AI_SERVICE_TIMEOUT_MS must be an integer between 1000 and 60000');
}

const parsedAiServiceUrl = new URL(aiServiceUrl);
if (!['http:', 'https:'].includes(parsedAiServiceUrl.protocol) || parsedAiServiceUrl.username || parsedAiServiceUrl.password) {
  throw new Error('AI_SERVICE_URL must be an HTTP(S) URL without embedded credentials');
}

module.exports = Object.freeze({
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  aiServiceUrl: aiServiceUrl.replace(/\/+$/, ''),
  aiServiceTimeoutMs,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
});