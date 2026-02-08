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
      
      // Note: CSRF token support prepared but backend not yet implemented
      // When available: const { token } = useCsrfToken(); await actor.updateOrderStatus(orderId, status, token);
      
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error: any) => {
      console.error('Update status error:', error);
      throw error;
    },
  });
}
