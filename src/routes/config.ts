import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { getConfigService } from '../container/DIContainer';
import configSchemas from '../schemas/config.json';
import type { ConfigRequest, ConfigResponse } from '../types/config';

interface ConfigParams {
  tenant: string;
  cloudRegion: string;
  service: string;
  configName: string;
}

export function configRoutes(fastify: FastifyInstance, _options: unknown, done: () => void): void {
  // GET /config/{tenant}/cloud/{cloudRegion}/service/{service}/config/{configName}
  fastify.get<{ Params: ConfigParams }>(
    '/config/:tenant/cloud/:cloudRegion/service/:service/config/:configName',
    { schema: configSchemas.getConfigByParams },
    async (
      request: FastifyRequest<{ Params: ConfigParams }>,
      reply: FastifyReply,
    ): Promise<ConfigResponse> => {
      const { tenant, cloudRegion, service, configName } = request.params;

      const configRequest: ConfigRequest = {
        tenant,
        cloudRegion,
        service,
        configName,
      };

      // Use semantic logging for business logic
      request.requestLogger.info('Processing config request', {
        event: 'business.config.get',
        config: {
          tenant,
          cloudRegion,
          service,
          configName,
        },
      });

      try {
        const configService = getConfigService();
        const config = await configService.getConfig(configRequest);

        if (config) {
          const response: ConfigResponse = {
            tenant,
            cloudRegion,
            service,
            configName,
            config,
            found: true,
          };

          request.requestLogger.info('Config found and returned', {
            event: 'business.config.found',
            config: {
              tenant,
              cloudRegion,
              service,
              configName,
              hasValue: config !== null && config !== undefined,
            },
          });

          return response;
        } else {
          void reply.code(404);
          const response: ConfigResponse = {
            tenant,
            cloudRegion,
            service,
            configName,
            config: null,
            found: false,
          };

          request.requestLogger.warn('Config not found', {
            event: 'business.config.not_found',
            config: {
              tenant,
              cloudRegion,
              service,
              configName,
            },
          });

          return response;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        request.log.error(`Error retrieving configuration: ${errorMessage}`);
        request.requestLogger.error('Error retrieving configuration', {
          event: 'business.config.error',
          config: {
            tenant,
            cloudRegion,
            service,
            configName,
          },
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          },
        });

        void reply.code(500);
        throw new Error('Internal server error while retrieving configuration');
      }
    },
  );

  // GET /config - List all available configurations (for debugging/discovery)
  fastify.get(
    '/config',
    { schema: configSchemas.getAllConfigs },
    async (request: FastifyRequest, reply: FastifyReply) => {
      request.requestLogger.info('Processing get all configs request', {
        event: 'business.config.get_all',
      });

      try {
        const configService = getConfigService();
        const allConfigs = await configService.getAllConfigs();

        request.requestLogger.info('All configs retrieved successfully', {
          event: 'business.config.get_all.success',
          result: {
            configCount: Object.keys(allConfigs).length,
          },
        });

        return allConfigs;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        request.log.error(`Error retrieving all configurations: ${errorMessage}`);
        request.requestLogger.error('Error retrieving all configurations', {
          event: 'business.config.get_all.error',
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          },
        });

        void reply.code(500);
        throw new Error('Internal server error while retrieving configurations');
      }
    },
  );

  // Call done to indicate plugin is ready
  done();
}
