import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';

import { requestLoggingPlugin } from '../../plugins/request-logging';
import { healthRoutes } from '../../routes/health';
import type { HealthResponse } from '../../types';
import { HealthStatus } from '../../types';

describe('Health Endpoint Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'silent';

    app = Fastify({
      logger: false, // Disable logging in tests
    });

    // Register request logging plugin first (required by health routes)
    await app.register(requestLoggingPlugin);

    // Register the health routes for testing
    await app.register(healthRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);

      const body: HealthResponse = JSON.parse(response.body) as HealthResponse;
      expect(body).toHaveProperty('status');
      expect(body.status).toBe(HealthStatus.HEALTHY);
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('version');
      expect(body).toHaveProperty('message');
      expect(typeof body.uptime).toBe('number');
      expect(typeof body.timestamp).toBe('string');
      expect(typeof body.version).toBe('string');
    });
  });

  describe('GET /', () => {
    it('should redirect to documentation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/docs');
    });
  });
});
