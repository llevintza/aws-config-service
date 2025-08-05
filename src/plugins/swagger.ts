import swagger from '@fastify/swagger';
import type { FastifyInstance } from 'fastify';

export async function registerSwagger(fastify: FastifyInstance): Promise<void> {
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'AWS Config Service API',
        description:
          'A REST API service for loading configurations by tenant, cloud region, and service',
        version: '1.0.0',
        contact: {
          name: 'AWS Config Service Team',
          email: 'support@aws-config-service.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      host: 'localhost:3000',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        {
          name: 'config',
          description:
            'Configuration management endpoints for tenants, cloud regions, and services',
        },
        {
          name: 'system',
          description: 'System health and monitoring endpoints',
        },
      ],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'apikey',
          in: 'header',
          description: 'API key for authentication',
        },
      },
      definitions: {
        Error: {
          type: 'object',
          required: ['error', 'message'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'number' },
          },
        },
      },
    },
  });
}
