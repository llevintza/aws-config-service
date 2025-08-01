# Design Patterns Implementation Guide

This document explains the refactored architecture using Factory, Strategy, and Dependency Injection design patterns.

## Architecture Overview

The configuration service has been refactored to follow SOLID principles and implement clean design patterns:

```
┌─────────────────────────────────────────────────────────────┐
│                        Routes Layer                         │
│                    (config.ts)                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Dependency Injection                        │
│                   (DIContainer)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Factory Pattern                             │
│               (ConfigServiceFactory)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Interface Contract                           │
│                 (IConfigService)                           │
└─────────┬─────────────────────────────────────────┬─────────┘
          │                                         │
          ▼                                         ▼
┌─────────────────────┐                 ┌─────────────────────┐
│  Strategy Pattern   │                 │  Strategy Pattern   │
│ FileConfigService   │                 │ DynamoConfigService │
│ (File-based impl)   │                 │ (DynamoDB impl)     │
└─────────────────────┘                 └─────────────────────┘
```

## Design Patterns Used

### 1. Strategy Pattern

- **Interface**: `IConfigService` defines the contract
- **Concrete Strategies**:
  - `FileConfigService` - File-based implementation
  - `DynamoConfigService` - DynamoDB-based implementation

### 2. Factory Pattern

- **Factory**: `ConfigServiceFactory` creates appropriate service instances
- **Product**: `IConfigService` implementations
- **Creation Logic**: Based on environment variables

### 3. Dependency Injection Pattern

- **Container**: `DIContainer` manages service instances
- **Injection**: Services are injected at runtime, not compile time
- **Lifecycle**: Singleton pattern for service instances

## Key Components

### Interface Definition

```typescript
// src/interfaces/IConfigService.ts
export interface IConfigService {
  getConfig(request: ConfigRequest): Promise<ConfigValue | null>;
  getAllConfigs(): Promise<ConfigurationData>;
  getTenants(): Promise<string[]>;
  // ... other methods
}
```

### Factory Implementation

```typescript
// src/factories/ConfigServiceFactory.ts
export class ConfigServiceFactory {
  public static createConfigService(options: ConfigServiceFactoryOptions = {}): IConfigService {
    const useDynamoDB = options.useDynamoDB ?? process.env.USE_DYNAMODB === 'true';

    if (useDynamoDB) {
      return new DynamoConfigService();
    } else {
      return new FileConfigService(options.configFilePath);
    }
  }
}
```

### Dependency Injection Container

```typescript
// src/container/DIContainer.ts
export class DIContainer {
  public getConfigService(): IConfigService {
    if (!this.configService) {
      this.configService = ConfigServiceFactory.createFromEnvironment();
    }
    return this.configService;
  }
}
```

## Usage Examples

### Basic Usage (Recommended)

```typescript
import { getConfigService } from '../container/DIContainer';

// Get the service instance (automatically created based on environment)
const configService = getConfigService();

// Use the service
const config = await configService.getConfig({
  tenant: 'tenant1',
  cloudRegion: 'us-east-1',
  service: 'api-gateway',
  configName: 'rate-limit',
});
```

### Testing with Dependency Injection

```typescript
import { DIContainer } from '../container/DIContainer';
import { MockConfigService } from '../testing/MockConfigService';

// Set up test environment
const container = DIContainer.getInstance();
const mockService = new MockConfigService();
container.setConfigService(mockService);

// Now all calls to getConfigService() will return the mock
const configService = getConfigService();
// This is now using the mock service
```

### Factory Usage with Custom Options

```typescript
import { ConfigServiceFactory } from '../factories/ConfigServiceFactory';

// Create a file-based service with custom path
const fileService = ConfigServiceFactory.createConfigService({
  useDynamoDB: false,
  configFilePath: '/custom/path/config.json',
});

// Create a DynamoDB service
const dynamoService = ConfigServiceFactory.createConfigService({
  useDynamoDB: true,
});
```

## Benefits of This Architecture

### 1. **Separation of Concerns**

- Each class has a single responsibility
- Interface defines the contract, implementations handle specifics
- Factory handles creation logic, DI manages lifecycle

### 2. **Testability**

- Easy to inject mock services for testing
- No direct dependencies on concrete implementations
- Clear interfaces make testing straightforward

### 3. **Extensibility**

- Add new storage backends by implementing `IConfigService`
- Factory can be extended to create new service types
- No changes needed in consuming code

### 4. **Configuration Management**

- Runtime switching between implementations
- Environment-based configuration
- No code changes needed to switch backends

### 5. **Maintainability**

- Clear separation between concerns
- Easy to modify individual components
- Follows SOLID principles

## Migration Guide

### From Old Hybrid Service

```typescript
// OLD WAY
import { hybridConfigService } from '../services/hybridConfigService';
const config = await hybridConfigService.getConfig(request);

// NEW WAY (Recommended)
import { getConfigService } from '../container/DIContainer';
const configService = getConfigService();
const config = await configService.getConfig(request);
```

### Backward Compatibility

The old `hybridConfigService` is still available but marked as deprecated. It now uses the DI container internally for consistency.

## Environment Configuration

The system automatically selects the appropriate implementation based on environment variables:

```bash
# Use DynamoDB implementation
export USE_DYNAMODB=true

# Use file-based implementation (default)
export USE_DYNAMODB=false
# or simply don't set the variable

# Optional: Custom config file path
export CONFIG_FILE_PATH=/custom/path/config.json
```

## Testing Strategy

### Unit Testing Individual Services

```typescript
import { FileConfigService } from '../services/fileConfigService';

describe('FileConfigService', () => {
  it('should load configuration from file', async () => {
    const service = new FileConfigService('/path/to/test/config.json');
    const config = await service.getConfig(testRequest);
    expect(config).toBeDefined();
  });
});
```

### Integration Testing with DI

```typescript
import { setupTestEnvironment, MockConfigService } from '../testing/MockConfigService';
import { getConfigService } from '../container/DIContainer';

describe('Integration Tests', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it('should use mock service in tests', async () => {
    const service = getConfigService();
    expect(service).toBeInstanceOf(MockConfigService);
  });
});
```

## Performance Considerations

### Service Instance Management

- Services are created once and reused (singleton pattern)
- DI container manages lifecycle efficiently
- No performance overhead from repeated instantiation

### Memory Usage

- Single instance per application lifecycle
- File-based service loads data once
- DynamoDB service maintains connection pool

## Best Practices

### 1. Use DI Container

```typescript
// ✅ Good - Uses DI container
import { getConfigService } from '../container/DIContainer';
const service = getConfigService();

// ❌ Avoid - Direct instantiation
import { FileConfigService } from '../services/fileConfigService';
const service = new FileConfigService();
```

### 2. Program to Interfaces

```typescript
// ✅ Good - Uses interface
function processConfig(service: IConfigService) {
  return service.getConfig(request);
}

// ❌ Avoid - Depends on concrete class
function processConfig(service: FileConfigService) {
  return service.getConfig(request);
}
```

### 3. Test with Mocks

```typescript
// ✅ Good - Uses dependency injection for testing
const mockService = new MockConfigService();
DIContainer.getInstance().setConfigService(mockService);

// ❌ Avoid - Hard to test without DI
const service = new FileConfigService('/hard/coded/path');
```

This architecture provides a clean, maintainable, and testable solution that follows industry best practices and design patterns.
