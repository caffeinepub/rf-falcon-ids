import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';
import { validateTrackingNumber } from '../../utils/validation';

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

      // Validate and normalize tracking number
      const validation = validateTrackingNumber(trackingNumber);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      return actor.setTrackingNumber(orderId, validation.normalized);
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
