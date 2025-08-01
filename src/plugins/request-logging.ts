import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { createRequestLogger } from '../config/logger';

declare module 'fastify' {
  interface FastifyRequest {
    requestLogger: ReturnType<typeof createRequestLogger>;
    startTime: number;
  }
}

function requestLoggingPluginFn(fastify: FastifyInstance): void {
  // Hook to add request logger and capture start time
  fastify.addHook('preHandler', (request: FastifyRequest) => {
    request.startTime = Date.now();
    request.requestLogger = createRequestLogger(request.id);

    // Semantic logging: Log incoming request with structured data
    request.requestLogger.info('Incoming request', {
      event: 'request.start',
      http: {
        method: request.method,
        url: request.url,
        route: request.routeOptions?.url ?? request.url,
        userAgent: request.headers['user-agent'],
        contentType: request.headers['content-type'],
        contentLength: request.headers['content-length'],
      },
      client: {
        ip: request.ip,
        hostname: request.hostname,
      },
      request: {
        id: request.id,
        params: request.params,
        query: request.query,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Hook to log response completion
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const responseTime = Date.now() - request.startTime;

    // Semantic logging: Log response completion with structured data
    request.requestLogger.info('Request completed', {
      event: 'request.complete',
      http: {
        method: request.method,
        url: request.url,
        route: request.routeOptions?.url ?? request.url,
        statusCode: reply.statusCode,
        statusMessage: reply.raw.statusMessage,
      },
      client: {
        ip: request.ip,
        hostname: request.hostname,
      },
      request: {
        id: request.id,
      },
      performance: {
        responseTime,
        responseTimeUnit: 'ms',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Hook to log errors
  fastify.addHook(
    'onError',
    async (request: FastifyRequest, _reply: FastifyReply, error: Error) => {
      const responseTime = Date.now() - request.startTime;

      // Semantic logging: Log errors with structured data
      request.requestLogger.error('Request error', {
        event: 'request.error',
        http: {
          method: request.method,
          url: request.url,
          route: request.routeOptions?.url ?? request.url,
        },
        client: {
          ip: request.ip,
          hostname: request.hostname,
        },
        request: {
          id: request.id,
        },
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: (error as Error & { code?: string }).code,
        },
        performance: {
          responseTime,
          responseTimeUnit: 'ms',
        },
        timestamp: new Date().toISOString(),
      });
    },
  );
}

// Export the plugin with proper encapsulation
export const requestLoggingPlugin = fp(requestLoggingPluginFn, {
  name: 'request-logging',
});

export default requestLoggingPlugin;
