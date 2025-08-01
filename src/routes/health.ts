import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import healthSchemas from '../schemas/health.json';

export function healthRoutes(fastify: FastifyInstance): void {
  // Health check endpoint
  fastify.get(
    '/health',
    { schema: healthSchemas.healthCheck },
    async (request: FastifyRequest, _reply: FastifyReply) => {
      // Semantic logging for health checks
      request.requestLogger.info('Processing health check', {
        event: 'system.health.check',
      });

      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version ?? '1.0.0',
        message: 'Service is running smoothly! 🎉',
      };

      request.requestLogger.info('Health check completed', {
        event: 'system.health.check.success',
        health: {
          status: healthData.status,
          uptime: healthData.uptime,
          version: healthData.version,
        },
      });

      return healthData;
    },
  );

  // Root endpoint - redirect to Swagger UI
  fastify.get(
    '/',
    { schema: healthSchemas.rootRedirect },
    async (request: FastifyRequest, reply: FastifyReply) => {
      request.requestLogger.info('Root endpoint accessed, redirecting to docs', {
        event: 'system.redirect.docs',
        redirect: {
          from: '/',
          to: '/docs',
        },
      });

      void reply.redirect('/docs');
    },
  );
}
