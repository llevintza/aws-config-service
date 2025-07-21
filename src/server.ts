import Fastify from 'fastify';
import cors from '@fastify/cors';
import { configRoutes } from './routes/config';
import { healthRoutes } from './routes/health';
import { registerSwagger } from './plugins/swagger';
import { registerSwaggerUI } from './plugins/swagger-ui';

const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
});

const start = async (): Promise<void> => {
  try {
    // Register CORS
    await server.register(cors, {
      origin: true
    });

    // Register Swagger documentation
    await registerSwagger(server);

    // Register Swagger UI
    await registerSwaggerUI(server);

    // Register all route modules individually
    await server.register(healthRoutes);
    await server.register(configRoutes);

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    
    // Enhanced startup logging
    server.log.info(`🚀 AWS Config Service started successfully!`);
    server.log.info(`📖 API Documentation: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/docs`);
    server.log.info(`❤️  Health Check: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/health`);
    server.log.info(`🔧 Example Config: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/config/tenant1/cloud/us-east-1/service/api-gateway/config/rate-limit`);
    server.log.info(`🌐 Root URL: http://${host === '0.0.0.0' ? 'localhost' : host}:${port} (redirects to docs)`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  server.log.info(`Received ${signal}, starting graceful shutdown...`);
  try {
    // Stop accepting new connections
    await server.close();
    server.log.info('✅ Server closed gracefully');
    server.log.info('👋 AWS Config Service shutdown complete');
    process.exit(0);
  } catch (err) {
    server.log.error('❌ Error during graceful shutdown:', err);
    process.exit(1);
  }
};

// Register signal handlers for graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  server.log.fatal('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  server.log.fatal('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

start();
