import * as fs from 'fs';
import * as path from 'path';
import { IConfigService } from '../interfaces/IConfigService';
import { ConfigRequest, ConfigurationData, ConfigValue } from '../types/config';

/**
 * File-based implementation of the configuration service
 * Reads configuration data from a JSON file
 */
export class FileConfigService implements IConfigService {
  private configData!: ConfigurationData;
  private readonly configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), 'data', 'configurations.json');
    this.loadConfigData();
  }

  private loadConfigData(): void {
    try {
      const rawData = fs.readFileSync(this.configPath, 'utf-8');
      this.configData = JSON.parse(rawData);
    } catch (error) {
      console.error('Error loading configuration data:', error);
      throw new Error(`Failed to load configuration data from ${this.configPath}`);
    }
  }

  public async getConfig(request: ConfigRequest): Promise<ConfigValue | null> {
    try {
      const { tenant, cloudRegion, service, configName } = request;

      // Navigate through the configuration structure
      const tenantData = this.configData[tenant];
      if (!tenantData) {
        return null;
      }

      const cloudData = tenantData.cloud[cloudRegion];
      if (!cloudData) {
        return null;
      }

      const serviceData = cloudData.services[service];
      if (!serviceData) {
        return null;
      }

      const configData = serviceData.configs[configName];
      if (!configData) {
        return null;
      }

      return configData;
    } catch (error) {
      console.error('Error retrieving configuration:', error);
      return null;
    }
  }

  public async getAllConfigs(): Promise<ConfigurationData> {
    return this.configData;
  }

  public async getTenants(): Promise<string[]> {
    return Object.keys(this.configData);
  }

  public async getCloudRegions(tenant: string): Promise<string[]> {
    const tenantData = this.configData[tenant];
    return tenantData ? Object.keys(tenantData.cloud) : [];
  }

  public async getServices(tenant: string, cloudRegion: string): Promise<string[]> {
    const tenantData = this.configData[tenant];
    if (!tenantData) {
      return [];
    }

    const cloudData = tenantData.cloud[cloudRegion];
    return cloudData ? Object.keys(cloudData.services) : [];
  }

  public async getConfigNames(
    tenant: string,
    cloudRegion: string,
    service: string
  ): Promise<string[]> {
    const tenantData = this.configData[tenant];
    if (!tenantData) {
      return [];
    }

    const cloudData = tenantData.cloud[cloudRegion];
    if (!cloudData) {
      return [];
    }

    const serviceData = cloudData.services[service];
    return serviceData ? Object.keys(serviceData.configs) : [];
  }

  public async reloadConfig(): Promise<void> {
    this.loadConfigData();
  }
}
