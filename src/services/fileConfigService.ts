import * as fs from 'fs';
import * as path from 'path';

import logger from '../config/logger';
import type { IConfigService } from '../interfaces/IConfigService';
import type { ConfigRequest, ConfigurationData, ConfigValue } from '../types/config';

/**
 * File-based implementation of the configuration service
 * Reads configuration data from a JSON file
 */
export class FileConfigService implements IConfigService {
  private configData!: ConfigurationData;
  private readonly configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath ?? path.join(process.cwd(), 'data', 'configurations.json');
    this.loadConfigData();
  }

  private loadConfigData(): void {
    try {
      const rawData = fs.readFileSync(this.configPath, 'utf-8');
      this.configData = JSON.parse(rawData) as ConfigurationData;
    } catch (error) {
      logger.error('Error loading configuration data:', error);
      throw new Error(`Failed to load configuration data from ${this.configPath}`);
    }
  }

  public async getConfig(request: ConfigRequest): Promise<ConfigValue | null> {
    return Promise.resolve(this.getConfigSync(request));
  }

  private getConfigSync(request: ConfigRequest): ConfigValue | null {
    try {
      const { tenant, cloudRegion, service, configName } = request;

      // Navigate through the configuration structure
      const tenantData = this.configData[tenant];
      if (tenantData === null || tenantData === undefined) {
        return null;
      }

      const cloudData = tenantData.cloud[cloudRegion];
      if (cloudData === null || cloudData === undefined) {
        return null;
      }

      const serviceData = cloudData.services[service];
      if (serviceData === null || serviceData === undefined) {
        return null;
      }

      const configData = serviceData.configs[configName];
      if (configData === null || configData === undefined) {
        return null;
      }

      return configData;
    } catch (error) {
      logger.error('Error retrieving configuration:', error);
      return null;
    }
  }

  public async getAllConfigs(): Promise<ConfigurationData> {
    return Promise.resolve(this.configData);
  }

  public async getTenants(): Promise<string[]> {
    return Promise.resolve(Object.keys(this.configData));
  }

  public async getCloudRegions(tenant: string): Promise<string[]> {
    const tenantData = this.configData[tenant];
    return Promise.resolve(
      tenantData !== null && tenantData !== undefined ? Object.keys(tenantData.cloud) : [],
    );
  }

  public async getServices(tenant: string, cloudRegion: string): Promise<string[]> {
    const tenantData = this.configData[tenant];
    if (tenantData === null || tenantData === undefined) {
      return Promise.resolve([]);
    }

    const cloudData = tenantData.cloud[cloudRegion];
    return Promise.resolve(
      cloudData !== null && cloudData !== undefined ? Object.keys(cloudData.services) : [],
    );
  }

  public async getConfigNames(
    tenant: string,
    cloudRegion: string,
    service: string,
  ): Promise<string[]> {
    const tenantData = this.configData[tenant];
    if (tenantData === null || tenantData === undefined) {
      return Promise.resolve([]);
    }

    const cloudData = tenantData.cloud[cloudRegion];
    if (cloudData === null || cloudData === undefined) {
      return Promise.resolve([]);
    }

    const serviceData = cloudData.services[service];
    return Promise.resolve(
      serviceData !== null && serviceData !== undefined ? Object.keys(serviceData.configs) : [],
    );
  }

  public async reloadConfig(): Promise<void> {
    return Promise.resolve(this.loadConfigData());
  }
}
