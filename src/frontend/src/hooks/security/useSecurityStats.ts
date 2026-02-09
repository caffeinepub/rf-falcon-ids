import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { securityKeys } from '../orders/queryKeys';
import type { TreyCSecurityStats } from '../../backend';

export function useSecurityStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TreyCSecurityStats>({
    queryKey: securityKeys.stats(),
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      
      try {
        return await actor.getTreyCSecurityStats();
      } catch (error: any) {
        // Handle unauthorized or unsupported backend gracefully
        if (error.message?.includes('Unauthorized') || error.message?.includes('not found')) {
          console.warn('TREY-C Security stats not available or unauthorized:', error.message);
          // Return default empty stats
          return {
            allowedCalls: BigInt(0),
            deniedCalls: BigInt(0),
            throttledCalls: BigInt(0),
          };
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 8000,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
}
