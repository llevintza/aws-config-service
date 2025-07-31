import { getConfigService } from '../container/DIContainer';
import { IConfigService } from '../interfaces/IConfigService';
import { ConfigRequest, ConfigValue, ConfigurationData } from '../types/config';

/**
 * Hybrid configuration service that delegates to the appropriate implementation
 * Uses dependency injection to get the correct service instance
 *
 * @deprecated This class is kept for backward compatibility.
 * Consider using getConfigService() directly from DIContainer for new code.
 */
class HybridConfigService implements IConfigService {
  private configService: IConfigService;

  constructor() {
    // Get the appropriate service instance through dependency injection
    this.configService = getConfigService();
  }

  public async getConfig(request: ConfigRequest): Promise<ConfigValue | null> {
    return this.configService.getConfig(request);
  }

  public async getAllConfigs(): Promise<ConfigurationData> {
    return this.configService.getAllConfigs();
  }

  public async getTenants(): Promise<string[]> {
    return this.configService.getTenants();
  }

  public async getCloudRegions(tenant: string): Promise<string[]> {
    return this.configService.getCloudRegions(tenant);
  }

  public async getServices(tenant: string, cloudRegion: string): Promise<string[]> {
    return this.configService.getServices(tenant, cloudRegion);
  }

  public async getConfigNames(
    tenant: string,
    cloudRegion: string,
    service: string
  ): Promise<string[]> {
    return this.configService.getConfigNames(tenant, cloudRegion, service);
  }

  public async reloadConfig(): Promise<void> {
    return this.configService.reloadConfig();
  }
}

export const hybridConfigService = new HybridConfigService();
