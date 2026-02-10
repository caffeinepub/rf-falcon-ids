/**
 * Composable hook that exposes centralized backend connectivity state
 * and retry action for components.
 */

import { useActor } from './useActor';
import { useBackendHealth } from './useBackendHealth';
import { useQueryClient } from '@tanstack/react-query';
import { deriveConnectivityState, type ConnectivityStatus } from '../utils/backendConnectivity';
import { useEffect, useState } from 'react';

export interface BackendConnectivityHook extends ConnectivityStatus {
  retry: () => void;
  isRetrying: boolean;
}

export function useBackendConnectivity(): BackendConnectivityHook {
  const { actor, isFetching: actorFetching } = useActor();
  const { isHealthy, isChecking: healthChecking, error: healthError, refetch } = useBackendHealth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectivityStatus>({
    state: 'connecting',
    message: 'Initializing...',
    canRetry: false,
  });

  useEffect(() => {
    deriveConnectivityState(!!actor, actorFetching, isHealthy, healthChecking, healthError).then(
      setStatus
    );
  }, [actor, actorFetching, isHealthy, healthChecking, healthError]);

  const retry = () => {
    // Invalidate actor to retry initialization
    queryClient.invalidateQueries({ queryKey: ['actor'] });
    // Retry health check
    refetch();
    // Invalidate all dependent queries
    queryClient.invalidateQueries();
  };

  return {
    ...status,
    retry,
    isRetrying: actorFetching || healthChecking,
  };
}

