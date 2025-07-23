import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import configSchemas from '../schemas/config.json';
import { configService } from '../services/configService';
import { ConfigRequest, ConfigResponse } from '../types/config';

interface ConfigParams {
  tenant: string;
  cloudRegion: string;
  service: string;
  configName: string;
}

export async function configRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /config/{tenant}/cloud/{cloudRegion}/service/{service}/config/{configName}
  fastify.get<{ Params: ConfigParams }>(
    '/config/:tenant/cloud/:cloudRegion/service/:service/config/:configName',
    { schema: configSchemas.getConfigByParams },
    async (
      request: FastifyRequest<{ Params: ConfigParams }>,
      reply: FastifyReply
    ): Promise<ConfigResponse> => {
      const { tenant, cloudRegion, service, configName } = request.params;

      const configRequest: ConfigRequest = {
        tenant,
        cloudRegion,
        service,
        configName,
      };

      try {
        const config = configService.getConfig(configRequest);

        if (config) {
          const response: ConfigResponse = {
            tenant,
            cloudRegion,
            service,
            configName,
            config,
            found: true,
          };
          return response;
        } else {
          reply.code(404);
          const response: ConfigResponse = {
            tenant,
            cloudRegion,
            service,
            configName,
            config: null,
            found: false,
          };
          return response;
        }
      } catch (error) {
        request.log.error('Error retrieving configuration:', error);
        reply.code(500);
        throw new Error('Internal server error while retrieving configuration');
      }
    }
  );

  // GET /config - List all available configurations (for debugging/discovery)
  fastify.get(
    '/config',
    { schema: configSchemas.getAllConfigs },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const allConfigs = configService.getAllConfigs();
        return allConfigs;
      } catch (error) {
        request.log.error('Error retrieving all configurations:', error);
        reply.code(500);
        throw new Error('Internal server error while retrieving configurations');
      }
    }
  );
}
