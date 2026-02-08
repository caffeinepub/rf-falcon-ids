import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';

export function useDeleteOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!actor) throw new Error('Actor not available');
      
      // Note: CSRF token support prepared but backend not yet implemented
      // When available: const { token } = useCsrfToken(); await actor.deleteOrder(orderId, token);
      
      return actor.deleteOrder(orderId);
    },
    onSuccess: () => {
      // Invalidate all order queries to refresh lists
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error: any) => {
      console.error('Delete order error:', error);
      throw error;
    },
  });
}
