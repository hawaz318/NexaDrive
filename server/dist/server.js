"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const server = app_1.default.listen(env_1.config.port, () => {
    console.log(`🚀 NexaDrive Backend Server running on http://localhost:${env_1.config.port}`);
    console.log(`📡 Environment: ${env_1.config.nodeEnv}`);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection at:', reason.stack || reason);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception thrown:', error.stack || error);
    process.exit(1);
});
exports.default = server;
