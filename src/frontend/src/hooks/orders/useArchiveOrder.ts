import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';

export function useArchiveOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      
      await actor.archiveOrder(orderId);
    },
    onSuccess: () => {
      // Invalidate all order queries to refresh lists
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error: any) => {
      console.error('Archive order error:', error);
      throw error;
    },
  });
}
