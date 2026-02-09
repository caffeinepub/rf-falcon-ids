import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';
import type { Details, Address } from '../../backend';

interface UpdateOrderDetailsParams {
  orderId: string;
  newDetails: Details;
  newAddress: Address;
}

export function useAdminUpdateOrderDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newDetails, newAddress }: UpdateOrderDetailsParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateOrderDetails(orderId, newDetails, newAddress);
    },
    onSuccess: () => {
      // Invalidate all order-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
