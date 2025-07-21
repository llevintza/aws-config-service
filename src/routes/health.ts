import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  // Health check endpoint
  fastify.get(
    '/health',
    {
      schema: {
        description: 'Health check endpoint',
        tags: ['system'],
        response: {
          200: {
            description: 'Service is healthy',
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              version: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        message: 'Service is running smoothly! 🎉',
      };
    }
  );

  // Root endpoint - redirect to Swagger UI
  fastify.get(
    '/',
    {
      schema: {
        description: 'Root endpoint - redirects to Swagger UI documentation',
        tags: ['system'],
        response: {
          302: {
            description: 'Redirect to Swagger UI',
            type: 'null',
          },
        },
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      reply.redirect('/docs');
    }
  );
}
