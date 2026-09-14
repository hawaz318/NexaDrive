import app from './app';
import { config } from './config/env';

const server = app.listen(config.port, () => {
  console.log(`🚀 NexaDrive Backend Server running on http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
});

process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection at:', reason.stack || reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception thrown:', error.stack || error);
  process.exit(1);
});

export default server;
