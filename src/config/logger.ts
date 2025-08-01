import fs from 'fs';
import path from 'path';

import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output with colors and semantic structure
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.colorize({ all: true }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format.printf(({ timestamp, level, message, stack, event, requestId, ...meta }: any) => {
    let logMessage = `${timestamp} [${level}]`;

    // Add request ID if available
    if (requestId) {
      logMessage += ` [${requestId}]`;
    }

    // Add event type if available for semantic logging
    if (event) {
      logMessage += ` [${event}]`;
    }

    logMessage += `: ${message}`;

    // Add stack trace for errors
    if (stack) {
      logMessage += `\n${stack}`;
    }

    // Add metadata if present (formatted for readability)
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0) {
      // Format specific semantic fields nicely
      if (meta.http && typeof meta.http === 'object') {
        const http = meta.http;
        logMessage += `\n  HTTP: ${http.method} ${http.url}`;
        if (http.statusCode) {
          logMessage += ` → ${http.statusCode}`;
        }
      }

      if (meta.performance && typeof meta.performance === 'object') {
        const perf = meta.performance;
        logMessage += `\n  Performance: ${perf.responseTime}${perf.responseTimeUnit || 'ms'}`;
      }

      if (meta.client && typeof meta.client === 'object') {
        const client = meta.client;
        logMessage += `\n  Client: ${client.ip}`;
      }

      // Show remaining metadata as JSON
      const remainingMeta = { ...meta };
      delete remainingMeta.http;
      delete remainingMeta.performance;
      delete remainingMeta.client;
      delete remainingMeta.timestamp;

      const remainingKeys = Object.keys(remainingMeta);
      if (remainingKeys.length > 0) {
        logMessage += `\n  Meta: ${JSON.stringify(remainingMeta, null, 2)}`;
      }
    }
    return logMessage;
  }),
);

// Custom format for file output (no colors, structured)
const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json(),
);

// Daily rotate file transport for general logs
const dailyRotateFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '100m', // 100MB max file size
  maxFiles: '7d', // Keep logs for 7 days
  format: fileFormat,
  level: 'info',
  zippedArchive: true, // Compress rotated files
  handleExceptions: true,
  handleRejections: true,
});

// Daily rotate file transport for error logs
const errorRotateFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '100m',
  maxFiles: '7d',
  format: fileFormat,
  level: 'error',
  zippedArchive: true,
  handleExceptions: true,
  handleRejections: true,
});

// Console transport with colors
const consoleTransport = new transports.Console({
  format: consoleFormat,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  handleExceptions: true,
  handleRejections: true,
});

// Create the logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: format.combine(format.timestamp(), format.errors({ stack: true })),
  transports: [consoleTransport, dailyRotateFileTransport, errorRotateFileTransport],
  exitOnError: false,
});

// Log rotation events
dailyRotateFileTransport.on('rotate', (oldFilename: string, newFilename: string) => {
  logger.info('Log file rotated', { oldFilename, newFilename });
});

dailyRotateFileTransport.on('new', (newFilename: string) => {
  logger.info('New log file created', { filename: newFilename });
});

errorRotateFileTransport.on('rotate', (oldFilename: string, newFilename: string) => {
  logger.info('Error log file rotated', { oldFilename, newFilename });
});

errorRotateFileTransport.on('new', (newFilename: string) => {
  logger.info('New error log file created', { filename: newFilename });
}); // Add request ID middleware helper
export const createRequestLogger = (
  requestId: string,
): {
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
  debug: (message: string, meta?: unknown) => void;
} => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: (message: string, meta?: any): void => {
      logger.info(message, { requestId, ...meta });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn: (message: string, meta?: any): void => {
      logger.warn(message, { requestId, ...meta });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (message: string, meta?: any): void => {
      logger.error(message, { requestId, ...meta });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debug: (message: string, meta?: any): void => {
      logger.debug(message, { requestId, ...meta });
    },
  };
};

export default logger;
