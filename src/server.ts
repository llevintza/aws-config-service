import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { configRoutes } from './routes/config';
import { healthRoutes } from './routes/health';

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

    // Register Swagger
    await server.register(swagger, {
      swagger: {
        info: {
          title: 'AWS Config Service API',
          description: 'A REST API service for loading configurations by tenant, cloud region, and service',
          version: '1.0.0',
          contact: {
            name: 'AWS Config Service Team',
            email: 'support@aws-config-service.com'
          }
        },
        host: 'localhost:3000',
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { 
            name: 'config', 
            description: 'Configuration management endpoints for tenants, cloud regions, and services' 
          },
          { 
            name: 'system', 
            description: 'System health and monitoring endpoints' 
          }
        ],
        securityDefinitions: {
          apiKey: {
            type: 'apiKey',
            name: 'apikey',
            in: 'header'
          }
        }
      }
    });

    // Register Swagger UI
    await server.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        displayRequestDuration: true,
        tryItOutEnabled: true
      },
      staticCSP: true,
      transformSpecificationClone: true
    });

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
process.on('SIGINT', async () => {
  try {
    await server.close();
    server.log.info('Server closed gracefully');
    process.exit(0);
  } catch (err) {
    server.log.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
});

start();
