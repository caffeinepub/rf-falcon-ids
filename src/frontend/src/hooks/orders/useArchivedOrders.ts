import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';
import { logErrorWithContext } from '../../utils/errorReporting';
import type { Order } from '../../backend';

export function useArchivedOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: orderKeys.archivedOrders(),
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }

      try {
        return actor.getArchivedOrders();
      } catch (error) {
        // Log with context preservation
        logErrorWithContext('getArchivedOrders', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
  });
}
