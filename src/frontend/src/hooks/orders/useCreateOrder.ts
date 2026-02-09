import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { orderKeys, accountKeys, authKeys } from './queryKeys';
import type { Details, Address } from '../../backend';
import { ExternalBlob } from '../../backend';
import { normalizeOrderError } from '../../utils/orderErrors';
import { withTimeout } from '../../utils/withTimeout';

interface CreateOrderParams {
  id: string;
  details: Details;
  address: Address;
  photo: ExternalBlob;
  promoCode?: string | null;
}

export function useCreateOrder() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details, address, photo, promoCode }: CreateOrderParams) => {
      if (!actor) {
        throw new Error('Actor not available');
      }

      if (!identity) {
        throw new Error('You must be logged in to place an order');
      }

      // Check if user is banned before attempting order creation
      try {
        const isBanned = await withTimeout(
          actor.isCallerBanned(),
          30000,
          'Ban check timed out'
        );
        
        if (isBanned) {
          throw new Error('Your account has been banned from placing orders');
        }
      } catch (error: any) {
        // If the ban check itself fails, let it through but log it
        if (error.message !== 'Your account has been banned from placing orders') {
          console.warn('Ban check failed:', error);
        } else {
          throw error;
        }
      }

      // Normalize promo code: trim and uppercase, or null if empty
      const normalizedPromoCode = promoCode?.trim().toUpperCase() || null;

      // Create the order with timeout
      await withTimeout(
        actor.createOrder(id, details, address, photo, normalizedPromoCode),
        30000,
        'Order creation timed out'
      );

      return { id };
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: authKeys.vipStatus() });
    },
    onError: (error: any) => {
      console.error('Order creation error:', error);
      // Error normalization happens in the component via normalizeOrderError
    },
  });
}
