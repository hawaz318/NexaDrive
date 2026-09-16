import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_jwt_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  storage: {
    uploadDir: process.env.STORAGE_UPLOAD_DIR || './uploads',
    maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES || '5368709120', 10),
    trashRetentionDays: parseInt(process.env.TRASH_RETENTION_DAYS || '30', 10),
  },
  chapa: {
    secretKey: process.env.CHAPA_SECRET_KEY || '',
    apiUrl: process.env.CHAPA_API_URL || 'https://api.chapa.co/v1',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id-placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret-placeholder',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || 'github-client-id-placeholder',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'github-client-secret-placeholder',
      callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/github/callback',
    },
  },
};
