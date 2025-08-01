import { MockConfigService } from '../testing/MockConfigService';
import { ConfigRequest } from '../types/config';

describe('MockConfigService', () => {
  let mockService: MockConfigService;

  beforeEach(() => {
    mockService = new MockConfigService();
  });

  describe('getConfig', () => {
    it('should return mock config data', async () => {
      const request: ConfigRequest = {
        tenant: 'test-tenant',
        cloudRegion: 'us-east-1',
        service: 'test-service',
        configName: 'test-config',
      };

      const result = await mockService.getConfig(request);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      if (result) {
        expect(result.value).toBe('test-value');
        expect(result.description).toBe('Test configuration');
      }
    });

    it('should return null for non-existent config', async () => {
      const request: ConfigRequest = {
        tenant: 'non-existent',
        cloudRegion: 'us-west-1',
        service: 'unknown-service',
        configName: 'missing-config',
      };

      const result = await mockService.getConfig(request);
      expect(result).toBeNull();
    });
  });

  describe('getAllConfigs', () => {
    it('should return all configuration data', async () => {
      const result = await mockService.getAllConfigs();

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result['test-tenant']).toBeDefined();
    });
  });

  describe('getTenants', () => {
    it('should return list of tenants', async () => {
      const result = await mockService.getTenants();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('test-tenant');
    });
  });

  describe('getCloudRegions', () => {
    it('should return cloud regions for a tenant', async () => {
      const result = await mockService.getCloudRegions('test-tenant');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('us-east-1');
    });

    it('should return empty array for non-existent tenant', async () => {
      const result = await mockService.getCloudRegions('non-existent');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });

  describe('getServices', () => {
    it('should return services for a tenant and region', async () => {
      const result = await mockService.getServices('test-tenant', 'us-east-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('test-service');
    });
  });

  describe('getConfigNames', () => {
    it('should return config names for a specific service', async () => {
      const result = await mockService.getConfigNames('test-tenant', 'us-east-1', 'test-service');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('test-config');
    });
  });

  describe('reloadConfig', () => {
    it('should complete without error', async () => {
      await expect(mockService.reloadConfig()).resolves.toBeUndefined();
    });
  });

  describe('setMockData', () => {
    it('should update the mock data', async () => {
      const newData = {
        'new-tenant': {
          cloud: {
            'eu-west-1': {
              services: {
                'new-service': {
                  configs: {
                    'new-config': {
                      value: 'new-value',
                      description: 'New test config',
                    },
                  },
                },
              },
            },
          },
        },
      };

      mockService.setMockData(newData);

      const tenants = await mockService.getTenants();
      expect(tenants).toContain('new-tenant');

      const config = await mockService.getConfig({
        tenant: 'new-tenant',
        cloudRegion: 'eu-west-1',
        service: 'new-service',
        configName: 'new-config',
      });

      expect(config).not.toBeNull();
      if (config) {
        expect(config.value).toBe('new-value');
      }
    });
  });
});
