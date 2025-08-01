import type { FastifyInstance } from 'fastify';

import { configRoutes } from './config';
import { healthRoutes } from './health';

export async function registerAllRoutes(fastify: FastifyInstance): Promise<void> {
  // Register all routes
  await fastify.register(healthRoutes);
  await fastify.register(configRoutes);
}

// Export individual route modules for selective registration
export { configRoutes, healthRoutes };
