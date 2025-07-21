import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { configService } from '../services/configService';
import { ConfigRequest, ConfigResponse } from '../types/config';

interface ConfigParams {
  tenant: string;
  cloudRegion: string;
  service: string;
  configName: string;
}

export async function configRoutes(fastify: FastifyInstance): Promise<void> {
  // Schema for the config endpoint
  const configSchema = {
    description: 'Get configuration for a specific tenant, cloud region, service, and config name',
    tags: ['config'],
    params: {
      type: 'object',
      properties: {
        tenant: { type: 'string', description: 'Tenant identifier' },
        cloudRegion: { type: 'string', description: 'Cloud region (e.g., us-east-1, eu-west-1)' },
        service: { type: 'string', description: 'Service name (e.g., api-gateway, lambda)' },
        configName: { type: 'string', description: 'Configuration name (e.g., rate-limit, timeout)' }
      },
      required: ['tenant', 'cloudRegion', 'service', 'configName']
    },
    response: {
      200: {
        description: 'Configuration found',
        type: 'object',
        properties: {
          tenant: { type: 'string' },
          cloudRegion: { type: 'string' },
          service: { type: 'string' },
          configName: { type: 'string' },
          config: {
            type: 'object',
            properties: {
              value: { type: ['string', 'number'] },
              unit: { type: 'string' },
              description: { type: 'string' }
            }
          },
          found: { type: 'boolean' }
        }
      },
      404: {
        description: 'Configuration not found',
        type: 'object',
        properties: {
          tenant: { type: 'string' },
          cloudRegion: { type: 'string' },
          service: { type: 'string' },
          configName: { type: 'string' },
          config: { type: 'null' },
          found: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  };

  // GET /config/{tenant}/cloud/{cloudRegion}/service/{service}/config/{configName}
  fastify.get<{ Params: ConfigParams }>(
    '/config/:tenant/cloud/:cloudRegion/service/:service/config/:configName',
    { schema: configSchema },
    async (request: FastifyRequest<{ Params: ConfigParams }>, reply: FastifyReply): Promise<ConfigResponse> => {
      const { tenant, cloudRegion, service, configName } = request.params;

      const configRequest: ConfigRequest = {
        tenant,
        cloudRegion,
        service,
        configName
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
            found: true
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
            found: false
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
    {
      schema: {
        description: 'List all available configurations',
        tags: ['config'],
        response: {
          200: {
            description: 'All configurations',
            type: 'object'
          }
        }
      }
    },
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
