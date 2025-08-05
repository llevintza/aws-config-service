import * as fs from 'fs';
import * as path from 'path';

import type { ConfigRequest, ConfigurationData, ConfigValue } from '../types/config';

class ConfigService {
  private configData!: ConfigurationData;

  constructor() {
    this.loadConfigData();
  }

  private loadConfigData(): void {
    try {
      const configPath = path.join(process.cwd(), 'data', 'configurations.json');
      const rawData = fs.readFileSync(configPath, 'utf-8');
      this.configData = JSON.parse(rawData) as ConfigurationData;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading configuration data:', error);
      throw new Error('Failed to load configuration data');
    }
  }

  public getConfig(request: ConfigRequest): ConfigValue | null {
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
      // eslint-disable-next-line no-console
      console.error('Error retrieving configuration:', error);
      return null;
    }
  }

  public getAllConfigs(): ConfigurationData {
    return this.configData;
  }

  public getTenants(): string[] {
    return Object.keys(this.configData);
  }

  public getCloudRegions(tenant: string): string[] {
    const tenantData = this.configData[tenant];
    return tenantData !== null && tenantData !== undefined ? Object.keys(tenantData.cloud) : [];
  }

  public getServices(tenant: string, cloudRegion: string): string[] {
    const tenantData = this.configData[tenant];
    if (tenantData === null || tenantData === undefined) {
      return [];
    }

    const cloudData = tenantData.cloud[cloudRegion];
    return cloudData !== null && cloudData !== undefined ? Object.keys(cloudData.services) : [];
  }

  public getConfigNames(tenant: string, cloudRegion: string, service: string): string[] {
    const tenantData = this.configData[tenant];
    if (tenantData === null || tenantData === undefined) {
      return [];
    }

    const cloudData = tenantData.cloud[cloudRegion];
    if (cloudData === null || cloudData === undefined) {
      return [];
    }

    const serviceData = cloudData.services[service];
    return serviceData !== null && serviceData !== undefined
      ? Object.keys(serviceData.configs)
      : [];
  }

  // Reload configuration data (useful for hot-reloading in development)
  public reloadConfig(): void {
    this.loadConfigData();
  }
}

export const configService = new ConfigService();
