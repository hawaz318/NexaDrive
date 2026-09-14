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
};
