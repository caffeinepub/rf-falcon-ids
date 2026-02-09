import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { securityKeys } from '../orders/queryKeys';
import type { TreyCSecurityConfig } from '../../backend';

export function useSecurityConfig() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TreyCSecurityConfig>({
    queryKey: securityKeys.config(),
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      
      try {
        return await actor.getTreyCSecurityConfig();
      } catch (error: any) {
        // Handle unauthorized or unsupported backend gracefully
        if (error.message?.includes('Unauthorized') || error.message?.includes('not found')) {
          console.warn('TREY-C Security not available or unauthorized:', error.message);
          // Return default disabled config
          return {
            enabled: false,
            rateLimitWindow: BigInt(60_000_000_000),
            maxCallsPerWindow: BigInt(10),
          };
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
    retry: 1,
  });
}
