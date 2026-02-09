import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from '../orders/queryKeys';

// Note: Bulk order actions are not implemented in the backend
// These hooks throw errors to prevent accidental use

export function useBulkApproveOrders() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      // Backend doesn't support bulk operations
      throw new Error('Bulk approve is not available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.allOrders() });
    },
  });
}

export function useBulkShipOrders() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      // Backend doesn't support bulk operations
      throw new Error('Bulk ship is not available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.allOrders() });
    },
  });
}

export function useBulkDeleteOrders() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      // Backend doesn't support bulk operations
      throw new Error('Bulk delete is not available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.allOrders() });
    },
  });
}
