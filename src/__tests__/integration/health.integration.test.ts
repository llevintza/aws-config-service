import Fastify, { FastifyInstance } from 'fastify';
import { requestLoggingPlugin } from '../../plugins/request-logging';
import { healthRoutes } from '../../routes/health';

describe('Health Endpoint Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
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

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('status');
      expect(body.status).toBe('healthy');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('version');
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
