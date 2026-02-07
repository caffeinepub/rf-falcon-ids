import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from '../orders/queryKeys';

export function useBulkApproveOrders() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkApproveOrders(orderIds);
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
      if (!actor) throw new Error('Actor not available');
      return actor.bulkShipOrders(orderIds);
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
      if (!actor) throw new Error('Actor not available');
      return actor.bulkDeleteOrders(orderIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.allOrders() });
    },
  });
}
