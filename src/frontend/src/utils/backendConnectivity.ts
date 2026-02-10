/**
 * Centralized backend connectivity state classification.
 * Distinguishes between misconfigured, unreachable, and unhealthy states.
 */

import { validateBackendCanisterId } from './runtimeConfig';

export type ConnectivityState =
  | 'connected'
  | 'connecting'
  | 'misconfigured'
  | 'unreachable'
  | 'unhealthy';

export interface ConnectivityStatus {
  state: ConnectivityState;
  message: string;
  canRetry: boolean;
}

/**
 * Derive connectivity state from runtime config, actor, and health check
 */
export async function deriveConnectivityState(
  isActorAvailable: boolean,
  isActorFetching: boolean,
  isHealthy: boolean,
  isHealthChecking: boolean,
  healthError: string | null
): Promise<ConnectivityStatus> {
  // Check runtime config first - this is authoritative for misconfiguration
  const configValidation = await validateBackendCanisterId();
  if (!configValidation.isValid) {
    return {
      state: 'misconfigured',
      message:
        configValidation.error === 'missing'
          ? 'Backend canister ID is not configured'
          : 'Backend canister ID format is invalid',
      canRetry: false, // Cannot retry misconfiguration - requires rebuild/redeploy or runtime config edit
    };
  }

  // Check if still initializing
  if (isActorFetching || isHealthChecking) {
    return {
      state: 'connecting',
      message: 'Connecting to backend...',
      canRetry: false,
    };
  }

  // Check if actor is unavailable
  if (!isActorAvailable) {
    return {
      state: 'unreachable',
      message: 'Unable to connect to backend service',
      canRetry: true,
    };
  }

  // Check health status
  if (healthError) {
    return {
      state: 'unhealthy',
      message: 'Backend service is not responding correctly',
      canRetry: true,
    };
  }

  if (!isHealthy) {
    return {
      state: 'unhealthy',
      message: 'Backend service health check failed',
      canRetry: true,
    };
  }

  return {
    state: 'connected',
    message: 'Connected to backend',
    canRetry: false,
  };
}

