/**
 * Health check response type definition
 */
export interface HealthResponse {
  /** Health status indicator */
  status: 'healthy' | 'unhealthy';
  /** ISO timestamp of when the health check was performed */
  timestamp: string;
  /** Process uptime in seconds */
  uptime: number;
  /** Application version */
  version: string;
  /** Optional health status message */
  message?: string;
}

/**
 * Health check status enum for consistency
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
}

/**
 * Utility function to create a health response object
 * @param status - The health status (defaults to healthy)
 * @param message - Optional message to include
 * @returns HealthResponse object
 */
export function createHealthResponse(
  status: HealthStatus = HealthStatus.HEALTHY,
  message?: string,
): HealthResponse {
  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version ?? '1.0.0',
    message,
  };
}
