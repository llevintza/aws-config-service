import cors from '@fastify/cors';
import Fastify from 'fastify';
import logger from './config/logger';
import { requestLoggingPlugin } from './plugins/request-logging';
import { registerSwaggerCombined } from './plugins/swagger-combined';
import { configRoutes } from './routes/config';
import { healthRoutes } from './routes/health';

// Export build function for testing
export function build() {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Register plugins and routes
  // Register CORS
  server.register(cors, {
    origin: true,
  });

  // Register logging
  server.register(requestLoggingPlugin);

  // Register swagger and swagger-ui together
  server.register(registerSwaggerCombined);

  // Register routes
  server.register(healthRoutes);
  server.register(configRoutes);

  return server;
}

// Log application startup with semantic structure
logger.info('🚀 Starting AWS Config Service...', {
  event: 'application.start',
  system: {
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    platform: process.platform,
    arch: process.arch,
  },
  timestamp: new Date().toISOString(),
});

const server = build();

// Add Winston logger to server context
server.decorate('winstonLogger', logger);

const start = async (): Promise<void> => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });

    // Enhanced startup logging (both Pino and Winston)
    const startupMessage = `🚀 AWS Config Service started successfully!`;
    const docsUrl = `📖 API Documentation: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/docs`;
    const healthUrl = `❤️  Health Check: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/health`;
    const exampleUrl = `🔧 Example Config: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/config/tenant1/cloud/us-east-1/service/api-gateway/config/rate-limit`;
    const rootUrl = `🌐 Root URL: http://${host === '0.0.0.0' ? 'localhost' : host}:${port} (redirects to docs)`;

    server.log.info(startupMessage);
    server.log.info(docsUrl);
    server.log.info(healthUrl);
    server.log.info(exampleUrl);
    server.log.info(rootUrl);

    // Also log to Winston
    logger.info(startupMessage, { port, host });
    logger.info('Service endpoints available', {
      docs: docsUrl,
      health: healthUrl,
      example: exampleUrl,
      root: rootUrl,
    });
  } catch (err) {
    server.log.error(err);
    logger.error('Failed to start server', { error: err });
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  server.log.info(`Received ${signal}, starting graceful shutdown...`);
  logger.info(`Received ${signal}, starting graceful shutdown...`, { signal });

  try {
    // Stop accepting new connections
    await server.close();
    server.log.info('✅ Server closed gracefully');
    server.log.info('👋 AWS Config Service shutdown complete');

    logger.info('✅ Server closed gracefully');
    logger.info('👋 AWS Config Service shutdown complete');

    process.exit(0);
  } catch (err) {
    server.log.error('❌ Error during graceful shutdown:', err);
    logger.error('❌ Error during graceful shutdown', { error: err });
    process.exit(1);
  }
};

// Register signal handlers for graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  server.log.fatal('Uncaught Exception:', err);
  logger.error('Uncaught Exception', { error: err, stack: err.stack });
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  server.log.fatal('Unhandled Rejection at Promise:', promise, 'reason:', reason);
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  start();
}
