import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';

export async function registerSwaggerCombined(fastify: FastifyInstance): Promise<void> {
  // Register swagger first
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'AWS Config Service API',
        description:
          'A REST API service for loading configurations by tenant, cloud region, and service',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        {
          name: 'config',
          description:
            'Configuration management endpoints for tenants, cloud regions, and services',
        },
        {
          name: 'health',
          description: 'Service health and monitoring endpoints',
        },
      ],
    },
  });

  // Then register swagger-ui
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
    staticCSP: true,
    transformSpecificationClone: true,
    theme: {
      title: 'AWS Config Service API Documentation',
    },
  });
}
