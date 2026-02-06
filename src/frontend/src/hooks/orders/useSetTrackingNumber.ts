import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';

interface SetTrackingNumberParams {
  orderId: string;
  trackingNumber: string;
}

export function useSetTrackingNumber() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, trackingNumber }: SetTrackingNumberParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setTrackingNumber(orderId, trackingNumber);
    },
    onSuccess: () => {
      // Invalidate all order queries to reflect the updated tracking number
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
