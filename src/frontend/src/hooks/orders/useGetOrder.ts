import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';
import type { Order } from '../../backend';

export function useGetOrder(orderId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Order>({
    queryKey: orderKeys.order(orderId),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && !!orderId,
  });
}
