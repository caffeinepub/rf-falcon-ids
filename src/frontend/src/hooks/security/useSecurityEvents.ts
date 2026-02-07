import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { securityKeys } from '../orders/queryKeys';
import type { SecurityEvent } from '../../backend';

export function useSecurityEvents(limit: number = 100) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SecurityEvent[]>({
    queryKey: securityKeys.events(limit),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSecurityEvents(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
    staleTime: 4000, // Consider data fresh for 4 seconds
    refetchInterval: (query) => {
      // Only refetch when document is visible
      return document.hidden ? false : 5000;
    },
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchIntervalInBackground: false, // Stop polling when tab is hidden
  });
}
