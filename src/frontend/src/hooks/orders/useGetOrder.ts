import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys } from './queryKeys';
import { logErrorWithContext } from '../../utils/errorReporting';
import type { Order } from '../../backend';

export function useGetOrder(orderId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: orderKeys.order(orderId),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const result = await actor.getOrder(orderId);
        return result || null;
      } catch (error) {
        // Log with context
        logErrorWithContext('getOrder', error, { orderId });
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!orderId,
    retry: (failureCount, error) => {
      // Don't retry for not found or unauthorized
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found') || errorMessage.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
