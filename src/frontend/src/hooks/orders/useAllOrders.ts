import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';
import { logErrorWithContext } from '../../utils/errorReporting';
import type { Order } from '../../backend';

export function useAllOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: orderKeys.allOrders(),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getAllOrders();
      } catch (error: any) {
        // Log with context preservation
        logErrorWithContext('getAllOrders', error);

        // Check for unauthorized and provide friendly message
        if (error.message?.includes('Unauthorized')) {
          const friendlyError = new Error('You do not have permission to view orders');
          (friendlyError as any).cause = error;
          throw friendlyError;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
  });
}
