import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { orderKeys } from './queryKeys';
import type { Details, Address, ExternalBlob } from '../../backend';

interface CreateOrderParams {
  id: string;
  details: Details;
  address: Address;
  photo: ExternalBlob;
}

export function useCreateOrder() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details, address, photo }: CreateOrderParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createOrder(id, details, address, photo);
      
      // Store order ID in localStorage keyed by principal
      if (identity) {
        const principalString = identity.getPrincipal().toString();
        const userOrderIds = JSON.parse(localStorage.getItem(`user_orders_${principalString}`) || '[]') as string[];
        if (!userOrderIds.includes(id)) {
          userOrderIds.push(id);
          localStorage.setItem(`user_orders_${principalString}`, JSON.stringify(userOrderIds));
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.userOrders() });
    },
  });
}
