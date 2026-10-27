const app = require('./app');
const env = require('./config/env');
const { connectToDatabase, disconnectFromDatabase } = require('./config/database');

let httpServer;
let shutdownPromise;

async function startServer() {
  await connectToDatabase();

  return new Promise((resolve, reject) => {
    const server = app.listen(env.port);
    server.once('error', reject);
    server.once('listening', () => {
      server.removeListener('error', reject);
      server.on('error', (error) => {
        console.error(`HTTP server error: ${error.message}`);
        process.exitCode = 1;
      });
      console.log(`F-096 backend listening on port ${env.port} (${env.nodeEnv})`);
      resolve(server);
    });
  });
}

async function shutdown(signal) {
  if (shutdownPromise) {
    return shutdownPromise;
  }

  shutdownPromise = (async () => {
    console.log(`Received ${signal}; shutting down F-096 backend`);
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => (error ? reject(error) : resolve()));
      });
    }
    await disconnectFromDatabase();
  })();

  return shutdownPromise;
}

async function run() {
  try {
    httpServer = await startServer();
  } catch (error) {
    console.error(`Backend startup failed: ${error.message}`);
    process.exitCode = 1;
    await disconnectFromDatabase().catch((disconnectError) => {
      console.error(`MongoDB disconnect failed (${disconnectError.name})`);
    });
  }
}

if (require.main === module) {
  process.once('SIGINT', () => {
    shutdown('SIGINT').catch((error) => {
      console.error(`Shutdown failed: ${error.message}`);
      process.exitCode = 1;
    });
  });
  process.once('SIGTERM', () => {
    shutdown('SIGTERM').catch((error) => {
      console.error(`Shutdown failed: ${error.message}`);
      process.exitCode = 1;
    });
  });

  run();
}

module.exports = { startServer, shutdown };