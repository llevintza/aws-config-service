import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

import { dynamoDBConfig } from '../config/dynamodb';
import logger from '../config/logger';
import type { IConfigService } from '../interfaces/IConfigService';
import type {
  ConfigRequest,
  ConfigurationData,
  ConfigValue,
  DynamoDBConfigItem,
} from '../types/config';

/**
 * DynamoDB-based implementation of the configuration service
 * Stores and retrieves configuration data from DynamoDB
 */
export class DynamoConfigService implements IConfigService {
  private readonly client: DynamoDBClient;
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    this.client = new DynamoDBClient({
      region: dynamoDBConfig.region,
      endpoint: dynamoDBConfig.endpoint,
      credentials: {
        accessKeyId: dynamoDBConfig.accessKeyId ?? 'dummy',
        secretAccessKey: dynamoDBConfig.secretAccessKey ?? 'dummy',
      },
    });

    this.docClient = DynamoDBDocumentClient.from(this.client);
    this.tableName = dynamoDBConfig.tableName;
  }

  private buildPrimaryKey(
    tenant: string,
    cloudRegion: string,
    service: string,
    configName: string,
  ): string {
    return `${tenant}#${cloudRegion}#${service}#${configName}`;
  }

  public async getConfig(request: ConfigRequest): Promise<ConfigValue | null> {
    try {
      const { tenant, cloudRegion, service, configName } = request;
      const pk = this.buildPrimaryKey(tenant, cloudRegion, service, configName);

      const command = new GetCommand({
        TableName: this.tableName,
        Key: {
          pk,
          sk: 'config',
        },
      });

      const result = await this.docClient.send(command);

      if (!result.Item) {
        return null;
      }

      const item = result.Item as DynamoDBConfigItem;
      return {
        value: item.value,
        unit: item.unit,
        description: item.description,
      };
    } catch (error) {
      logger.error('Error retrieving configuration from DynamoDB:', error);
      return null;
    }
  }

  public async getAllConfigs(): Promise<ConfigurationData> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName,
      });

      const result = await this.docClient.send(command);
      const configData: ConfigurationData = {};

      if (result.Items) {
        for (const item of result.Items as DynamoDBConfigItem[]) {
          const { tenant, cloudRegion, service, configName, value, unit, description } = item;

          if (!configData[tenant]) {
            configData[tenant] = { cloud: {} };
          }

          if (!configData[tenant].cloud[cloudRegion]) {
            configData[tenant].cloud[cloudRegion] = { services: {} };
          }

          if (!configData[tenant].cloud[cloudRegion].services[service]) {
            configData[tenant].cloud[cloudRegion].services[service] = { configs: {} };
          }

          configData[tenant].cloud[cloudRegion].services[service].configs[configName] = {
            value,
            unit,
            description,
          };
        }
      }

      return configData;
    } catch (error) {
      logger.error('Error retrieving all configurations from DynamoDB:', error);
      return {};
    }
  }

  public async getTenants(): Promise<string[]> {
    try {
      const allConfigs = await this.getAllConfigs();
      return Object.keys(allConfigs);
    } catch (error) {
      logger.error('Error retrieving tenants from DynamoDB:', error);
      return [];
    }
  }

  public async getCloudRegions(tenant: string): Promise<string[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'tenant-index', // We'll need to create this GSI
        KeyConditionExpression: 'tenant = :tenant',
        ExpressionAttributeValues: {
          ':tenant': tenant,
        },
        ProjectionExpression: 'cloudRegion',
      });

      const result = await this.docClient.send(command);
      const regions = new Set<string>();

      if (result.Items) {
        for (const item of result.Items as DynamoDBConfigItem[]) {
          regions.add(item.cloudRegion);
        }
      }

      return Array.from(regions);
    } catch (error) {
      logger.error('Error retrieving cloud regions from DynamoDB:', error);
      return [];
    }
  }

  public async getServices(tenant: string, cloudRegion: string): Promise<string[]> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'tenant = :tenant AND cloudRegion = :cloudRegion',
        ExpressionAttributeValues: {
          ':tenant': tenant,
          ':cloudRegion': cloudRegion,
        },
        ProjectionExpression: 'service',
      });

      const result = await this.docClient.send(command);
      const services = new Set<string>();

      if (result.Items) {
        for (const item of result.Items as DynamoDBConfigItem[]) {
          services.add(item.service);
        }
      }

      return Array.from(services);
    } catch (error) {
      logger.error('Error retrieving services from DynamoDB:', error);
      return [];
    }
  }

  public async getConfigNames(
    tenant: string,
    cloudRegion: string,
    service: string,
  ): Promise<string[]> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'tenant = :tenant AND cloudRegion = :cloudRegion AND service = :service',
        ExpressionAttributeValues: {
          ':tenant': tenant,
          ':cloudRegion': cloudRegion,
          ':service': service,
        },
        ProjectionExpression: 'configName',
      });

      const result = await this.docClient.send(command);
      const configNames = new Set<string>();

      if (result.Items) {
        for (const item of result.Items as DynamoDBConfigItem[]) {
          configNames.add(item.configName);
        }
      }

      return Array.from(configNames);
    } catch (error) {
      logger.error('Error retrieving config names from DynamoDB:', error);
      return [];
    }
  }

  public async putConfig(
    tenant: string,
    cloudRegion: string,
    service: string,
    configName: string,
    config: ConfigValue,
  ): Promise<boolean> {
    try {
      const pk = this.buildPrimaryKey(tenant, cloudRegion, service, configName);
      const item: DynamoDBConfigItem = {
        pk,
        sk: 'config',
        tenant,
        cloudRegion,
        service,
        configName,
        value: config.value,
        unit: config.unit,
        description: config.description,
      };

      const command = new PutCommand({
        TableName: this.tableName,
        Item: item,
      });

      await this.docClient.send(command);
      return true;
    } catch (error) {
      logger.error('Error putting configuration to DynamoDB:', error);
      return false;
    }
  }

  public async reloadConfig(): Promise<void> {
    // For DynamoDB, no reload is needed as data is always live
    // This method is included for interface compliance
    return Promise.resolve();
  }
}

export const dynamoConfigService = new DynamoConfigService();
