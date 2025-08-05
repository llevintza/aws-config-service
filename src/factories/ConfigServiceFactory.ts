import logger from '../config/logger';
import type { IConfigService } from '../interfaces/IConfigService';
import { DynamoConfigService } from '../services/dynamoConfigService';
import { FileConfigService } from '../services/fileConfigService';

/**
 * Configuration for the service factory
 */
export interface ConfigServiceFactoryOptions {
  useDynamoDB?: boolean;
  configFilePath?: string;
}

/**
 * Factory class responsible for creating configuration service instances
 * Implements the Factory design pattern to abstract service creation
 */
export class ConfigServiceFactory {
  /**
   * Creates a configuration service instance based on the provided options
   * @param options Configuration options for service creation
   * @returns An instance implementing IConfigService
   */
  public static createConfigService(options: ConfigServiceFactoryOptions = {}): IConfigService {
    const useDynamoDB = options.useDynamoDB ?? process.env.USE_DYNAMODB === 'true';

    if (useDynamoDB) {
      logger.info('ConfigServiceFactory: Creating DynamoDB-based configuration service');
      return new DynamoConfigService();
    } else {
      logger.info('ConfigServiceFactory: Creating file-based configuration service');
      return new FileConfigService(options.configFilePath);
    }
  }

  /**
   * Creates a configuration service instance based on environment variables
   * @returns An instance implementing IConfigService
   */
  public static createFromEnvironment(): IConfigService {
    return this.createConfigService({
      useDynamoDB: process.env.USE_DYNAMODB === 'true',
      configFilePath: process.env.CONFIG_FILE_PATH,
    });
  }
}
