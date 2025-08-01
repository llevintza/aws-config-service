import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationData, ConfigRequest, ConfigValue } from '../types/config';

class ConfigService {
  private configData!: ConfigurationData;

  constructor() {
    this.loadConfigData();
  }

  private loadConfigData(): void {
    try {
      const configPath = path.join(process.cwd(), 'data', 'configurations.json');
      const rawData = fs.readFileSync(configPath, 'utf-8');
      this.configData = JSON.parse(rawData);
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
    return tenantData ? Object.keys(tenantData.cloud) : [];
  }

  public getServices(tenant: string, cloudRegion: string): string[] {
    const tenantData = this.configData[tenant];
    if (!tenantData) return [];

    const cloudData = tenantData.cloud[cloudRegion];
    return cloudData ? Object.keys(cloudData.services) : [];
  }

  public getConfigNames(tenant: string, cloudRegion: string, service: string): string[] {
    const tenantData = this.configData[tenant];
    if (!tenantData) return [];

    const cloudData = tenantData.cloud[cloudRegion];
    if (!cloudData) return [];

    const serviceData = cloudData.services[service];
    return serviceData ? Object.keys(serviceData.configs) : [];
  }

  // Reload configuration data (useful for hot-reloading in development)
  public reloadConfig(): void {
    this.loadConfigData();
  }
}

export const configService = new ConfigService();
