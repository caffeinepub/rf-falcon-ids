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
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}
