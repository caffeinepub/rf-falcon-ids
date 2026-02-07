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
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error: any) => {
      console.error('Set tracking number error:', error);
      throw error;
    },
  });
}
