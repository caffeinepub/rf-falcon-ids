/**
 * Runtime validator for backend health check response shape.
 * Validates that the backend health check returns expected fields and types.
 */

import type { HealthCheck } from '../backend';

export interface HealthCheckValidationResult {
  isValid: boolean;
  error: string | null;
  data: HealthCheck | null;
}

/**
 * Validate the shape and types of a health check response
 */
export function validateHealthCheckResponse(data: unknown): HealthCheckValidationResult {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      error: 'Health check response is not an object',
      data: null,
    };
  }

  const response = data as Record<string, unknown>;

  // Check required fields
  if (typeof response.version !== 'string') {
    return {
      isValid: false,
      error: 'Health check missing or invalid "version" field',
      data: null,
    };
  }

  if (typeof response.isHealthy !== 'boolean') {
    return {
      isValid: false,
      error: 'Health check missing or invalid "isHealthy" field',
      data: null,
    };
  }

  if (typeof response.time_ns !== 'bigint') {
    return {
      isValid: false,
      error: 'Health check missing or invalid "time_ns" field',
      data: null,
    };
  }

  if (!response.config || typeof response.config !== 'object') {
    return {
      isValid: false,
      error: 'Health check missing or invalid "config" field',
      data: null,
    };
  }

  if (!Array.isArray(response.updateLogs)) {
    return {
      isValid: false,
      error: 'Health check missing or invalid "updateLogs" field',
      data: null,
    };
  }

  // All validations passed, safe to cast
  return {
    isValid: true,
    error: null,
    data: data as HealthCheck,
  };
}
