import { ConfigServiceFactory } from '../factories/ConfigServiceFactory';
import type { IConfigService } from '../interfaces/IConfigService';

/**
 * Simple dependency injection container for managing configuration service instances
 * Implements the Dependency Injection pattern with singleton behavior
 */
export class DIContainer {
  private static instance: DIContainer;
  private configService: IConfigService | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of the DI container
   */
  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Get the configuration service instance
   * Creates one if it doesn't exist using the factory
   */
  public getConfigService(): IConfigService {
    if (!this.configService) {
      this.configService = ConfigServiceFactory.createFromEnvironment();
    }
    return this.configService;
  }

  /**
   * Set a specific configuration service instance
   * Useful for testing or explicit service injection
   */
  public setConfigService(service: IConfigService): void {
    this.configService = service;
  }

  /**
   * Reset the container (mainly for testing purposes)
   */
  public reset(): void {
    this.configService = null;
  }

  /**
   * Check if a service instance is currently registered
   */
  public hasConfigService(): boolean {
    return this.configService !== null;
  }
}

/**
 * Convenience function to get the configuration service
 */
export function getConfigService(): IConfigService {
  return DIContainer.getInstance().getConfigService();
}
