import { DIContainer } from '../container/DIContainer';
import type { IConfigService } from '../interfaces/IConfigService';
import type { ConfigRequest, ConfigValue, ConfigurationData } from '../types/config';

/**
 * Mock implementation of IConfigService for testing purposes
 * Demonstrates how the DI pattern allows for easy testing
 */
export class MockConfigService implements IConfigService {
  private mockData: ConfigurationData = {
    'test-tenant': {
      cloud: {
        'us-east-1': {
          services: {
            'test-service': {
              configs: {
                'test-config': {
                  value: 'test-value',
                  unit: 'test-unit',
                  description: 'Test configuration',
                },
              },
            },
          },
        },
      },
    },
  };

  async getConfig(request: ConfigRequest): Promise<ConfigValue | null> {
    const { tenant, cloudRegion, service, configName } = request;

    return (
      this.mockData[tenant]?.cloud[cloudRegion]?.services[service]?.configs[configName] || null
    );
  }

  async getAllConfigs(): Promise<ConfigurationData> {
    return this.mockData;
  }

  async getTenants(): Promise<string[]> {
    return Object.keys(this.mockData);
  }

  async getCloudRegions(tenant: string): Promise<string[]> {
    return Object.keys(this.mockData[tenant]?.cloud || {});
  }

  async getServices(tenant: string, cloudRegion: string): Promise<string[]> {
    return Object.keys(this.mockData[tenant]?.cloud[cloudRegion]?.services || {});
  }

  async getConfigNames(tenant: string, cloudRegion: string, service: string): Promise<string[]> {
    return Object.keys(this.mockData[tenant]?.cloud[cloudRegion]?.services[service]?.configs || {});
  }

  async reloadConfig(): Promise<void> {
    // Mock implementation - nothing to reload
    return Promise.resolve();
  }

  // Helper method to set mock data for testing
  setMockData(data: ConfigurationData): void {
    this.mockData = data;
  }
}

/**
 * Example usage of DI pattern for testing
 */
export function setupTestEnvironment(): void {
  const container = DIContainer.getInstance();
  const mockService = new MockConfigService();

  // Inject the mock service for testing
  container.setConfigService(mockService);
}

/**
 * Reset to production environment
 */
export function resetToProductionEnvironment(): void {
  const container = DIContainer.getInstance();
  container.reset(); // This will cause the next getConfigService() call to create a new instance
}
