import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { startPlagiarismWorker } from './services/plagiarism/worker.js';
import { logger } from './utils/logger.js';

async function start() {
  await connectDB();
  const stopPlagiarism = startPlagiarismWorker();
  const server = app.listen(env.port, () => {
    logger.info('server', `listening on http://localhost:${env.port}`);
  });

  const shutdown = async (signal) => {
    logger.info('server', `${signal} shutting down`);
    stopPlagiarism();
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  logger.error('server', 'failed to start', err);
  process.exit(1);
});
