"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // Will be restricted to frontend domain in production
    credentials: true,
}));
// Logging & Parsing Middlewares
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'NexaDrive Backend API is running seamlessly',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
    });
});
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
