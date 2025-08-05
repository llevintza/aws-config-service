import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';

export async function registerSwaggerUI(fastify: FastifyInstance): Promise<void> {
  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      displayRequestDuration: true,
      tryItOutEnabled: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    uiHooks: {
      onRequest(request, reply, next) {
        // Add any custom logic before serving Swagger UI
        next();
      },
    },
    staticCSP: true,
    transformSpecificationClone: true,
    theme: {
      title: 'AWS Config Service API Documentation',
    },
  });
}
