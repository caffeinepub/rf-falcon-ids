import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { orderKeys, authKeys, accountKeys } from './queryKeys';
import { normalizeOrderError } from '../../utils/orderErrors';
import { withTimeout } from '../../utils/withTimeout';
import type { Details, Address } from '../../backend';
import { ExternalBlob } from '../../backend';

interface CreateOrderParams {
  id: string;
  details: Details;
  address: Address;
  photo: ExternalBlob;
  promoCode?: string | null;
  signature?: ExternalBlob | null;
}

export function useCreateOrder() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateOrderParams) => {
      if (!actor) {
        throw new Error('Actor not available');
      }

      if (!identity) {
        throw new Error('You must be logged in to create an order');
      }

      const principal = identity.getPrincipal();

      // Check if user is banned
      const isBanned = await actor.isUserBanned(principal);
      if (isBanned) {
        throw new Error('BANNED');
      }

      // Normalize promo code (trim + uppercase)
      const normalizedPromoCode = params.promoCode?.trim().toUpperCase() || null;

      // Create order with timeout
      await withTimeout(
        actor.createOrder(
          params.id,
          params.details,
          params.address,
          params.photo,
          normalizedPromoCode,
          params.signature || null
        ),
        30000
      );

      // Store order ID in localStorage for user's order list
      const principalString = principal.toString();
      const existingOrders = JSON.parse(
        localStorage.getItem(`user_orders_${principalString}`) || '[]'
      ) as string[];
      
      if (!existingOrders.includes(params.id)) {
        existingOrders.push(params.id);
        localStorage.setItem(
          `user_orders_${principalString}`,
          JSON.stringify(existingOrders)
        );
      }
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      
      if (identity) {
        const principalText = identity.getPrincipal().toString();
        queryClient.invalidateQueries({ 
          queryKey: accountKeys.info(principalText) 
        });
      }
    },
    onError: (error: any) => {
      const normalizedError = normalizeOrderError(error);
      console.error('Create order error:', normalizedError);
      throw new Error(normalizedError);
    },
  });
}
