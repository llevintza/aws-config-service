import pino from 'pino';
import logger from './logger';

// Create a custom Pino stream that forwards to Winston
const winstonStream = {
  write: (chunk: string): void => {
    try {
      const logEntry = JSON.parse(chunk);
      const { level, msg, ...meta } = logEntry;

      // Map Pino levels to Winston levels
      const levelMap: { [key: number]: string } = {
        10: 'debug', // trace -> debug
        20: 'debug', // debug -> debug
        30: 'info', // info -> info
        40: 'warn', // warn -> warn
        50: 'error', // error -> error
        60: 'error', // fatal -> error
      };

      const winstonLevel = levelMap[level] || 'info';
      const message = msg || 'No message';

      // Clean up meta object
      const cleanMeta = { ...meta };
      delete cleanMeta.hostname;
      delete cleanMeta.pid;

      // Log to Winston
      logger.log(winstonLevel, message, cleanMeta);
    } catch (error) {
      // Fallback for malformed JSON
      logger.info(chunk.trim());
    }
  },
};

// Create Pino logger that uses Winston as transport
export const pinoLogger = pino(
  {
    level: process.env.LOG_LEVEL ?? 'info',
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
    },
  },
  winstonStream,
);

export default pinoLogger;
