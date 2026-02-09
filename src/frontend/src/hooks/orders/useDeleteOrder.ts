import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';

// Note: Delete order is not implemented in the backend
// This hook throws an error to prevent accidental use

export function useDeleteOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      // Backend doesn't support order deletion
      throw new Error('Order deletion is not available');
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
