import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';
import type { OrderStatus } from '../../backend';

interface UpdateOrderStatusParams {
  orderId: string;
  status: OrderStatus;
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: UpdateOrderStatusParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.allOrders() });
      queryClient.invalidateQueries({ queryKey: orderKeys.userOrders() });
    },
  });
}
