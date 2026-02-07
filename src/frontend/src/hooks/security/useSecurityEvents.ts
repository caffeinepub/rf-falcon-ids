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
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}
