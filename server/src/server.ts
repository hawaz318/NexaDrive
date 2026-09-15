import dotenv from "dotenv";
import app from './app';


dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`NexaDrive API running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});
process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection at:', reason.stack || reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception thrown:', error.stack || error);
  process.exit(1);
});

export default server;
