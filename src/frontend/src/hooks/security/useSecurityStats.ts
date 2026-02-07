import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { securityKeys } from '../orders/queryKeys';
import type { SecurityStats } from '../../backend';

export function useSecurityStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SecurityStats>({
    queryKey: securityKeys.stats(),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSecurityStats();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 8000, // Consider data fresh for 8 seconds
    refetchInterval: (query) => {
      // Only refetch when document is visible
      return document.hidden ? false : 10000;
    },
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchIntervalInBackground: false, // Stop polling when tab is hidden
  });
}
