/**
 * React Query hook for backend health check with timeout and response validation.
 * Used to verify backend connectivity and validate response shape.
 */

import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { withTimeout } from '../utils/withTimeout';
import { validateHealthCheckResponse } from '../utils/healthCheckValidation';
import type { HealthCheck } from '../backend';

export interface BackendHealthState {
  isHealthy: boolean;
  isChecking: boolean;
  error: string | null;
  data: HealthCheck | null;
  lastChecked: number | null;
}

export function useBackendHealth() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<HealthCheck>({
    queryKey: ['backend-health'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available for health check');
      }

      try {
        // Call health check with 10 second timeout
        const response = await withTimeout(
          actor.healthCheck(),
          10000,
          'Health check timed out after 10 seconds'
        );

        // Validate response shape
        const validation = validateHealthCheckResponse(response);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid health check response');
        }

        return validation.data!;
      } catch (error: any) {
        // Preserve original error context
        console.error('[Health Check] Failed:', {
          error,
          message: error?.message,
          stack: error?.stack,
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2, // Retry twice for transient failures
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    staleTime: 30000, // Consider fresh for 30 seconds
    refetchOnWindowFocus: true,
  });

  return {
    isHealthy: query.isSuccess && query.data?.isHealthy === true,
    isChecking: query.isLoading || query.isFetching,
    error: query.error ? String(query.error) : null,
    data: query.data || null,
    lastChecked: query.dataUpdatedAt || null,
    refetch: query.refetch,
  };
}
