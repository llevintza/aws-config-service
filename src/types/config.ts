export interface ConfigValue {
  value: string | number;
  unit?: string;
  description?: string;
}

export interface ServiceConfigs {
  [configName: string]: ConfigValue;
}

export interface Service {
  configs: ServiceConfigs;
}

export interface Services {
  [serviceName: string]: Service;
}

export interface CloudRegion {
  services: Services;
}

export interface Cloud {
  [regionName: string]: CloudRegion;
}

export interface Tenant {
  cloud: Cloud;
}

export interface ConfigurationData {
  [tenantName: string]: Tenant;
}

export interface ConfigRequest {
  tenant: string;
  cloudRegion: string;
  service: string;
  configName: string;
}

export interface ConfigResponse {
  tenant: string;
  cloudRegion: string;
  service: string;
  configName: string;
  config: ConfigValue | null;
  found: boolean;
}

// DynamoDB-specific types
export interface DynamoDBConfigItem {
  pk: string; // Primary key: tenant#cloudRegion#service#configName
  sk: string; // Sort key: config
  tenant: string;
  cloudRegion: string;
  service: string;
  configName: string;
  value: string | number;
  unit?: string;
  description?: string;
  ttl?: number; // Optional TTL for cache expiration
}
