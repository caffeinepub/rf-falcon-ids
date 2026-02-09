import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { securityKeys } from '../orders/queryKeys';
import type { TreyCSecurityEvent } from '../../backend';

export function useSecurityEvents(limit: number = 100) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TreyCSecurityEvent[]>({
    queryKey: securityKeys.events(limit),
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      
      try {
        const events = await actor.getTreyCSecurityEvents();
        // Return most recent events up to limit
        return events.slice(-limit).reverse();
      } catch (error: any) {
        // Handle unauthorized or unsupported backend gracefully
        if (error.message?.includes('Unauthorized') || error.message?.includes('not found')) {
          console.warn('TREY-C Security events not available or unauthorized:', error.message);
          // Return empty array
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 4000,
    refetchInterval: 8000,
    refetchOnWindowFocus: true,
  });
}
