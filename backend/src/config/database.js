const mongoose = require('mongoose');
const env = require('./env');

function sanitizeConnectionMessage(message) {
  return String(message).replace(/mongodb(?:\+srv)?:\/\/[^\s"'`]+/gi, '[REDACTED_MONGODB_URI]');
}

async function connectToDatabase() {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is required before the backend can start');
  }

  try {
    await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5000 });
    console.info(`MongoDB connected to database "${mongoose.connection.name}"`);
    return mongoose.connection;
  } catch (error) {
    console.error(
      `MongoDB connection failed (${error.name}): ${sanitizeConnectionMessage(error.message)}`
    );
    throw new Error(`Unable to connect to MongoDB (${error.name})`);
  }
}

async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  isDatabaseConnected,
};