import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import healthSchemas from '../schemas/health.json';
import type { HealthResponse } from '../types';
import { HealthStatus, createHealthResponse } from '../types';

export function healthRoutes(fastify: FastifyInstance, _options: unknown, done: () => void): void {
  // Health check endpoint
  fastify.get(
    '/health',
    { schema: healthSchemas.healthCheck },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Semantic logging for health checks (only in non-test environments)
      if (process.env.NODE_ENV !== 'test' || process.env.LOG_LEVEL !== 'silent') {
        request.requestLogger.info('Processing health check', {
          event: 'system.health.check',
        });
      }

      const healthData: HealthResponse = createHealthResponse(
        HealthStatus.HEALTHY,
        'Service is running smoothly! 🎉',
      );

      if (process.env.NODE_ENV !== 'test' || process.env.LOG_LEVEL !== 'silent') {
        request.requestLogger.info('Health check completed', {
          event: 'system.health.check.success',
          health: {
            status: healthData.status,
            uptime: healthData.uptime,
            version: healthData.version,
          },
        });
      }

      return reply.send(healthData);
    },
  );

  // Root endpoint - redirect to Swagger UI
  fastify.get(
    '/',
    { schema: healthSchemas.rootRedirect },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (process.env.NODE_ENV !== 'test' || process.env.LOG_LEVEL !== 'silent') {
        request.requestLogger.info('Root endpoint accessed, redirecting to docs', {
          event: 'system.redirect.docs',
          redirect: {
            from: '/',
            to: '/docs',
          },
        });
      }

      return reply.redirect('/docs');
    },
  );

  // Call done to indicate plugin is ready
  done();
}
