import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';
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
        console.error('Get all orders error:', error);
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to view orders');
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
