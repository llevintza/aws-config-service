import fs from 'fs';
import path from 'path';

import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define interfaces for log entry structures
interface HttpInfo {
  method?: string;
  url?: string;
  statusCode?: number;
}

interface PerformanceInfo {
  responseTime?: number;
  responseTimeUnit?: string;
}

interface ClientInfo {
  ip?: string;
}

// Safe getter for nested properties
function safeGet(obj: unknown, path: string): unknown {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return undefined;
  }
  return (obj as Record<string, unknown>)[path];
}

// Type guard functions
function isHttpInfo(obj: unknown): obj is HttpInfo {
  return obj !== null && obj !== undefined && typeof obj === 'object';
}

function isPerformanceInfo(obj: unknown): obj is PerformanceInfo {
  return obj !== null && obj !== undefined && typeof obj === 'object';
}

function isClientInfo(obj: unknown): obj is ClientInfo {
  return obj !== null && obj !== undefined && typeof obj === 'object';
}

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
  format.printf((info: unknown) => {
    // Type-safe extraction from info object
    const infoObj = info as Record<string, unknown>;
    const timestamp = infoObj.timestamp as string;
    const level = infoObj.level as string;
    const message = infoObj.message as string;
    const stack = infoObj.stack as string | undefined;
    const event = infoObj.event as string | undefined;
    const requestId = infoObj.requestId as string | undefined;

    // Create clean meta object
    const meta = { ...infoObj };
    delete meta.timestamp;
    delete meta.level;
    delete meta.message;
    delete meta.stack;
    delete meta.event;
    delete meta.requestId;

    let logMessage = `${timestamp} [${level}]`;

    // Add request ID if available
    if (requestId !== null && requestId !== undefined) {
      logMessage += ` [${requestId}]`;
    }

    // Add event type if available for semantic logging
    if (event !== null && event !== undefined) {
      logMessage += ` [${event}]`;
    }

    logMessage += `: ${message}`;

    // Add stack trace for errors
    if (stack !== null && stack !== undefined) {
      logMessage += `\n${stack}`;
    }

    // Add metadata if present (formatted for readability)
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0) {
      // Format specific semantic fields nicely
      const httpInfo = safeGet(meta, 'http');
      if (isHttpInfo(httpInfo)) {
        logMessage += `\n  HTTP: ${httpInfo.method ?? 'UNKNOWN'} ${httpInfo.url ?? 'UNKNOWN'}`;
        if (httpInfo.statusCode !== null && httpInfo.statusCode !== undefined) {
          logMessage += ` → ${httpInfo.statusCode}`;
        }
      }

      const performanceInfo = safeGet(meta, 'performance');
      if (isPerformanceInfo(performanceInfo)) {
        logMessage += `\n  Performance: ${performanceInfo.responseTime ?? 'UNKNOWN'}${performanceInfo.responseTimeUnit ?? 'ms'}`;
      }

      const clientInfo = safeGet(meta, 'client');
      if (isClientInfo(clientInfo)) {
        logMessage += `\n  Client: ${clientInfo.ip ?? 'UNKNOWN'}`;
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
  level:
    process.env.NODE_ENV === 'test' && process.env.LOG_LEVEL === 'silent'
      ? 'error' // Use error level to minimize output in silent test mode
      : process.env.NODE_ENV === 'production'
        ? 'info'
        : 'debug',
  handleExceptions: true,
  handleRejections: true,
  silent: process.env.LOG_LEVEL === 'silent', // Respect silent mode
});

// Create the logger instance
// In test environment, only use console transport to avoid file system issues
const loggerTransports =
  process.env.NODE_ENV === 'test'
    ? [consoleTransport]
    : [consoleTransport, dailyRotateFileTransport, errorRotateFileTransport];

const logger = createLogger({
  level: process.env.LOG_LEVEL === 'silent' ? 'error' : (process.env.LOG_LEVEL ?? 'info'),
  format: format.combine(format.timestamp(), format.errors({ stack: true })),
  transports: loggerTransports,
  exitOnError: false,
  silent: process.env.LOG_LEVEL === 'silent',
});

// Log rotation events (only in non-test environments)
if (process.env.NODE_ENV !== 'test') {
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
  });
} // Add request ID middleware helper
export const createRequestLogger = (
  requestId: string,
): {
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
  debug: (message: string, meta?: unknown) => void;
} => {
  // Return no-op functions in silent test mode
  if (process.env.LOG_LEVEL === 'silent') {
    return {
      info: (): void => {},
      warn: (): void => {},
      error: (): void => {},
      debug: (): void => {},
    };
  }

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
