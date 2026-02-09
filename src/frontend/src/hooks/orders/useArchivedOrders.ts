import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';
import type { Order } from '../../backend';

export function useArchivedOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: orderKeys.archivedOrders(),
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      
      return actor.getArchivedOrders();
    },
    enabled: !!actor && !isFetching,
  });
}
