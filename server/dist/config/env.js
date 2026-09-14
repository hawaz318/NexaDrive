"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.config = {
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
