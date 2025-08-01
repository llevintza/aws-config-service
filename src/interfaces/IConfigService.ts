import type { ConfigRequest, ConfigValue, ConfigurationData } from '../types/config';

/**
 * Interface defining the contract for configuration service implementations
 */
export interface IConfigService {
  /**
   * Retrieve a specific configuration value
   */
  getConfig(request: ConfigRequest): Promise<ConfigValue | null>;

  /**
   * Retrieve all configuration data
   */
  getAllConfigs(): Promise<ConfigurationData>;

  /**
   * Get all available tenants
   */
  getTenants(): Promise<string[]>;

  /**
   * Get all cloud regions for a specific tenant
   */
  getCloudRegions(tenant: string): Promise<string[]>;

  /**
   * Get all services for a specific tenant and cloud region
   */
  getServices(tenant: string, cloudRegion: string): Promise<string[]>;

  /**
   * Get all configuration names for a specific tenant, cloud region, and service
   */
  getConfigNames(tenant: string, cloudRegion: string, service: string): Promise<string[]>;

  /**
   * Reload configuration data (implementation-specific behavior)
   */
  reloadConfig(): Promise<void>;
}
