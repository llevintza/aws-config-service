import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import healthSchemas from '../schemas/health.json';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  // Health check endpoint
  fastify.get(
    '/health',
    { schema: healthSchemas.healthCheck },
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
    { schema: healthSchemas.rootRedirect },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      reply.redirect('/docs');
    }
  );
}
