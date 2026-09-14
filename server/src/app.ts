import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: '*', // Will be restricted to frontend domain in production
    credentials: true,
  })
);

// Logging & Parsing Middlewares
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'NexaDrive Backend API is running seamlessly',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
